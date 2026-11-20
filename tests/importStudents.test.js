/**
 * Covers FR-10, B4, B5 — import: preview categories, commit actions,
 * duplicate NISN, same file twice, angkatan filled (R7), nothing written at preview.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ExcelJS from "exceljs";
import importStudentServiceFactory from "../src/services/importStudentService.js";
import { HttpError } from "../src/utils/errorResponse.js";
import { createTestDb, skipNoDb, seedSchool, FIXED_NOW } from "./helpers/testDb.js";

let db, svc, seed, yearId;

before(async () => {
  if (skipNoDb) return;
  db = await createTestDb();
  seed = await seedSchool(db.pool, { students: 2 });
  yearId = seed.yearId["2026/2027"];
  svc = importStudentServiceFactory({ pool: db.pool, now: FIXED_NOW });
});
after(async () => db && (await db.close()));

const makeFile = async (rows) => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Siswa");
  ws.addRow(["NISN", "Nama", "Kelas", "Jenis Kelamin", "Alamat"]);
  rows.forEach((r) => ws.addRow(r));
  const file = path.join(os.tmpdir(), `imp_${Date.now()}_${Math.random().toString(16).slice(2)}.xlsx`);
  await wb.xlsx.writeFile(file);
  return file;
};
const preview = async (rows) => svc.previewImport({ filePath: await makeFile(rows), academicYearId: yearId, userId: 1 });
const count = async (sql) => Number((await db.pool.query(sql))[0][0].n);

test("[FR-10] preview classifies rows and writes no students", { skip: skipNoDb }, async () => {
  const before = await count("SELECT COUNT(*) n FROM students");
  // existing: 0000000001 'Siswa A' in XI-A, 0000000002 'Siswa B' in XI-A
  const res = await preview([
    ["1111111111", "Murid Baru", "X-A", "L", "Jl. A"],        // new
    ["0000000001", "Siswa A", "XI-A", "", ""],                 // unchanged
    ["0000000002", "Siswa B Baru", "XI-A", "", ""],            // changed (name)
    ["2222222222", "Kelas Ngawur", "XI-Z", "", ""],            // error: class missing
    ["1111111111", "Dobel", "X-A", "", ""],                    // error: duplicate in file
  ]);
  assert.deepEqual(res.counts, { new: 1, unchanged: 1, changed: 1, moved: 0, error: 2 });
  assert.equal(res.file_seen_before, false);
  assert.ok(res.rows.find((r) => r.nisn === "0000000002").diff.some((d) => d.field === "name"));
  assert.ok(res.rows.filter((r) => r.category === "error").every((r) => r.errors.length > 0));
  assert.equal(await count("SELECT COUNT(*) n FROM students"), before);
});

test("[B5] a different class for an existing NISN is 'moved', not skipped", { skip: skipNoDb }, async () => {
  const res = await preview([["0000000001", "Siswa A", "XI-B", "", ""]]);
  assert.equal(res.counts.moved, 1);
  assert.equal(res.rows[0].current_class_name, "XI-A");
});

test("[FR-10,B4] commit creates new students with computed angkatan and an enrollment", { skip: skipNoDb }, async () => {
  const res = await preview([["3333333333", "Anak X", "X-A", "P", "Jl. B"], ["3333333334", "Anak XI", "XI-A", "L", ""]]);
  const out = await svc.commitImport({ batchId: res.batch_id, actions: {} });
  assert.equal(out.result.created, 2);
  const [rows] = await db.pool.query("SELECT nisn, angkatan, academic_year FROM students WHERE nisn IN ('3333333333','3333333334') ORDER BY nisn");
  assert.deepEqual(rows.map((r) => r.angkatan), ["2026", "2025"]);
  assert.ok(rows.every((r) => r.academic_year === "2026/2027"));
  assert.equal(await count("SELECT COUNT(*) n FROM student_enrollments e JOIN students s ON s.id=e.student_id WHERE s.nisn IN ('3333333333','3333333334') AND e.end_date IS NULL"), 2);
});

test("[FR-10] a committed batch cannot be committed twice (409)", { skip: skipNoDb }, async () => {
  const res = await preview([["4444444444", "Sekali", "X-A", "L", ""]]);
  await svc.commitImport({ batchId: res.batch_id });
  await assert.rejects(() => svc.commitImport({ batchId: res.batch_id }), (e) => e instanceof HttpError && e.status === 409);
  await assert.rejects(() => svc.commitImport({ batchId: 999999 }), (e) => e.status === 404);
  await assert.rejects(() => svc.commitImport({ batchId: res.batch_id, actions: { moved: "x" } }), (e) => e.status === 400);
});

test("[FR-10] same file twice: seen-before warning, second import changes nothing", { skip: skipNoDb }, async () => {
  const rows = [["5555555555", "Dua Kali", "XI-A", "L", "Jl. C"]];
  const file1 = await makeFile(rows);
  const file2 = file1.replace(".xlsx", "_copy.xlsx");
  fs.copyFileSync(file1, file2);
  const first = await svc.previewImport({ filePath: file1, academicYearId: yearId, userId: 1 });
  await svc.commitImport({ batchId: first.batch_id });
  const second = await svc.previewImport({ filePath: file2, academicYearId: yearId, userId: 1 });
  assert.equal(second.file_seen_before, true);
  assert.deepEqual(second.counts, { new: 0, unchanged: 1, changed: 0, moved: 0, error: 0 });
  const before = await count("SELECT COUNT(*) n FROM student_enrollments");
  const out = await svc.commitImport({ batchId: second.batch_id, actions: { changed: "update", moved: "move" } });
  assert.equal(out.result.created + out.result.updated + out.result.moved, 0);
  assert.equal(await count("SELECT COUNT(*) n FROM student_enrollments"), before);
});

test("[FR-10] 'changed' is applied only when the action is update; blank file cells keep existing data", { skip: skipNoDb }, async () => {
  const res = await preview([["0000000002", "Siswa B Revisi", "XI-A", "", ""]]);
  await svc.commitImport({ batchId: res.batch_id, actions: { changed: "skip" } });
  assert.equal((await db.pool.query("SELECT name FROM students WHERE nisn='0000000002'"))[0][0].name, "Siswa B");
  const res2 = await preview([["0000000002", "Siswa B Revisi", "XI-A", "", ""]]);
  const out = await svc.commitImport({ batchId: res2.batch_id, actions: { changed: "update" } });
  assert.equal(out.result.updated, 1);
  assert.equal((await db.pool.query("SELECT name, angkatan FROM students WHERE nisn='0000000002'"))[0][0].name, "Siswa B Revisi");
  // existing angkatan is never overwritten
  assert.equal((await db.pool.query("SELECT angkatan FROM students WHERE nisn='0000000002'"))[0][0].angkatan, "2025");
});

test("[FR-10] moved + move action transfers the student; skip leaves them", { skip: skipNoDb }, async () => {
  const res = await preview([["0000000001", "Siswa A", "XI-B", "", ""]]);
  await svc.commitImport({ batchId: res.batch_id, actions: { moved: "skip" } });
  let [[cur]] = await db.pool.query("SELECT c.name FROM student_enrollments e JOIN classes c ON c.id=e.class_id JOIN students s ON s.id=e.student_id WHERE s.nisn='0000000001' AND e.end_date IS NULL");
  assert.equal(cur.name, "XI-A");
  const res2 = await preview([["0000000001", "Siswa A", "XI-B", "", ""]]);
  await svc.commitImport({ batchId: res2.batch_id, actions: { moved: "move" } });
  [[cur]] = await db.pool.query("SELECT c.name FROM student_enrollments e JOIN classes c ON c.id=e.class_id JOIN students s ON s.id=e.student_id WHERE s.nisn='0000000001' AND e.end_date IS NULL");
  assert.equal(cur.name, "XI-B");
});

test("a soft-deleted or inactive NISN is an error row, not a crash", { skip: skipNoDb }, async () => {
  await db.pool.query("UPDATE students SET is_deleted=1, is_active=0 WHERE nisn='4444444444'");
  await db.pool.query("UPDATE students SET is_active=0 WHERE nisn='3333333334'");
  const res = await preview([["4444444444", "Dihapus", "X-A", "", ""], ["3333333334", "Nonaktif", "XI-A", "", ""]]);
  assert.equal(res.counts.error, 2);
});
