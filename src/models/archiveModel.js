/**
 * @fileoverview Archive model factory for database operations.
 * This module creates and exports an archive model with methods to perform
 * CRUD operations on archive records and archive categories in the database.
 */

/**
 * Factory function that creates an archive model with database operations.
 * @param {Object} options - Configuration options.
 * @param {mysql.Pool} options.pool - MySQL connection pool for database operations.
 * @returns {Object} An object containing archive model methods.
 */
const archiveModelFactory = ({ pool }) => {
  /**
   * Retrieves archives with pagination, search, and category filtering.
   * @param {Object} options - Query options.
   * @param {string} [options.search=""] - Search term to filter archives by file name, description, or document number.
   * @param {number} [options.page=1] - Page number for pagination.
   * @param {number} [options.limit=10] - Number of items per page.
   * @param {number} [options.categoryId] - Category ID to filter archives by category.
   * @returns {Promise<Object>} Promise that resolves to an object containing archive data, pagination info, and total count.
   * @throws {Error} If database query fails.
   */
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

  /**
   * Retrieves a single archive by its ID.
   * @param {number} id - The ID of the archive to retrieve.
   * @returns {Promise<Object|null>} Promise that resolves to the archive object or null if not found.
   * @throws {Error} If database query fails.
   */
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

  /**
   * Retrieves all archive categories.
   * @returns {Promise<Array>} Promise that resolves to an array of category objects.
   * @throws {Error} If database query fails.
   */
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

  /**
   * Creates a new archive record in the database.
   * @param {Object} data - Archive data to create.
   * @param {string} data.file_name - Name of the file.
   * @param {string} data.file_path - Path to the file.
   * @param {string} data.mime_type - MIME type of the file.
   * @param {string} [data.description] - Description of the archive.
   * @param {number} [data.category_id] - Category ID of the archive.
   * @param {number} data.file_size - Size of the file.
   * @param {string} [data.document_number] - Document number.
   * @param {Date} [data.document_date] - Document date.
   * @returns {Promise<Object>} Promise that resolves to an object containing the new archive ID and success message.
   * @throws {Error} If database operation fails.
   */
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

  /**
   * Updates an existing archive record in the database.
   * @param {number} id - ID of the archive to update.
   * @param {Object} data - Updated archive data.
   * @param {string} data.file_name - Name of the file.
   * @param {string} data.file_path - Path to the file.
   * @param {string} data.mime_type - MIME type of the file.
   * @param {string} [data.description] - Description of the archive.
   * @param {number} [data.category_id] - Category ID of the archive.
   * @param {number} data.file_size - Size of the file.
   * @param {string} [data.document_number] - Document number.
   * @param {Date} [data.document_date] - Document date.
   * @returns {Promise<Object>} Promise that resolves to an object containing a success message.
   * @throws {Error} If archive not found or database operation fails.
   */
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

  /**
   * Soft deletes an archive by setting its is_active flag to false.
   * @param {number} id - ID of the archive to delete.
   * @returns {Promise<Object>} Promise that resolves to an object containing a success message.
   * @throws {Error} If archive not found or database operation fails.
   */
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
