/**
 * @fileoverview Service for importing student data from Excel files.
 * This module provides a factory function that creates a service for processing Excel files
 * containing student data, with functions for mapping columns, validating data, and importing
 * students into the database.
 */

import ExcelJS from "exceljs";
import fs from "fs";
import crypto from "crypto";
import academicYearServiceFactory, { computeAngkatan } from "./academicYearService.js";
import { HttpError } from "../utils/errorResponse.js";
import { moveEnrollment, syncLegacyHistory } from "./studentLifecycleService.js";

/**
 * Words/name-fragments that mark an Excel row as a summary/signature row
 * (to skip) rather than a real student record.
 *
 * AUDIT-031: this heuristic is tightly coupled to one specific school's
 * Excel template — the current template's signature block includes the
 * developer's own name ("daffa", "pasya", "al ghifary") and staff-title
 * abbreviations ("nip", "kom", "pd", "s.pd", "sekretaris", "kepala").
 * These are matched as case-insensitive substrings against the row's name
 * column, so they'll misbehave the moment the template's signatory or
 * wording changes, and a future maintainer has no way to know why these
 * specific strings are here without this comment. Left as-is (not moved to
 * a more structural check) since changing the matching logic itself needs
 * testing against real historical import files, which weren't available
 * for this pass — see AUDIT-031 in CODEBASE_AUDIT_REPORT.md.
 * @type {string[]}
 */
const SUMMARY_ROW_KEYWORDS = [
  "jumlah",
  "total",
  "summary",
  "subtotal",
  "keseluruhan",
  "rekapitulasi",
  "daffa",
  "pasya",
  "al ghifary",
  "nip",
  "kom",
  "pd",
  "s.pd",
  "sekretaris",
  "kepala",
];

/**
 * Factory function that creates a student import service.
 * This service processes Excel files containing student data and imports valid records
 * into the database while handling various Excel formats and data validation.
 *
 * @param {object} dependencies - The dependencies object.
 * @param {object} dependencies.pool - Database pool.
 * @returns {object} An object containing the import service methods.
 */
const importStudentServiceFactory = ({ pool, now = () => new Date() }) => {
  const yearService = academicYearServiceFactory({ pool, now });
  const fieldAliases = {
    nisn: ["nisn", "no induk", "no. induk", "nomor induk", "id siswa"],
    name: ["nama", "nama lengkap", "nama siswa", "siswa", "nama lengkap siswa"],
    className: [
      "kelas",
      "kelas rombel",
      "kelas-rombel",
      "kelas/rombel",
      "tingkat",
      "rombel",
      "tingkat kelas",
      "tingkat - rombel",
      "tingkat rombel",
      "tingkat - rombel",
    ],
    jenisKelamin: ["jenis kelamin", "jk", "gender", "kelamin", "sex"],
    nik: ["nik", "no nik", "nomor nik"],
    birthPlace: ["tempat lahir", "tmpt lahir", "ttl"],
    birthDate: ["tanggal lahir", "tgl lahir", "birth date"],
    address: ["alamat", "domisili"],
    phone: ["no telepon", "telepon", "no hp", "hp", "phone"],
    parentName: [
      "nama orang tua",
      "nama ayah",
      "nama ibu",
      "nama wali",
      "ortu",
    ],
  };

  /**
   * Normalizes a string by removing special characters and standardizing formatting.
   * Used for matching Excel column headers to database fields.
   *
   * @param {string} str - The string to normalize.
   * @returns {string} The normalized string.
   */
  const normalizeString = (str) => {
    if (!str) return "";

    return str
      .toString()
      .toLowerCase()
      .replace(/[^\w\s\-\/]/g, " ")
      .replace(/\s+/g, " ")
      .replace(/[\-\/]+/g, "-")
      .trim();
  };

  /**
   * Finds the corresponding database field for an Excel header.
   * First checks EMIS headers, then checks against the field aliases.
   *
   * @param {string} header - The Excel header to match.
   * @returns {string|null} The matching database field or null if not found.
   */
  const findFieldByHeader = (header) => {
    const normalizedHeader = normalizeString(header);

    const emisHeaders = {
      "tingkat - rombel": "className",
      "tingkat rombel": "className",
      "nama lengkap": "name",
      nisn: "nisn",
      "tempat lahir": "birthPlace",
      "tanggal lahir": "birthDate",
      "jenis kelamin": "jenisKelamin",
      alamat: "address",
      "no telepon": "phone",
      "nama ayah kandung": "parentName",
      "nama ibu kandung": "parentName",
    };

    if (emisHeaders[normalizedHeader]) {
      return emisHeaders[normalizedHeader];
    }

    for (const [field, aliases] of Object.entries(fieldAliases)) {
      for (const alias of aliases) {
        if (normalizeString(alias) === normalizedHeader) {
          return field;
        }
      }
    }

    return null;
  };

  /**
   * Creates a mapping between Excel column headers and database fields.
   * Reads the first row of the worksheet and maps each column to its corresponding field.
   *
   * @param {ExcelJS.Worksheet} worksheet - The Excel worksheet to process.
   * @returns {object} An object mapping field names to column numbers.
   */
  const createHeaderMapping = (worksheet) => {
    const headerRow = worksheet.getRow(1);
    const mapping = {};

    headerRow.eachCell((cell, colNumber) => {
      const headerValue = cell.value;
      if (headerValue) {
        const field = findFieldByHeader(headerValue);
        if (field) {
          mapping[field] = colNumber;
        }
      }
    });

    return mapping;
  };

  /**
   * Standardizes gender values to 'L' (Laki-laki) or 'P' (Perempuan).
   * Handles various input formats for gender data.
   *
   * @param {string} jenisKelamin - The gender value to standardize.
   * @returns {string|null} 'L' for male, 'P' for female, or null if unrecognizable.
   */
  const standardizeJenisKelamin = (jenisKelamin) => {
    if (!jenisKelamin) return null;

    const normalized = jenisKelamin.toString().toUpperCase().trim();

    if (
      normalized.includes("LAKI") ||
      normalized.includes("L") ||
      normalized === "PRIA"
    ) {
      return "L";
    }

    if (
      normalized.includes("PEREMPUAN") ||
      normalized.includes("P") ||
      normalized === "WANITA"
    ) {
      return "P";
    }

    return null;
  };

  /**
   * Determines if a row is a summary row that should be skipped.
   * Checks for various indicators that a row contains summary data rather than student data.
   *
   * @param {object} rowData - The row data to check.
   * @returns {boolean} True if the row should be skipped, false otherwise.
   */
  const isSummaryRow = (rowData) => {
    if (!rowData.nisn || !rowData.name) {
      return true;
    }

    const nameLower = rowData.name.toString().toLowerCase().trim();
    const nisnStr = rowData.nisn.toString().trim();

    const hasSummaryKeyword = SUMMARY_ROW_KEYWORDS.some(
      (keyword) =>
        nameLower.includes(keyword) || nisnStr.toLowerCase().includes(keyword)
    );

    const nameIsSingleChar =
      nameLower.length === 1 && !/^[pl]$/i.test(nameLower);

    const nisnIsValid = /^\d{10,}$/.test(nisnStr);

    return hasSummaryKeyword || nameIsSingleChar || !nisnIsValid;
  };

  /**
   * Checks if a row is empty (contains no data).
   *
   * @param {ExcelJS.Row} row - The Excel row to check.
   * @returns {boolean} True if the row is empty, false otherwise.
   */
  const isEmptyRow = (row) => {
    return !row.values || row.values.every((cell) => !cell);
  };

  /**
   * Standardizes class names to a consistent format (e.g., "X-A", "XI-B").
   * Handles various input formats for class names.
   *
   * @param {string} className - The class name to standardize.
   * @returns {string} The standardized class name.
   */
  const standardizeClassName = (className) => {
    if (!className) return "";

    let standardized = className
      .toString()
      .toUpperCase()
      .trim()
      .replace(/KELAS\s*/g, "")
      .replace(/\s+/g, " ")
      .replace(/^\s*[-–—]\s*/g, "")
      .replace(/\s*[-–—]\s*$/g, "")
      .replace(/\s*[–—]\s*/g, "-")
      .replace(/\s*-\s*/g, "-");

    const emisPattern = /^(\d+)\s*-?\s*[\dXVI]*\s*-?\s*([A-Z]{1,3})$/i;
    const emisMatch = standardized.match(emisPattern);

    if (emisMatch) {
      const level = parseInt(emisMatch[1]);
      const rombel = emisMatch[2];

      let romanLevel = "";
      if (level === 10) romanLevel = "X";
      else if (level === 11) romanLevel = "XI";
      else if (level === 12) romanLevel = "XII";

      return `${romanLevel}-${rombel}`;
    }

    standardized = standardized.replace(/([A-Z0-9])\s+([A-Z0-9])/g, "$1-$2");

    const parts = standardized.split("-").filter((part) => part.trim());
    if (parts.length >= 2) {
      const levelPart = parts[0].trim();
      const rombelCandidates = parts.slice(1);
      const rombel = rombelCandidates[rombelCandidates.length - 1];

      let romanLevel = levelPart;
      const levelNum = parseInt(levelPart);
      if (levelNum === 10) romanLevel = "X";
      else if (levelNum === 11) romanLevel = "XI";
      else if (levelNum === 12) romanLevel = "XII";

      return `${romanLevel}-${rombel}`;
    }

    const simplePattern = /^(\d+|[XVI]+)\s*-?\s*([A-Z]+)$/i;
    const simpleMatch = standardized.match(simplePattern);

    if (simpleMatch) {
      const levelPart = simpleMatch[1];
      const rombelPart = simpleMatch[2];

      let romanLevel = levelPart;
      const levelNum = parseInt(levelPart);
      if (levelNum === 10) romanLevel = "X";
      else if (levelNum === 11) romanLevel = "XI";
      else if (levelNum === 12) romanLevel = "XII";

      return `${romanLevel}-${rombelPart}`;
    }

    return standardized;
  };

  /**
   * Processes a single row of Excel data and maps it to student data fields.
   * Uses the header mapping to extract data from the appropriate columns.
   *
   * @param {ExcelJS.Row} row - The Excel row to process.
   * @param {object} headerMapping - The mapping of fields to column numbers.
   * @returns {object} An object containing the extracted student data.
   */
  const processRow = (row, headerMapping) => {
    const result = {};

    Object.keys(headerMapping).forEach((field) => {
      const columnIndex = headerMapping[field];
      if (columnIndex) {
        const cellValue = row.getCell(columnIndex).value;

        if (field === "birthDate" && cellValue) {
          if (typeof cellValue === "number") {
            const date = new Date((cellValue - 25569) * 86400 * 1000);
            result[field] = date.toISOString().split("T")[0];
          } else {
            result[field] = cellValue;
          }
        } else {
          result[field] = cellValue ? cellValue.toString().trim() : null;
        }
      }
    });

    return result;
  };

  const COMPARE_FIELDS = [
    ["name", "name"],
    ["jenis_kelamin", "jenisKelamin"],
    ["nik", "nik"],
    ["birth_place", "birthPlace"],
    ["birth_date", "birthDate"],
    ["address", "address"],
    ["phone", "phone"],
    ["parent_name", "parentName"],
  ];

  /** Excel dates arrive as Date, serial number, ISO or dd/mm/yyyy text -> "YYYY-MM-DD" or null. */
  const normalizeDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    const str = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
    const dmy = str.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
    if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
    return null;
  };

  const emptyToNull = (v) => (v === undefined || v === null || String(v).trim() === "" ? null : String(v).trim());

  /**
   * Reads one worksheet into candidate rows (no database access).
   * Rows that are blank or look like summary/signature rows are dropped.
   */
  const readWorksheet = (worksheet, worksheetName) => {
    const rows = [];
    const sheetErrors = [];
    if (worksheetName.toLowerCase().includes("tidak aktif")) return { rows, sheetErrors };

    const headerMapping = createHeaderMapping(worksheet);
    const missing = ["nisn", "name", "className"].filter((f) => !headerMapping[f]);
    if (missing.length > 0) {
      sheetErrors.push({
        worksheet: worksheetName,
        error: `Kolom wajib tidak ditemukan: ${missing.join(", ")}`,
      });
      return { rows, sheetErrors };
    }

    let last = 0;
    for (let i = worksheet.rowCount; i >= 2; i--) {
      if (!isEmptyRow(worksheet.getRow(i))) {
        last = i;
        break;
      }
    }

    for (let i = 2; i <= last; i++) {
      const row = worksheet.getRow(i);
      if (isEmptyRow(row)) continue;
      const data = processRow(row, headerMapping);
      if (isSummaryRow(data)) continue;
      rows.push({ row: i, worksheet: worksheetName, data });
    }
    return { rows, sheetErrors };
  };

  /**
   * Step 1 of the import: parse + classify every row against the database and
   * store the result as a `previewed` batch. NOTHING is written to students.
   * Categories: new, unchanged, changed (data differs), moved (class differs), error.
   */
  const previewImport = async ({ filePath, academicYearId, userId }) => {
    try {
      const year = await yearService.getById(Number(academicYearId));
      if (!year) throw new HttpError(404, "Tahun ajaran tidak ditemukan");

      const buffer = fs.readFileSync(filePath);
      const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const candidates = [];
      const sheetErrors = [];
      for (const ws of workbook.worksheets) {
        const read = readWorksheet(ws, ws.name);
        candidates.push(...read.rows);
        sheetErrors.push(...read.sheetErrors);
      }

      const [classes] = await pool.query(
        "SELECT id, name, grade_level FROM classes WHERE academic_year_id = ?",
        [year.id],
      );
      const classByName = new Map(classes.map((c) => [c.name, c]));
      const classById = new Map(classes.map((c) => [c.id, c]));

      const nisns = [...new Set(candidates.map((c) => String(c.data.nisn || "").trim()).filter(Boolean))];
      const existingByNisn = new Map();
      if (nisns.length > 0) {
        const [existing] = await pool.query(
          `SELECT s.id, s.nisn, s.name, s.jenis_kelamin, s.nik, s.birth_place,
                  DATE_FORMAT(s.birth_date, '%Y-%m-%d') AS birth_date,
                  s.address, s.phone, s.parent_name, s.angkatan, s.is_active, s.is_deleted,
                  e.class_id AS current_class_id, c.name AS current_class_name
             FROM students s
             LEFT JOIN student_enrollments e ON e.student_id = s.id AND e.end_date IS NULL
             LEFT JOIN classes c ON c.id = e.class_id
            WHERE s.nisn IN (?)`,
          [nisns],
        );
        existing.forEach((s) => existingByNisn.set(String(s.nisn), s));
      }

      const seenInFile = new Set();
      const rows = candidates.map(({ row, worksheet, data }) => {
        const base = { row, worksheet, nisn: String(data.nisn || "").trim(), name: data.name };
        const errors = [];

        if (!base.nisn) errors.push("NISN kosong");
        else if (!/^\d{10,}$/.test(base.nisn)) errors.push("NISN harus 10+ digit angka");
        else if (seenInFile.has(base.nisn)) errors.push("NISN ganda di dalam file");
        seenInFile.add(base.nisn);

        if (!data.name) errors.push("Nama kosong");
        else if (/^\d+$/.test(String(data.name))) errors.push("Nama tidak boleh hanya angka");

        const gender = standardizeJenisKelamin(data.jenisKelamin);
        if (data.jenisKelamin && !gender) errors.push(`Gender tidak valid: "${data.jenisKelamin}"`);

        const className = standardizeClassName(data.className);
        const cls = className ? classByName.get(className) : null;
        if (!className) errors.push(`Format kelas tidak valid: "${data.className}"`);
        else if (!cls) {
          errors.push(`Kelas ${className} tidak ada pada tahun ajaran ${year.label}`);
        }

        if (errors.length > 0) {
          return { ...base, class_name: className || null, category: "error", errors };
        }

        const incoming = {
          name: emptyToNull(data.name),
          jenis_kelamin: gender,
          nik: emptyToNull(data.nik),
          birth_place: emptyToNull(data.birthPlace),
          birth_date: normalizeDate(data.birthDate),
          address: emptyToNull(data.address),
          phone: emptyToNull(data.phone),
          parent_name: emptyToNull(data.parentName),
        };
        const common = { ...base, class_id: cls.id, class_name: cls.name, data: incoming };

        const existing = existingByNisn.get(base.nisn);
        if (!existing) return { ...common, category: "new" };

        if (existing.is_deleted) {
          return { ...common, category: "error", errors: ["NISN sudah pernah terdaftar lalu dihapus"] };
        }
        if (!existing.is_active) {
          return {
            ...common,
            category: "error",
            errors: ["Siswa sudah nonaktif (lulus atau keluar); tidak diubah oleh import"],
          };
        }

        const diff = [];
        for (const [column] of COMPARE_FIELDS) {
          const next = incoming[column];
          if (next === null || next === undefined) continue; // blank in file = keep what we have
          const prev = existing[column] === null ? null : String(existing[column]);
          if (prev !== String(next)) diff.push({ field: column, old: prev, new: next });
        }

        const base2 = {
          ...common,
          student_id: existing.id,
          diff,
          current_class_name: existing.current_class_name || null,
        };
        if (existing.current_class_id !== cls.id) return { ...base2, category: "moved" };
        if (diff.length > 0) return { ...base2, category: "changed" };
        return { ...base2, category: "unchanged" };
      });

      sheetErrors.forEach((e) =>
        rows.push({ row: 1, worksheet: e.worksheet, nisn: "", name: "", category: "error", errors: [e.error] }),
      );

      const counts = { new: 0, unchanged: 0, changed: 0, moved: 0, error: 0 };
      rows.forEach((r) => (counts[r.category] += 1));

      const [seen] = await pool.query(
        "SELECT COUNT(*) AS n FROM import_batches WHERE file_hash = ? AND status = 'committed'",
        [fileHash],
      );

      const [result] = await pool.query(
        `INSERT INTO import_batches (file_hash, user_id, academic_year_id, status, payload, summary)
         VALUES (?, ?, ?, 'previewed', ?, ?)`,
        [fileHash, userId, year.id, JSON.stringify(rows), JSON.stringify(counts)],
      );

      return {
        batch_id: result.insertId,
        file_seen_before: Number(seen[0].n) > 0,
        academic_year: year,
        counts,
        rows,
      };
    } finally {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  };

  /**
   * Step 2: apply a previewed batch. `actions.changed` = update|skip and
   * `actions.moved` = move|skip (default skip). All-or-nothing transaction.
   * Unchanged rows never write. Existing `angkatan` is never overwritten, only
   * filled when empty.
   */
  const commitImport = async ({ batchId, actions = {} }) => {
    const changedAction = actions.changed || "skip";
    const movedAction = actions.moved || "skip";
    if (!["update", "skip"].includes(changedAction) || !["move", "skip"].includes(movedAction)) {
      throw new HttpError(400, "Aksi tidak valid (changed: update|skip, moved: move|skip)");
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [batches] = await conn.query("SELECT * FROM import_batches WHERE id = ? FOR UPDATE", [
        Number(batchId),
      ]);
      const batch = batches[0];
      if (!batch) throw new HttpError(404, "Batch import tidak ditemukan");
      if (batch.status !== "previewed") {
        throw new HttpError(409, "Batch import ini sudah diproses");
      }

      const year = await yearService.getById(batch.academic_year_id, conn);
      const rows = typeof batch.payload === "string" ? JSON.parse(batch.payload) : batch.payload;
      const [classRows] = await conn.query(
        "SELECT id, name, grade_level, academic_year, academic_year_id FROM classes WHERE academic_year_id = ?",
        [year.id],
      );
      const classById = new Map(classRows.map((c) => [c.id, c]));

      const result = { created: 0, updated: 0, moved: 0, skipped: 0, failed: 0, errors: [] };

      for (const r of rows) {
        const cls = classById.get(r.class_id);
        try {
          if (r.category === "new") {
            const [dup] = await conn.query("SELECT id FROM students WHERE nisn = ?", [r.nisn]);
            if (dup.length > 0) {
              result.skipped++;
              continue;
            }
            const angkatan = computeAngkatan(year.label, cls.grade_level);
            const d = r.data;
            const [ins] = await conn.query(
              `INSERT INTO students
                 (nisn, name, jenis_kelamin, academic_year, is_active, is_deleted,
                  nik, birth_place, birth_date, address, phone, parent_name, angkatan)
               VALUES (?, ?, ?, ?, 1, 0, ?, ?, ?, ?, ?, ?, ?)`,
              [r.nisn, d.name, d.jenis_kelamin, year.label, d.nik, d.birth_place, d.birth_date, d.address, d.phone, d.parent_name, angkatan],
            );
            await conn.query(
              "INSERT INTO student_enrollments (student_id, class_id, start_date) VALUES (?, ?, ?)",
              [ins.insertId, cls.id, year.start_date],
            );
            await syncLegacyHistory(conn, {
              studentId: ins.insertId,
              classId: cls.id,
              yearLabel: year.label,
              angkatan,
            });
            result.created++;
          } else if (r.category === "unchanged" || r.category === "error") {
            result.skipped++;
          } else {
            // changed | moved
            const wantsUpdate = r.diff && r.diff.length > 0 && changedAction === "update";
            const wantsMove = r.category === "moved" && movedAction === "move";

            if (wantsUpdate) {
              const sets = r.diff.map((d) => `${d.field} = ?`).join(", ");
              await conn.query(`UPDATE students SET ${sets} WHERE id = ?`, [
                ...r.diff.map((d) => d.new),
                r.student_id,
              ]);
              result.updated++;
            }
            if (wantsMove) {
              const [cur] = await conn.query(
                `SELECT c.academic_year_id, c.grade_level
                   FROM student_enrollments e JOIN classes c ON c.id = e.class_id
                  WHERE e.student_id = ? AND e.end_date IS NULL`,
                [r.student_id],
              );
              const sameYear = cur[0] && cur[0].academic_year_id === year.id;
              const reason = !cur[0]
                ? "transferred_class"
                : !sameYear
                  ? "promoted"
                  : cur[0].grade_level === cls.grade_level
                    ? "transferred_class"
                    : "correction";
              const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(now());
              const effective = sameYear
                ? today < year.start_date
                  ? year.start_date
                  : today >= year.end_date
                    ? year.start_date
                    : today
                : year.start_date;
              const [stu] = await conn.query("SELECT angkatan FROM students WHERE id = ?", [r.student_id]);
              await moveEnrollment(conn, {
                studentId: r.student_id,
                toClass: cls,
                effectiveDate: effective,
                reason,
                angkatan: stu[0]?.angkatan || computeAngkatan(year.label, cls.grade_level),
              });
              result.moved++;
            }
            if (!wantsUpdate && !wantsMove) result.skipped++;
            // fill an EMPTY angkatan only
            if (wantsUpdate || wantsMove) {
              await conn.query(
                "UPDATE students SET angkatan = ? WHERE id = ? AND (angkatan IS NULL OR angkatan = '')",
                [computeAngkatan(year.label, cls.grade_level), r.student_id],
              );
            }
          }
        } catch (error) {
          // A DB error aborts the whole batch: partial imports are worse than none.
          console.error(error);
          throw new HttpError(500, `Gagal memproses baris ${r.row} (NISN ${r.nisn})`);
        }
      }

      const previewCounts =
        typeof batch.summary === "string" ? JSON.parse(batch.summary) : batch.summary || {};
      await conn.query(
        "UPDATE import_batches SET status = 'committed', committed_at = CURRENT_TIMESTAMP, summary = ? WHERE id = ?",
        [JSON.stringify({ counts: previewCounts, result }), batch.id],
      );
      await conn.commit();
      return { success: true, result };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  };

  return {
    previewImport,
    commitImport,
  };
};

export default importStudentServiceFactory;
