import fs from "fs";

/**
 * Factory function to create a Student Controller with CRUD operations.
 * @param {Object} dependencies - Dependencies to be injected
 * @param {Object} dependencies.pool - Database connection pool
 * @param {Object} dependencies.importStudentService - Service for importing student data
 * @returns {Object} Controller with CRUD methods
 */
const studentControllerFactory = ({ pool, importStudentService }) => {
  /**
   * Retrieves a list of students with pagination, search, and filtering capabilities.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  const getStudents = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search = "",
        classId,
        academicYear,
      } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const [students] = await pool.execute(
        `SELECT 
        s.id, s.nisn, s.name, s.jenis_kelamin, s.status, 
        c.name as className, c.level, c.rombel,
        sah.academicYear
       FROM students s
       LEFT JOIN student_academic_history sah ON s.id = sah.studentId
       LEFT JOIN classes c ON sah.classId = c.id
       WHERE s.name LIKE ? OR s.nisn LIKE ?
         ${classId ? "AND sah.classId = ?" : ""}
         ${academicYear ? "AND sah.academicYear = ?" : ""}
       ORDER BY s.name
       LIMIT ? OFFSET ?`,
        [`%${search}%`, `%${search}%`, classId, academicYear, limit, offset]
      );

      const [countRes] = await pool.execute(
        `SELECT COUNT(*) as total FROM students s
         LEFT JOIN student_academic_history sah ON s.id = sah.studentId
         WHERE s.name LIKE ? OR s.nisn LIKE ?
           ${classId ? "AND sah.classId = ?" : ""}
           ${academicYear ? "AND sah.academicYear = ?" : ""}`,
        [`%${search}%`, `%${search}%`, classId, academicYear]
      );

      res.json({
        data: students,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countRes[0].total,
          totalPages: Math.ceil(countRes[0].total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Creates a new student record with the provided information.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  const createStudent = async (req, res) => {
    try {
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
        classId,
      } = req.body;

      if (!nisn || !name || !classId) {
        return res
          .status(400)
          .json({ error: "NISN, Nama, dan Kelas wajib diisi" });
      }

      const [existing] = await pool.execute(
        "SELECT id FROM students WHERE nisn = ?",
        [nisn]
      );
      if (existing.length > 0) {
        return res.status(400).json({ error: "NISN sudah terdaftar" });
      }

      const [classCheck] = await pool.execute(
        "SELECT id FROM classes WHERE id = ?",
        [classId]
      );
      if (classCheck.length === 0) {
        return res.status(400).json({ error: "Kelas tidak ditemukan" });
      }

      const [result] = await pool.execute(
        `INSERT INTO students (nisn, name, jenis_kelamin, nik, birthPlace, 
          birthDate, address, phone, parentName, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Aktif')`,
        [
          nisn,
          name,
          jenisKelamin,
          nik,
          birthPlace,
          birthDate,
          address,
          phone,
          parentName,
        ]
      );

      const studentId = result.insertId;

      await pool.execute(
        "INSERT INTO student_academic_history (studentId, classId, academicYear) VALUES (?, ?, ?)",
        [studentId, classId, academicYear || "2025/2026"]
      );

      res.status(201).json({
        message: "Siswa berhasil ditambahkan",
        studentId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Retrieves a specific student by their ID.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  const getStudentById = async (req, res) => {
    try {
      const { id } = req.params;

      const [students] = await pool.execute(
        `SELECT 
          s.*, c.name as className, c.level, c.rombel,
          sah.academicYear
         FROM students s
         LEFT JOIN student_academic_history sah ON s.id = sah.studentId
         LEFT JOIN classes c ON sah.classId = c.id
         WHERE s.id = ?`,
        [id]
      );

      if (students.length === 0) {
        return res.status(404).json({ error: "Siswa tidak ditemukan" });
      }

      res.json(students[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Updates an existing student's information.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  const updateStudent = async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (updates.nisn) {
        const [existing] = await pool.execute(
          "SELECT id FROM students WHERE nisn = ? AND id != ?",
          [updates.nisn, id]
        );
        if (existing.length > 0) {
          return res
            .status(400)
            .json({ error: "NISN sudah digunakan siswa lain" });
        }
      }

      const fields = [];
      const values = [];

      if (updates.name) {
        fields.push("name = ?");
        values.push(updates.name);
      }
      if (updates.jenisKelamin) {
        fields.push("jenis_kelamin = ?");
        values.push(updates.jenisKelamin);
      }
      if (updates.nik) {
        fields.push("nik = ?");
        values.push(updates.nik);
      }
      if (updates.birthPlace) {
        fields.push("birthPlace = ?");
        values.push(updates.birthPlace);
      }
      if (updates.birthDate) {
        fields.push("birthDate = ?");
        values.push(updates.birthDate);
      }
      if (updates.address) {
        fields.push("address = ?");
        values.push(updates.address);
      }
      if (updates.phone) {
        fields.push("phone = ?");
        values.push(updates.phone);
      }
      if (updates.parentName) {
        fields.push("parentName = ?");
        values.push(updates.parentName);
      }
      if (updates.nisn) {
        fields.push("nisn = ?");
        values.push(updates.nisn);
      }
      if (updates.status !== undefined) {
        fields.push("status = ?");
        values.push(updates.status);
      }

      if (fields.length === 0) {
        return res.status(400).json({ error: "Tidak ada data yang diupdate" });
      }

      values.push(id);
      const query = `UPDATE students SET ${fields.join(", ")} WHERE id = ?`;

      const [result] = await pool.execute(query, values);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Siswa tidak ditemukan" });
      }

      if (updates.classId) {
        await pool.execute(
          `UPDATE student_academic_history 
           SET classId = ? 
           WHERE studentId = ? AND academicYear = (
             SELECT academicYear FROM student_academic_history 
             WHERE studentId = ? 
             ORDER BY createdAt DESC LIMIT 1
           )`,
          [updates.classId, id, id]
        );
      }

      res.json({ message: "Siswa berhasil diupdate" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Soft deletes a student by setting their status to inactive.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  const deleteStudent = async (req, res) => {
    try {
      const { id } = req.params;

      const [student] = await pool.execute(
        "SELECT id FROM students WHERE id = ?",
        [id]
      );
      if (student.length === 0) {
        return res.status(404).json({ error: "Siswa tidak ditemukan" });
      }

      await pool.execute(
        'UPDATE students SET status = "Tidak Aktif" WHERE id = ?',
        [id]
      );

      res.json({ message: "Siswa berhasil dihapus" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Retrieves statistics about students.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  const getStudentStats = async (req, res) => {
    try {
      const [rows] = await pool.execute(
        "SELECT COUNT(*) as total FROM students WHERE is_active = 1 AND is_deleted = 0"
      );

      const totalStudents = rows[0].total;

      res.status(200).json({
        totalStudents,
      });
    } catch (error) {
      console.error("Error fetching student stats:", error);
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Imports student data from a file.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  const importStudents = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const results = await importStudentService.processImportFile(
        req.file.path
      );

      const response = {
        success: results.success,
        failed: results.failed,
        skipped: results.skipped,
        updated: results.updated || 0,
        errors: results.errors,
        worksheetDetails: results.worksheetDetails,
        skipBreakdown: results.skipBreakdown || {},
      };

      res.json(response);
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({
        message: "Failed to process file",
        error: error.message,
        success: 0,
        failed: 1,
      });
    }
  };

  return {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentStats,
    importStudents,
  };
};

export default studentControllerFactory;
