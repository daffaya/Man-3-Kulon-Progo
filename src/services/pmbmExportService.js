/**
 * @fileoverview Export service for PMBM registration data.
 * Menggunakan writeBuffer() untuk menghindari masalah file korup.
 */

import ExcelJS from "exceljs";
import { escapeExcelCell } from "../utils/helper.js";

/**
 * Human-readable labels
 */
const JALUR_LABEL = {
  tahfidz: "Tahfidz",
  kko: "KKO (Kelas Khusus Olahraga)",
  keterampilan: "Keterampilan",
  akademik: "Akademik",
  non_akademik: "Non-Akademik",
  afirmasi: "Afirmasi",
  tes: "Tes (Gelombang II)",
};

const STATUS_LABEL = {
  pending: "Menunggu Verifikasi",
  verified: "Terverifikasi",
  accepted: "Diterima",
  rejected: "Ditolak",
};

const KETERAMPILAN_LABEL = {
  titl: "TITL (Teknik Instalasi Tenaga Listrik)",
  tata_busana: "Tata Busana",
  multimedia: "Multimedia",
};

/**
 * Export PMBM data ke Excel (Streaming Buffer - Paling Stabil)
 */
export const exportPmbmToExcel = async (res, data, options = {}) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data Pendaftar PMBM");

    // ====================== HEADER ======================
    const titleRow = worksheet.addRow([
      "DATA PENDAFTAR PMBM MAN 3 KULON PROGO TA 2026/2027",
    ]);
    titleRow.font = { size: 14, bold: true };
    titleRow.alignment = { horizontal: "center" };
    worksheet.mergeCells("A1:AL1");

    // Filter Info
    const filterParts = [];
    if (options.gelombang) filterParts.push(`Gelombang: ${options.gelombang}`);
    if (options.jalur)
      filterParts.push(`Jalur: ${JALUR_LABEL[options.jalur] ?? options.jalur}`);
    if (options.status)
      filterParts.push(
        `Status: ${STATUS_LABEL[options.status] ?? options.status}`,
      );

    const infoRow = worksheet.addRow([
      filterParts.length > 0
        ? `Filter: ${filterParts.join(" | ")}`
        : "Filter: Semua data",
    ]);
    infoRow.font = { size: 11, italic: true };
    worksheet.mergeCells("A2:AL2");

    const dateRow = worksheet.addRow([
      `Diekspor pada: ${new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
    ]);
    dateRow.font = { size: 11, italic: true };
    worksheet.mergeCells("A3:AL3");

    worksheet.addRow([]); // spacer

    // ====================== HEADERS ======================
    const headers = [
      "No",
      "Nomor Pendaftaran",
      "Gelombang",
      "Jalur",
      "Program Keterampilan",
      "Status",
      "Nama Lengkap",
      "NISN",
      "NIK",
      "Tempat Lahir",
      "Tanggal Lahir",
      "Jenis Kelamin",
      "Asal Sekolah",
      "No. KK",
      "Alamat Lengkap",
      "Alamat Domisili",
      "No. HP Siswa",
      "Nama Ayah",
      "Nama Ibu",
      "Pekerjaan Ayah",
      "Pekerjaan Ibu",
      "Penghasilan Ayah",
      "Penghasilan Ibu",
      "Alamat Orang Tua",
      "Alamat Domisili Orang Tua",
      "No. HP Ayah",
      "No. HP Ibu",
      "Hafalan (Juz)",
      "Cabang Olahraga",
      "Rata-rata Rapor",
      "Jenis Kejuaraan",
      "Tingkat Kejuaraan",
      "Nama Kejuaraan",
      "Tahun Kejuaraan",
      "Link Dokumen",
      "Komitmen",
      "Tanggal Daftar",
      "Catatan Admin",
    ];

    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E3A5F" },
    };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.height = 22;

    // ====================== DATA ROWS ======================
    // AUDIT-007: every value below is sourced from pmbm_registrations rows,
    // which originate from the unauthenticated public /api/pmbm/register
    // endpoint — wrap with escapeExcelCell() to prevent formula/CSV
    // injection when staff later open the export in Excel.
    data.forEach((reg, index) => {
      const row = worksheet.addRow([
        index + 1,
        escapeExcelCell(reg.nomor_pendaftaran),
        escapeExcelCell(reg.gelombang),
        JALUR_LABEL[reg.jalur] ?? escapeExcelCell(reg.jalur),
        reg.pilihan_keterampilan
          ? (KETERAMPILAN_LABEL[reg.pilihan_keterampilan] ??
            escapeExcelCell(reg.pilihan_keterampilan))
          : "-",
        STATUS_LABEL[reg.status] ?? escapeExcelCell(reg.status),
        escapeExcelCell(reg.nama_lengkap),
        escapeExcelCell(reg.nisn),
        escapeExcelCell(reg.nik),
        escapeExcelCell(reg.tempat_lahir),
        reg.tanggal_lahir
          ? new Date(reg.tanggal_lahir).toLocaleDateString("id-ID")
          : "-",
        reg.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan",
        escapeExcelCell(reg.asal_sekolah),
        escapeExcelCell(reg.no_kk),
        escapeExcelCell(reg.alamat_lengkap),
        escapeExcelCell(reg.alamat_domisili),
        escapeExcelCell(reg.no_hp_siswa),
        escapeExcelCell(reg.nama_ayah),
        escapeExcelCell(reg.nama_ibu),
        escapeExcelCell(reg.pekerjaan_ayah),
        escapeExcelCell(reg.pekerjaan_ibu),
        escapeExcelCell(reg.penghasilan_ayah),
        escapeExcelCell(reg.penghasilan_ibu),
        escapeExcelCell(reg.alamat_ortu),
        escapeExcelCell(reg.alamat_domisili_ortu),
        escapeExcelCell(reg.no_hp_ayah),
        escapeExcelCell(reg.no_hp_ibu),
        escapeExcelCell(reg.jumlah_hafalan_juz) ?? "-",
        escapeExcelCell(reg.cabang_olahraga) ?? "-",
        escapeExcelCell(reg.rata_rata_rapor) ?? "-",
        escapeExcelCell(reg.jenis_kejuaraan) ?? "-",
        escapeExcelCell(reg.tingkat_kejuaraan) ?? "-",
        escapeExcelCell(reg.nama_kejuaraan) ?? "-",
        escapeExcelCell(reg.tahun_kejuaraan) ?? "-",
        escapeExcelCell(reg.link_dokumen) ?? "-",
        reg.komitmen ? "Ya" : "Tidak",
        reg.created_at
          ? new Date(reg.created_at).toLocaleDateString("id-ID")
          : "-",
        escapeExcelCell(reg.catatan_admin) ?? "-",
      ]);

      // Alternating row color
      if (index % 2 === 0) {
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF5F5F5" },
        };
      }
    });

    // ====================== FORMATTING ======================
    const columnWidths = [
      4, 22, 10, 20, 30, 20, 25, 14, 18, 16, 14, 14, 25, 18, 35, 35, 16, 20, 20,
      18, 18, 22, 22, 35, 35, 16, 16, 14, 18, 16, 20, 18, 30, 14, 35, 10, 16,
      30,
    ];

    worksheet.columns.forEach((col, i) => {
      col.width = columnWidths[i] ?? 15;
    });

    // Freeze header
    worksheet.views = [{ state: "frozen", ySplit: 5 }];

    // Auto Filter
    worksheet.autoFilter = {
      from: "A5",
      to: "AL5",
    };

    // ====================== RESPONSE ======================
    const date = new Date().toISOString().split("T")[0];
    const gelombangSuffix = options.gelombang ? `_g${options.gelombang}` : "";
    const filename = `pendaftar_pmbm${gelombangSuffix}_${date}.xlsx`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer); // Lebih aman daripada write(res)
  } catch (error) {
    console.error("Export PMBM Excel Error:", error);

    if (!res.headersSent) {
      res.status(500).json({ error: "Gagal memproses export Excel" });
    } else {
      res.end();
    }
  }
};
