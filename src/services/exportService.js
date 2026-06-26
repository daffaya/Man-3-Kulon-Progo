/**
 * @fileoverview Service for exporting data to Excel and PDF formats.
 * This module provides functions to generate Excel and PDF reports for student attendance,
 * including formatting, styling, and file management.
 */

import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Exports student attendance data to an Excel file with modern styling.
 */
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

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Rekap Presensi");

  // ====================== HEADER KOP ======================
  const titleRow = worksheet.addRow(["REKAP PRESENSI SISWA"]);
  titleRow.font = { size: 16, bold: true };
  titleRow.alignment = { horizontal: "center" };
  worksheet.mergeCells("A1:H1");

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
  infoRow.font = { size: 11 };
  infoRow.alignment = { horizontal: "left" };
  worksheet.mergeCells("A2:D2");
  worksheet.mergeCells("E2:H2");

  if (period !== "daily") {
    const dateRow = worksheet.addRow([`Tanggal: ${startDate} - ${endDate}`]);
    dateRow.font = { size: 11, italic: true };
    worksheet.mergeCells("A3:H3");
  }

  worksheet.addRow([]); // Spacer

  // ====================== TABLE HEADERS ======================
  const headers = ["No", "NISN", "Nama Siswa"];
  if (period !== "daily") {
    headers.push("Total Hari", "Hadir", "Izin", "Sakit", "Alpa", "% Kehadiran");
  } else {
    headers.push("Status", "Keterangan");
  }

  const headerRow = worksheet.addRow(headers);

  // Styling Header Table
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } }; // White text
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E3A5F" }, // Dark Blue background
  };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };
  headerRow.height = 22; // Taller header

  // ====================== DATA ROWS ======================
  data.forEach((student, index) => {
    const rowData = [index + 1, student.nisn, student.name];

    if (period !== "daily") {
      rowData.push(
        student.total_hari || 0,
        student.hadir || 0,
        student.izin || 0,
        student.sakit || 0,
        student.alpa || 0,
        `${student.persentase_kehadiran || 0}%`,
      );
    } else {
      rowData.push(student.status || "-", student.notes || "-");
    }

    const row = worksheet.addRow(rowData);

    // Zebra Striping (Alternate row colors)
    if (index % 2 === 0) {
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF5F5F5" }, // Light grey
      };
    }

    // Alignment
    row.getCell(1).alignment = { horizontal: "center" }; // No
    row.getCell(2).alignment = { horizontal: "left" }; // NISN

    // Center numeric values for non-daily period
    if (period !== "daily") {
      for (let i = 3; i < rowData.length; i++) {
        row.getCell(i + 1).alignment = { horizontal: "center" };
      }
    }
  });

  // ====================== COLUMN WIDTHS ======================
  worksheet.columns.forEach((column, i) => {
    let width = 15; // Default
    if (i === 0) width = 5; // No
    if (i === 2) width = 30; // Nama
    if (i === 1) width = 15; // NISN

    // Specific adjustments for daily vs non-daily
    if (period === "daily") {
      if (i === 4) width = 40; // Keterangan
    } else {
      if (i === 3 || i === 4) width = 10; // Total/Hadir
    }

    column.width = width;
  });

  // ====================== EXCEL FEATURES ======================
  // Freeze Header Row (Row 5 is the header, so freeze after row 5)
  worksheet.views = [{ state: "frozen", ySplit: 5 }];

  // Auto Filter
  const lastColLetter = period !== "daily" ? "I" : "E";
  worksheet.autoFilter = {
    from: `A5`,
    to: `${lastColLetter}5`,
  };

  // ====================== WRITE FILE ======================
  const date = new Date().toISOString().split("T")[0];
  const filename = `rekap_presensi_${className}_${period}_${date}.xlsx`;
  const filepath = path.join(__dirname, "../temp", filename);

  if (!fs.existsSync(path.join(__dirname, "../temp"))) {
    fs.mkdirSync(path.join(__dirname, "../temp"), { recursive: true });
  }

  await workbook.xlsx.writeFile(filepath);

  return {
    filename,
    filepath,
    mimetype:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
};

/**
 * Exports student attendance data to a PDF file with clean layout.
 */
export const exportToPDF = async (data, options) => {
  const { period, className, academicYear, semester, startDate, endDate } =
    options;

  const date = new Date().toISOString().split("T")[0];
  const filename = `rekap_presensi_${className}_${period}_${date}.pdf`;
  const filepath = path.join(__dirname, "../temp", filename);

  if (!fs.existsSync(path.join(__dirname, "../temp"))) {
    fs.mkdirSync(path.join(__dirname, "../temp"), { recursive: true });
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 40,
        size: "A4",
        bufferPages: true,
      });

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      /**
       * Draws the page header with title and report information.
       */
      const drawPageHeader = () => {
        // Title
        doc
          .fontSize(18)
          .font("Helvetica-Bold")
          .text("REKAP PRESENSI SISWA", { align: "center" });
        doc.moveDown(0.5);

        // Info Block
        doc.fontSize(10).font("Helvetica");
        const infoText = [
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
        ];

        doc.text(infoText.join("    |    "), { align: "center" });

        if (period !== "daily") {
          doc.text(`Rentang Tanggal: ${startDate} s.d ${endDate}`, {
            align: "center",
          });
        }

        doc.moveDown(1.5);
      };

      drawPageHeader();

      // Table Configuration
      const tableConfig = {
        headers: ["No", "NISN", "Nama Siswa"],
        columnWidths: [30, 80, 150], // Default widths
        rowHeight: 20,
        margin: 40,
        headerBackgroundColor: "#1E3A5F", // Dark Blue
      };

      if (period !== "daily") {
        tableConfig.headers.push("H", "I", "S", "A", "%");
        // Adjust widths: No(30) + NISN(80) + Nama(150) = 260 used. 552 total width (A4) - 80 margins = 472 available. 472-260=212 left.
        // Distribute 212 to 5 cols -> approx 42 each.
        tableConfig.columnWidths = [25, 60, 140, 35, 35, 35, 35, 40];
      } else {
        tableConfig.headers.push("Status", "Keterangan");
        tableConfig.columnWidths = [25, 70, 130, 60, 150];
      }

      let currentY = doc.y;

      /**
       * Draws the table header on the current page.
       */
      const drawTableHeader = (y) => {
        let x = tableConfig.margin;

        // Draw Header Background
        doc
          .rect(
            tableConfig.margin,
            y,
            doc.page.width - tableConfig.margin * 2,
            tableConfig.rowHeight,
          )
          .fill(tableConfig.headerBackgroundColor);

        // Draw Header Text
        doc.fontSize(9).font("Helvetica-Bold").fillColor("#FFFFFF");

        tableConfig.headers.forEach((header, i) => {
          doc.text(header, x + 2, y + 5, {
            width: tableConfig.columnWidths[i] - 4,
            align: "center",
          });
          x += tableConfig.columnWidths[i];
        });

        doc.fillColor("#000000"); // Reset color

        return y + tableConfig.rowHeight;
      };

      currentY = drawTableHeader(currentY);

      /**
       * Checks if a new page is needed and adds one if so.
       */
      const checkPageBreak = () => {
        if (currentY > doc.page.height - doc.page.margins.bottom - 40) {
          doc.addPage();
          drawPageHeader();
          currentY = drawTableHeader(doc.y);
        }
      };

      doc.font("Helvetica").fontSize(9);

      data.forEach((student, index) => {
        checkPageBreak();

        let x = tableConfig.margin;

        // Draw Row Border (Bottom line)
        doc
          .moveTo(tableConfig.margin, currentY + tableConfig.rowHeight)
          .lineTo(
            doc.page.width - tableConfig.margin,
            currentY + tableConfig.rowHeight,
          )
          .stroke("#CCCCCC"); // Light grey line

        // Draw Cell Content
        // No
        doc.text(index + 1, x, currentY + 4, {
          width: tableConfig.columnWidths[0],
          align: "center",
        });
        x += tableConfig.columnWidths[0];

        // NISN
        doc.text(student.nisn || "-", x, currentY + 4, {
          width: tableConfig.columnWidths[1],
          align: "left",
        });
        x += tableConfig.columnWidths[1];

        // Nama
        const name =
          student.name && student.name.length > 25
            ? student.name.substring(0, 25) + "..."
            : student.name || "-";
        doc.text(name, x, currentY + 4, {
          width: tableConfig.columnWidths[2],
        });
        x += tableConfig.columnWidths[2];

        if (period !== "daily") {
          const numericFields = [
            student.hadir || 0,
            student.izin || 0,
            student.sakit || 0,
            student.alpa || 0,
            `${student.persentase_kehadiran || 0}%`,
          ];

          numericFields.forEach((val, i) => {
            doc.text(val, x, currentY + 4, {
              width: tableConfig.columnWidths[i + 3],
              align: "center",
            });
            x += tableConfig.columnWidths[i + 3];
          });
        } else {
          // Status
          doc.text(student.status || "-", x, currentY + 4, {
            width: tableConfig.columnWidths[3],
            align: "center",
          });
          x += tableConfig.columnWidths[3];

          // Keterangan
          const notes =
            student.notes && student.notes.length > 40
              ? student.notes.substring(0, 40) + "..."
              : student.notes || "-";
          doc.text(notes, x, currentY + 4, {
            width: tableConfig.columnWidths[4],
          });
        }

        currentY += tableConfig.rowHeight;
      });

      // Finalize PDF
      doc.end();

      stream.on("finish", () => {
        resolve({
          filename,
          filepath,
          mimetype: "application/pdf",
        });
      });

      stream.on("error", (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
};
