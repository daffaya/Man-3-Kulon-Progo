// src/services/importStudentService.js
import ExcelJS from "exceljs";
import fs from "fs";

const importStudentServiceFactory = ({ studentModel }) => {
  // Daftar alias untuk setiap field database
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

  // Normalisasi string untuk pencocokan
  const normalizeString = (str) => {
    if (!str) return "";

    return str
      .toString()
      .toLowerCase()
      .replace(/[^\w\s\-\/]/g, " ") // Ganti karakter khusus dengan spasi, kecuali - dan /
      .replace(/\s+/g, " ") // Gabungkan multiple spasi
      .replace(/[\-\/]+/g, "-") // Gabungkan multiple - dan / menjadi -
      .trim();
  };

  // Cari field database berdasarkan header
  const findFieldByHeader = (header) => {
    const normalizedHeader = normalizeString(header);

    // Special handling for EMIS headers
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

    // Check EMIS headers first
    if (emisHeaders[normalizedHeader]) {
      return emisHeaders[normalizedHeader];
    }

    // Then check regular aliases
    for (const [field, aliases] of Object.entries(fieldAliases)) {
      for (const alias of aliases) {
        if (normalizeString(alias) === normalizedHeader) {
          return field;
        }
      }
    }

    return null;
  };

  // Baca header dan buat mapping
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

  // **FIX: Fungsi standarisasi jenis kelamin yang lebih robust**
  const standardizeJenisKelamin = (jenisKelamin) => {
    if (!jenisKelamin) return null;

    const normalized = jenisKelamin.toString().toUpperCase().trim();

    // Mapping berbagai format jenis kelamin
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

    return null; // Format tidak dikenali
  };

  const isSummaryRow = (rowData) => {
    // Skip kalau TIDAK ADA NISN atau NAMA
    if (!rowData.nisn || !rowData.name) {
      return true;
    }

    const nameLower = rowData.name.toString().toLowerCase().trim();
    const nisnStr = rowData.nisn.toString().trim();

    // **FIX: HANYA CEK NAME & NISN, BUKAN ALAMAT!**
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

    // **FIX: Nama 1 karakter SAJA yang di-skip**
    const nameIsSingleChar =
      nameLower.length === 1 && !/^[pl]$/i.test(nameLower);

    // **FIX: NISN harus 10+ digit**
    const nisnIsValid = /^\d{10,}$/.test(nisnStr);

    // **LOGIC BARU: Skip KALAU:**
    return (
      hasSummaryKeyword || // Keyword summary di NAME/NISN
      nameIsSingleChar || // Nama 1 karakter (bukan P/L)
      !nisnIsValid // NISN invalid
    );
  };

  // Cek apakah baris adalah baris kosong
  const isEmptyRow = (row) => {
    return !row.values || row.values.every((cell) => !cell);
  };

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

    console.log(`🔍 [CLASS] "${className}" -> "${standardized}"`);

    // **FIX 1: EMIS Pattern - Ambil ROMBEL TERAKHIR (A, B, C, D, etc)**
    const emisPattern = /^(\d+)\s*-?\s*[\dXVI]*\s*-?\s*([A-Z]{1,3})$/i; // {1,3} untuk A, B, C, AB, etc
    const emisMatch = standardized.match(emisPattern);

    if (emisMatch) {
      const level = parseInt(emisMatch[1]);
      const rombel = emisMatch[2];

      let romanLevel = "";
      if (level === 10) romanLevel = "X";
      else if (level === 11) romanLevel = "XI";
      else if (level === 12) romanLevel = "XII";

      const result = `${romanLevel}-${rombel}`;
      console.log(`✅ [EMIS] "${standardized}" -> ${result}`);
      return result;
    }

    // **FIX 2: Space to dash dulu**
    standardized = standardized.replace(/([A-Z0-9])\s+([A-Z0-9])/g, "$1-$2"); // "X C" -> "X-C", "10 A" -> "10-A"

    console.log(`🔍 [CLASS] After space: "${standardized}"`);

    // **FIX 3: Split by dash untuk ambil ROMBEL terakhir**
    const parts = standardized.split("-").filter((part) => part.trim());
    if (parts.length >= 2) {
      const levelPart = parts[0].trim();
      const rombelCandidates = parts.slice(1); // Ambil semua setelah level
      const rombel = rombelCandidates[rombelCandidates.length - 1]; // ROMBEL TERAKHIR

      let romanLevel = levelPart;
      const levelNum = parseInt(levelPart);
      if (levelNum === 10) romanLevel = "X";
      else if (levelNum === 11) romanLevel = "XI";
      else if (levelNum === 12) romanLevel = "XII";

      const result = `${romanLevel}-${rombel}`;
      console.log(
        `✅ [SPLIT] ${levelPart}|${rombelCandidates.join("|")} -> ${result}`
      );
      return result;
    }

    // **FIX 4: Simple patterns**
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

      const result = `${romanLevel}-${rombelPart}`;
      console.log(`✅ [SIMPLE] "${standardized}" -> ${result}`);
      return result;
    }

    console.log(`❌ [NO MATCH] "${standardized}"`);
    return standardized;
  };

  // Proses satu baris data
  const processRow = (row, headerMapping) => {
    const result = {};

    // Ambil data berdasarkan mapping header
    Object.keys(headerMapping).forEach((field) => {
      const columnIndex = headerMapping[field];
      if (columnIndex) {
        const cellValue = row.getCell(columnIndex).value;

        // Handle khusus untuk tanggal
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

  // **FIX: processWorksheet dengan skip breakdown lengkap**
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
      skipBreakdown: skipReasons, // **TAMBAHAN: Return skip breakdown**
    };

    // Skip worksheet "Tidak Aktif"
    if (worksheetName.toLowerCase().includes("tidak aktif")) {
      console.log(`Skipping worksheet: ${worksheetName}`);
      return results;
    }

    console.log(`\n=== Processing worksheet: ${worksheetName} ===`);

    // Buat header mapping
    const headerMapping = createHeaderMapping(worksheet);

    // Cek field wajib
    const requiredFields = ["nisn", "name", "className"];
    const missingFields = requiredFields.filter(
      (field) => !headerMapping[field]
    );

    if (missingFields.length > 0) {
      console.log(
        `[ERROR] Missing required fields: ${missingFields.join(", ")}`
      );
      results.hasCriticalError = true;
      results.errors.push({
        row: 1,
        worksheet: worksheetName,
        error: `Kolom wajib tidak ditemukan: ${missingFields.join(", ")}`,
      });
      return results;
    }

    const academicYear = await studentModel.getCurrentAcademicYear();
    console.log(`[Import] Using academic year: ${academicYear}`);

    const tempData = [];

    // Validasi data
    const validateRowData = (rowData, rowNumber) => {
      const errors = [];

      if (!rowData.nisn) errors.push("NISN kosong");
      if (!rowData.name) errors.push("Nama kosong");
      if (!rowData.className) errors.push("Kelas kosong");

      // **FIX: Validasi NISN lebih ketat (10+ digit)**
      if (rowData.nisn && !/^\d{10,}$/.test(rowData.nisn.toString())) {
        errors.push("NISN harus 10+ digit angka");
      }

      if (rowData.name && /^\d+$/.test(rowData.name.toString())) {
        errors.push("Nama tidak boleh hanya angka");
      }

      if (errors.length > 0) {
        console.log(`[Row ${rowNumber}] Validation errors:`, errors);
        return false;
      }

      return true;
    };

    // Hitung actual row count
    let actualRowCount = 0;
    for (let i = worksheet.rowCount; i >= 2; i--) {
      const row = worksheet.getRow(i);
      if (!isEmptyRow(row)) {
        actualRowCount = i;
        break;
      }
    }

    console.log(`[Worksheet] Actual rows: ${actualRowCount - 1}`);

    // **PROSES BARIS PER BARIS DENGAN LOG DETAIL**
    for (let i = 2; i <= actualRowCount; i++) {
      try {
        const row = worksheet.getRow(i);

        if (isEmptyRow(row)) {
          skipReasons.missingData++;
          results.skipped++;
          continue;
        }

        const rowData = processRow(row, headerMapping);

        // Skip summary rows
        if (isSummaryRow(rowData)) {
          skipReasons.summary++;
          results.skipped++;
          console.log(
            `[Row ${i}] SKIPPED - Summary: ${rowData.name || "EMPTY"}`
          );
          continue;
        }

        // Skip missing required data
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

        // Validate data
        if (!validateRowData(rowData, i)) {
          skipReasons.validationError++;
          results.skipped++;
          continue;
        }

        // **VALIDASI GENDER**
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

        // **STANDARISASI & VALIDASI KELAS (FIX UTAMA)**
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

        // **CEK DUPLIKAT**
        const existingStudent = await studentModel.getStudentByNISN(
          rowData.nisn
        );
        if (existingStudent) {
          skipReasons.duplicate++;
          results.skipped++;
          console.log(`[Row ${i}] SKIPPED - Duplicate: ${rowData.nisn}`);
          continue;
        }

        // **DATA VALID - Simpan ke temp**
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

        console.log(
          `[Row ${i}] ✅ VALID - ${rowData.name} (${rowData.nisn}) -> ${className}`
        );
      } catch (error) {
        console.error(`[Row ${i}] ERROR:`, error);
        skipReasons.validationError++;
        results.skipped++;
        results.errors.push({
          row: i,
          worksheet: worksheetName,
          error: error.message || "Error tidak diketahui",
        });
      }
    }

    // **COMMIT KE DATABASE**
    console.log(`\n[COMMIT] Saving ${tempData.length} students...`);
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
        console.error(`[COMMIT] Failed ${data.nisn}:`, error);
        results.failed++;
        results.errors.push({
          row: 0,
          worksheet: worksheetName,
          error: `Gagal simpan ${data.nisn}: ${error.message}`,
        });
      }
    }

    console.log(`\n=== ${worksheetName} SUMMARY ===`);
    console.log(
      `Success: ${results.success}, Skipped: ${results.skipped}, Failed: ${results.failed}`
    );
    console.log("Skip Breakdown:", skipReasons);

    return results;
  };

  // Proses import file Excel
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

      console.log("\n=== FINAL RESULTS ===", results);
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
