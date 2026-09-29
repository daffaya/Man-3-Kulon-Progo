/**
 * @fileoverview Category model factory for database operations.
 * This module creates and exports a category model with methods to perform
 * CRUD operations on category records in the database.
 */

/**
 * Factory function that creates a category model with database operations.
 * @param {Object} options - Configuration options.
 * @param {mysql.Pool} options.pool - MySQL connection pool for database operations.
 * @returns {Object} An object containing category model methods.
 */
const createCategoryModel = ({ pool }) => {
  /**
   * Creates a URL-friendly slug from a name string.
   * @param {string} name - The name to convert into a slug.
   * @returns {string} The generated slug.
   */
  const generateSlug = (name) =>
    name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const model = {
    /**
     * Retrieves all categories from the database, ordered by name.
     * @returns {Promise<Array>} Promise that resolves to an array of category objects.
     */
    findAll: async () => {
      const [rows] = await pool.execute(
        `SELECT id, name, slug, description, created_at, updated_at 
         FROM categories 
         ORDER BY name ASC`
      );
      return rows;
    },

    /**
     * Retrieves a single category by its ID.
     * @param {number} id - The ID of the category to retrieve.
     * @returns {Promise<Object|null>} Promise that resolves to the category object or null if not found.
     */
    findById: async (id) => {
      const [rows] = await pool.execute(
        `SELECT id, name, slug, description, created_at, updated_at 
         FROM categories 
         WHERE id = ?`,
        [id]
      );
      return rows[0] || null;
    },

    /**
     * Deletes a category by its ID.
     * @param {number} id - The ID of the category to delete.
     * @returns {Promise<boolean>} Promise that resolves to true if deletion was successful, false otherwise.
     */
    delete: async (id) => {
      const [result] = await pool.execute(
        `DELETE FROM categories WHERE id = ?`,
        [id]
      );
      return result.affectedRows > 0;
    },

    /**
     * Creates a new category in the database.
     * @param {Object} data - The category data to create.
     * @param {string} data.name - The name of the category.
     * @param {string} [data.description] - The description of the category.
     * @returns {Promise<Object>} Promise that resolves to the newly created category object.
     */
    create: async ({ name, description }) => {
      const slug = generateSlug(name);
      const [result] = await pool.execute(
        `INSERT INTO categories (name, slug, description, created_at, updated_at) 
       VALUES (?, ?, ?, NOW(), NOW())`,
        [name, slug, description]
      );
      return await model.findById(result.insertId);
    },

    /**
     * Updates an existing category in the database.
     * @param {number} id - The ID of the category to update.
     * @param {Object} data - The updated category data.
     * @param {string} data.name - The new name of the category.
     * @param {string} [data.description] - The new description of the category.
     * @returns {Promise<Object|null>} Promise that resolves to the updated category object or null if not found.
     */
    update: async (id, { name, description }) => {
      const slug = generateSlug(name);
      const [result] = await pool.execute(
        `UPDATE categories 
       SET name = ?, slug = ?, description = ?, updated_at = NOW() 
       WHERE id = ?`,
        [name, slug, description, id]
      );
      if (result.affectedRows === 0) return null;
      return await model.findById(id);
    },
  };

  return model;
};

export default createCategoryModel;
