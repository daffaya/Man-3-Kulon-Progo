/**
 * @typedef {Object} User
 * @property {number} id - The user's unique ID.
 * @property {string} username - The user's username.
 * @property {string} [full_name] - The user's full name.
 * @property {string} [avatar] - URL to the user's avatar image.
 * @property {string} role - The user's role (e.g., 'admin', 'user').
 * @property {Date|string} created_at - The timestamp when the user was created.
 */

/**
 * @typedef {Object} UserWithPassword
 * @property {number} id - The user's unique ID.
 * @property {string} username - The user's username.
 * @property {string} password_hash - The user's hashed password.
 * @property {string} [full_name] - The user's full name.
 * @property {string} [avatar] - URL to the user's avatar image.
 * @property {string} role - The user's role.
 * @property {Date|string} created_at - The timestamp when the user was created.
 */

/**
 * Factory function to create a User Model for database interactions.
 * This model uses a dependency-injected database pool for queries.
 *
 * @param {Object} dependencies - The dependencies for the model.
 * @param {Object} dependencies.pool - The database connection pool.
 * @returns {Object} An object with methods for user CRUD operations.
 */
const createUserModel = ({ pool }) => {
  const model = {
    /**
     * Finds a user by their ID.
     * @param {number} id - The ID of the user to find.
     * @returns {Promise<User|null>} A promise that resolves to the user object if found, otherwise null.
     * @throws {Error} If a database error occurs.
     */
    findById: async (id) => {
      const [rows] = await pool.execute(
        `SELECT id, username, full_name, avatar, role, created_at 
         FROM users 
         WHERE id = ?`,
        [id]
      );
      return rows[0] || null;
    },

    /**
     * Finds a user by their username. Includes the password hash for authentication.
     * @param {string} username - The username of the user to find.
     * @returns {Promise<UserWithPassword|null>} A promise that resolves to the user object if found, otherwise null.
     * @throws {Error} If a database error occurs.
     */
    findByUsername: async (username) => {
      const [rows] = await pool.execute(
        `SELECT id, username, password_hash, full_name, avatar, role, created_at 
         FROM users 
         WHERE username = ?`,
        [username]
      );
      return rows[0] || null;
    },

    /**
     * Retrieves all users from the database, ordered by creation date.
     * @returns {Promise<User[]>} A promise that resolves to an array of user objects.
     * @throws {Error} If a database error occurs.
     */
    getAllUsers: async () => {
      const [rows] = await pool.execute(
        `SELECT id, username, full_name, avatar, role, created_at 
         FROM users 
         ORDER BY created_at DESC`
      );
      return rows;
    },

    /**
     * Creates a new user in the database.
     * @param {Object} userData - The data for the new user.
     * @param {string} userData.username - The username for the new user.
     * @param {string} userData.password_hash - The hashed password for the new user.
     * @param {string} userData.role - The role for the new user (e.g., 'admin', 'user').
     * @param {string} [userData.full_name=""] - The full name of the new user.
     * @returns {Promise<number>} A promise that resolves to the ID of the newly created user.
     * @throws {Error} If a database error occurs.
     */
    create: async ({ username, password_hash, role, full_name = "" }) => {
      const [result] = await pool.execute(
        `INSERT INTO users (username, password_hash, role, full_name, created_at) 
         VALUES (?, ?, ?, ?, NOW())`,
        [username, password_hash, role, full_name]
      );
      return result.insertId;
    },

    /**
     * Updates a user's basic information (username, role, full name).
     * @param {number} id - The ID of the user to update.
     * @param {Object} userData - The data to update.
     * @param {string} userData.username - The new username.
     * @param {string} userData.role - The new role.
     * @param {string} userData.full_name - The new full name.
     * @returns {Promise<boolean>} A promise that resolves to true if the update was successful, otherwise false.
     * @throws {Error} If a database error occurs.
     */
    update: async (id, { username, role, full_name }) => {
      const [result] = await pool.execute(
        `UPDATE users 
         SET username = ?, role = ?, full_name = ? 
         WHERE id = ?`,
        [username, role, full_name, id]
      );
      return result.affectedRows > 0;
    },

    /**
     * Updates a user's password.
     * @param {number} id - The ID of the user to update.
     * @param {string} password_hash - The new hashed password.
     * @returns {Promise<boolean>} A promise that resolves to true if the update was successful, otherwise false.
     * @throws {Error} If a database error occurs.
     */
    updatePassword: async (id, password_hash) => {
      const [result] = await pool.execute(
        `UPDATE users 
         SET password_hash = ? 
         WHERE id = ?`,
        [password_hash, id]
      );
      return result.affectedRows > 0;
    },

    /**
     * Updates a user's profile information (full name and avatar).
     * @param {number} id - The ID of the user to update.
     * @param {Object} profileData - The profile data to update.
     * @param {string} [profileData.full_name] - The new full name.
     * @param {string} [profileData.avatar] - The new avatar URL.
     * @returns {Promise<boolean>} A promise that resolves to true if the update was successful, otherwise false.
     * @throws {Error} If a database error occurs.
     */
    updateProfile: async (id, { full_name, avatar }) => {
      // Validasi parameter
      if (id === undefined || id === null) {
        throw new Error("User ID is required");
      }

      // Siapkan parameter query
      const params = [];
      let query = "UPDATE users SET ";

      // Tambahkan field yang akan diupdate
      const updates = [];

      if (full_name !== undefined) {
        updates.push("full_name = ?");
        params.push(full_name);
      }

      if (avatar !== undefined) {
        updates.push("avatar = ?");
        params.push(avatar);
      }

      // Jika tidak ada field yang diupdate, kembalikan false
      if (updates.length === 0) {
        return false;
      }

      // Gabungkan query
      query += updates.join(", ") + " WHERE id = ?";
      params.push(id);

      const [result] = await pool.execute(query, params);
      return result.affectedRows > 0;
    },

    /**
     * Deletes a user from the database.
     * @param {number} id - The ID of the user to delete.
     * @returns {Promise<boolean>} A promise that resolves to true if the deletion was successful, otherwise false.
     * @throws {Error} If a database error occurs.
     */
    delete: async (id) => {
      const [result] = await pool.execute(`DELETE FROM users WHERE id = ?`, [
        id,
      ]);
      return result.affectedRows > 0;
    },
  };

  return model;
};

export default createUserModel;
