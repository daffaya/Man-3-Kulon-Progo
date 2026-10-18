/**
 * Covers FR-04–FR-08, FR-14, B9 — saving attendance (R4): default hadir,
 * validation, transaction, correction window, roles.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import attendanceSaveServiceFactory from "../src/services/attendanceSaveService.js";
import { HttpError } from "../src/utils/errorResponse.js";
import { createTestDb, skipNoDb, seedSchool, FIXED_NOW } from "./helpers/testDb.js";

let db, service, seed, xia;
const GB = { id: 1, role: "guru_bk" };
const SA = { id: 1, role: "super_admin" };

before(async () => {
  if (skipNoDb) return;
  db = await createTestDb();
  seed = await seedSchool(db.pool, { students: 3 });
  xia = seed.classId["2026/2027:XI-A"];
  service = attendanceSaveServiceFactory({ pool: db.pool, now: FIXED_NOW });
});
after(async () => db && (await db.close()));

const rows = async (date) => {
  const [r] = await db.pool.query(
    "SELECT student_id, class_id, status, notes FROM attendances WHERE date=? ORDER BY student_id",
    [date],
  );
  return r;
};
const rejects = (promise, status) =>
  assert.rejects(promise, (e) => e instanceof HttpError && e.status === status, `expected ${status}`);

test("[FR-04] students missing from the payload are saved as hadir, class snapshot stored", { skip: skipNoDb }, async () => {
  const res = await service.saveAttendance({
    classId: xia,
    date: "2026-10-13",
    attendances: [{ studentId: seed.studentIds[0], status: "sakit", notes: "demam" }],
    user: GB,
  });
  assert.equal(res.saved, 3);
  assert.equal(res.defaulted_hadir, 2);
  const r = await rows("2026-10-13");
  assert.deepEqual(r.map((x) => x.status), ["sakit", "hadir", "hadir"]);
  assert.ok(r.every((x) => x.class_id === xia));
  assert.equal(r[0].notes, "demam");
});

test("[FR-05] saving twice is idempotent and last write wins", { skip: skipNoDb }, async () => {
  await service.saveAttendance({ classId: xia, date: "2026-10-12", attendances: [{ studentId: seed.studentIds[1], status: "alpa" }], user: GB });
  await service.saveAttendance({ classId: xia, date: "2026-10-12", attendances: [{ studentId: seed.studentIds[1], status: "izin" }], user: GB });
  const r = await rows("2026-10-12");
  assert.equal(r.length, 3);
  assert.equal(r.find((x) => x.student_id === seed.studentIds[1]).status, "izin");
});

test("[FR-06] future date is rejected (422)", { skip: skipNoDb }, async () => {
  await rejects(service.saveAttendance({ classId: xia, date: "2026-10-15", attendances: [], user: GB }), 422);
});

test("[FR-06] weekend is rejected (422)", { skip: skipNoDb }, async () => {
  await rejects(service.saveAttendance({ classId: xia, date: "2026-10-11", attendances: [], user: GB }), 422);
});

test("[FR-06] holiday: guru_bk rejected, super_admin may override", { skip: skipNoDb }, async () => {
  await db.pool.query("INSERT INTO school_holidays (date, description, academic_year) VALUES ('2026-10-09','Libur Uji','2026/2027')");
  await rejects(service.saveAttendance({ classId: xia, date: "2026-10-09", attendances: [], user: GB }), 422);
  await rejects(service.saveAttendance({ classId: xia, date: "2026-10-09", attendances: [], user: SA }), 422);
  const ok = await service.saveAttendance({ classId: xia, date: "2026-10-09", attendances: [], user: SA, override: true });
  assert.equal(ok.success, true);
});

test("[FR-06] class from another academic year is rejected (422)", { skip: skipNoDb }, async () => {
  await rejects(
    service.saveAttendance({ classId: seed.classId["2025/2026:XI-A"], date: "2026-10-13", attendances: [], user: GB }),
    422,
  );
});

test("[FR-07] student outside the roster is rejected and nothing is written", { skip: skipNoDb }, async () => {
  const [r] = await db.pool.query(
    "INSERT INTO students (nisn,name,academic_year,is_active,is_deleted,angkatan) VALUES ('9999999999','Luar','2026/2027',1,0,'2025')",
  );
  await rejects(
    service.saveAttendance({
      classId: xia,
      date: "2026-10-08",
      attendances: [{ studentId: r.insertId, status: "alpa" }],
      user: GB,
    }),
    422,
  );
  assert.equal((await rows("2026-10-08")).length, 0);
});

test("[FR-08] invalid status and 'libur' are rejected (400)", { skip: skipNoDb }, async () => {
  for (const status of ["libur", "terlambat", ""]) {
    await rejects(
      service.saveAttendance({ classId: xia, date: "2026-10-07", attendances: [{ studentId: seed.studentIds[0], status }], user: GB }),
      400,
    );
  }
  await rejects(service.saveAttendance({ classId: xia, date: "bukan-tanggal", attendances: [], user: GB }), 400);
  await rejects(service.saveAttendance({ classId: "abc", date: "2026-10-07", attendances: [], user: GB }), 400);
});

test("[FR-14] beyond the correction window: guru_bk 403, super_admin needs a reason", { skip: skipNoDb }, async () => {
  const date = "2026-09-28"; // 16 days before the fixed 'today'
  await rejects(service.saveAttendance({ classId: xia, date, attendances: [], user: GB }), 403);
  await rejects(service.saveAttendance({ classId: xia, date, attendances: [], user: SA }), 422);
  await service.saveAttendance({ classId: xia, date, attendances: [], user: SA, reason: "Presensi lupa diinput" });
  const r = await rows(date);
  assert.ok(r.every((x) => x.notes.includes("[koreksi: Presensi lupa diinput]")));
});

test("[FR-14] inside the window guru_bk may edit", { skip: skipNoDb }, async () => {
  const ok = await service.saveAttendance({ classId: xia, date: "2026-10-07", attendances: [], user: GB });
  assert.equal(ok.success, true);
});

test("[B9] a failure inside the transaction leaves no partial rows", { skip: skipNoDb }, async () => {
  const fakePool = {
    getConnection: async () => {
      const conn = await db.pool.getConnection();
      const original = conn.query.bind(conn);
      conn.query = (sql, params) =>
        String(sql).includes("INSERT INTO attendances")
          ? Promise.reject(new Error("boom"))
          : original(sql, params);
      return conn;
    },
  };
  const failing = attendanceSaveServiceFactory({ pool: fakePool, now: FIXED_NOW });
  await assert.rejects(() => failing.saveAttendance({ classId: xia, date: "2026-10-06", attendances: [], user: GB }));
  assert.equal((await rows("2026-10-06")).length, 0);
});

test("[FR-05] roster change: a student who moved out is not in the old class payload", { skip: skipNoDb }, async () => {
  const xib = seed.classId["2026/2027:XI-B"];
  const sid = seed.studentIds[0];
  await db.pool.query("UPDATE student_enrollments SET end_date='2026-10-05', end_reason='transferred_class' WHERE student_id=? AND end_date IS NULL", [sid]);
  await db.pool.query("INSERT INTO student_enrollments (student_id,class_id,start_date) VALUES (?,?, '2026-10-05')", [sid, xib]);
  await rejects(
    service.saveAttendance({ classId: xia, date: "2026-10-14", attendances: [{ studentId: sid, status: "alpa" }], user: GB }),
    422,
  );
  const ok = await service.saveAttendance({ classId: xib, date: "2026-10-14", attendances: [{ studentId: sid, status: "alpa" }], user: GB });
  assert.equal(ok.saved, 1);
});
