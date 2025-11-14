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

  const date = new Date().toISOString().split("T")[0];
  const filename = `rekap_presensi_${className}_${period}_${date}.pdf`;
  const filepath = path.join(__dirname, "../temp", filename);

  if (!fs.existsSync(path.join(__dirname, "../temp"))) {
    fs.mkdirSync(path.join(__dirname, "../temp"), { recursive: true });
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 30,
        size: "A4",
        bufferPages: true,
      });

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // =============================
      // HEADER (TITLE + INFO)
      // =============================
      const drawPageHeader = () => {
        doc.fontSize(18).text("REKAP PRESENSI SISWA", { align: "center" });
        doc.moveDown();

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
      };

      drawPageHeader();

      // =============================
      // TABLE SETTINGS
      // =============================
      const tableConfig = {
        headers: ["No", "NISN", "Nama Siswa"],
        columnWidths: [35, 80, 150],
        rowHeight: 22,
        margin: 30,
      };

      if (period !== "daily") {
        tableConfig.headers.push(
          "Total",
          "Hadir",
          "Izin",
          "Sakit",
          "Alpa",
          "%"
        );
        tableConfig.columnWidths.push(40, 40, 40, 40, 40, 40);
      } else {
        tableConfig.headers.push("Status", "Keterangan");
        tableConfig.columnWidths.push(70, 120);
      }

      // =============================
      // DRAW TABLE HEADER
      // =============================
      const drawTableHeader = (y) => {
        let x = tableConfig.margin;

        doc.fontSize(11).font("Helvetica-Bold");

        tableConfig.headers.forEach((header, i) => {
          doc.text(header, x, y, {
            width: tableConfig.columnWidths[i],
            align: "center",
          });
          x += tableConfig.columnWidths[i];
        });

        // Garis bawah header
        doc
          .moveTo(tableConfig.margin, y + 18)
          .lineTo(
            tableConfig.margin +
              tableConfig.columnWidths.reduce((a, b) => a + b, 0),
            y + 18
          )
          .stroke();

        return y + 25;
      };

      let currentY = drawTableHeader(doc.y);

      // =============================
      // PAGE BREAK CHECKER
      // =============================
      const checkPageBreak = () => {
        if (currentY > doc.page.height - doc.page.margins.bottom - 40) {
          doc.addPage();
          drawPageHeader();
          currentY = drawTableHeader(doc.y);
        }
      };

      // =============================
      // ROW DRAWING
      // =============================
      doc.font("Helvetica").fontSize(10);

      data.forEach((student, index) => {
        checkPageBreak();

        let x = tableConfig.margin;

        // No
        doc.text(index + 1, x, currentY, {
          width: tableConfig.columnWidths[0],
          align: "center",
        });
        x += tableConfig.columnWidths[0];

        // NISN
        const nisn =
          student.nisn && student.nisn.length > 12
            ? student.nisn.substring(0, 12) + "..."
            : student.nisn || "-";

        doc.text(nisn, x, currentY, {
          width: tableConfig.columnWidths[1],
        });
        x += tableConfig.columnWidths[1];

        // Name
        const name =
          student.name && student.name.length > 25
            ? student.name.substring(0, 25) + "..."
            : student.name || "-";

        doc.text(name, x, currentY, {
          width: tableConfig.columnWidths[2],
        });
        x += tableConfig.columnWidths[2];

        if (period !== "daily") {
          const numericFields = [
            student.total_hari || 0,
            student.hadir || 0,
            student.izin || 0,
            student.sakit || 0,
            student.alpa || 0,
            `${student.persentase_kehadiran || 0}%`,
          ];

          numericFields.forEach((val, i) => {
            doc.text(val, x, currentY, {
              width: tableConfig.columnWidths[i + 3],
              align: "center",
            });
            x += tableConfig.columnWidths[i + 3];
          });
        } else {
          doc.text(student.status || "-", x, currentY, {
            width: tableConfig.columnWidths[3],
          });
          x += tableConfig.columnWidths[3];

          const notes =
            student.notes && student.notes.length > 20
              ? student.notes.substring(0, 20) + "..."
              : student.notes || "-";

          doc.text(notes, x, currentY, {
            width: tableConfig.columnWidths[4],
          });
        }

        // Garis pemisah baris (lebih aman dan tidak menabrak teks)
        const lineY = currentY + tableConfig.rowHeight - 3;
        doc
          .moveTo(tableConfig.margin, lineY)
          .lineTo(
            tableConfig.margin +
              tableConfig.columnWidths.reduce((a, b) => a + b, 0),
            lineY
          )
          .stroke();

        currentY += tableConfig.rowHeight;
      });

      // =============================
      // END PDF
      // =============================
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
