/**
 * @fileoverview Service for importing student data from Excel files.
 * This module provides a factory function that creates a service for processing Excel files
 * containing student data, with functions for mapping columns, validating data, and importing
 * students into the database.
 */

import ExcelJS from "exceljs";
import fs from "fs";

/**
 * Factory function that creates a student import service.
 * This service processes Excel files containing student data and imports valid records
 * into the database while handling various Excel formats and data validation.
 *
 * @param {object} dependencies - The dependencies object.
 * @param {object} dependencies.studentModel - The student model for database operations.
 * @returns {object} An object containing the import service methods.
 */
const importStudentServiceFactory = ({ studentModel }) => {
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

    const summaryKeywords = [
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

    const hasSummaryKeyword = summaryKeywords.some(
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

  /**
   * Processes an entire worksheet of student data.
   * Validates data, handles various formats, and prepares data for import.
   *
   * @param {ExcelJS.Worksheet} worksheet - The Excel worksheet to process.
   * @param {string} worksheetName - The name of the worksheet.
   * @returns {Promise<object>} A promise that resolves to an object containing import results.
   */
  const processWorksheet = async (worksheet, worksheetName) => {
    const skipReasons = {
      summary: 0,
      missingData: 0,
      duplicate: 0,
      validationError: 0,
      classNotFound: 0,
      genderError: 0,
      invalidNISN: 0,
    };

    const results = {
      success: 0,
      failed: 0,
      updated: 0,
      skipped: 0,
      errors: [],
      hasCriticalError: false,
      skipBreakdown: skipReasons,
    };

    if (worksheetName.toLowerCase().includes("tidak aktif")) {
      return results;
    }

    const headerMapping = createHeaderMapping(worksheet);

    const requiredFields = ["nisn", "name", "className"];
    const missingFields = requiredFields.filter(
      (field) => !headerMapping[field]
    );

    if (missingFields.length > 0) {
      results.hasCriticalError = true;
      results.errors.push({
        row: 1,
        worksheet: worksheetName,
        error: `Kolom wajib tidak ditemukan: ${missingFields.join(", ")}`,
      });
      return results;
    }

    const academicYear = await studentModel.getCurrentAcademicYear();

    const tempData = [];

    const validateRowData = (rowData, rowNumber) => {
      const errors = [];

      if (!rowData.nisn) errors.push("NISN kosong");
      if (!rowData.name) errors.push("Nama kosong");
      if (!rowData.className) errors.push("Kelas kosong");

      if (rowData.nisn && !/^\d{10,}$/.test(rowData.nisn.toString())) {
        errors.push("NISN harus 10+ digit angka");
      }

      if (rowData.name && /^\d+$/.test(rowData.name.toString())) {
        errors.push("Nama tidak boleh hanya angka");
      }

      if (errors.length > 0) {
        return false;
      }

      return true;
    };

    let actualRowCount = 0;
    for (let i = worksheet.rowCount; i >= 2; i--) {
      const row = worksheet.getRow(i);
      if (!isEmptyRow(row)) {
        actualRowCount = i;
        break;
      }
    }

    for (let i = 2; i <= actualRowCount; i++) {
      try {
        const row = worksheet.getRow(i);

        if (isEmptyRow(row)) {
          skipReasons.missingData++;
          results.skipped++;
          continue;
        }

        const rowData = processRow(row, headerMapping);

        if (isSummaryRow(rowData)) {
          skipReasons.summary++;
          results.skipped++;
          continue;
        }

        if (!rowData.nisn || !rowData.name || !rowData.className) {
          skipReasons.missingData++;
          results.skipped++;
          results.errors.push({
            row: i,
            worksheet: worksheetName,
            error: `Data wajib kosong (NISN=${!!rowData.nisn}, Name=${!!rowData.name}, Class=${!!rowData.className})`,
          });
          continue;
        }

        if (!validateRowData(rowData, i)) {
          skipReasons.validationError++;
          results.skipped++;
          continue;
        }

        const standardizedJenisKelamin = standardizeJenisKelamin(
          rowData.jenisKelamin
        );
        if (rowData.jenisKelamin && !standardizedJenisKelamin) {
          skipReasons.genderError++;
          results.skipped++;
          results.errors.push({
            row: i,
            worksheet: worksheetName,
            error: `Gender tidak valid: "${rowData.jenisKelamin}"`,
          });
          continue;
        }

        const originalClassName = rowData.className;
        const className = standardizeClassName(originalClassName);

        if (!className) {
          skipReasons.classNotFound++;
          results.skipped++;
          results.errors.push({
            row: i,
            worksheet: worksheetName,
            error: `Format kelas tidak valid: "${originalClassName}"`,
          });
          continue;
        }

        const classData = await studentModel.getClassByName(
          className,
          academicYear
        );
        if (!classData) {
          skipReasons.classNotFound++;
          results.skipped++;
          results.errors.push({
            row: i,
            worksheet: worksheetName,
            error: `Kelas tidak ditemukan: "${className}" (original: "${originalClassName}")`,
          });
          continue;
        }

        const existingStudent = await studentModel.getStudentByNISN(
          rowData.nisn
        );
        if (existingStudent) {
          skipReasons.duplicate++;
          results.skipped++;
          continue;
        }

        tempData.push({
          nisn: rowData.nisn,
          name: rowData.name,
          jenisKelamin: standardizedJenisKelamin,
          academicYear,
          nik: rowData.nik,
          birthPlace: rowData.birthPlace,
          birthDate: rowData.birthDate,
          address: rowData.address,
          phone: rowData.phone,
          parentName: rowData.parentName,
          className,
          classId: classData.id,
        });
      } catch (error) {
        skipReasons.validationError++;
        results.skipped++;
        results.errors.push({
          row: i,
          worksheet: worksheetName,
          error: error.message || "Error tidak diketahui",
        });
      }
    }

    for (const data of tempData) {
      try {
        const studentId = await studentModel.createStudent({
          nisn: data.nisn,
          name: data.name,
          jenisKelamin: data.jenisKelamin,
          academicYear: data.academicYear,
          nik: data.nik,
          birthPlace: data.birthPlace,
          birthDate: data.birthDate,
          address: data.address,
          phone: data.phone,
          parentName: data.parentName,
        });

        await studentModel.createStudentAcademicHistory({
          studentId,
          classId: data.classId,
          academicYear: data.academicYear,
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: 0,
          worksheet: worksheetName,
          error: `Gagal simpan ${data.nisn}: ${error.message}`,
        });
      }
    }

    return results;
  };

  /**
   * Processes an Excel file containing student data.
   * Reads the file, processes each worksheet, and returns import results.
   *
   * @param {string} filePath - The path to the Excel file.
   * @returns {Promise<object>} A promise that resolves to an object containing import results.
   */
  const processImportFile = async (filePath) => {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      const results = {
        success: 0,
        failed: 0,
        updated: 0,
        skipped: 0,
        errors: [],
        worksheetDetails: {},
        skipBreakdown: {
          summary: 0,
          missingData: 0,
          duplicate: 0,
          validationError: 0,
          classNotFound: 0,
          genderError: 0,
          invalidNISN: 0,
        },
      };

      for (const worksheet of workbook.worksheets) {
        const wsName = worksheet.name;
        const wsResult = await processWorksheet(worksheet, wsName);

        results.worksheetDetails[wsName] = wsResult;
        results.success += wsResult.success;
        results.failed += wsResult.failed;
        results.skipped += wsResult.skipped;
        results.errors.push(...wsResult.errors);

        if (wsResult.skipBreakdown) {
          Object.keys(wsResult.skipBreakdown).forEach((key) => {
            results.skipBreakdown[key] += wsResult.skipBreakdown[key];
          });
        }
      }

      fs.unlinkSync(filePath);

      return results;
    } catch (error) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      throw error;
    }
  };

  return {
    processImportFile,
  };
};

export default importStudentServiceFactory;
