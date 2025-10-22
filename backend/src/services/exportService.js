// src/services/exportService.js
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Helper untuk mendapatkan __dirname di ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const exportToExcel = async (data, options) => {
  const {
    classId,
    period,
    className,
    academicYear,
    semester,
    startDate,
    endDate,
  } = options;

  // Create a new workbook
  const workbook = new ExcelJS.Workbook();

  // Add a worksheet
  const worksheet = workbook.addWorksheet("Rekap Presensi");

  // Add title
  const titleRow = worksheet.addRow(["REKAP PRESENSI SISWA"]);
  titleRow.font = { size: 16, bold: true };
  titleRow.alignment = { horizontal: "center" };
  worksheet.mergeCells("A1:H1");

  // Add class info
  const infoRow = worksheet.addRow([
    `Kelas: ${className}`,
    `Tahun Ajaran: ${academicYear}`,
    `Semester: ${semester}`,
    `Periode: ${
      period === "daily"
        ? "Harian"
        : period === "monthly"
        ? "Bulanan"
        : "Semesteran"
    }`,
  ]);
  infoRow.font = { size: 12 };
  worksheet.mergeCells("A2:D2");
  worksheet.mergeCells("E2:H2");

  // Add date range if not daily
  if (period !== "daily") {
    const dateRow = worksheet.addRow([`Tanggal: ${startDate} - ${endDate}`]);
    dateRow.font = { size: 12 };
    worksheet.mergeCells("A3:H3");
  }

  // Add empty row
  worksheet.addRow([]);

  // Add headers
  const headers = ["No", "NISN", "Nama Siswa"];
  if (period !== "daily") {
    headers.push(
      "Total Hari",
      "Hadir",
      "Izin",
      "Sakit",
      "Alpa",
      "Persentase Kehadiran"
    );
  } else {
    headers.push("Status", "Keterangan");
  }

  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD3D3D3" },
  };

  // Add data
  data.forEach((student, index) => {
    const row = [index + 1, student.nisn, student.name];

    if (period !== "daily") {
      row.push(
        student.total_hari || 0,
        student.hadir || 0,
        student.izin || 0,
        student.sakit || 0,
        student.alpa || 0,
        `${student.persentase_kehadiran || 0}%`
      );
    } else {
      row.push(student.status || "-", student.notes || "-");
    }

    worksheet.addRow(row);
  });

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    if (column.header) {
      column.width = column.header.length < 15 ? 15 : column.header.length;
    }
  });

  // Generate filename
  const date = new Date().toISOString().split("T")[0];
  const filename = `rekap_presensi_${className}_${period}_${date}.xlsx`;
  const filepath = path.join(__dirname, "../temp", filename);

  // Ensure temp directory exists
  if (!fs.existsSync(path.join(__dirname, "../temp"))) {
    fs.mkdirSync(path.join(__dirname, "../temp"), { recursive: true });
  }

  // Save the workbook
  await workbook.xlsx.writeFile(filepath);

  return {
    filename,
    filepath,
    mimetype:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
};

export const exportToPDF = async (data, options) => {
  const {
    classId,
    period,
    className,
    academicYear,
    semester,
    startDate,
    endDate,
  } = options;

  // Generate filename
  const date = new Date().toISOString().split("T")[0];
  const filename = `rekap_presensi_${className}_${period}_${date}.pdf`;
  const filepath = path.join(__dirname, "../temp", filename);

  // Ensure temp directory exists
  if (!fs.existsSync(path.join(__dirname, "../temp"))) {
    fs.mkdirSync(path.join(__dirname, "../temp"), { recursive: true });
  }

  // Create a new PDF document
  const doc = new PDFDocument({
    margin: 30,
    size: "A4",
  });

  // Pipe the PDF to a file
  doc.pipe(fs.createWriteStream(filepath));

  // Add title
  doc.fontSize(18).text("REKAP PRESENSI SISWA", { align: "center" });
  doc.moveDown();

  // Add class info
  doc.fontSize(12).text(`Kelas: ${className}`);
  doc.text(`Tahun Ajaran: ${academicYear}`);
  doc.text(`Semester: ${semester}`);
  doc.text(
    `Periode: ${
      period === "daily"
        ? "Harian"
        : period === "monthly"
        ? "Bulanan"
        : "Semesteran"
    }`
  );

  if (period !== "daily") {
    doc.text(`Tanggal: ${startDate} - ${endDate}`);
  }

  doc.moveDown();

  // Add table headers
  const headers = ["No", "NISN", "Nama Siswa"];
  if (period !== "daily") {
    headers.push("Total", "Hadir", "Izin", "Sakit", "Alpa", "%");
  } else {
    headers.push("Status", "Keterangan");
  }

  // Calculate column widths
  const columnWidths = [30, 70, 100];
  if (period !== "daily") {
    columnWidths.push(40, 40, 40, 40, 40, 40);
  } else {
    columnWidths.push(70, 100);
  }

  // Draw table headers
  let x = 30;
  headers.forEach((header, i) => {
    doc
      .fontSize(10)
      .text(header, x, doc.y, { width: columnWidths[i], align: "center" });
    x += columnWidths[i];
  });

  // Draw line under headers
  doc
    .moveTo(30, doc.y + 15)
    .lineTo(570, doc.y + 15)
    .stroke();
  doc.moveDown();

  // Add data
  data.forEach((student, index) => {
    const y = doc.y;

    // Add row data
    doc.fontSize(9).text(`${index + 1}`, 30, y, { width: 30, align: "center" });
    doc.text(student.nisn, 60, y, { width: 70 });
    doc.text(student.name, 130, y, { width: 100 });

    if (period !== "daily") {
      doc.text(`${student.total_hari || 0}`, 230, y, {
        width: 40,
        align: "center",
      });
      doc.text(`${student.hadir || 0}`, 270, y, { width: 40, align: "center" });
      doc.text(`${student.izin || 0}`, 310, y, { width: 40, align: "center" });
      doc.text(`${student.sakit || 0}`, 350, y, { width: 40, align: "center" });
      doc.text(`${student.alpa || 0}`, 390, y, { width: 40, align: "center" });
      doc.text(`${student.persentase_kehadiran || 0}%`, 430, y, {
        width: 40,
        align: "center",
      });
    } else {
      doc.text(student.status || "-", 230, y, { width: 70 });
      doc.text(student.notes || "-", 300, y, { width: 100 });
    }

    doc.moveDown();

    // Add line under each row
    doc
      .moveTo(30, doc.y - 5)
      .lineTo(570, doc.y - 5)
      .stroke();
  });

  // Finalize the PDF
  doc.end();

  return {
    filename,
    filepath,
    mimetype: "application/pdf",
  };
};
