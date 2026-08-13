/**
 * @fileoverview Data access layer for student-related operations.
 * This module provides a factory function to create a student model object with methods
 * for CRUD operations against the database.
 */

/**
 * Creates a student model with methods to interact with the student database tables.
 * @param {object} options - The options object.
 * @param {mysql.Pool} options.pool - The database connection pool.
 * @returns {object} An object containing student model methods.
 */
const studentModelFactory = ({ pool }) => {
  /**
   * Retrieves a student by their NISN (National Student Identification Number).
   * @async
   * @param {string} nisn - The NISN of the student to retrieve.
   * @returns {Promise<object|null>} A promise that resolves to the student object or null if not found.
   */
  const getStudentByNISN = async (nisn) => {
    const [students] = await pool.query(
      "SELECT * FROM students WHERE nisn = ? AND is_deleted = 0",
      [nisn]
    );
    return students[0] || null;
  };

  /**
   * Creates a new student record in the database.
   * @async
   * @param {object} studentData - The student data to insert.
   * @param {string} studentData.nisn - The NISN of the student.
   * @param {string} studentData.name - The name of the student.
   * @param {string} studentData.jenisKelamin - The gender of the student.
   * @param {string} studentData.academicYear - The academic year of enrollment.
   * @param {string} studentData.nik - The National Identification Number.
   * @param {string} studentData.birthPlace - The place of birth.
   * @param {string} studentData.birthDate - The date of birth.
   * @param {string} studentData.address - The address of the student.
   * @param {string} studentData.phone - The phone number.
   * @param {string} studentData.parentName - The name of the parent/guardian.
   * @returns {Promise<number>} A promise that resolves to the ID of the newly created student.
   */
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

  /**
   * Updates an existing student record in the database.
   * @async
   * @param {number} id - The ID of the student to update.
   * @param {object} studentData - The updated student data.
   * @param {string} studentData.name - The name of the student.
   * @param {string} studentData.jenisKelamin - The gender of the student.
   * @param {string} studentData.nik - The National Identification Number.
   * @param {string} studentData.birthPlace - The place of birth.
   * @param {string} studentData.birthDate - The date of birth.
   * @param {string} studentData.address - The address of the student.
   * @param {string} studentData.phone - The phone number.
   * @param {string} studentData.parentName - The name of the parent/guardian.
   * @returns {Promise<void>} A promise that resolves when the update is complete.
   */
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

  /**
   * Retrieves a class by its name and academic year.
   * @async
   * @param {string} className - The name of the class.
   * @param {string} academicYear - The academic year.
   * @returns {Promise<object|null>} A promise that resolves to the class object or null if not found.
   */
  const getClassByName = async (className, academicYear) => {
    const [classes] = await pool.query(
      "SELECT * FROM classes WHERE name = ? AND academic_year = ?",
      [className, academicYear]
    );
    return classes[0] || null;
  };

  /**
   * Retrieves a student's academic history for a specific academic year.
   * @async
   * @param {number} studentId - The ID of the student.
   * @param {string} academicYear - The academic year.
   * @returns {Promise<object|null>} A promise that resolves to the academic history object or null if not found.
   */
  const getStudentAcademicHistory = async (studentId, academicYear) => {
    const [history] = await pool.query(
      "SELECT * FROM student_academic_history WHERE student_id = ? AND academic_year = ?",
      [studentId, academicYear]
    );
    return history[0] || null;
  };

  /**
   * Creates a new academic history record for a student.
   * @async
   * @param {object} historyData - The academic history data.
   * @param {number} historyData.studentId - The ID of the student.
   * @param {number} historyData.classId - The ID of the class.
   * @param {string} historyData.academicYear - The academic year.
   * @returns {Promise<number>} A promise that resolves to the ID of the newly created academic history record.
   */
  const createStudentAcademicHistory = async (historyData) => {
    const { studentId, classId, academicYear } = historyData;

    try {
      const [result] = await pool.query(
        "INSERT INTO student_academic_history (student_id, class_id, academic_year, is_current) VALUES (?, ?, ?, 1)",
        [studentId, classId, academicYear]
      );
      return result.insertId;
    } catch (error) {
      // If error due to duplicate, update the existing record
      if (error.code === "ER_DUP_ENTRY") {
        await pool.query(
          "UPDATE student_academic_history SET class_id = ?, is_current = 1 WHERE student_id = ? AND academic_year = ?",
          [classId, studentId, academicYear]
        );

        // Return ID from the updated record
        const [existingHistory] = await pool.query(
          "SELECT id FROM student_academic_history WHERE student_id = ? AND academic_year = ?",
          [studentId, academicYear]
        );

        return existingHistory[0]?.id || null;
      }

      throw error;
    }
  };

  /**
   * Updates an existing academic history record.
   * @async
   * @param {number} id - The ID of the academic history record to update.
   * @param {object} historyData - The updated academic history data.
   * @param {number} historyData.classId - The ID of the class.
   * @returns {Promise<void>} A promise that resolves when the update is complete.
   */
  const updateStudentAcademicHistory = async (id, historyData) => {
    const { classId } = historyData;
    await pool.query(
      "UPDATE student_academic_history SET class_id = ?, is_current = 1 WHERE id = ?",
      [classId, id]
    );
  };

  /**
   * Sets all academic history records for a student to non-current.
   * @async
   * @param {number} studentId - The ID of the student.
   * @returns {Promise<void>} A promise that resolves when the update is complete.
   */
  const setAllHistoryNonCurrent = async (studentId) => {
    await pool.query(
      "UPDATE student_academic_history SET is_current = 0 WHERE student_id = ?",
      [studentId]
    );
  };

  /**
   * Retrieves the current academic year from system settings.
   * @async
   * @returns {Promise<string>} A promise that resolves to the current academic year string.
   */
  const getCurrentAcademicYear = async () => {
    try {
      const [settings] = await pool.query(
        "SELECT value FROM attendance_system_settings WHERE `key` = 'current_academic_year'"
      );
      return settings[0]?.value || "2023/2024";
    } catch (error) {
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
