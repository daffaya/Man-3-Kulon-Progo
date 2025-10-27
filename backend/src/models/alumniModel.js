// src/models/alumniModel.js
const alumniModelFactory = ({ pool }) => {
  // Get all alumni with filters
  const getAlumni = async (filters = {}) => {
    const { search, graduationYear } = filters;

    let query = `
      SELECT 
        a.id, a.student_id, a.nisn, a.name, a.graduation_year, 
        a.last_class_id, a.last_class_name, a.last_academic_year,
        a.status, a.workplace, a.business, a.university
      FROM alumni a
      WHERE 1=1`;

    const queryParams = [];

    if (search) {
      query += ` AND (a.nisn LIKE ? OR a.name LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (graduationYear) {
      query += ` AND a.graduation_year = ?`;
      queryParams.push(graduationYear);
    }

    query += ` ORDER BY a.name`;

    const [alumni] = await pool.query(query, queryParams);
    return alumni;
  };

  // Get alumni by ID
  const getAlumniById = async (id) => {
    const [alumni] = await pool.query(
      `SELECT 
        a.id, a.student_id, a.nisn, a.name, a.graduation_year, 
        a.last_class_id, a.last_class_name, a.last_academic_year,
        a.status, a.workplace, a.business, a.university
      FROM alumni a
      WHERE a.id = ?`,
      [id]
    );

    return alumni[0] || null;
  };

  // Update alumni data
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
      ]
    );

    return result.affectedRows > 0;
  };

  // Create new alumni (used when graduating students)
  const createAlumni = async (alumniData) => {
    const {
      student_id,
      nisn,
      name,
      graduation_year,
      last_class_id,
      last_class_name,
      last_academic_year,
    } = alumniData;

    const [result] = await pool.query(
      `INSERT INTO alumni 
       (student_id, nisn, name, graduation_year, last_class_id, last_class_name, last_academic_year) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        nisn,
        name,
        graduation_year,
        last_class_id,
        last_class_name,
        last_academic_year,
      ]
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
