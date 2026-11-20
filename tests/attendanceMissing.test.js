/**
 * Covers FR-03 (missing list), B6 — missing attendance only for classes of the
 * year containing each date, on school days, never future days.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import attendanceModelFactory from "../src/models/attendanceModel.js";
import attendanceSaveServiceFactory from "../src/services/attendanceSaveService.js";
import { createTestDb, skipNoDb, seedSchool, FIXED_NOW } from "./helpers/testDb.js";

let db, model, seed;
before(async () => {
  if (skipNoDb) return;
  db = await createTestDb();
  seed = await seedSchool(db.pool, { students: 2 });
  model = attendanceModelFactory({ pool: db.pool, now: FIXED_NOW });
  await db.pool.query("INSERT INTO school_holidays (date, description, academic_year) VALUES ('2026-10-08','Libur','2026/2027')");
  const save = attendanceSaveServiceFactory({ pool: db.pool, now: FIXED_NOW });
  await save.saveAttendance({ classId: seed.classId["2026/2027:XI-A"], date: "2026-10-13", attendances: [], user: { id: 1, role: "guru_bk" } });
});
after(async () => db && (await db.close()));

test("[B6] only classes that have a roster, only of the date's year", { skip: skipNoDb }, async () => {
  const missing = await model.getMissingAttendanceByDateRange("2026-10-12", "2026-10-14");
  assert.deepEqual(Object.keys(missing), ["2026-10-12", "2026-10-14"]); // 13th was recorded
  assert.deepEqual(missing["2026-10-12"].map((c) => c.name), ["XI-A"]);
  // 2025/2026 classes and empty classes (XI-B, X-A, XII-A) never show up
});

test("weekends, holidays and future days are skipped", { skip: skipNoDb }, async () => {
  const missing = await model.getMissingAttendanceByDateRange("2026-10-07", "2026-10-20");
  const days = Object.keys(missing);
  assert.ok(!days.includes("2026-10-08"), "holiday");
  assert.ok(!days.includes("2026-10-10") && !days.includes("2026-10-11"), "weekend");
  assert.ok(days.every((d) => d <= "2026-10-14"), "future days");
});

test("a range entirely in the future returns nothing", { skip: skipNoDb }, async () => {
  assert.deepEqual(await model.getMissingAttendanceByDateRange("2026-10-20", "2026-10-30"), {});
});

test("dates outside every academic year are skipped", { skip: skipNoDb }, async () => {
  assert.deepEqual(await model.getMissingAttendanceByDateRange("2024-01-01", "2024-01-05"), {});
});
