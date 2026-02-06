/**
 * @fileoverview Data access layer for alumni-related operations.
 * This module provides a factory function to create an alumni model object with methods
 * for CRUD operations against the database.
 */

/**
 * Creates an alumni model with methods to interact with the alumni database table.
 * @param {object} options - The options object.
 * @param {mysql.Pool} options.pool - The database connection pool.
 * @returns {object} An object containing alumni model methods.
 */
const alumniModelFactory = ({ pool }) => {
  /**
   * Retrieves a paginated list of alumni, with optional filtering by name, graduation year, and status.
   * @async
   * @param {object} [filters={}] - The filtering and pagination options.
   * @param {string} [filters.search] - Search term to filter by name.
   * @param {number} [filters.graduationYear] - Filter by graduation year.
   * @param {string} [filters.status] - Filter by status.
   * @param {number} [filters.page=1] - The page number for pagination.
   * @param {number} [filters.limit=35] - The number of items per page.
   * @returns {Promise<object>} A promise that resolves to an object containing the alumni data and pagination metadata.
   */
  const getAlumni = async (filters = {}) => {
    const { search, graduationYear, status, page = 1, limit = 35 } = filters;
    const offset = (page - 1) * limit;

    let countQuery = `
    SELECT COUNT(*) as total
    FROM alumni a
    WHERE 1=1`;

    let query = `
    SELECT 
      a.id, a.student_id, a.name, a.graduation_year, 
      a.last_class_id, a.last_class_name, a.last_academic_year,
      a.status, a.workplace, a.business, a.university
    FROM alumni a
    WHERE 1=1`;

    const queryParams = [];
    const countParams = [];

    if (search) {
      const searchCondition = ` AND a.name LIKE ?`;
      countQuery += searchCondition;
      query += searchCondition;
      queryParams.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    if (graduationYear) {
      const yearCondition = ` AND a.graduation_year = ?`;
      countQuery += yearCondition;
      query += yearCondition;
      queryParams.push(graduationYear);
      countParams.push(graduationYear);
    }

    if (status) {
      const statusCondition = ` AND a.status = ?`;
      countQuery += statusCondition;
      query += statusCondition;
      queryParams.push(status);
      countParams.push(status);
    }

    query += ` ORDER BY a.name LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const [countResult] = await pool.query(countQuery, countParams);
    const [alumni] = await pool.query(query, queryParams);

    const totalAlumni = countResult[0].total;
    const totalPages = Math.ceil(totalAlumni / limit);

    return {
      data: alumni,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalAlumni,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  };

  /**
   * Retrieves a single alumni record by their ID.
   * @async
   * @param {number} id - The ID of the alumni to retrieve.
   * @returns {Promise<object|null>} A promise that resolves to the alumni object or null if not found.
   */
  const getAlumniById = async (id) => {
    const [alumni] = await pool.query(
      `SELECT 
        a.id, a.student_id, a.name, a.graduation_year, 
        a.last_class_id, a.last_class_name, a.last_academic_year,
        a.status, a.workplace, a.business, a.university
      FROM alumni a
      WHERE a.id = ?`,
      [id],
    );

    return alumni[0] || null;
  };

  /**
   * Updates an existing alumni's information (status, workplace, business, university).
   * @async
   * @param {number} id - The ID of the alumni to update.
   * @param {object} alumniData - The data to update.
   * @param {string|null} [alumniData.status] - The new status of the alumni.
   * @param {string|null} [alumniData.workplace] - The new workplace of the alumni.
   * @param {string|null} [alumniData.business] - The new business of the alumni.
   * @param {string|null} [alumniData.university] - The new university of the alumni.
   * @returns {Promise<boolean>} A promise that resolves to true if the update was successful, false otherwise.
   */
  const updateAlumni = async (id, alumniData) => {
    const { status, workplace, business, university } = alumniData;

    const [result] = await pool.query(
      `UPDATE alumni 
       SET status = ?, workplace = ?, business = ?, university = ? 
       WHERE id = ?`,
      [
        status || null,
        workplace || null,
        business || null,
        university || null,
        id,
      ],
    );

    return result.affectedRows > 0;
  };

  /**
   * Creates a new alumni record in the database.
   * @async
   * @param {object} alumniData - The data for the new alumni record.
   * @param {number} alumniData.student_id - The student ID.
   * @param {string} alumniData.name - The alumni's name.
   * @param {number} alumniData.graduation_year - The graduation year.
   * @param {number} alumniData.last_class_id - The ID of the last class.
   * @param {string} alumniData.last_class_name - The name of the last class.
   * @param {string} alumniData.last_academic_year - The last academic year.
   * @returns {Promise<number>} A promise that resolves to the ID of the newly created alumni record.
   */
  const createAlumni = async (alumniData) => {
    const {
      student_id,
      name,
      graduation_year,
      last_class_id,
      last_class_name,
      last_academic_year,
    } = alumniData;

    const [result] = await pool.query(
      `INSERT INTO alumni 
       (student_id, name, graduation_year, last_class_id, last_class_name, last_academic_year) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        name,
        graduation_year,
        last_class_id,
        last_class_name,
        last_academic_year,
      ],
    );

    return result.insertId;
  };

  return {
    getAlumni,
    getAlumniById,
    updateAlumni,
    createAlumni,
  };
};

export default alumniModelFactory;
