/**
 * Covers FR-05/B1/B7/B10 — recap uses the class snapshot, percentage is over
 * recorded non-libur days, and history stays with the old class after a move.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import attendanceModelFactory from "../src/models/attendanceModel.js";
import attendanceSaveServiceFactory from "../src/services/attendanceSaveService.js";
import studentLifecycleServiceFactory from "../src/services/studentLifecycleService.js";
import { createTestDb, skipNoDb, seedSchool, FIXED_NOW } from "./helpers/testDb.js";

let db, model, seed, xia, xib;
before(async () => {
  if (skipNoDb) return;
  db = await createTestDb();
  seed = await seedSchool(db.pool, { students: 2 });
  xia = seed.classId["2026/2027:XI-A"];
  xib = seed.classId["2026/2027:XI-B"];
  model = attendanceModelFactory({ pool: db.pool, now: FIXED_NOW });
  const save = attendanceSaveServiceFactory({ pool: db.pool, now: FIXED_NOW });
  const [s1] = seed.studentIds;
  const GB = { id: 1, role: "guru_bk" };
  await save.saveAttendance({ classId: xia, date: "2026-10-12", attendances: [{ studentId: s1, status: "alpa" }], user: GB });
  await save.saveAttendance({ classId: xia, date: "2026-10-13", attendances: [], user: GB });
  // legacy 'libur' row must not count
  await db.pool.query("INSERT INTO attendances (student_id,class_id,date,status,recorded_by) VALUES (?,?,'2026-10-09','libur',1)", [s1, xia]);
});
after(async () => db && (await db.close()));

test("[B10] percentage is over recorded non-libur days", { skip: skipNoDb }, async () => {
  const recap = await model.getAttendanceRecap(xia, "monthly", "2026-10-01", "2026-10-31");
  const a = recap.find((r) => r.id === seed.studentIds[0]);
  assert.equal(a.total_hari, 2);
  assert.equal(a.hadir, 1);
  assert.equal(a.alpa, 1);
  assert.equal(a.persentase_kehadiran, 50);
});

test("student with no records has null percentage, not 0/NaN", { skip: skipNoDb }, async () => {
  const recap = await model.getAttendanceRecap(xia, "monthly", "2026-11-01", "2026-11-30");
  assert.ok(recap.every((r) => r.persentase_kehadiran === null && r.total_hari === 0));
});

test("[B1] after a transfer, past attendance stays in the old class and new rows go to the new one", { skip: skipNoDb }, async () => {
  const life = studentLifecycleServiceFactory({ pool: db.pool, now: FIXED_NOW });
  const sid = seed.studentIds[0];
  const res = await life.transferStudent(sid, { to_class_id: xib, effective_date: "2026-10-14" });
  assert.equal(res.corrected_in_place, false);

  const oldRecap = await model.getAttendanceRecap(xia, "monthly", "2026-10-01", "2026-10-31");
  const moved = oldRecap.find((r) => r.id === sid);
  assert.equal(moved.total_hari, 2, "history stays with the old class");

  const newRecap = await model.getAttendanceRecap(xib, "monthly", "2026-10-01", "2026-10-31");
  assert.ok(newRecap.some((r) => r.id === sid));
  assert.equal(newRecap.find((r) => r.id === sid).total_hari, 0);

  const [rows] = await db.pool.query("SELECT class_id FROM attendances WHERE student_id=? AND date < '2026-10-14'", [sid]);
  assert.ok(rows.every((r) => r.class_id === xia));
});

test("daily recap lists the roster of that date", { skip: skipNoDb }, async () => {
  const daily = await model.getAttendanceRecap(xia, "daily", "2026-10-13");
  assert.equal(daily.length, 2); // student moved on 10-14, still in XI-A on 10-13
  assert.ok(daily.every((r) => r.status === "hadir"));
});

test("[B7] semester archive is computed from rows and is idempotent", { skip: skipNoDb }, async () => {
  const first = await model.archiveAttendanceData("2026/2027", "ganjil");
  assert.equal(first.success, true);
  await model.archiveAttendanceData("2026/2027", "ganjil");
  const [rows] = await db.pool.query("SELECT student_id, total_hadir, total_alpa FROM attendance_archives WHERE academic_year='2026/2027' AND semester='ganjil'");
  assert.equal(rows.length, 2);
  const a = rows.find((r) => r.student_id === seed.studentIds[0]);
  assert.equal(Number(a.total_alpa), 1);
});
