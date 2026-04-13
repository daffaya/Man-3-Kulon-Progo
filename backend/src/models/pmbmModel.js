/**
 * @fileoverview PMBM (Penerimaan Murid Baru Madrasah) model factory for database operations.
 * This module creates and exports a PMBM registration model with methods to perform
 * CRUD operations on registration records in the database.
 */

/**
 * Factory function that creates a PMBM model with database operations.
 * @param {Object} options - Configuration options.
 * @param {mysql.Pool} options.pool - MySQL connection pool for database operations.
 * @returns {Object} An object containing PMBM model methods.
 */
const createPmbmModel = ({ pool }) => {
  /**
   * Generates a unique registration number in the format PMBM-YYYY-G-XXXX.
   * Each gelombang has its own numbering sequence per year.
   * Example: PMBM-2026-1-0001 (Gelombang 1), PMBM-2026-2-0001 (Gelombang 2)
   * @param {number} gelombang - The registration wave number (1 or 2).
   * @returns {Promise<string>} Promise resolving to the generated registration number.
   */
  const generateNomorPendaftaran = async (gelombang) => {
    const year = new Date().getFullYear();
    const prefix = `PMBM-${year}-${gelombang}-`;

    const [rows] = await pool.execute(
      `SELECT nomor_pendaftaran
       FROM pmbm_registrations
       WHERE nomor_pendaftaran LIKE ?
       ORDER BY id DESC
       LIMIT 1`,
      [`${prefix}%`],
    );

    let nextNumber = 1;
    if (rows.length > 0) {
      const lastNum = parseInt(rows[0].nomor_pendaftaran.split("-").pop(), 10);
      nextNumber = lastNum + 1;
    }

    return `${prefix}${String(nextNumber).padStart(4, "0")}`;
  };

  const model = {
    /**
     * Creates a new registration record in the database.
     * @param {Object} data - The registration data.
     * @param {number} [data.gelombang=1] - Registration wave number (1 or 2).
     * @param {string} data.jalur - Registration track (tahfidz/kko/keterampilan/akademik/non_akademik/afirmasi/tes).
     * @param {string|null} [data.pilihan_keterampilan] - Skills program choice (only for keterampilan track).
     * @param {string} data.nama_lengkap - Student's full name.
     * @param {string} data.nisn - Student's NISN number.
     * @param {string} data.nik - Student's NIK number.
     * @param {string} data.tempat_lahir - Student's place of birth.
     * @param {string} data.tanggal_lahir - Student's date of birth (YYYY-MM-DD).
     * @param {string} data.jenis_kelamin - Student's gender (L/P).
     * @param {string} data.asal_sekolah - Student's school of origin.
     * @param {string} data.no_kk - Family card number.
     * @param {string} data.alamat_lengkap - Student's full address per KK.
     * @param {string} data.alamat_domisili - Student's current domicile address.
     * @param {string} data.no_hp_siswa - Student's WhatsApp number.
     * @param {string} data.nama_ayah - Father's full name.
     * @param {string} data.nama_ibu - Mother's full name.
     * @param {string} data.pekerjaan_ayah - Father's occupation.
     * @param {string} data.pekerjaan_ibu - Mother's occupation.
     * @param {string} data.penghasilan_ayah - Father's monthly income range.
     * @param {string} data.penghasilan_ibu - Mother's monthly income range.
     * @param {string} data.alamat_ortu - Parent's address.
     * @param {string} data.alamat_domisili_ortu - Parent's domicile address.
     * @param {string} data.no_hp_ayah - Father's WhatsApp number.
     * @param {string} data.no_hp_ibu - Mother's WhatsApp number.
     * @param {number|null} [data.jumlah_hafalan_juz] - Number of memorized juz (tahfidz track only).
     * @param {string|null} [data.cabang_olahraga] - Sports or martial arts branch (KKO track only).
     * @param {number|null} [data.rata_rata_rapor] - Average report card score semester 1-5 (akademik track only).
     * @param {string|null} [data.jenis_kejuaraan] - Type of competition (academic/sports/arts etc.).
     * @param {string|null} [data.tingkat_kejuaraan] - Competition level (kecamatan/kabupaten/provinsi/nasional).
     * @param {string|null} [data.nama_kejuaraan] - Name of the competition.
     * @param {number|null} [data.tahun_kejuaraan] - Year of the competition.
     * @param {string|null} [data.link_dokumen] - Optional Google Drive link for supporting documents.
     * @param {boolean} data.komitmen - Student's commitment to enroll if accepted.
     * @returns {Promise<Object>} Promise resolving to an object containing the generated nomor_pendaftaran.
     */
    create: async (data) => {
      const gelombang = data.gelombang ?? 1;
      const nomor_pendaftaran = await generateNomorPendaftaran(gelombang);

      await pool.execute(
        `INSERT INTO pmbm_registrations (
           nomor_pendaftaran, jalur, gelombang, pilihan_keterampilan,
           nama_lengkap, nisn, nik, tempat_lahir, tanggal_lahir, jenis_kelamin,
           asal_sekolah, no_kk, alamat_lengkap, alamat_domisili, no_hp_siswa,
           nama_ayah, nama_ibu, pekerjaan_ayah, pekerjaan_ibu,
           penghasilan_ayah, penghasilan_ibu,
           alamat_ortu, alamat_domisili_ortu, no_hp_ayah, no_hp_ibu,
           jumlah_hafalan_juz, cabang_olahraga, rata_rata_rapor,
           jenis_kejuaraan, tingkat_kejuaraan, nama_kejuaraan, tahun_kejuaraan,
           link_dokumen, komitmen
         ) VALUES (
           ?, ?, ?, ?,
           ?, ?, ?, ?, ?, ?,
           ?, ?, ?, ?, ?,
           ?, ?, ?, ?,
           ?, ?,
           ?, ?, ?, ?,
           ?, ?, ?,
           ?, ?, ?, ?,
           ?, ?
         )`,
        [
          nomor_pendaftaran,
          data.jalur,
          gelombang,
          data.pilihan_keterampilan ?? null,
          data.nama_lengkap,
          data.nisn,
          data.nik,
          data.tempat_lahir,
          data.tanggal_lahir,
          data.jenis_kelamin,
          data.asal_sekolah,
          data.no_kk,
          data.alamat_lengkap,
          data.alamat_domisili,
          data.no_hp_siswa,
          data.nama_ayah,
          data.nama_ibu,
          data.pekerjaan_ayah,
          data.pekerjaan_ibu,
          data.penghasilan_ayah,
          data.penghasilan_ibu,
          data.alamat_ortu,
          data.alamat_domisili_ortu,
          data.no_hp_ayah,
          data.no_hp_ibu,
          data.jumlah_hafalan_juz ?? null,
          data.cabang_olahraga ?? null,
          data.rata_rata_rapor ?? null,
          data.jenis_kejuaraan ?? null,
          data.tingkat_kejuaraan ?? null,
          data.nama_kejuaraan ?? null,
          data.tahun_kejuaraan ?? null,
          data.link_dokumen ?? null,
          data.komitmen ? 1 : 0,
        ],
      );

      return { nomor_pendaftaran, gelombang };
    },

    /**
     * Retrieves a paginated list of public registrations with limited fields and optional filters.
     * This endpoint is intended for public access, so sensitive data (e.g., NISN/NIK) is excluded.
     *
     * @param {Object} [options] - Filter and pagination options.
     * @param {string} [options.search] - Search by full name or registration number.
     * @param {string} [options.jalur] - Filter by registration track.
     * @param {number} [options.page=1] - Page number (1-based).
     * @param {number} [options.limit=20] - Number of records per page.
     *
     * @returns {Promise<Object>} Promise resolving to an object containing:
     * @returns {Array<Object>} returns.data - Array of registration records (public fields only).
     * @returns {number} returns.total - Total number of records matching the filter.
     * @returns {number} returns.page - Current page number.
     * @returns {number} returns.limit - Number of records per page.
     */
    findAllPublic: async ({ search, jalur, page = 1, limit = 20 } = {}) => {
      const conditions = [];
      const params = [];

      if (jalur) {
        conditions.push("jalur = ?");
        params.push(jalur);
      }
      if (search) {
        conditions.push("(nama_lengkap LIKE ? OR nomor_pendaftaran LIKE ?)");
        // Sengaja TIDAK pakai NISN/NIK di pencarian publik
        params.push(`%${search}%`, `%${search}%`);
      }

      const where = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";
      const offset = (page - 1) * limit;

      const [rows] = await pool.execute(
        `SELECT
       nomor_pendaftaran, jalur, gelombang,
       nama_lengkap, asal_sekolah,
       status
     FROM pmbm_registrations
     ${where}
     ORDER BY created_at ASC
     LIMIT ? OFFSET ?`,
        [...params, limit, offset],
      );

      const [[{ total }]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM pmbm_registrations ${where}`,
        params,
      );

      return { data: rows, total, page, limit };
    },

    /**
     * Retrieves a paginated list of registrations with optional filters.
     * @param {Object} [options] - Filter and pagination options.
     * @param {number} [options.gelombang] - Filter by registration wave (1 or 2).
     * @param {string} [options.jalur] - Filter by registration track.
     * @param {string} [options.status] - Filter by registration status.
     * @param {string} [options.search] - Search by name, registration number, or NISN.
     * @param {number} [options.page=1] - Page number (1-based).
     * @param {number} [options.limit=20] - Number of records per page.
     * @returns {Promise<Object>} Promise resolving to an object with data array, total count, page, and limit.
     */
    findAll: async ({
      gelombang,
      jalur,
      status,
      search,
      page = 1,
      limit = 20,
    } = {}) => {
      const conditions = [];
      const params = [];

      if (gelombang) {
        conditions.push("gelombang = ?");
        params.push(gelombang);
      }
      if (jalur) {
        conditions.push("jalur = ?");
        params.push(jalur);
      }
      if (status) {
        conditions.push("status = ?");
        params.push(status);
      }
      if (search) {
        conditions.push(
          "(nama_lengkap LIKE ? OR nomor_pendaftaran LIKE ? OR nisn LIKE ?)",
        );
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      const where = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";
      const offset = (page - 1) * limit;

      const [rows] = await pool.execute(
        `SELECT
           id, nomor_pendaftaran, gelombang, jalur, pilihan_keterampilan,
           nama_lengkap, nisn, asal_sekolah, no_hp_siswa,
           status, created_at
         FROM pmbm_registrations
         ${where}
         ORDER BY created_at ASC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset],
      );

      const [[{ total }]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM pmbm_registrations ${where}`,
        params,
      );

      return { data: rows, total, page, limit };
    },

    /**
     * Retrieves a single registration by its ID.
     * @param {number} id - The ID of the registration to retrieve.
     * @returns {Promise<Object|null>} Promise resolving to the registration object or null if not found.
     */
    findById: async (id) => {
      const [rows] = await pool.execute(
        `SELECT * FROM pmbm_registrations WHERE id = ?`,
        [id],
      );
      return rows[0] || null;
    },

    /**
     * Updates the status of an existing registration.
     * @param {number} id - The ID of the registration to update.
     * @param {string} status - The new status (pending/verified/accepted/rejected).
     * @param {string|null} [catatan_admin=null] - Optional notes from admin.
     * @returns {Promise<boolean>} Promise resolving to true if the update was successful, false otherwise.
     */
    updateStatus: async (id, status, catatan_admin = null) => {
      const [result] = await pool.execute(
        `UPDATE pmbm_registrations
         SET status = ?, catatan_admin = ?
         WHERE id = ?`,
        [status, catatan_admin, id],
      );
      return result.affectedRows > 0;
    },
  };

  return model;
};

export default createPmbmModel;
