/**
 * @fileoverview Kelulusan controller factory.
 */

import createKelulusanModel from "../models/kelulusanModel.js";
import ExcelJS from "exceljs";

// Tahun ajaran aktif — ganti tiap tahun di sini
// TODO: integrasikan dengan tabel tahun_ajaran kalau sudah siap
const TAHUN_AJARAN_AKTIF = "2025/2026";

const kelulusanControllerFactory = ({ pool }) => {
  const kelulusanModel = createKelulusanModel({ pool });

  /**
   * Publik — cek kelulusan berdasarkan NISN.
   */
  const handleCekKelulusan = async (req, res) => {
    const { nisn } = req.params;

    if (!nisn || nisn.trim() === "") {
      return res.status(400).json({ error: "NISN wajib diisi" });
    }

    try {
      const result = await kelulusanModel.findByNisn(
        nisn.trim(),
        TAHUN_AJARAN_AKTIF,
      );

      if (!result) {
        return res.status(404).json({
          error: "NISN tidak ditemukan",
          message: "Pastikan NISN yang kamu masukkan sudah benar.",
        });
      }

      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Admin — get semua data kelulusan dengan filter.
   */
  const handleGetAll = async (req, res) => {
    const { tahun_ajaran, search, page, limit } = req.query;
    try {
      const result = await kelulusanModel.findAll({
        tahun_ajaran: tahun_ajaran || TAHUN_AJARAN_AKTIF,
        search,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Admin — get list tahun ajaran yang tersedia.
   */
  const handleGetTahunAjaran = async (req, res) => {
    try {
      const data = await kelulusanModel.getTahunAjaran();
      res.json({ data, aktif: TAHUN_AJARAN_AKTIF });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Admin — import dari Excel.
   * Expects multipart/form-data dengan field 'file' dan 'tahun_ajaran'.
   */
  const handleImport = async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "File Excel wajib diupload" });
    }

    const tahun_ajaran = req.body.tahun_ajaran || TAHUN_AJARAN_AKTIF;

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        return res
          .status(400)
          .json({ error: "Sheet tidak ditemukan dalam file Excel" });
      }

      const normalize = (str) =>
        String(str ?? "")
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "_");

      // Ambil header dari baris pertama
      const headerRow = worksheet.getRow(1);
      const headers = {};
      headerRow.eachCell((cell, colNumber) => {
        headers[colNumber] = normalize(cell.value);
      });

      const parsed = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header

        const normalizedRow = {};

        row.eachCell((cell, colNumber) => {
          const key = headers[colNumber];
          if (!key) return;

          let val;
          if (cell.type === ExcelJS.ValueType.Number) {
            val = Math.round(cell.value).toString();
          } else if (cell.type === ExcelJS.ValueType.Formula) {
            const result = cell.result;
            val =
              typeof result === "number"
                ? Math.round(result).toString()
                : String(result ?? "").trim();
          } else {
            val = String(cell.value ?? "").trim();
          }
          normalizedRow[key] = val;
        });

        // Parse status — toleran terhadap variasi teks dan whitespace
        const statusRaw = String(
          normalizedRow["dinyatakan"] || normalizedRow["status"] || "",
        )
          .toLowerCase()
          .replace(/\s+/g, "");

        const isLulus =
          statusRaw.includes("lulus") && !statusRaw.includes("tidak");

        const data = {
          nisn: String(normalizedRow["nisn"] || "").trim(),
          nism: String(normalizedRow["nism"] || "").trim() || null,
          nomor_asesmen:
            String(normalizedRow["nomor_asesmen_madrasah"] || "").trim() ||
            null,
          nama: String(
            normalizedRow["nama_peserta_didik"] || normalizedRow["nama"] || "",
          ).trim(),
          kelas: String(normalizedRow["kelas"] || "").trim(),
          status: isLulus ? "lulus" : "tidak_lulus",
        };

        if (data.nisn && data.nama) {
          parsed.push(data);
        }
      });

      if (parsed.length === 0) {
        return res.status(400).json({
          error: "Tidak ada data valid. Cek format kolom Excel.",
        });
      }

      const result = await kelulusanModel.bulkInsert(parsed, tahun_ajaran);

      res.json({
        success: true,
        message: `Berhasil mengimpor ${result.inserted} data kelulusan`,
        inserted: result.inserted,
        tahun_ajaran,
      });
    } catch (error) {
      console.error("IMPORT ERROR:", error);
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Admin — hapus data tahun ajaran tertentu.
   */
  const handleDelete = async (req, res) => {
    const { tahun_ajaran } = req.params;
    if (!tahun_ajaran) {
      return res.status(400).json({ error: "Tahun ajaran wajib diisi" });
    }
    try {
      const deleted = await kelulusanModel.deleteByTahunAjaran(tahun_ajaran);
      res.json({
        success: true,
        message: `${deleted} data kelulusan berhasil dihapus`,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  return {
    handleCekKelulusan,
    handleGetAll,
    handleGetTahunAjaran,
    handleImport,
    handleDelete,
  };
};

export default kelulusanControllerFactory;
