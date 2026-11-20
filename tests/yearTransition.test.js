/**
 * Covers FR-09, FR-11, R6 — year transition: preview, execute, idempotency.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import yearTransitionServiceFactory from "../src/services/yearTransitionService.js";
import academicYearServiceFactory from "../src/services/academicYearService.js";
import { HttpError } from "../src/utils/errorResponse.js";
import { createTestDb, skipNoDb, FIXED_NOW } from "./helpers/testDb.js";

let db, svc, fromId, toId;

before(async () => {
  if (skipNoDb) return;
  db = await createTestDb();
  const { pool } = db;
  const years = academicYearServiceFactory({ pool, now: FIXED_NOW });
  const list = await years.list();
  fromId = list.find((y) => y.label === "2026/2027").id;
  toId = (await years.create({ start_date: "2027-07-01", end_date: "2028-07-01" })).id;

  const mk = async (name, grade) =>
    (await pool.query(
      "INSERT INTO classes (name, academic_year, semester, academic_year_id, grade_level) VALUES (?, '2026/2027','ganjil',?,?)",
      [name, fromId, grade],
    ))[0].insertId;
  const cx = await mk("X-A", 10);
  const cxi = await mk("XI-A", 11);
  const cxii = await mk("XII-A", 12);
  await pool.query("INSERT INTO users (id,username,password_hash,role,full_name) VALUES (1,'k','x','super_admin','K')");

  let n = 0;
  const add = async (classId, count, angkatan) => {
    for (let i = 0; i < count; i++) {
      n++;
      const [r] = await pool.query(
        "INSERT INTO students (nisn,name,academic_year,is_active,is_deleted,angkatan) VALUES (?,?,'2026/2027',1,0,?)",
        [`77000000${String(n).padStart(2, "0")}`, `S${n}`, angkatan],
      );
      await pool.query("INSERT INTO student_enrollments (student_id,class_id,start_date) VALUES (?,?, '2026-07-01')", [r.insertId, classId]);
    }
  };
  await add(cx, 3, "2026");
  await add(cxi, 2, "2025");
  await add(cxii, 2, "2024");
  svc = yearTransitionServiceFactory({ pool, now: FIXED_NOW });
});
after(async () => db && (await db.close()));

const input = (extra = {}) => ({ fromYearId: fromId, toYearId: toId, newClassCounts: { X: 2 }, ...extra });
const count = async (sql, p = []) => Number((await db.pool.query(sql, p))[0][0].n);

test("[FR-09] preview computes the plan and writes nothing", { skip: skipNoDb }, async () => {
  const plan = await svc.preview(input());
  assert.deepEqual(plan.classes_to_create.map((c) => c.name).sort(), ["X-A", "X-B", "XI-A", "XII-A"]);
  assert.deepEqual(plan.totals, { promote: 5, graduate: 2 });
  assert.equal(plan.promotions.find((p) => p.from_class === "X-A").to_class, "XI-A");
  assert.equal(plan.promotions.find((p) => p.from_class === "XI-A").to_class, "XII-A");
  assert.equal(plan.graduations[0].students, 2);
  assert.equal(await count("SELECT COUNT(*) n FROM classes WHERE academic_year_id=?", [toId]), 0);
});

test("[FR-09] execute requires confirm:true and valid years", { skip: skipNoDb }, async () => {
  await assert.rejects(() => svc.execute(input()), (e) => e instanceof HttpError && e.status === 400);
  await assert.rejects(() => svc.preview({ fromYearId: toId, toYearId: fromId, newClassCounts: { X: 1 } }), (e) => e.status === 422);
  await assert.rejects(() => svc.preview(input({ newClassCounts: { X: 99 } })), (e) => e.status === 400);
});

test("[FR-09,FR-11] execute promotes 1:1, graduates XII, creates alumni", { skip: skipNoDb }, async () => {
  const res = await svc.execute(input({ confirm: true }));
  assert.equal(res.summary.promoted, 5);
  assert.equal(res.summary.graduated, 2);

  assert.equal(await count("SELECT COUNT(*) n FROM classes WHERE academic_year_id=?", [toId]), 4);
  // X students -> XI-A(2027), XI students -> XII-A(2027)
  assert.equal(await count(
    `SELECT COUNT(*) n FROM student_enrollments e JOIN classes c ON c.id=e.class_id
      WHERE e.end_date IS NULL AND c.academic_year_id=? AND c.name='XI-A'`, [toId]), 3);
  assert.equal(await count(
    `SELECT COUNT(*) n FROM student_enrollments e JOIN classes c ON c.id=e.class_id
      WHERE e.end_date IS NULL AND c.academic_year_id=? AND c.name='XII-A'`, [toId]), 2);
  // old enrollments closed at the old year's end (exclusive), with reasons
  assert.equal(await count("SELECT COUNT(*) n FROM student_enrollments WHERE end_reason='promoted' AND end_date='2027-07-01'"), 5);
  assert.equal(await count("SELECT COUNT(*) n FROM student_enrollments WHERE end_reason='graduated' AND end_date='2027-07-01'"), 2);
  // graduates inactive + alumni records
  assert.equal(await count("SELECT COUNT(*) n FROM students WHERE is_active=0"), 2);
  assert.equal(await count("SELECT COUNT(*) n FROM alumni WHERE last_academic_year='2026/2027' AND graduation_year='2027'"), 2);
  // every active student has exactly one open enrollment
  assert.equal(await count(
    `SELECT COUNT(*) n FROM students s WHERE is_active=1 AND
      (SELECT COUNT(*) FROM student_enrollments e WHERE e.student_id=s.id AND e.end_date IS NULL) <> 1`), 0);
});

test("[FR-09] running execute twice changes nothing more (idempotent)", { skip: skipNoDb }, async () => {
  const before = await count("SELECT COUNT(*) n FROM student_enrollments");
  const res = await svc.execute(input({ confirm: true }));
  assert.equal(res.summary.promoted, 0);
  assert.equal(res.summary.graduated, 0);
  assert.equal(await count("SELECT COUNT(*) n FROM student_enrollments"), before);
  assert.equal(await count("SELECT COUNT(*) n FROM classes WHERE academic_year_id=?", [toId]), 4);
  assert.equal(await count("SELECT COUNT(*) n FROM alumni"), 2);
});

test("[FR-09] roster per date is correct on both sides of the new year start", { skip: skipNoDb }, async () => {
  const [a] = await db.pool.query(
    `SELECT COUNT(*) n FROM student_enrollments e WHERE e.start_date <= '2027-06-30' AND (e.end_date IS NULL OR e.end_date > '2027-06-30')`);
  const [b] = await db.pool.query(
    `SELECT COUNT(*) n FROM student_enrollments e WHERE e.start_date <= '2027-07-01' AND (e.end_date IS NULL OR e.end_date > '2027-07-01')`);
  assert.equal(Number(a[0].n), 7); // all 7 still in the old classes
  assert.equal(Number(b[0].n), 5); // 5 promoted, 2 graduated
});
