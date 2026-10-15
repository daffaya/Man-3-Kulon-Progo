/**
 * @fileoverview Behavioral test for importStudentService's AUDIT-030 refactor
 * (batched class/NISN lookups + concurrent inserts instead of per-row
 * sequential DB calls). Builds a tiny in-memory workbook and a fake
 * studentModel, then checks that skip-reason counts and per-row error
 * attribution still work the same way they did before the refactor.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import ExcelJS from "exceljs";
import importStudentServiceFactory from "../src/services/importStudentService.js";

const ACADEMIC_YEAR = "2025/2026";

const buildWorkbook = (rows) => {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("Kelas XI");
  ws.addRow(["NISN", "Nama", "Kelas"]);
  rows.forEach((r) => ws.addRow(r));
  return workbook;
};

const makeFakeStudentModel = ({ existingNisns = [], classes = [] } = {}) => {
  const createdStudents = [];
  const createdHistory = [];
  return {
    getCurrentAcademicYear: async () => ACADEMIC_YEAR,
    getClassesByAcademicYear: async () => classes,
    getExistingNisns: async (nisns) =>
      new Set(nisns.filter((n) => existingNisns.includes(n))),
    createStudent: async (data) => {
      if (data.nisn === "1111111111") {
        throw new Error("simulated DB failure for this row");
      }
      createdStudents.push(data);
      return createdStudents.length; // fake sequential id
    },
    createStudentAcademicHistory: async (data) => {
      createdHistory.push(data);
      return createdHistory.length;
    },
    _debug: { createdStudents, createdHistory },
  };
};

test("AUDIT-030: valid row is imported, duplicate NISN is skipped, unknown class is skipped, failed insert is attributed to that row only", async () => {
  const fakeModel = makeFakeStudentModel({
    existingNisns: ["2222222222"], // already exists in "DB"
    classes: [{ id: 1, name: "XI-A", academic_year: ACADEMIC_YEAR }],
  });
  const service = importStudentServiceFactory({ studentModel: fakeModel });

  const workbook = buildWorkbook([
    ["1234567890", "Siswa Baru", "XI-A"], // valid, should succeed
    ["2222222222", "Siswa Duplikat", "XI-A"], // duplicate NISN -> skipped
    ["3333333333", "Siswa Kelas Aneh", "XII-Z"], // class not found -> skipped
    ["1111111111", "Siswa Gagal Insert", "XI-A"], // passes all checks, DB insert throws
  ]);
  const workbook_ = await workbook.xlsx.writeBuffer();

  // processImportFile expects a file path; write the buffer to a temp file.
  const fs = await import("node:fs");
  const os = await import("node:os");
  const path = await import("node:path");
  const tmpFile = path.join(os.tmpdir(), `audit030-test-${Date.now()}.xlsx`);
  fs.writeFileSync(tmpFile, workbook_);

  const results = await service.processImportFile(tmpFile);

  assert.equal(results.success, 1, "exactly 1 row should succeed");
  assert.equal(results.failed, 1, "exactly 1 row should fail at insert");
  assert.equal(results.skipped, 2, "2 rows should be skipped (duplicate + unknown class)");
  assert.equal(results.skipBreakdown.duplicate, 1);
  assert.equal(results.skipBreakdown.classNotFound, 1);

  // The failed row's error must still be attributable to its own NISN,
  // not silently swallowed or misattributed by the Promise.all batching.
  const failedError = results.errors.find((e) =>
    e.error.includes("1111111111"),
  );
  assert.ok(failedError, "failed row's error must mention its own NISN");

  assert.equal(fakeModel._debug.createdStudents.length, 1);
  assert.equal(fakeModel._debug.createdStudents[0].nisn, "1234567890");
  assert.equal(fakeModel._debug.createdHistory.length, 1);
});
