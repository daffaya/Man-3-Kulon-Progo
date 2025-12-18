/**
 * @fileoverview Staff model for database interactions.
 * This module provides a factory function to create a Staff model.
 * The model includes methods for CRUD (Create, Read, Update, Delete) operations
 * on the 'tendik' table in the database.
 */

/**
 * Factory function that creates a Staff model for interacting with the database.
 *
 * @param {object} options
 * @param {import('mysql2/promise').Pool} options.pool - MySQL connection pool.
 * @returns {object} Staff model methods.
 */
const createStaffModel = ({ pool }) => {
  return {
    /**
     * Creates a new staff/teacher record in the database.
     *
     * @param {object} staffData - Data for the new staff/teacher.
     * @param {string} staffData.type - Type (teacher or staff).
     * @param {string} staffData.nama - Full name.
     * @param {string} staffData.nip - NIP.
     * @param {string} staffData.gender - Gender (L/P).
     * @param {string} staffData.status - Employment status (PNS/PPPK/CPNS).
     * @param {string} staffData.jabatan - Position.
     * @returns {Promise<number>} A promise that resolves to the ID of the newly created record.
     */
    async create(staffData) {
      try {
        const { type, nama, nip, gender, status, jabatan } = staffData;

        const sql = `
          INSERT INTO tendik 
          SET 
            type = ?, 
            nama = ?, 
            nip = ?, 
            gender = ?, 
            status = ?, 
            jabatan = ?
        `;

        const params = [type, nama, nip, gender, status, jabatan];

        const [result] = await pool.execute(sql, params);
        return result.insertId;
      } catch (error) {
        console.error("[StaffModel] Error creating staff:", error);
        throw error;
      }
    },

    /**
     * Finds all staff/teachers with optional filters and pagination.
     *
     * @param {object} [filters={}] - Filtering and pagination options.
     * @param {string} [filters.keyword=""] - Keyword to search in name and position.
     * @param {string} [filters.type=""] - Filter by type (teacher/staff).
     * @param {string} [filters.gender=""] - Filter by gender (L/P).
     * @param {string} [filters.status=""] - Filter by status (PNS/PPPK/CPNS).
     * @param {number} [filters.page=1] - The page number for pagination.
     * @param {number} [filters.limit=10] - The number of records per page.
     * @returns {Promise<{data: object[], total: number, totalPages: number, currentPage: number}>} A promise that resolves to an object containing the records and pagination metadata.
     */
    async findAll(filters = {}) {
      const {
        keyword = "",
        type = "",
        gender = "",
        status = "",
        page = 1,
        limit = 10,
      } = filters;

      const offset = (page - 1) * limit;
      const conditions = [];
      const queryParams = [];

      if (keyword) {
        conditions.push("(tendik.nama LIKE ? OR tendik.jabatan LIKE ?)");
        queryParams.push(`%${keyword}%`, `%${keyword}%`);
      }

      if (type) {
        conditions.push("tendik.type = ?");
        queryParams.push(type);
      }

      if (gender) {
        conditions.push("tendik.gender = ?");
        queryParams.push(gender);
      }

      if (status) {
        conditions.push("tendik.status = ?");
        queryParams.push(status);
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const sql = `
          SELECT
            id,
            type,
            nama,
            nip,
            gender,
            status,
            jabatan,
            created_at,
            updated_at
          FROM tendik
          ${whereClause}
          ORDER BY nama ASC
          LIMIT ${limit} OFFSET ${offset};
        `;

      const [rows] = await pool.execute(sql, queryParams);
      const [totalRows] = await pool.execute(
        `
        SELECT COUNT(*) AS total
        FROM tendik
        ${whereClause};
      `,
        queryParams
      );

      const total = totalRows[0].total;
      const totalPages = Math.ceil(total / limit);

      return {
        data: rows,
        total,
        totalPages,
        currentPage: page,
      };
    },

    /**
     * Finds a single staff/teacher by ID.
     *
     * @param {number} id - The ID of the record to find.
     * @returns {Promise<object|null>} A promise that resolves to the record object if found, otherwise `null`.
     */
    async findById(id) {
      const [rows] = await pool.execute(
        `
        SELECT
          id,
          type,
          nama,
          nip,
          gender,
          status,
          jabatan,
          created_at,
          updated_at
        FROM tendik
        WHERE id = ?;
      `,
        [id]
      );

      if (rows.length === 0) return null;
      return rows[0];
    },

    /**
     * Updates an existing staff/teacher in the database by ID.
     *
     * @param {number} id - The ID of the record to update.
     * @param {object} staffData - An object containing the data to be updated.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the record was successfully updated, otherwise `false`.
     */
    async update(id, staffData) {
      const { type, nama, nip, gender, status, jabatan } = staffData;

      const sql = `
        UPDATE tendik SET
          type = ?,
          nama = ?,
          nip = ?,
          gender = ?,
          status = ?,
          jabatan = ?,
          updated_at = NOW()
        WHERE id = ?;
      `;

      const [result] = await pool.execute(sql, [
        type,
        nama,
        nip,
        gender,
        status,
        jabatan,
        id,
      ]);

      return result.affectedRows > 0;
    },

    /**
     * Deletes a staff/teacher from the database by ID.
     *
     * @param {number} id - The ID of the record to delete.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the record was successfully deleted, otherwise `false`.
     */
    async delete(id) {
      const [result] = await pool.execute("DELETE FROM tendik WHERE id = ?;", [
        id,
      ]);
      return result.affectedRows > 0;
    },

    /**
     * Gets recapitulation data by type (teacher or staff).
     *
     * @param {string} type - Type (teacher or staff).
     * @returns {Promise<object[]>} A promise that resolves to an array of recap data.
     */
    async getRecapByType(type) {
      const query = `
        SELECT
          status,
          SUM(CASE WHEN gender = 'L' THEN 1 ELSE 0 END) AS male,
          SUM(CASE WHEN gender = 'P' THEN 1 ELSE 0 END) AS female
        FROM tendik
        WHERE type = ?
        GROUP BY status
        ORDER BY FIELD(status, 'PNS', 'PPPK', 'CPNS')
      `;

      const [rows] = await pool.execute(query, [type]);
      return rows;
    },
    /**
     * Gets all tendik data for detailed view.
     *
     * @returns {Promise<object[]>} A promise that resolves to an array of all tendik data.
     */
    async getAllTendik() {
      try {
        const query = `
          SELECT 
            ROW_NUMBER() OVER (ORDER BY id) as no,
            nama, nip, gender, status, jabatan
          FROM tendik
          ORDER BY nama ASC
        `;

        const [rows] = await pool.execute(query);
        return rows;
      } catch (error) {
        throw error;
      }
    },
  };
};

export default createStaffModel;
