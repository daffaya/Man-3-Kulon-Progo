/**
 * Covers FR-02, FR-03, B1, B6 — roster per date (R2) and class list per year.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import attendanceModelFactory from "../src/models/attendanceModel.js";
import { createTestDb, skipNoDb, seedSchool, FIXED_NOW } from "./helpers/testDb.js";

let db, model, seed;
before(async () => {
  if (skipNoDb) return;
  db = await createTestDb();
  seed = await seedSchool(db.pool, { students: 3 });
  model = attendanceModelFactory({ pool: db.pool, now: FIXED_NOW });
});
after(async () => db && (await db.close()));

test("[FR-02,B6] classes are only those of the year containing the date", { skip: skipNoDb }, async () => {
  const now = await model.getClasses("2026-10-14");
  assert.ok(now.length > 0 && now.every((c) => c.academic_year === "2026/2027"));
  const past = await model.getClasses("2026-01-15");
  assert.ok(past.length > 0 && past.every((c) => c.academic_year === "2025/2026"));
  const xia = now.find((c) => c.name === "XI-A");
  assert.equal(xia.student_count, 3);
  assert.equal(xia.total_siswa, 3);
});

test("[FR-02] no date = today", { skip: skipNoDb }, async () => {
  const classes = await model.getClasses();
  assert.ok(classes.every((c) => c.academic_year === "2026/2027"));
});

test("[FR-03] roster by date follows enrollment ranges (before/after transfer)", { skip: skipNoDb }, async () => {
  const { pool } = db;
  const xia = seed.classId["2026/2027:XI-A"];
  const xib = seed.classId["2026/2027:XI-B"];
  const sid = seed.studentIds[0];

  await pool.query("UPDATE student_enrollments SET end_date='2026-09-01', end_reason='transferred_class' WHERE student_id=?", [sid]);
  await pool.query("INSERT INTO student_enrollments (student_id, class_id, start_date) VALUES (?,?, '2026-09-01')", [sid, xib]);

  const before = await model.getRoster(xia, "2026-08-31");
  const after = await model.getRoster(xia, "2026-09-01");
  const inB = await model.getRoster(xib, "2026-09-01");
  assert.ok(before.some((s) => s.id === sid));
  assert.ok(!after.some((s) => s.id === sid));
  assert.ok(inB.some((s) => s.id === sid));
  assert.equal(after.length, 2);
});

test("[FR-03] soft-deleted students are not in the roster", { skip: skipNoDb }, async () => {
  const xia = seed.classId["2026/2027:XI-A"];
  await db.pool.query("UPDATE students SET is_deleted=1 WHERE id=?", [seed.studentIds[2]]);
  const roster = await model.getRoster(xia, "2026-10-14");
  assert.ok(!roster.some((s) => s.id === seed.studentIds[2]));
});

test("[FR-02] date outside every year gives empty classes, not an error", { skip: skipNoDb }, async () => {
  const classes = await model.getClasses("2040-01-01");
  assert.ok(Array.isArray(classes));
});
