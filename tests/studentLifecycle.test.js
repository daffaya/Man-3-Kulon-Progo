/**
 * Covers FR-09 (transfer), FR-11 (leave), R5, B11 — transfer and leaving school.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import studentLifecycleServiceFactory from "../src/services/studentLifecycleService.js";
import { HttpError } from "../src/utils/errorResponse.js";
import { createTestDb, skipNoDb, seedSchool, FIXED_NOW } from "./helpers/testDb.js";

let db, life, seed;
const C = (k) => seed.classId[k];
before(async () => {
  if (skipNoDb) return;
  db = await createTestDb();
  seed = await seedSchool(db.pool, { students: 3 });
  life = studentLifecycleServiceFactory({ pool: db.pool, now: FIXED_NOW });
});
after(async () => db && (await db.close()));

const rejects = (p, status) => assert.rejects(p, (e) => e instanceof HttpError && e.status === status);
const enrollments = async (sid) =>
  (await db.pool.query(
    "SELECT class_id, DATE_FORMAT(start_date,'%Y-%m-%d') s, DATE_FORMAT(end_date,'%Y-%m-%d') e, end_reason FROM student_enrollments WHERE student_id=? ORDER BY start_date, id",
    [sid],
  ))[0];

test("[R5] transfer closes the old enrollment and opens the new one on the effective date", { skip: skipNoDb }, async () => {
  const sid = seed.studentIds[0];
  const res = await life.transferStudent(sid, { to_class_id: C("2026/2027:XI-B"), effective_date: "2026-10-01" });
  assert.equal(res.corrected_in_place, false);
  const e = await enrollments(sid);
  assert.equal(e.length, 2);
  assert.deepEqual([e[0].e, e[0].end_reason], ["2026-10-01", "transferred_class"]);
  assert.deepEqual([e[1].s, e[1].e, e[1].class_id], ["2026-10-01", null, C("2026/2027:XI-B")]);
});

test("[R5] effective date equal to the enrollment start corrects the class in place", { skip: skipNoDb }, async () => {
  const sid = seed.studentIds[1]; // enrolled 2026-07-01 in XI-A
  const res = await life.transferStudent(sid, { to_class_id: C("2026/2027:XI-B"), effective_date: "2026-07-01" });
  assert.equal(res.corrected_in_place, true);
  const e = await enrollments(sid);
  assert.equal(e.length, 1);
  assert.equal(e[0].class_id, C("2026/2027:XI-B"));
});

test("[R5] different grade or different year is rejected (422)", { skip: skipNoDb }, async () => {
  const sid = seed.studentIds[2];
  await rejects(life.transferStudent(sid, { to_class_id: C("2026/2027:XII-A"), effective_date: "2026-10-01" }), 422);
  await rejects(life.transferStudent(sid, { to_class_id: C("2025/2026:XI-A"), effective_date: "2026-10-01" }), 422);
  await rejects(life.transferStudent(sid, { to_class_id: C("2026/2027:XI-A"), effective_date: "2026-10-01" }), 409);
  await rejects(life.transferStudent(sid, { to_class_id: C("2026/2027:XI-B"), effective_date: "2026-06-30" }), 422);
  await rejects(life.transferStudent(sid, { to_class_id: C("2026/2027:XI-B"), effective_date: "nope" }), 400);
  await rejects(life.transferStudent(999999, { to_class_id: C("2026/2027:XI-B"), effective_date: "2026-10-01" }), 404);
});

test("[B11] repeated same-year transfers do not hit the legacy unique key", { skip: skipNoDb }, async () => {
  const sid = seed.studentIds[2];
  await life.transferStudent(sid, { to_class_id: C("2026/2027:XI-B"), effective_date: "2026-09-01" });
  await life.transferStudent(sid, { to_class_id: C("2026/2027:XI-A"), effective_date: "2026-10-01" });
  const [h] = await db.pool.query("SELECT class_id, is_current FROM student_academic_history WHERE student_id=? AND academic_year='2026/2027'", [sid]);
  assert.equal(h.length, 1);
  assert.equal(h[0].class_id, C("2026/2027:XI-A"));
});

test("[R5] attendance on/after the effective date follows the new class; earlier stays", { skip: skipNoDb }, async () => {
  const sid = seed.studentIds[0]; // now in XI-B from 10-01
  await db.pool.query("INSERT INTO attendances (student_id,class_id,date,status,recorded_by) VALUES (?,?,'2026-09-30','hadir',1),(?,?,'2026-10-05','hadir',1)", [sid, C("2026/2027:XI-A"), sid, C("2026/2027:XI-A")]);
  await life.transferStudent(sid, { to_class_id: C("2026/2027:XI-A"), effective_date: "2026-10-03" });
  const [rows] = await db.pool.query("SELECT DATE_FORMAT(date,'%Y-%m-%d') d, class_id FROM attendances WHERE student_id=? ORDER BY date", [sid]);
  assert.equal(rows.find((r) => r.d === "2026-10-05").class_id, C("2026/2027:XI-A"));
});

test("[FR-11] leave closes the enrollment, deactivates, keeps attendance", { skip: skipNoDb }, async () => {
  const sid = seed.studentIds[1];
  await db.pool.query("INSERT INTO attendances (student_id,class_id,date,status,recorded_by) VALUES (?,?,'2026-10-05','hadir',1)", [sid, C("2026/2027:XI-B")]);
  await rejects(life.leaveSchool(sid, { effective_date: "2026-10-10", reason: "" }), 400);
  await rejects(life.leaveSchool(sid, { effective_date: "2026-07-01", reason: "pindah" }), 422);
  await life.leaveSchool(sid, { effective_date: "2026-10-10", reason: "pindah sekolah" });
  const e = await enrollments(sid);
  assert.equal(e.at(-1).end_reason, "left_school");
  const [[s]] = await db.pool.query("SELECT is_active FROM students WHERE id=?", [sid]);
  assert.equal(s.is_active, 0);
  const [[n]] = await db.pool.query("SELECT COUNT(*) n FROM attendances WHERE student_id=?", [sid]);
  assert.equal(Number(n.n), 1);
  await rejects(life.leaveSchool(sid, { effective_date: "2026-10-12", reason: "x" }), 409);
});

test("createStudent uses the class's year, computes angkatan, rejects duplicate NISN", { skip: skipNoDb }, async () => {
  const created = await life.createStudent({ nisn: "1234567890", name: "Baru", class_id: C("2026/2027:XI-A") });
  assert.equal(created.academic_year, "2026/2027");
  assert.equal(created.angkatan, "2025");
  assert.equal(created.start_date, "2026-10-14");
  await rejects(life.createStudent({ nisn: "1234567890", name: "Dobel", class_id: C("2026/2027:XI-A") }), 409);
  await rejects(life.createStudent({ nisn: "1234567891", name: "Tanpa kelas", class_id: 99999 }), 422);
});
