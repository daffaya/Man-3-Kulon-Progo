const archiveModelFactory = ({ pool }) => {
  const getArchive = async ({
    search = "",
    page = 1,
    limit = 10,
    categoryId,
  } = {}) => {
    try {
      const offset = (page - 1) * limit;

      let query = `
      SELECT 
          a.id, 
          a.file_name, 
          a.description, 
          a.upload_date, 
          a.file_size, 
          a.document_number, 
          DATE_FORMAT(a.document_date, '%Y-%m-%d') AS document_date, 
          c.name as category_name,
          c.id as category_id
      FROM archives a 
      LEFT JOIN archive_categories c ON a.category_id = c.id 
      WHERE a.is_active = true
    `;

      let params = [];

      if (search) {
        query += ` AND (a.file_name LIKE ? OR a.description LIKE ? OR a.document_number LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      if (categoryId) {
        query += ` AND a.category_id = ?`;
        params.push(parseInt(categoryId));
      }

      query += ` ORDER BY a.upload_date DESC LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), offset);

      const [rows] = await pool.query(query, params);

      let countQuery = `SELECT COUNT(*) as total FROM archives WHERE is_active = true`;
      let countParams = [];

      if (search) {
        countQuery += ` AND (file_name LIKE ? OR description LIKE ? OR document_number LIKE ?)`;
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (categoryId) {
        countQuery += ` AND category_id = ?`;
        countParams.push(parseInt(categoryId));
      }

      const [countRes] = await pool.query(countQuery, countParams);

      return {
        data: rows,
        total: countRes[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countRes[0].total / limit),
      };
    } catch (error) {
      throw new Error(`Gagal mengambil arsip: ${error.message}`);
    }
  };

  const getArchiveById = async (id) => {
    try {
      const [rows] = await pool.query(
        `SELECT 
        a.id,
        a.file_name,
        a.file_path,
        a.mime_type,
        a.description,
        a.category_id,
        a.file_size,
        a.document_number,
        DATE_FORMAT(a.document_date, '%Y-%m-%d') AS document_date, 
        a.upload_date,
        c.name as category_name 
       FROM archives a 
       LEFT JOIN archive_categories c ON a.category_id = c.id 
       WHERE a.id = ? AND a.is_active = true`,
        [parseInt(id)]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Gagal mengambil arsip: ${error.message}`);
    }
  };

  const getArchiveCategories = async () => {
    try {
      const [rows] = await pool.query(
        `SELECT id, name, description FROM archive_categories ORDER BY name`
      );
      return rows;
    } catch (error) {
      throw new Error(`Gagal mengambil kategori: ${error.message}`);
    }
  };

  const createArchive = async (data) => {
    try {
      const {
        file_name,
        file_path,
        mime_type,
        description,
        category_id,
        file_size,
        document_number,
        document_date,
      } = data;

      const query = `
        INSERT INTO archives (
          file_name, file_path, mime_type, description, category_id, 
          file_size, document_number, document_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        file_name,
        file_path,
        mime_type,
        description || null,
        category_id ? parseInt(category_id) : null,
        file_size,
        document_number || null,
        document_date || null,
      ];

      const [result] = await pool.query(query, values);
      return { id: result.insertId, message: "Arsip berhasil dibuat" };
    } catch (error) {
      throw new Error(`Gagal membuat arsip: ${error.message}`);
    }
  };

  const updateArchive = async (id, data) => {
    try {
      const {
        file_name,
        file_path,
        mime_type,
        description,
        category_id,
        file_size,
        document_number,
        document_date,
      } = data;

      const query = `
        UPDATE archives 
        SET file_name = ?, file_path = ?, mime_type = ?, description = ?, 
            category_id = ?, file_size = ?, document_number = ?, document_date = ?
        WHERE id = ? AND is_active = true
      `;

      const values = [
        file_name,
        file_path,
        mime_type,
        description || null,
        category_id ? parseInt(category_id) : null,
        file_size,
        document_number || null,
        document_date || null,
        parseInt(id),
      ];

      const [result] = await pool.query(query, values);

      if (result.affectedRows === 0) {
        throw new Error("Arsip tidak ditemukan");
      }

      return { message: "Arsip berhasil diperbarui" };
    } catch (error) {
      throw new Error(`Gagal memperbarui arsip: ${error.message}`);
    }
  };

  const deleteArchive = async (id) => {
    try {
      const query = `UPDATE archives SET is_active = false WHERE id = ? AND is_active = true`;
      const [result] = await pool.query(query, [parseInt(id)]);

      if (result.affectedRows === 0) {
        throw new Error("Arsip tidak ditemukan");
      }

      return { message: "Arsip berhasil dihapus" };
    } catch (error) {
      throw new Error(`Gagal menghapus arsip: ${error.message}`);
    }
  };

  return {
    getArchive,
    getArchiveById,
    getArchiveCategories,
    createArchive,
    updateArchive,
    deleteArchive,
  };
};

export default archiveModelFactory;
