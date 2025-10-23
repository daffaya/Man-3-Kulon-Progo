// src/models/studentModel.js
const studentModelFactory = ({ pool }) => {
  // Get student by NISN
  const getStudentByNISN = async (nisn) => {
    const [students] = await pool.query(
      "SELECT * FROM students WHERE nisn = ? AND is_deleted = 0",
      [nisn]
    );
    return students[0] || null;
  };

  // Create new student
  const createStudent = async (studentData) => {
    const {
      nisn,
      name,
      jenisKelamin,
      academicYear,
      nik,
      birthPlace,
      birthDate,
      address,
      phone,
      parentName,
    } = studentData;

    const [result] = await pool.query(
      `INSERT INTO students 
      (nisn, name, jenis_kelamin, academic_year, nik, birth_place, birth_date, address, phone, parent_name, is_active, is_deleted) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)`,
      [
        nisn,
        name,
        jenisKelamin,
        academicYear,
        nik,
        birthPlace,
        birthDate,
        address,
        phone,
        parentName,
      ]
    );
    return result.insertId;
  };

  // Update student
  const updateStudent = async (id, studentData) => {
    const {
      name,
      jenisKelamin,
      nik,
      birthPlace,
      birthDate,
      address,
      phone,
      parentName,
    } = studentData;

    await pool.query(
      `UPDATE students SET 
      name = ?, 
      jenis_kelamin = ?,
      nik = ?,
      birth_place = ?,
      birth_date = ?,
      address = ?,
      phone = ?,
      parent_name = ?
      WHERE id = ?`,
      [
        name,
        jenisKelamin,
        nik,
        birthPlace,
        birthDate,
        address,
        phone,
        parentName,
        id,
      ]
    );
  };

  // Get class by name and academic year
  const getClassByName = async (className, academicYear) => {
    const [classes] = await pool.query(
      "SELECT * FROM classes WHERE name = ? AND academic_year = ?",
      [className, academicYear]
    );
    return classes[0] || null;
  };

  // Get student academic history
  const getStudentAcademicHistory = async (studentId, academicYear) => {
    const [history] = await pool.query(
      "SELECT * FROM student_academic_history WHERE student_id = ? AND academic_year = ?",
      [studentId, academicYear]
    );
    return history[0] || null;
  };

  // Create student academic history
  const createStudentAcademicHistory = async (historyData) => {
    const { studentId, classId, academicYear } = historyData;

    try {
      const [result] = await pool.query(
        "INSERT INTO student_academic_history (student_id, class_id, academic_year, is_current) VALUES (?, ?, ?, 1)",
        [studentId, classId, academicYear]
      );
      return result.insertId;
    } catch (error) {
      console.error("Error creating student academic history:", error);

      // Jika error karena duplikat, update yang sudah ada
      if (error.code === "ER_DUP_ENTRY") {
        console.log(
          "Duplicate academic history detected, updating existing record"
        );

        await pool.query(
          "UPDATE student_academic_history SET class_id = ?, is_current = 1 WHERE student_id = ? AND academic_year = ?",
          [classId, studentId, academicYear]
        );

        // Return ID dari record yang sudah diupdate
        const [existingHistory] = await pool.query(
          "SELECT id FROM student_academic_history WHERE student_id = ? AND academic_year = ?",
          [studentId, academicYear]
        );

        return existingHistory[0]?.id || null;
      }

      throw error;
    }
  };

  // Update student academic history
  const updateStudentAcademicHistory = async (id, historyData) => {
    const { classId } = historyData;
    await pool.query(
      "UPDATE student_academic_history SET class_id = ?, is_current = 1 WHERE id = ?",
      [classId, id]
    );
  };

  // Set all academic history to non-current for a student
  const setAllHistoryNonCurrent = async (studentId) => {
    await pool.query(
      "UPDATE student_academic_history SET is_current = 0 WHERE student_id = ?",
      [studentId]
    );
  };

  // Get current academic year from system settings
  const getCurrentAcademicYear = async () => {
    try {
      const [settings] = await pool.query(
        "SELECT value FROM attendance_system_settings WHERE `key` = 'current_academic_year'"
      );
      return settings[0]?.value || "2023/2024";
    } catch (error) {
      console.error("Error getting current academic year:", error);
      // Return default value if table doesn't exist or has error
      return "2023/2024";
    }
  };

  return {
    getStudentByNISN,
    createStudent,
    updateStudent,
    getClassByName,
    getStudentAcademicHistory,
    createStudentAcademicHistory,
    updateStudentAcademicHistory,
    setAllHistoryNonCurrent,
    getCurrentAcademicYear,
  };
};

export default studentModelFactory;
