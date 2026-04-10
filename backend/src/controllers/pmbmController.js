/**
 * @fileoverview PMBM controller factory for handling registration request logic.
 * This module creates and exports a controller with handlers for public registration
 * submission and admin management of PMBM registration records.
 */

import createPmbmModel from "../models/pmbmModel.js";
import { exportPmbmToExcel } from "../services/pmbmExportService.js";
// Hapus import fs karena tidak diperlukan lagi

const JALUR_VALID_G1 = [
  "tahfidz",
  "kko",
  "keterampilan",
  "akademik",
  "non_akademik",
  "afirmasi",
];

const JALUR_VALID_G2 = ["tes"];

const JALUR_VALID_ALL = [...JALUR_VALID_G1, ...JALUR_VALID_G2];

const KETERAMPILAN_VALID = ["titl", "tata_busana", "multimedia"];

const STATUS_VALID = ["pending", "verified", "accepted", "rejected"];

const REQUIRED_FIELDS = [
  "jalur",
  "nama_lengkap",
  "nisn",
  "nik",
  "tempat_lahir",
  "tanggal_lahir",
  "jenis_kelamin",
  "asal_sekolah",
  "no_kk",
  "alamat_lengkap",
  "alamat_domisili",
  "no_hp_siswa",
  "nama_ayah",
  "nama_ibu",
];

/**
 * Factory function to create a PMBM controller.
 * @param {Object} dependencies - The dependencies to inject.
 * @param {mysql.Pool} dependencies.pool - The database connection pool.
 * @returns {Object} An object containing PMBM controller handler methods.
 */
const pmbmControllerFactory = ({ pool }) => {
  const pmbmModel = createPmbmModel({ pool });

  /**
   * Handles a new registration submission from a prospective student.
   * Validates required fields, gelombang value, and track-specific conditional fields before saving.
   * @async
   * @param {Object} req - Express request object.
   * @param {Object} req.body - The registration form data.
   * @param {number} [req.body.gelombang=1] - Registration wave number.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>}
   */
  const handleRegister = async (req, res) => {
    const body = req.body;
    const gelombang = parseInt(body.gelombang) || 1;

    if (![1, 2].includes(gelombang)) {
      return res
        .status(400)
        .json({ error: "Gelombang tidak valid (harus 1 atau 2)" });
    }

    const missing = REQUIRED_FIELDS.filter(
      (f) => !body[f] || String(body[f]).trim() === "",
    );
    if (missing.length > 0) {
      return res.status(400).json({
        error: "Field wajib belum diisi",
        missing,
      });
    }

    if (!JALUR_VALID_ALL.includes(body.jalur)) {
      return res.status(400).json({ error: "Jalur pendaftaran tidak valid" });
    }

    if (gelombang === 1 && !JALUR_VALID_G1.includes(body.jalur)) {
      return res.status(400).json({
        error: "Jalur tidak tersedia untuk Gelombang I",
      });
    }
    if (gelombang === 2 && !JALUR_VALID_G2.includes(body.jalur)) {
      return res.status(400).json({
        error: "Gelombang II hanya tersedia untuk jalur tes",
      });
    }

    if (
      body.jalur === "keterampilan" &&
      !KETERAMPILAN_VALID.includes(body.pilihan_keterampilan)
    ) {
      return res.status(400).json({
        error:
          "Pilihan keterampilan wajib diisi (titl / tata_busana / multimedia)",
      });
    }

    if (body.jalur === "tahfidz" && !body.jumlah_hafalan_juz) {
      return res
        .status(400)
        .json({ error: "Jumlah hafalan juz wajib diisi untuk jalur Tahfidz" });
    }

    if (body.jalur === "kko" && !body.cabang_olahraga) {
      return res
        .status(400)
        .json({ error: "Cabang olahraga wajib diisi untuk jalur KKO" });
    }

    if (body.jalur === "akademik" && !body.rata_rata_rapor) {
      return res
        .status(400)
        .json({ error: "Rata-rata rapor wajib diisi untuk jalur Akademik" });
    }

    try {
      const result = await pmbmModel.create({ ...body, gelombang });

      return res.status(201).json({
        success: true,
        message: "Pendaftaran berhasil!",
        data: {
          nomor_pendaftaran: result.nomor_pendaftaran,
          gelombang: result.gelombang,
          nama_lengkap: body.nama_lengkap,
          jalur: body.jalur,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

  /**
   * Handles the request to get a paginated list of registrations.
   * Supports filtering by gelombang, jalur, status, and search keyword.
   * @async
   * @param {Object} req - Express request object.
   * @param {Object} req.query - Query parameters for filtering and pagination.
   * @param {string} [req.query.gelombang] - Filter by registration wave.
   * @param {string} [req.query.jalur] - Filter by registration track.
   * @param {string} [req.query.status] - Filter by registration status.
   * @param {string} [req.query.search] - Search keyword.
   * @param {string} [req.query.page] - Page number.
   * @param {string} [req.query.limit] - Records per page.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>}
   */
  const handleGetAll = async (req, res) => {
    const { gelombang, jalur, status, search, page, limit } = req.query;

    try {
      const result = await pmbmModel.findAll({
        gelombang: gelombang ? parseInt(gelombang) : undefined,
        jalur,
        status,
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
   * Handles the request to get the full details of a single registration by ID.
   * @async
   * @param {Object} req - Express request object.
   * @param {Object} req.params - Route parameters.
   * @param {string} req.params.id - The ID of the registration.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>}
   */
  const handleGetById = async (req, res) => {
    const { id } = req.params;

    try {
      const registration = await pmbmModel.findById(id);

      if (!registration) {
        return res
          .status(404)
          .json({ error: "Data pendaftaran tidak ditemukan" });
      }

      res.json(registration);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Handles the request to update the status of a registration record.
   * @async
   * @param {Object} req - Express request object.
   * @param {Object} req.params - Route parameters.
   * @param {string} req.params.id - The ID of the registration to update.
   * @param {Object} req.body - The request body.
   * @param {string} req.body.status - The new status value.
   * @param {string} [req.body.catatan_admin] - Optional admin notes.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>}
   */
  const handleUpdateStatus = async (req, res) => {
    const { id } = req.params;
    const { status, catatan_admin } = req.body;

    if (!STATUS_VALID.includes(status)) {
      return res.status(400).json({ error: "Status tidak valid" });
    }

    try {
      const updated = await pmbmModel.updateStatus(id, status, catatan_admin);

      if (!updated) {
        return res
          .status(404)
          .json({ error: "Data pendaftaran tidak ditemukan" });
      }

      res.json({
        success: true,
        message: "Status pendaftaran berhasil diperbarui",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Handles the request to export registration data to an Excel file.
   * Streams the file directly to the client.
   * @async
   * @param {Object} req - Express request object.
   * @param {Object} req.query - Query parameters for filtering.
   * @param {string} [req.query.gelombang] - Filter by registration wave.
   * @param {string} [req.query.jalur] - Filter by registration track.
   * @param {string} [req.query.status] - Filter by registration status.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>}
   */
  const handleExport = async (req, res) => {
    const { gelombang, jalur, status } = req.query;

    try {
      const { data } = await pmbmModel.findAll({
        gelombang: gelombang ? parseInt(gelombang) : undefined,
        jalur,
        status,
        page: 1,
        limit: 99999,
      });

      // Panggil service dengan passing 'res'
      await exportPmbmToExcel(res, data, {
        gelombang: gelombang ? parseInt(gelombang) : undefined,
        jalur,
        status,
      });
    } catch (error) {
      // Jika error terjadi di model atau sebelum headers terkirim
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  };

  return {
    handleRegister,
    handleGetAll,
    handleGetById,
    handleUpdateStatus,
    handleExport,
  };
};

export default pmbmControllerFactory;
