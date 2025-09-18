// src/models/attendanceModel.js
export const AttendanceModel = (dependencies) => {
  const { pool } = dependencies;

  const create = async (data) => {
    const [result] = await pool.query(
      "INSERT INTO attendances (...) VALUES (?)",
      [data]
    );
    return result;
  };

  const checkHoliday = async (date) => {
    const [rows] = await pool.query(
      "SELECT COUNT(*) as count FROM school_holidays WHERE date = ?",
      [date]
    );
    return rows[0].count > 0;
  };

  // ... method lainnya

  return { create, checkHoliday };
};
