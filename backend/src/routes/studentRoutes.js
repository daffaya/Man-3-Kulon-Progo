/**
 * @fileoverview Router for managing student-related endpoints.
 * This module defines and configures an Express router for student operations,
 * including CRUD operations, bulk operations, and student management features.
 */

import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  authenticateTokenFactory,
  restrictTo,
} from "../middleware/authMiddleware.js";
import studentModelFactory from "../models/studentModel.js";
import importStudentServiceFactory from "../services/importStudentService.js";
import rateLimiter from "../middleware/rateLimiter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /xlsx|xls/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );

    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error("Hanya file Excel yang diizinkan (.xlsx, .xls)"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Factory function that creates and configures the student router.
 * This router handles all student-related endpoints including CRUD operations,
 * bulk operations, and student management features.
 *
 * @param {object} options - The options object.
 * @param {import('mysql2/promise').Pool} options.pool - MySQL connection pool.
 * @param {string} options.JWT_SECRET - Secret key for JWT authentication.
 * @returns {import('express').Router} Configured Express router for student endpoints.
 */
const studentRouterFactory = ({ pool, JWT_SECRET }) => {
  const router = Router();
  const authenticateToken = authenticateTokenFactory({ JWT_SECRET });

  const limiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Terlalu banyak permintaan. Coba lagi nanti" },
  });

  const studentModel = studentModelFactory({ pool });
  const importStudentService = importStudentServiceFactory({ studentModel });

  router.get("/template", (req, res) => {
    const filePath = path.join(
      __dirname,
      "../../template/template-import-siswa.xlsx",
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Template tidak ditemukan" });
    }

    res.download(filePath, "template-import-siswa.xlsx");
  });

  router.use(authenticateToken);

  /**
   * GET /students
   * Retrieves a list of students with pagination and filtering options.
   * Can also return special data based on query parameters:
   * - getAngkatans: Returns all student angkatans (batches)
   * - getClassesByAngkatan: Returns classes for a specific angkatan
   * - getClassesByLevel: Returns classes for a specific level (X, XI, XII)
   *
   * @route GET /students
   * @param {string} [req.query.classId] - Filter by class ID.
   * @param {string} [req.query.search] - Search by NISN or name.
   * @param {string} [req.query.academicYear] - Filter by academic year.
   * @param {string} [req.query.angkatan] - Filter by angkatan (batch).
   * @param {string} [req.query.getAngkatans] - If "true", returns all angkatans.
   * @param {string} [req.query.getClassesByAngkatan] - Returns classes for this angkatan.
   * @param {string} [req.query.getClassesByLevel] - Returns classes for this level.
   * @param {number} [req.query.page=1] - Page number for pagination.
   * @param {number} [req.query.limit=30] - Number of items per page.
   * @returns {object} Paginated list of students or special data based on query parameters.
   */
  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const {
        classId,
        search,
        academicYear,
        angkatan,
        getAngkatans,
        getClassesByAngkatan,
        getClassesByLevel,
        page = 1,
        limit = 30,
      } = req.query;

      if (getAngkatans === "true") {
        const [angkatansData] = await pool.query(
          `SELECT 
        CAST(s.angkatan AS CHAR) as angkatan,
        COUNT(*) as count
      FROM students s
        WHERE s.is_deleted = 0 AND s.is_active = 1
          AND s.angkatan IS NOT NULL
          AND s.angkatan != ''
        GROUP BY s.angkatan
        ORDER BY s.angkatan DESC`,
        );
        return res.json(angkatansData);
      }

      if (getClassesByAngkatan) {
        const [angkatanCheck] = await pool.query(
          `SELECT DISTINCT angkatan FROM student_academic_history WHERE angkatan = ? LIMIT 1`,
          [angkatan],
        );

        if (angkatanCheck.length === 0) {
          return res.status(404).json({ error: "Angkatan tidak ditemukan" });
        }

        const [classes] = await pool.query(
          `SELECT DISTINCT c.id, c.name, c.academic_year, c.semester
              FROM classes c
              JOIN student_academic_history sah ON c.id = sah.class_id
              JOIN students s ON sah.student_id = s.id
              WHERE sah.angkatan = ? 
                AND s.is_deleted = 0 
                AND s.is_active = 1
                AND sah.is_current = 1
              ORDER BY c.name`,
          [angkatan],
        );

        return res.json(classes);
      }

      if (getClassesByLevel) {
        const level = getClassesByLevel;
        const [classes] = await pool.query(
          `SELECT id, name, academic_year, semester
             FROM classes
             WHERE name LIKE ?
             ORDER BY name`,
          [`${level}-%`],
        );

        return res.json(classes);
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      let countQuery = `
          SELECT COUNT(*) as total
          FROM students s
          LEFT JOIN student_academic_history sah ON s.id = sah.student_id AND sah.is_current = 1
          LEFT JOIN classes c ON sah.class_id = c.id
          WHERE s.is_deleted = 0 AND s.is_active = 1 
        `;

      const countParams = [];

      if (classId) {
        countQuery += " AND sah.class_id = ?";
        countParams.push(classId);
      }

      if (search) {
        countQuery += " AND (s.nisn LIKE ? OR s.name LIKE ?)";
        countParams.push(`%${search}%`, `%${search}%`);
      }

      if (academicYear) {
        countQuery += " AND s.academic_year = ?";
        countParams.push(academicYear);
      }

      if (angkatan) {
        countQuery += " AND COALESCE(sah.angkatan, s.angkatan) = ?";
        countParams.push(angkatan);
      }

      const [countResult] = await pool.query(countQuery, countParams);
      const totalItems = countResult[0].total;

      let dataQuery = `
          SELECT 
            s.id,
            s.nisn,
            s.name,
            s.academic_year,
            s.is_active,
            s.is_deleted,
            COALESCE(sah.angkatan, s.angkatan) as angkatan,
            c.name as class_name,
            c.id as class_id
          FROM students s
          LEFT JOIN student_academic_history sah ON s.id = sah.student_id AND sah.is_current = 1
          LEFT JOIN classes c ON sah.class_id = c.id
          WHERE s.is_deleted = 0 AND s.is_active = 1
        `;
      const dataParams = [];

      if (classId) {
        dataQuery += " AND sah.class_id = ?";
        dataParams.push(classId);
      }

      if (search) {
        dataQuery += " AND (s.nisn LIKE ? OR s.name LIKE ?)";
        dataParams.push(`%${search}%`, `%${search}%`);
      }

      if (academicYear) {
        dataQuery += " AND s.academic_year = ?";
        dataParams.push(academicYear);
      }

      if (angkatan) {
        dataQuery += " AND COALESCE(sah.angkatan, s.angkatan) = ?";
        dataParams.push(angkatan);
      }

      dataQuery += " ORDER BY c.name, s.name LIMIT ? OFFSET ?";
      dataParams.push(parseInt(limit), offset);

      const [students] = await pool.query(dataQuery, dataParams);
      const totalPages = Math.ceil(totalItems / parseInt(limit));

      res.json({
        data: students,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems,
          itemsPerPage: parseInt(limit),
        },
      });
    }),
  );

  /**
   * GET /students/:id
   * Retrieves a single student by ID.
   *
   * @route GET /students/:id
   * @param {string} req.params.id - The ID of the student to retrieve.
   * @returns {object} The requested student object or an error message.
   */
  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const { id } = req.params;

      const [student] = await pool.query(
        `SELECT 
        s.*, 
        c.name as class_name, c.id as class_id,
        sah.academic_year
       FROM students s
       LEFT JOIN student_academic_history sah ON s.id = sah.student_id AND sah.is_current = 1
       LEFT JOIN classes c ON sah.class_id = c.id
       WHERE s.id = ? AND s.is_deleted = 0`,
        [id],
      );

      if (student.length === 0) {
        return res.status(404).json({ error: "Siswa tidak ditemukan" });
      }

      res.json(student[0]);
    }),
  );

  /**
   * GET /students/classes
   * Retrieves a list of all classes, optionally filtered by academic year.
   *
   * @route GET /students/classes
   * @param {string} [req.query.academicYear] - Filter by academic year.
   * @returns {object} List of classes.
   */
  router.get(
    "/classes",
    asyncHandler(async (req, res) => {
      const { academicYear } = req.query;

      try {
        let query = `SELECT id, name, academic_year, semester FROM classes`;
        const queryParams = [];

        if (academicYear) {
          query += ` WHERE academic_year = ?`;
          queryParams.push(academicYear);
        }

        query += ` ORDER BY name`;

        const [classes] = await pool.query(query, queryParams);
        res.json(classes);
      } catch (error) {
        console.error("Error fetching classes:", error);
        res.status(500).json({ error: "Failed to fetch classes" });
      }
    }),
  );

  /**
   * GET /students/classes-by-level
   * Retrieves a list of classes filtered by level (X, XI, XII).
   *
   * @route GET /students/classes-by-level
   * @param {string} req.query.level - The level to filter by (X, XI, XII).
   * @returns {object} List of classes for the specified level.
   */
  router.get(
    "/classes-by-level",
    asyncHandler(async (req, res) => {
      const { level } = req.query;

      if (!level) {
        return res.status(400).json({ error: "Level is required" });
      }

      try {
        const [classes] = await pool.query(
          `SELECT id, name, academic_year, semester
         FROM classes
         WHERE name LIKE ?
         ORDER BY name`,
          [`${level}-%`],
        );

        res.json(classes);
      } catch (error) {
        console.error("Error fetching classes by level:", error);
        res.status(500).json({ error: "Failed to fetch classes" });
      }
    }),
  );

  /**
   * POST /students
   * Creates a new student record.
   * Restricted to users with "guru_bk" or "super_admin" roles.
   *
   * @route POST /students
   * @param {string} req.body.nisn - The NISN of the student.
   * @param {string} req.body.name - The name of the student.
   * @param {number} req.body.class_id - The ID of the class to assign the student to.
   * @param {string} [req.body.academic_year="2025/2026"] - The academic year.
   * @returns {object} The created student object.
   */
  router.post(
    "/",
    restrictTo(["guru_bk", "super_admin"]),
    asyncHandler(async (req, res) => {
      const {
        nisn,
        name,
        jenis_kelamin,
        class_id,
        academic_year = "2025/2026",
        nik,
        birth_place,
        birth_date,
        address,
        phone,
        parent_name,
        angkatan,
      } = req.body;

      const [existingStudent] = await pool.query(
        "SELECT id FROM students WHERE nisn = ? AND is_deleted = 0",
        [nisn],
      );

      if (existingStudent.length > 0) {
        return res.status(400).json({ error: "NISN sudah terdaftar" });
      }

      const [result] = await pool.query(
        `INSERT INTO students 
      (nisn, name, jenis_kelamin, academic_year, is_active, is_deleted, 
       nik, birth_place, birth_date, address, phone, parent_name, angkatan) 
      VALUES (?, ?, ?, ?, 1, 0, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nisn,
          name,
          jenis_kelamin || null,
          academic_year,
          nik || null,
          birth_place || null,
          birth_date || null,
          address || null,
          phone || null,
          parent_name || null,
          angkatan || null,
        ],
      );

      const studentId = result.insertId;

      await pool.query(
        "INSERT INTO student_academic_history (student_id, class_id, academic_year, is_current, angkatan) VALUES (?, ?, ?, 1, ?)",
        [studentId, class_id, academic_year, angkatan || null],
      );

      res.status(201).json({
        id: studentId,
        nisn,
        name,
        jenis_kelamin,
        academic_year,
        is_active: true,
        nik,
        birth_place,
        birth_date,
        address,
        phone,
        parent_name,
        angkatan,
      });
    }),
  );

  /**
   * PUT /students/:id
   * Updates an existing student record.
   * Restricted to users with "guru_bk" or "super_admin" roles.
   *
   * @route PUT /students/:id
   * @param {string} req.params.id - The ID of the student to update.
   * @param {string} req.body.nisn - The updated NISN of the student.
   * @param {string} req.body.name - The updated name of the student.
   * @param {number} req.body.class_id - The updated class ID.
   * @param {string} [req.body.academic_year] - The updated academic year.
   * @returns {object} The updated student object.
   */
  router.put(
    "/:id",
    restrictTo(["guru_bk", "super_admin"]),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const {
        nisn,
        name,
        jenis_kelamin,
        class_id,
        academic_year,
        nik,
        birth_place,
        birth_date,
        address,
        phone,
        parent_name,
        angkatan,
      } = req.body;

      try {
        const [existingStudent] = await pool.query(
          "SELECT * FROM students WHERE id = ? AND is_deleted = 0",
          [id],
        );

        if (existingStudent.length === 0) {
          return res.status(404).json({ error: "Siswa tidak ditemukan" });
        }

        if (nisn !== existingStudent[0].nisn) {
          const [duplicateStudent] = await pool.query(
            "SELECT id FROM students WHERE nisn = ? AND id != ? AND is_deleted = 0",
            [nisn, id],
          );
          if (duplicateStudent.length > 0) {
            return res.status(400).json({ error: "NISN sudah terdaftar" });
          }
        }

        const finalAcademicYear =
          academic_year || existingStudent[0].academic_year;

        await pool.query(
          `UPDATE students SET 
        nisn = ?, name = ?, jenis_kelamin = ?, academic_year = ?, 
        nik = ?, birth_place = ?, birth_date = ?, address = ?, 
        phone = ?, parent_name = ?, angkatan = ?
        WHERE id = ?`,
          [
            nisn,
            name,
            jenis_kelamin || null,
            finalAcademicYear,
            nik || null,
            birth_place || null,
            birth_date || null,
            address || null,
            phone || null,
            parent_name || null,
            angkatan || existingStudent[0].angkatan,
            id,
          ],
        );

        if (class_id) {
          const [currentHistory] = await pool.query(
            `SELECT class_id, academic_year FROM student_academic_history 
           WHERE student_id = ? AND is_current = 1`,
            [id],
          );

          if (currentHistory.length > 0) {
            const currentClassId = currentHistory[0].class_id;

            if (currentClassId != class_id) {
              await pool.query(
                "UPDATE student_academic_history SET is_current = 0 WHERE student_id = ? AND is_current = 1",
                [id],
              );

              await pool.query(
                "INSERT INTO student_academic_history (student_id, class_id, academic_year, is_current, angkatan) VALUES (?, ?, ?, 1, ?)",
                [
                  id,
                  class_id,
                  finalAcademicYear,
                  angkatan || existingStudent[0].angkatan,
                ],
              );
            }
          } else {
            await pool.query(
              "INSERT INTO student_academic_history (student_id, class_id, academic_year, is_current, angkatan) VALUES (?, ?, ?, 1, ?)",
              [id, class_id, finalAcademicYear, angkatan || null],
            );
          }
        }

        res.json({
          id: parseInt(id),
          nisn,
          name,
          jenis_kelamin,
          academic_year: finalAcademicYear,
          is_active: existingStudent[0].is_active,
          nik,
          birth_place,
          birth_date,
          address,
          phone,
          parent_name,
          angkatan: angkatan || existingStudent[0].angkatan,
        });
      } catch (error) {
        console.error("Error updating student:", error);
        res.status(500).json({
          error: error.message || "Failed to update student",
        });
      }
    }),
  );

  /**
   * DELETE /students/:id
   * Soft deletes a student by marking them as deleted and inactive.
   * Restricted to users with "guru_bk" or "super_admin" roles.
   *
   * @route DELETE /students/:id
   * @param {string} req.params.id - The ID of the student to delete.
   * @returns {object} Success message.
   */
  router.delete(
    "/:id",
    restrictTo(["guru_bk", "super_admin"]),
    asyncHandler(async (req, res) => {
      const { id } = req.params;

      const [result] = await pool.query(
        "UPDATE students SET is_deleted = 1, is_active = 0 WHERE id = ?",
        [id],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Siswa tidak ditemukan" });
      }

      res.json({ success: true, message: "Siswa berhasil dihapus" });
    }),
  );

  /**
   * POST /students/:id/move-class
   * Moves a student to a different class.
   * Restricted to users with "guru_bk" or "super_admin" roles.
   *
   * @route POST /students/:id/move-class
   * @param {string} req.params.id - The ID of the student to move.
   * @param {number} req.body.classId - The ID of the target class.
   * @returns {object} Success message.
   */
  router.post(
    "/:id/move-class",
    restrictTo(["guru_bk", "super_admin"]),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const { classId } = req.body;

      const [existingStudent] = await pool.query(
        "SELECT * FROM students WHERE id = ? AND is_deleted = 0",
        [id],
      );

      if (existingStudent.length === 0) {
        return res.status(404).json({ error: "Siswa tidak ditemukan" });
      }

      const [targetClass] = await pool.query(
        "SELECT * FROM classes WHERE id = ?",
        [classId],
      );

      if (targetClass.length === 0) {
        return res.status(400).json({ error: "Kelas tujuan tidak ditemukan" });
      }

      const [existingHistory] = await pool.query(
        `SELECT * FROM student_academic_history 
       WHERE student_id = ? AND academic_year = ?`,
        [id, targetClass[0].academic_year],
      );

      if (existingHistory.length > 0) {
        if (existingHistory[0].class_id == classId) {
          return res.status(400).json({ error: "Siswa sudah di kelas ini" });
        }

        await pool.query(
          `UPDATE student_academic_history 
         SET class_id = ?, is_current = 1 
         WHERE student_id = ? AND academic_year = ?`,
          [classId, id, targetClass[0].academic_year],
        );

        await pool.query(
          `UPDATE student_academic_history 
         SET is_current = 0 
         WHERE student_id = ? AND academic_year != ?`,
          [id, targetClass[0].academic_year],
        );
      } else {
        await pool.query(
          "UPDATE student_academic_history SET is_current = 0 WHERE student_id = ?",
          [id],
        );

        await pool.query(
          "INSERT INTO student_academic_history (student_id, class_id, academic_year, is_current) VALUES (?, ?, ?, 1)",
          [id, classId, targetClass[0].academic_year],
        );
      }

      res.json({ success: true, message: "Siswa berhasil dipindahkan kelas" });
    }),
  );

  /**
   * POST /students/import
   * Imports students from an Excel file.
   * Restricted to users with "guru_bk" or "super_admin" roles.
   *
   * @route POST /students/import
   * @param {file} req.file - The Excel file containing student data.
   * @returns {object} Import results including success count and errors.
   */
  router.post(
    "/import",
    restrictTo(["guru_bk", "super_admin"]),
    upload.single("file"),
    asyncHandler(async (req, res) => {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Tidak ada file yang diupload",
        });
      }

      try {
        const results = await importStudentService.processImportFile(
          req.file.path,
        );

        res.json({
          success: true,
          results: results,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message || "Terjadi kesalahan saat import data siswa",
        });
      }
    }),
  );

  /**
   * POST /students/bulk-move-class
   * Moves multiple students from one class to another based on angkatan (batch).
   * Restricted to users with "guru_bk" or "super_admin" roles.
   *
   * @route POST /students/bulk-move-class
   * @param {number} req.body.classIdFrom - The source class ID.
   * @param {number} req.body.classIdTo - The target class ID.
   * @param {string} req.body.academicYear - The academic year.
   * @param {string} req.body.angkatan - The angkatan (batch) to move.
   * @returns {object} Success message with count of moved students.
   */
  router.post(
    "/bulk-move-class",
    limiter,
    authenticateTokenFactory({ JWT_SECRET }),
    restrictTo(["guru_bk", "super_admin"]),
    asyncHandler(async (req, res) => {
      const { classIdFrom, classIdTo, academicYear, angkatan } = req.body;

      if (!classIdFrom || !classIdTo || !academicYear || !angkatan) {
        return res.status(400).json({
          error: "Kelas asal, tujuan, tahun ajaran, dan angkatan wajib diisi",
        });
      }

      if (!academicYear.match(/^\d{4}\/\d{4}$/)) {
        return res
          .status(400)
          .json({ error: "Format tahun ajaran harus YYYY/YYYY" });
      }
      const [year1, year2] = academicYear.split("/");
      if (Number(year2) !== Number(year1) + 1) {
        return res.status(400).json({ error: "Tahun ajaran tidak valid" });
      }

      const [fromClass] = await pool.query(
        "SELECT * FROM classes WHERE id = ?",
        [classIdFrom],
      );
      const [toClass] = await pool.query("SELECT * FROM classes WHERE id = ?", [
        classIdTo,
      ]);

      if (fromClass.length === 0 || toClass.length === 0) {
        return res.status(400).json({
          error: "Kelas asal atau tujuan tidak ditemukan",
        });
      }

      const [studentsToMove] = await pool.query(
        `SELECT s.id, s.nisn, s.name, s.angkatan 
       FROM students s 
       JOIN student_academic_history sah ON s.id = sah.student_id 
       WHERE sah.class_id = ? 
         AND sah.is_current = 1 
         AND s.is_active = 1
         AND s.angkatan = ?`,
        [classIdFrom, angkatan],
      );

      if (studentsToMove.length === 0) {
        return res.status(400).json({
          error: "Tidak ada siswa di kelas asal untuk angkatan ini",
        });
      }

      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        await connection.query(
          "UPDATE student_academic_history SET is_current = 0 WHERE class_id = ? AND is_current = 1",
          [classIdFrom],
        );

        for (const student of studentsToMove) {
          const [existingHistory] = await connection.query(
            `SELECT * FROM student_academic_history 
           WHERE student_id = ? AND academic_year = ?`,
            [student.id, academicYear],
          );

          if (existingHistory.length > 0) {
            await connection.query(
              `UPDATE student_academic_history 
             SET class_id = ?, is_current = 1, angkatan = ?
             WHERE student_id = ? AND academic_year = ?`,
              [classIdTo, student.angkatan, student.id, academicYear],
            );
          } else {
            await connection.query(
              `INSERT INTO student_academic_history 
             (student_id, class_id, academic_year, is_current, angkatan) 
             VALUES (?, ?, ?, 1, ?)`,
              [student.id, classIdTo, academicYear, student.angkatan],
            );
          }
        }

        await connection.commit();

        res.json({
          success: true,
          message: `${studentsToMove.length} siswa Angkatan ${angkatan} dipindah ke ${toClass[0].name}`,
          studentsMoved: studentsToMove.length,
          angkatan,
          fromClassName: fromClass[0].name,
          toClassName: toClass[0].name,
        });
      } catch (error) {
        await connection.rollback();
        console.error("Error bulk-move-class:", error);
        res.status(500).json({
          error: error.message || "Gagal memindahkan siswa",
        });
      } finally {
        connection.release();
      }
    }),
  );

  /**
   * POST /students/graduate
   * Marks students as graduated by updating their status and creating alumni records.
   * Restricted to users with "guru_bk" or "super_admin" roles.
   *
   * @route POST /students/graduate
   * @param {number} req.body.classIdFrom - The source class ID.
   * @param {string} req.body.academicYear - The academic year.
   * @param {string} req.body.angkatan - The angkatan (batch) to graduate.
   * @returns {object} Success message with count of graduated students.
   */
  router.post(
    "/graduate",
    limiter,
    authenticateTokenFactory({ JWT_SECRET }),
    restrictTo(["guru_bk", "super_admin"]),
    asyncHandler(async (req, res) => {
      const { classIdFrom, academicYear, angkatan } = req.body;

      if (!classIdFrom || !academicYear || !angkatan) {
        return res.status(400).json({
          error: "Kelas asal, tahun ajaran, dan angkatan wajib diisi",
        });
      }

      if (!academicYear.match(/^\d{4}\/\d{4}$/)) {
        return res
          .status(400)
          .json({ error: "Format tahun ajaran harus YYYY/YYYY" });
      }
      const [year1, year2] = academicYear.split("/");
      if (Number(year2) !== Number(year1) + 1) {
        return res.status(400).json({ error: "Tahun ajaran tidak valid" });
      }

      const [fromClass] = await pool.query(
        "SELECT * FROM classes WHERE id = ?",
        [classIdFrom],
      );
      if (fromClass.length === 0) {
        return res.status(400).json({ error: "Kelas asal tidak ditemukan" });
      }

      const [students] = await pool.query(
        `SELECT s.id, s.nisn, s.name, s.angkatan
       FROM students s 
       JOIN student_academic_history sah ON s.id = sah.student_id 
       WHERE sah.class_id = ? 
         AND sah.is_current = 1 
         AND s.is_active = 1
         AND s.angkatan = ?`,
        [classIdFrom, angkatan],
      );

      if (students.length === 0) {
        return res
          .status(400)
          .json({ error: "Tidak ada siswa di kelas asal untuk angkatan ini" });
      }

      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        await connection.query(
          "UPDATE student_academic_history SET is_current = 0 WHERE class_id = ? AND is_current = 1",
          [classIdFrom],
        );

        await connection.query(
          `UPDATE students SET is_active = 0 WHERE id IN (?)`,
          [students.map((s) => s.id)],
        );

        for (const student of students) {
          const [existingAlumni] = await connection.query(
            "SELECT * FROM alumni WHERE student_id = ?",
            [student.id],
          );

          if (existingAlumni.length === 0) {
            await connection.query(
              `INSERT INTO alumni (student_id, nisn, name, graduation_year, last_class_id, last_class_name, last_academic_year) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                student.id,
                student.nisn,
                student.name,
                academicYear.split("/")[0],
                classIdFrom,
                fromClass[0].name,
                academicYear,
              ],
            );
          }
        }

        await connection.commit();
        res.json({
          success: true,
          message: `${students.length} siswa Angkatan ${angkatan} ditandai lulus`,
          count: students.length,
          angkatan: angkatan,
        });
      } catch (error) {
        await connection.rollback();
        throw new Error(error.message || "Gagal menandai lulus");
      } finally {
        connection.release();
      }
    }),
  );

  /**
   * GET /students/angkatans
   * Retrieves a list of all angkatans (batches) with student counts.
   *
   * @route GET /students/angkatans
   * @returns {object} List of angkatans with student counts.
   */
  router.get(
    "/angkatans",
    asyncHandler(async (req, res) => {
      try {
        const [angkatans] = await pool.query(
          `SELECT 
          CAST(s.angkatan AS CHAR) as angkatan,
          COUNT(*) as count
        FROM students s
        WHERE s.is_deleted = 0 AND s.is_active = 1
          AND s.angkatan IS NOT NULL
          AND s.angkatan != ''
        GROUP BY s.angkatan
        ORDER BY s.angkatan DESC`,
        );
        res.json(angkatans);
      } catch (error) {
        console.error("[Angkatans Route] Error:", error);
        res.status(500).json({ error: "Failed to fetch angkatans" });
      }
    }),
  );

  router.use((err, req, res, next) => {
    console.error("[Students Route Error]", err);

    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "Ukuran file terlalu besar. Maksimal 5MB" });
    }

    if (err.message === "Hanya file Excel yang diizinkan (.xlsx, .xls)") {
      return res.status(400).json({ error: err.message });
    }

    res.status(500).json({
      error: err.message || "Terjadi kesalahan pada server",
    });
  });

  return router;
};

export default studentRouterFactory;
