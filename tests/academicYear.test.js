/**
 * Covers FR-01, FR-12 — academic year derived from the date (R1), no flag.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import academicYearServiceFactory, {
  resolveAcademicYear,
  labelFromStartDate,
  computeAngkatan,
} from "../src/services/academicYearService.js";
import { HttpError } from "../src/utils/errorResponse.js";
import { createTestDb, skipNoDb, FIXED_NOW } from "./helpers/testDb.js";

const YEARS = [
  { id: 1, label: "2025/2026", start_date: "2025-07-01", end_date: "2026-07-01" },
  { id: 2, label: "2026/2027", start_date: "2026-07-01", end_date: "2027-07-01" },
];

test("[FR-01] date inside a range resolves to that year", () => {
  const r = resolveAcademicYear(YEARS, "2026-01-15");
  assert.equal(r.year.label, "2025/2026");
  assert.equal(r.exact, true);
});

test("[FR-01] end_date is exclusive, start_date inclusive", () => {
  assert.equal(resolveAcademicYear(YEARS, "2026-06-30").year.label, "2025/2026");
  assert.equal(resolveAcademicYear(YEARS, "2026-07-01").year.label, "2026/2027");
});

test("[FR-01] date outside every range falls back to the nearest year, exact=false", () => {
  const r = resolveAcademicYear(YEARS, "2027-09-01");
  assert.equal(r.year.label, "2026/2027");
  assert.equal(r.exact, false);
  assert.equal(resolveAcademicYear(YEARS, "2025-01-01").year.label, "2025/2026");
});

test("[FR-01] empty year list resolves to null", () => {
  assert.deepEqual(resolveAcademicYear([], "2026-01-01"), { year: null, exact: false });
});

test("label and angkatan helpers", () => {
  assert.equal(labelFromStartDate("2027-07-01"), "2027/2028");
  assert.equal(computeAngkatan("2026/2027", 10), "2026");
  assert.equal(computeAngkatan("2026/2027", 11), "2025");
  assert.equal(computeAngkatan("2026/2027", 12), "2024");
});

let db;
let service;
before(async () => {
  if (skipNoDb) return;
  db = await createTestDb();
  service = academicYearServiceFactory({ pool: db.pool, now: FIXED_NOW });
});
after(async () => db && (await db.close()));

test("[FR-12] listWithCurrent marks exactly the year containing today", { skip: skipNoDb }, async () => {
  const list = await service.listWithCurrent();
  assert.deepEqual(
    list.filter((y) => y.is_current).map((y) => y.label),
    ["2026/2027"],
  );
});

test("[FR-12] overlapping range is rejected with 422", { skip: skipNoDb }, async () => {
  await assert.rejects(
    () => service.create({ start_date: "2026-12-01", end_date: "2027-12-01" }),
    (e) => e instanceof HttpError && e.status === 422,
  );
});

test("[FR-12] new year is created with a computed label", { skip: skipNoDb }, async () => {
  const created = await service.create({ start_date: "2027-07-01", end_date: "2028-07-01" });
  assert.equal(created.label, "2027/2028");
  await assert.rejects(
    () => service.create({ start_date: "2027-07-01", end_date: "2028-07-01" }),
    (e) => e instanceof HttpError,
  );
});

test("[FR-12] invalid dates are rejected", { skip: skipNoDb }, async () => {
  await assert.rejects(() => service.create({ start_date: "x", end_date: "y" }), (e) => e.status === 400);
  await assert.rejects(
    () => service.create({ start_date: "2030-07-01", end_date: "2030-07-01" }),
    (e) => e.status === 422,
  );
});
