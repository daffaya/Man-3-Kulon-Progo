// src/routes/studentRoutes.js
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

// Helper untuk mendapatkan __dirname di ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfigurasi multer untuk upload file
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
      path.extname(file.originalname).toLowerCase()
    );

    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error("Hanya file Excel yang diizinkan (.xlsx, .xls)"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Error handler middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const studentRouterFactory = ({ pool, JWT_SECRET }) => {
  const router = Router();
  const authenticateToken = authenticateTokenFactory({ JWT_SECRET });

  const limiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 100, // 100 request per IP
    message: { error: "Terlalu banyak permintaan. Coba lagi nanti" },
  });

  // Initialize dependencies
  const studentModel = studentModelFactory({ pool });
  const importStudentService = importStudentServiceFactory({ studentModel });

  // Logging middleware untuk debugging
  router.use((req, res, next) => {
    console.log(`[Student Routes] ${req.method} ${req.url}`, req.query);
    next();
  });

  // Template download route (no authentication required)
  router.get("/template", (req, res) => {
    console.log("[Template Route] Template download requested");

    const filePath = path.join(
      __dirname,
      "../../template/template-import-siswa.xlsx"
    );

    if (!fs.existsSync(filePath)) {
      console.log("[Template Route] Template file not found at:", filePath);
      return res.status(404).json({ error: "Template tidak ditemukan" });
    }

    console.log("[Template Route] Sending template file...");
    res.download(filePath, "template-import-siswa.xlsx");
  });

  // Apply authentication middleware to all routes below
  router.use(authenticateToken);

  // GET / - Get all students with support for special parameters
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
        limit = 30, // Default limit 30 siswa per halaman
      } = req.query;

      // Jika parameter getAngkatans ada, kembalikan data angkatan
      if (getAngkatans === "true") {
        try {
          console.log("[Students Route] Fetching angkatans...");
          const [angkatansData] = await pool.query(
            `SELECT 
        CAST(s.angkatan AS CHAR) as angkatan,
        COUNT(*) as count
      FROM students s
        WHERE s.is_deleted = 0 AND s.is_active = 1
          AND s.angkatan IS NOT NULL
          AND s.angkatan != ''
        GROUP BY s.angkatan
        ORDER BY s.angkatan DESC`
          );
          console.log("[Students Route] Found angkatans:", angkatansData);
          return res.json(angkatansData);
        } catch (error) {
          console.error("[Students Route] Error fetching angkatans:", error);
          return res.status(500).json({ error: "Failed to fetch angkatans" });
        }
      }

      // Jika parameter getClassesByAngkatan ada, kembalikan kelas berdasarkan angkatan
      if (getClassesByAngkatan) {
        try {
          console.log(
            `[Students Route] Fetching classes for angkatan: ${angkatan}`
          );

          // Debug: Check if angkatan exists in database
          const [angkatanCheck] = await pool.query(
            `SELECT DISTINCT angkatan FROM student_academic_history WHERE angkatan = ? LIMIT 1`,
            [angkatan]
          );

          if (angkatanCheck.length === 0) {
            console.log(
              `[Students Route] Angkatan ${angkatan} not found in database`
            );
            return res.status(404).json({ error: "Angkatan tidak ditemukan" });
          }

          // Get all classes that have ACTIVE students with the specified angkatan
          const [classes] = await pool.query(
            `SELECT DISTINCT c.id, c.name, c.academic_year, c.semester
              FROM classes c
              JOIN student_academic_history sah ON c.id = sah.class_id
              JOIN students s ON sah.student_id = s.id
              WHERE sah.angkatan = ? 
                AND s.is_deleted = 0 
                AND s.is_active = 1
                AND sah.is_current = 1  -- Tambahkan kondisi ini
              ORDER BY c.name`,
            [angkatan]
          );

          console.log(
            `[Students Route] Found ${classes.length} classes for angkatan ${angkatan}`
          );
          console.log(`[Students Route] Classes data:`, classes);

          return res.json(classes);
        } catch (error) {
          console.error("Error fetching classes by angkatan:", error);
          return res.status(500).json({ error: "Failed to fetch classes" });
        }
      }

      // Jika parameter getClassesByLevel ada, kembalikan kelas berdasarkan level
      if (getClassesByLevel) {
        try {
          const level = getClassesByLevel;
          console.log(`[Students Route] Fetching classes for level: ${level}`);

          // Get classes based on level (assuming class names start with level)
          const [classes] = await pool.query(
            `SELECT id, name, academic_year, semester
             FROM classes
             WHERE name LIKE ?
             ORDER BY name`,
            [`${level}-%`]
          );

          console.log(
            `[Students Route] Found ${classes.length} classes for level ${level}`
          );
          console.log(`[Students Route] Classes data:`, classes);

          return res.json(classes);
        } catch (error) {
          console.error("Error fetching classes by level:", error);
          return res.status(500).json({ error: "Failed to fetch classes" });
        }
      }

      // Kode normal untuk get students dengan pagination
      console.log("[Students Route] Fetching students with query:", req.query);

      // Hitung offset berdasarkan page dan limit
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Query untuk menghitung total data
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

      // Eksekusi query count
      const [countResult] = await pool.query(countQuery, countParams);
      const totalItems = countResult[0].total;

      // Query untuk mengambil data dengan pagination
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

      console.log("[Students Route] Executing query:", dataQuery);
      console.log("[Students Route] With params:", dataParams);

      const [students] = await pool.query(dataQuery, dataParams);
      console.log("[Students Route] Found", students.length, "students");

      // Hitung total halaman
      const totalPages = Math.ceil(totalItems / parseInt(limit));

      // Kembalikan response dengan struktur pagination
      res.json({
        data: students,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems,
          itemsPerPage: parseInt(limit),
        },
      });
    })
  );

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
        [id]
      );

      if (student.length === 0) {
        return res.status(404).json({ error: "Siswa tidak ditemukan" });
      }

      res.json(student[0]);
    })
  );

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
    })
  );

  router.get(
    "/classes-by-level",
    asyncHandler(async (req, res) => {
      const { level } = req.query; // level: 'X', 'XI', 'XII'

      if (!level) {
        return res.status(400).json({ error: "Level is required" });
      }

      try {
        console.log(`[Classes By Level] Fetching classes for level: ${level}`);

        // Get classes based on level (assuming class names start with level)
        const [classes] = await pool.query(
          `SELECT id, name, academic_year, semester
         FROM classes
         WHERE name LIKE ?
         ORDER BY name`,
          [`${level}-%`]
        );

        console.log(
          `[Classes By Level] Found ${classes.length} classes for level ${level}`
        );
        console.log(`[Classes By Level] Classes data:`, classes);

        res.json(classes);
      } catch (error) {
        console.error("Error fetching classes by level:", error);
        res.status(500).json({ error: "Failed to fetch classes" });
      }
    })
  );

  // POST / - Create new student
  router.post(
    "/",
    restrictTo(["guru_bk", "super_admin"]),
    asyncHandler(async (req, res) => {
      const { nisn, name, class_id, academic_year = "2025/2026" } = req.body;

      // Check if NISN already exists
      const [existingStudent] = await pool.query(
        "SELECT id FROM students WHERE nisn = ? AND is_deleted = 0",
        [nisn]
      );

      if (existingStudent.length > 0) {
        return res.status(400).json({ error: "NISN sudah terdaftar" });
      }

      // Create student
      const [result] = await pool.query(
        "INSERT INTO students (nisn, name, academic_year, is_active, is_deleted) VALUES (?, ?, ?, 1, 0)",
        [nisn, name, academic_year]
      );

      const studentId = result.insertId;

      await pool.query(
        "INSERT INTO student_academic_history (student_id, class_id, academic_year, is_current) VALUES (?, ?, ?, 1)",
        [studentId, class_id, academic_year]
      );

      res.status(201).json({
        id: studentId,
        nisn,
        name,
        academic_year,
        is_active: true,
      });
    })
  );

  // PUT /:id - Update student
  router.put(
    "/:id",
    restrictTo(["guru_bk", "super_admin"]),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const { nisn, name, class_id, academic_year } = req.body;

      // Check if student exists
      const [existingStudent] = await pool.query(
        "SELECT * FROM students WHERE id = ? AND is_deleted = 0",
        [id]
      );

      if (existingStudent.length === 0) {
        return res.status(404).json({ error: "Siswa tidak ditemukan" });
      }

      // Check NISN duplicate
      if (nisn !== existingStudent[0].nisn) {
        const [duplicateStudent] = await pool.query(
          "SELECT id FROM students WHERE nisn = ? AND id != ? AND is_deleted = 0",
          [nisn, id]
        );
        if (duplicateStudent.length > 0) {
          return res.status(400).json({ error: "NISN sudah terdaftar" });
        }
      }

      // Update student basic info
      await pool.query(
        "UPDATE students SET nisn = ?, name = ?, academic_year = ? WHERE id = ?",
        [nisn, name, academicYear || existingStudent[0].academic_year, id]
      );

      // Handle academic history
      if (class_id) {
        // Get current academic history
        const [currentHistory] = await pool.query(
          `SELECT class_id, academic_year FROM student_academic_history 
         WHERE student_id = ? AND is_current = 1`,
          [id]
        );

        if (currentHistory.length > 0) {
          const currentClassId = currentHistory[0].class_id;

          if (currentClassId != class_id) {
            // Deactivate current record
            await pool.query(
              "UPDATE student_academic_history SET is_current = 0 WHERE student_id = ? AND is_current = 1",
              [id]
            );

            // Insert new record
            await pool.query(
              "INSERT INTO student_academic_history (student_id, class_id, academic_year, is_current) VALUES (?, ?, ?, 1)",
              [id, class_id, academicYear || currentHistory[0].academic_year]
            );
          }
        } else {
          // No current history - create new
          await pool.query(
            "INSERT INTO student_academic_history (student_id, class_id, academic_year, is_current) VALUES (?, ?, ?, 1)",
            [id, class_id, academicYear || "2025/2026"]
          );
        }
      }

      res.json({
        id: parseInt(id),
        nisn,
        name,
        academic_year: academicYear || existingStudent[0].academic_year,
        is_active: existingStudent[0].is_active,
      });
    })
  );

  // DELETE /:id - Delete student
  router.delete(
    "/:id",
    restrictTo(["guru_bk", "super_admin"]),
    asyncHandler(async (req, res) => {
      const { id } = req.params;

      const [result] = await pool.query(
        "UPDATE students SET is_deleted = 1, is_active = 0 WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Siswa tidak ditemukan" });
      }

      res.json({ success: true, message: "Siswa berhasil dihapus" });
    })
  );

  // POST /:id/move-class - Move student to different class
  router.post(
    "/:id/move-class",
    restrictTo(["guru_bk", "super_admin"]),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const { classId } = req.body;

      // Check if student exists
      const [existingStudent] = await pool.query(
        "SELECT * FROM students WHERE id = ? AND is_deleted = 0",
        [id]
      );

      if (existingStudent.length === 0) {
        return res.status(404).json({ error: "Siswa tidak ditemukan" });
      }

      // Check if class exists
      const [targetClass] = await pool.query(
        "SELECT * FROM classes WHERE id = ?",
        [classId]
      );

      if (targetClass.length === 0) {
        return res.status(400).json({ error: "Kelas tujuan tidak ditemukan" });
      }

      // Check if already has history for this academic year
      const [existingHistory] = await pool.query(
        `SELECT * FROM student_academic_history 
       WHERE student_id = ? AND academic_year = ?`,
        [id, targetClass[0].academic_year]
      );

      if (existingHistory.length > 0) {
        // If already has history for this academic year
        if (existingHistory[0].class_id == classId) {
          return res.status(400).json({ error: "Siswa sudah di kelas ini" });
        }

        // Update existing history
        await pool.query(
          `UPDATE student_academic_history 
         SET class_id = ?, is_current = 1 
         WHERE student_id = ? AND academic_year = ?`,
          [classId, id, targetClass[0].academic_year]
        );

        // Deactivate other histories for this student
        await pool.query(
          `UPDATE student_academic_history 
         SET is_current = 0 
         WHERE student_id = ? AND academic_year != ?`,
          [id, targetClass[0].academic_year]
        );
      } else {
        // Deactivate all current histories
        await pool.query(
          "UPDATE student_academic_history SET is_current = 0 WHERE student_id = ?",
          [id]
        );

        // Insert new history
        await pool.query(
          "INSERT INTO student_academic_history (student_id, class_id, academic_year, is_current) VALUES (?, ?, ?, 1)",
          [id, classId, targetClass[0].academic_year]
        );
      }

      res.json({ success: true, message: "Siswa berhasil dipindahkan kelas" });
    })
  );

  // POST /import - Import students from Excel
  router.post(
    "/import",
    restrictTo(["guru_bk", "super_admin"]),
    upload.single("file"),
    asyncHandler(async (req, res) => {
      console.log("[Import Route] Import request received");
      console.log("[Import Route] File info:", req.file);

      if (!req.file) {
        console.log("[Import Route] No file uploaded");
        return res.status(400).json({
          success: false,
          error: "Tidak ada file yang diupload",
        });
      }

      try {
        console.log("[Import Route] Processing file:", req.file.path);
        const results = await importStudentService.processImportFile(
          req.file.path
        );

        console.log("[Import Route] Import completed successfully");
        console.log("[Import Route] Results:", results);

        res.json({
          success: true,
          results: results,
        });
      } catch (error) {
        console.error("[Import Route] Import failed:", error);
        res.status(500).json({
          success: false,
          error: error.message || "Terjadi kesalahan saat import data siswa",
        });
      }
    })
  );

  // === BULK MOVE CLASS ===
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

      // Validasi format tahun ajaran
      if (!academicYear.match(/^\d{4}\/\d{4}$/)) {
        return res
          .status(400)
          .json({ error: "Format tahun ajaran harus YYYY/YYYY" });
      }
      const [year1, year2] = academicYear.split("/");
      if (Number(year2) !== Number(year1) + 1) {
        return res.status(400).json({ error: "Tahun ajaran tidak valid" });
      }

      // Pastikan kelas asal dan tujuan ada
      const [fromClass] = await pool.query(
        "SELECT * FROM classes WHERE id = ?",
        [classIdFrom]
      );
      const [toClass] = await pool.query("SELECT * FROM classes WHERE id = ?", [
        classIdTo,
      ]);

      if (fromClass.length === 0 || toClass.length === 0) {
        return res.status(400).json({
          error: "Kelas asal atau tujuan tidak ditemukan",
        });
      }

      // Ambil siswa di kelas asal sesuai angkatan
      const [studentsToMove] = await pool.query(
        `SELECT s.id, s.nisn, s.name, s.angkatan 
       FROM students s 
       JOIN student_academic_history sah ON s.id = sah.student_id 
       WHERE sah.class_id = ? 
         AND sah.is_current = 1 
         AND s.is_active = 1
         AND s.angkatan = ?`,
        [classIdFrom, angkatan]
      );

      if (studentsToMove.length === 0) {
        return res.status(400).json({
          error: "Tidak ada siswa di kelas asal untuk angkatan ini",
        });
      }

      console.log("Moving students:", studentsToMove);
      console.log(
        "Student angkatan data:",
        studentsToMove.map((s) => ({
          id: s.id,
          name: s.name,
          angkatan: s.angkatan,
        }))
      );

      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        // Set semua siswa di kelas asal jadi tidak current lagi
        await connection.query(
          "UPDATE student_academic_history SET is_current = 0 WHERE class_id = ? AND is_current = 1",
          [classIdFrom]
        );

        // Untuk setiap siswa, periksa apakah sudah ada riwayat untuk tahun ajaran ini
        for (const student of studentsToMove) {
          // Cek apakah siswa sudah memiliki riwayat untuk tahun ajaran ini
          const [existingHistory] = await connection.query(
            `SELECT * FROM student_academic_history 
           WHERE student_id = ? AND academic_year = ?`,
            [student.id, academicYear]
          );

          if (existingHistory.length > 0) {
            // Jika sudah ada, update record yang ada
            await connection.query(
              `UPDATE student_academic_history 
             SET class_id = ?, is_current = 1, angkatan = ?
             WHERE student_id = ? AND academic_year = ?`,
              [classIdTo, student.angkatan, student.id, academicYear]
            );

            console.log(
              `Updated existing history for student ${student.id} in academic year ${academicYear}`
            );
          } else {
            // Jika belum ada, insert record baru
            await connection.query(
              `INSERT INTO student_academic_history 
             (student_id, class_id, academic_year, is_current, angkatan) 
             VALUES (?, ?, ?, 1, ?)`,
              [student.id, classIdTo, academicYear, student.angkatan]
            );

            console.log(
              `Created new history for student ${student.id} in academic year ${academicYear}`
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
    })
  );

  // === GRADUATE ===
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

      // Validasi format tahun ajaran
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
        [classIdFrom]
      );
      if (fromClass.length === 0) {
        return res.status(400).json({ error: "Kelas asal tidak ditemukan" });
      }

      // Hanya ambil siswa dari angkatan yang dipilih
      const [students] = await pool.query(
        `SELECT s.id, s.nisn, s.name, s.angkatan
       FROM students s 
       JOIN student_academic_history sah ON s.id = sah.student_id 
       WHERE sah.class_id = ? 
         AND sah.is_current = 1 
         AND s.is_active = 1
         AND s.angkatan = ?`,
        [classIdFrom, angkatan]
      );

      if (students.length === 0) {
        return res
          .status(400)
          .json({ error: "Tidak ada siswa di kelas asal untuk angkatan ini" });
      }

      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        // Set semua siswa di kelas asal jadi tidak current lagi
        await connection.query(
          "UPDATE student_academic_history SET is_current = 0 WHERE class_id = ? AND is_current = 1",
          [classIdFrom]
        );

        // Update status siswa menjadi tidak aktif
        await connection.query(
          `UPDATE students SET is_active = 0 WHERE id IN (?)`,
          [students.map((s) => s.id)]
        );

        // Insert data ke tabel alumni
        const alumniValues = students.map((student) => [
          student.id,
          student.nisn,
          student.name,
          academicYear.split("/")[0], // Tahun kelulusan
          classIdFrom,
          fromClass[0].name,
          academicYear,
        ]);

        // Cek apakah siswa sudah ada di tabel alumni
        for (const student of students) {
          const [existingAlumni] = await connection.query(
            "SELECT * FROM alumni WHERE student_id = ?",
            [student.id]
          );

          if (existingAlumni.length === 0) {
            // Hanya insert jika belum ada di tabel alumni
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
              ]
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
    })
  );

  router.get(
    "/angkatans",
    asyncHandler(async (req, res) => {
      console.log("[Angkatans Route] Fetching angkatans...");
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
        ORDER BY s.angkatan DESC`
        );
        console.log("[Angkatans Route] Found angkatans:", angkatans);
        res.json(angkatans);
      } catch (error) {
        console.error("[Angkatans Route] Error:", error);
        res.status(500).json({ error: "Failed to fetch angkatans" });
      }
    })
  );

  // Error handler middleware
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
