/**
 * @fileoverview Real-database helper for service tests.
 *
 * Tests that need SQL semantics (enrollment ranges, transactions, unique keys)
 * run against a throw-away MariaDB/MySQL database. They are SKIPPED unless
 * one of these is set, so `npm test` stays green on machines without a DB:
 *
 *   TEST_DB_SOCKET=/run/mysqld/mysqld.sock        (or)
 *   TEST_DB_HOST=127.0.0.1  TEST_DB_PORT=3306
 *   TEST_DB_USER=root       TEST_DB_PASSWORD=...
 *
 * Each call creates a fresh schema: production structure
 * (tests/fixtures/base_schema.sql) + docs/migrations/m1a_attendance_schema.sql
 * + m2a_import_batches.sql — exactly what production looks like after M1a/M2a.
 * The database is dropped on close().
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

export const dbAvailable = Boolean(process.env.TEST_DB_SOCKET || process.env.TEST_DB_HOST);
export const skipNoDb = dbAvailable ? false : "TEST_DB_SOCKET/TEST_DB_HOST not set";

const connectionOptions = () => ({
  ...(process.env.TEST_DB_SOCKET
    ? { socketPath: process.env.TEST_DB_SOCKET }
    : {
        host: process.env.TEST_DB_HOST,
        port: Number(process.env.TEST_DB_PORT || 3306),
      }),
  user: process.env.TEST_DB_USER || "root",
  password: process.env.TEST_DB_PASSWORD || "",
});

let counter = 0;

/** @returns {Promise<{pool: import('mysql2/promise').Pool, name: string, close: () => Promise<void>}>} */
export const createTestDb = async () => {
  const name = `man3_test_${process.pid}_${Date.now()}_${counter++}`;
  const admin = await mysql.createConnection(connectionOptions());
  await admin.query(`CREATE DATABASE \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`);
  await admin.end();

  const loader = await mysql.createConnection({
    ...connectionOptions(),
    database: name,
    multipleStatements: true,
  });
  for (const file of [
    path.join(root, "tests/fixtures/base_schema.sql"),
    path.join(root, "../docs/migrations/m1a_attendance_schema.sql"),
    path.join(root, "../docs/migrations/m2a_import_batches.sql"),
  ]) {
    if (fs.existsSync(file)) await loader.query(fs.readFileSync(file, "utf8"));
  }
  await loader.end();

  const pool = mysql.createPool({
    ...connectionOptions(),
    database: name,
    connectionLimit: 5,
    dateStrings: false, // same as production bootstrap.js
  });

  return {
    pool,
    name,
    close: async () => {
      await pool.end();
      const dropper = await mysql.createConnection(connectionOptions());
      await dropper.query(`DROP DATABASE IF EXISTS \`${name}\``);
      await dropper.end();
    },
  };
};

/** Fixed clock: Wednesday 2026-10-14, 12:00 WIB. */
export const FIXED_NOW = () => new Date("2026-10-14T05:00:00Z");

/**
 * Fixture: years 2025/2026 + 2026/2027 (from M1a), classes X-A/XI-A/XII-A in
 * both years, and `n` students enrolled in 2026/2027 XI-A (open enrollments).
 * Returns ids for use in assertions.
 */
export const seedSchool = async (pool, { students = 3 } = {}) => {
  const [years] = await pool.query("SELECT id, label FROM academic_years");
  const yearId = Object.fromEntries(years.map((y) => [y.label, y.id]));

  const classId = {};
  for (const label of ["2025/2026", "2026/2027"]) {
    for (const [name, grade] of [["X-A", 10], ["XI-A", 11], ["XII-A", 12], ["XI-B", 11]]) {
      const [r] = await pool.query(
        "INSERT INTO classes (name, academic_year, semester, academic_year_id, grade_level) VALUES (?, ?, 'ganjil', ?, ?)",
        [name, label, yearId[label], grade],
      );
      classId[`${label}:${name}`] = r.insertId;
    }
  }

  await pool.query("INSERT INTO users (id, username, password_hash, role, full_name) VALUES (1, 'kuma', 'x', 'super_admin', 'Kuma')");

  const studentIds = [];
  for (let i = 1; i <= students; i++) {
    const [r] = await pool.query(
      `INSERT INTO students (nisn, name, academic_year, is_active, is_deleted, angkatan)
       VALUES (?, ?, '2026/2027', 1, 0, '2025')`,
      [`00000000${String(i).padStart(2, "0")}`, `Siswa ${String.fromCharCode(64 + i)}`],
    );
    studentIds.push(r.insertId);
    await pool.query(
      "INSERT INTO student_enrollments (student_id, class_id, start_date) VALUES (?, ?, '2026-07-01')",
      [r.insertId, classId["2026/2027:XI-A"]],
    );
  }
  return { yearId, classId, studentIds };
};
