// PERF P0-6: getMissingAttendanceByDateRange used 1 COUNT(*) query per
// (weekday x class). It now uses 1 query + in-memory diff. These tests run the
// ORIGINAL algorithm (copied below) and the new model against the same fake
// data and require byte-identical JSON, and check the query count.
import { test } from "node:test";
import assert from "node:assert/strict";
import attendanceModelFactory from "../src/models/attendanceModel.js";

const iso = (d) => d.toISOString().split("T")[0];

/** Small deterministic PRNG so failures are reproducible. */
const rng = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

/**
 * In-memory stand-in for mysql2 pool. Answers only the queries this feature
 * issues (matched by SQL text) and counts every call.
 * dataset = { classes:[{id,name,...}], holidays:["YYYY-MM-DD"], attended:Set("YYYY-MM-DD_classId") }
 */
const fakePool = (dataset) => {
  const pool = {
    calls: 0,
    async query(sql, params = []) {
      pool.calls++;
      if (sql.includes("FROM school_holidays")) {
        const [start, end] = params;
        return [
          dataset.holidays
            .filter((d) => d >= start && d <= end)
            .map((d) => ({ date: new Date(`${d}T00:00:00Z`) })),
        ];
      }
      if (sql.includes("FROM classes c")) {
        return [dataset.classes];
      }
      if (sql.includes("COUNT(*) as count FROM attendances")) {
        const [date, classId] = params; // legacy per-(date,class) query
        return [[{ count: dataset.attended.has(`${date}_${classId}`) ? 3 : 0 }]];
      }
      if (sql.includes("SELECT DISTINCT DATE_FORMAT(a.date")) {
        const [start, end] = params;
        const rows = [...dataset.attended]
          .map((k) => {
            const [date_str, class_id] = k.split("_");
            return { date_str, class_id: Number(class_id) };
          })
          .filter((r) => r.date_str >= start && r.date_str <= end);
        return [rows];
      }
      throw new Error(`fakePool: unexpected SQL: ${sql.slice(0, 80)}`);
    },
  };
  return pool;
};

/** ORIGINAL implementation (pre-P0-6), verbatim logic, kept as the oracle. */
const legacyGetMissing = async (pool, getClasses, startDate, endDate) => {
  const [holidays] = await pool.query(
    "SELECT date FROM school_holidays WHERE date BETWEEN ? AND ?",
    [startDate, endDate],
  );
  const holidayDates = new Set(holidays.map((h) => h.date.toISOString().split("T")[0]));
  const classes = await getClasses();
  const results = {};
  let currentDate = new Date(startDate);
  while (currentDate <= new Date(endDate)) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.has(dateStr)) {
      const missingClasses = [];
      for (const classItem of classes) {
        const [attendanceCheck] = await pool.query(
          `SELECT COUNT(*) as count FROM attendances a
           JOIN student_academic_history sah ON a.student_id = sah.student_id AND sah.is_current = 1
           WHERE a.date = ? AND sah.class_id = ?`,
          [dateStr, classItem.id],
        );
        if (attendanceCheck[0].count === 0) {
          missingClasses.push({ id: classItem.id, name: classItem.name });
        }
      }
      if (missingClasses.length > 0) results[dateStr] = missingClasses;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return results;
};

const buildDataset = (random, { from, to, classCount, attendProb, holidayProb }) => {
  const classes = Array.from({ length: classCount }, (_, i) => ({
    id: i + 1,
    name: `Kelas ${String.fromCharCode(65 + i)}`,
    academic_year: "2025/2026",
    semester: "Genap",
    total_siswa: 30,
  }));
  const holidays = [];
  const attended = new Set();
  for (let d = new Date(from); d <= new Date(to); d.setUTCDate(d.getUTCDate() + 1)) {
    const ds = iso(d);
    if (random() < holidayProb) holidays.push(ds);
    for (const c of classes) if (random() < attendProb) attended.add(`${ds}_${c.id}`);
  }
  return { classes, holidays, attended };
};

const runBoth = async (dataset, startDate, endDate) => {
  const oldPool = fakePool(dataset);
  const oldModel = attendanceModelFactory({ pool: oldPool });
  const legacy = await legacyGetMissing(oldPool, oldModel.getClasses, startDate, endDate);

  const newPool = fakePool(dataset);
  const model = attendanceModelFactory({ pool: newPool });
  const current = await model.getMissingAttendanceByDateRange(startDate, endDate);

  return { legacy, current, legacyCalls: oldPool.calls, newCalls: newPool.calls };
};

test("randomized datasets: new result is identical to legacy (incl. key order)", async () => {
  const random = rng(20260928);
  for (let round = 0; round < 40; round++) {
    const dataset = buildDataset(random, {
      from: "2026-01-20",
      to: "2026-03-15",
      classCount: 1 + Math.floor(random() * 12),
      attendProb: random(),
      holidayProb: random() * 0.2,
    });
    const { legacy, current } = await runBoth(dataset, "2026-02-01", "2026-02-28");
    assert.equal(JSON.stringify(current), JSON.stringify(legacy), `round ${round}`);
  }
});

test("edge ranges give identical results", async () => {
  const random = rng(7);
  const dataset = buildDataset(random, {
    from: "2025-12-01",
    to: "2026-02-28",
    classCount: 5,
    attendProb: 0.5,
    holidayProb: 0.1,
  });
  const ranges = [
    ["2026-01-05", "2026-01-05"], // single weekday
    ["2026-01-03", "2026-01-04"], // weekend only
    ["2026-01-10", "2026-01-05"], // start after end
    ["2025-12-29", "2026-01-04"], // crosses year boundary
    ["2025-12-01", "2026-02-28"], // 3 months
    ["2030-01-01", "2030-01-31"], // no data at all
  ];
  for (const [start, end] of ranges) {
    const { legacy, current } = await runBoth(dataset, start, end);
    assert.equal(JSON.stringify(current), JSON.stringify(legacy), `${start}..${end}`);
  }
});

test("no attendance at all -> every class missing on every non-holiday weekday", async () => {
  const dataset = {
    classes: [{ id: 1, name: "X-A" }, { id: 2, name: "X-B" }],
    holidays: ["2026-02-03"],
    attended: new Set(),
  };
  const { current } = await runBoth(dataset, "2026-02-02", "2026-02-06");
  assert.deepEqual(Object.keys(current), ["2026-02-02", "2026-02-04", "2026-02-05", "2026-02-06"]);
  assert.deepEqual(current["2026-02-02"], [{ id: 1, name: "X-A" }, { id: 2, name: "X-B" }]);
});

test("full attendance -> empty object", async () => {
  const dataset = {
    classes: [{ id: 1, name: "X-A" }],
    holidays: [],
    attended: new Set(["2026-02-02_1", "2026-02-03_1"]),
  };
  const { current } = await runBoth(dataset, "2026-02-02", "2026-02-03");
  assert.deepEqual(current, {});
});

test("query count is constant (holidays + classes + 1), not weekdays x classes", async () => {
  const dataset = buildDataset(rng(1), {
    from: "2026-02-01",
    to: "2026-02-28",
    classCount: 20,
    attendProb: 0.5,
    holidayProb: 0,
  });
  const { legacyCalls, newCalls } = await runBoth(dataset, "2026-02-01", "2026-02-28");

  assert.equal(newCalls, 3);
  assert.ok(legacyCalls > 300, `legacy made ${legacyCalls} queries`); // 20 weekdays x 20 classes + 2
});
