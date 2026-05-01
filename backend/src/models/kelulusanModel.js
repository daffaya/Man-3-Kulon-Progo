/**
 * @fileoverview Kelulusan model factory for database operations.
 */

const createKelulusanModel = ({ pool }) => {
  const model = {
    /**
     * Bulk insert kelulusan data dari hasil parsing Excel.
     * Hapus data tahun ajaran yang sama dulu sebelum insert (upsert pattern).
     */
    bulkInsert: async (data, tahun_ajaran) => {
      // Hapus data lama untuk tahun ajaran yang sama
      await pool.execute(`DELETE FROM kelulusan WHERE tahun_ajaran = ?`, [
        tahun_ajaran,
      ]);

      if (data.length === 0) return { inserted: 0 };

      const values = data.map((row) => [
        row.nisn,
        row.nism ?? null,
        row.nomor_asesmen ?? null,
        row.nama,
        row.kelas,
        row.status,
        tahun_ajaran,
      ]);

      await pool.query(
        `INSERT INTO kelulusan
           (nisn, nism, nomor_asesmen, nama, kelas, status, tahun_ajaran)
         VALUES ?`,
        [values],
      );

      return { inserted: data.length };
    },

    /**
     * Cek kelulusan berdasarkan NISN — endpoint publik.
     */
    findByNisn: async (nisn, tahun_ajaran) => {
      const [rows] = await pool.execute(
        `SELECT nisn, nama, kelas, status, tahun_ajaran
         FROM kelulusan
         WHERE nisn = ? AND tahun_ajaran = ?`,
        [nisn, tahun_ajaran],
      );
      return rows[0] || null;
    },

    /**
     * List semua data kelulusan — untuk admin.
     */
    findAll: async ({ tahun_ajaran, search, page = 1, limit = 20 } = {}) => {
      const conditions = [];
      const params = [];

      if (tahun_ajaran) {
        conditions.push("tahun_ajaran = ?");
        params.push(tahun_ajaran);
      }
      if (search) {
        conditions.push("(nama LIKE ? OR nisn LIKE ?)");
        params.push(`%${search}%`, `%${search}%`);
      }

      const where = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";
      const offset = (page - 1) * limit;

      const [rows] = await pool.execute(
        `SELECT * FROM kelulusan ${where}
         ORDER BY nama ASC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset],
      );

      const [[{ total }]] = await pool.execute(
        `SELECT COUNT(*) AS total FROM kelulusan ${where}`,
        params,
      );

      return { data: rows, total, page, limit };
    },

    /**
     * List tahun ajaran yang tersedia.
     */
    getTahunAjaran: async () => {
      const [rows] = await pool.execute(
        `SELECT DISTINCT tahun_ajaran
         FROM kelulusan
         ORDER BY tahun_ajaran DESC`,
      );
      return rows.map((r) => r.tahun_ajaran);
    },

    /**
     * Hapus semua data untuk tahun ajaran tertentu.
     */
    deleteByTahunAjaran: async (tahun_ajaran) => {
      const [result] = await pool.execute(
        `DELETE FROM kelulusan WHERE tahun_ajaran = ?`,
        [tahun_ajaran],
      );
      return result.affectedRows;
    },
  };

  return model;
};

export default createKelulusanModel;
