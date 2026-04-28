/**
 * @fileoverview CMS Model for site_contents and site_collections tables.
 * Handles all database interactions for the CMS system.
 */

/**
 * Factory function that creates a CMS model.
 * @param {object} options
 * @param {import('mysql2/promise').Pool} options.pool - MySQL connection pool.
 * @returns {object} CMS model methods.
 */
const createCmsModel = ({ pool }) => {
  return {
    // ─────────────────────────────────────────────
    // site_contents
    // ─────────────────────────────────────────────

    /**
     * Fetch all sections for a given page.
     * Returns an object keyed by section name for easy frontend consumption.
     * @param {string} page
     * @returns {Promise<Record<string, any>>}
     */
    async findByPage(page) {
      const [rows] = await pool.execute(
        `SELECT section, data, updated_at
         FROM site_contents
         WHERE page = ?
         ORDER BY section`,
        [page],
      );

      return rows.reduce((acc, row) => {
        acc[row.section] = {
          ...row.data,
          _updated_at: row.updated_at,
        };
        return acc;
      }, {});
    },

    /**
     * Fetch a single section.
     * @param {string} page
     * @param {string} section
     * @returns {Promise<object|null>}
     */
    async findSection(page, section) {
      const [rows] = await pool.execute(
        `SELECT section, data, updated_at
         FROM site_contents
         WHERE page = ? AND section = ?`,
        [page, section],
      );

      if (rows.length === 0) return null;
      return { ...rows[0].data, _updated_at: rows[0].updated_at };
    },

    /**
     * Upsert (insert or update) a section's data.
     * @param {string} page
     * @param {string} section
     * @param {object} data
     * @param {number|null} updatedBy - user id
     * @returns {Promise<void>}
     */
    async upsertSection(page, section, data, updatedBy = null) {
      await pool.execute(
        `INSERT INTO site_contents (page, section, data, updated_by)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           data       = VALUES(data),
           updated_by = VALUES(updated_by),
           updated_at = CURRENT_TIMESTAMP`,
        [page, section, JSON.stringify(data), updatedBy],
      );
    },

    // ─────────────────────────────────────────────
    // site_collections
    // ─────────────────────────────────────────────

    /**
     * Fetch all active items of a collection type, ordered by sort_order.
     * @param {string} type
     * @returns {Promise<object[]>}
     */
    async findCollection(type) {
      const [rows] = await pool.execute(
        `SELECT id, data, sort_order, is_active, updated_at
         FROM site_collections
         WHERE type = ? AND is_active = 1
         ORDER BY sort_order ASC`,
        [type],
      );

      return rows.map((row) => ({
        id: row.id,
        ...row.data,
        sort_order: row.sort_order,
        is_active: row.is_active === 1,
        _updated_at: row.updated_at,
      }));
    },

    /**
     * Fetch all items (including inactive) for admin management.
     * @param {string} type
     * @returns {Promise<object[]>}
     */
    async findCollectionAdmin(type) {
      const [rows] = await pool.execute(
        `SELECT id, data, sort_order, is_active, updated_at
         FROM site_collections
         WHERE type = ?
         ORDER BY sort_order ASC`,
        [type],
      );

      return rows.map((row) => ({
        id: row.id,
        ...row.data,
        sort_order: row.sort_order,
        is_active: row.is_active === 1,
        _updated_at: row.updated_at,
      }));
    },

    /**
     * Insert a new collection item.
     * @param {string} type
     * @param {object} data
     * @param {number} sortOrder
     * @param {number|null} updatedBy
     * @returns {Promise<number>} new item id
     */
    async createCollectionItem(type, data, sortOrder = 0, updatedBy = null) {
      const [result] = await pool.execute(
        `INSERT INTO site_collections (type, data, sort_order, is_active, updated_by)
         VALUES (?, ?, ?, 1, ?)`,
        [type, JSON.stringify(data), sortOrder, updatedBy],
      );
      return result.insertId;
    },

    /**
     * Update a collection item's data.
     * @param {number} id
     * @param {object} data
     * @param {number} sortOrder
     * @param {boolean} isActive
     * @param {number|null} updatedBy
     * @returns {Promise<boolean>}
     */
    async updateCollectionItem(
      id,
      data,
      sortOrder,
      isActive,
      updatedBy = null,
    ) {
      const [result] = await pool.execute(
        `UPDATE site_collections
         SET data       = ?,
             sort_order = ?,
             is_active  = ?,
             updated_by = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [JSON.stringify(data), sortOrder, isActive ? 1 : 0, updatedBy, id],
      );
      return result.affectedRows > 0;
    },

    /**
     * Delete a collection item.
     * @param {number} id
     * @returns {Promise<boolean>}
     */
    async deleteCollectionItem(id) {
      const [result] = await pool.execute(
        `DELETE FROM site_collections WHERE id = ?`,
        [id],
      );
      return result.affectedRows > 0;
    },
  };
};

export default createCmsModel;
