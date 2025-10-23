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
import studentControllerFactory from "../controllers/studentController.js";

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

  // Initialize dependencies
  const studentModel = studentModelFactory({ pool });
  const importStudentService = importStudentServiceFactory({ studentModel });
  const studentController = studentControllerFactory({
    pool,
    importStudentService,
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

  // GET / - Get all students (perbaikan path dari /students menjadi /)
  router.get(
    "/",
    asyncHandler(async (req, res) => {
      console.log("[Students Route] Fetching students with query:", req.query);

      const { classId, search, academicYear } = req.query;

      let query = `
    SELECT 
      s.id,
      s.nisn,
      s.name,
      s.academic_year,
      s.is_active,
      s.is_deleted,
      c.name as class_name,
      c.id as class_id
    FROM students s
    LEFT JOIN student_academic_history sah ON s.id = sah.student_id AND sah.is_current = 1
    LEFT JOIN classes c ON sah.class_id = c.id
    WHERE s.is_deleted = 0
  `;

      const queryParams = [];

      if (classId) {
        query += " AND sah.class_id = ?";
        queryParams.push(classId);
      }

      if (search) {
        query += " AND (s.nisn LIKE ? OR s.name LIKE ?)";
        queryParams.push(`%${search}%`, `%${search}%`);
      }

      if (academicYear) {
        query += " AND s.academic_year = ?";
        queryParams.push(academicYear);
      }

      query += " ORDER BY c.name, s.name";

      console.log("[Students Route] Executing query:", query);
      console.log("[Students Route] With params:", queryParams);

      const [students] = await pool.query(query, queryParams);
      console.log("[Students Route] Found", students.length, "students");

      res.json(students);
    })
  );

  // POST / - Create new student (perbaikan path dari /students menjadi /)
  router.post(
    "/",
    restrictTo(["guru_bk", "super_admin"]),
    asyncHandler(async (req, res) => {
      const { nisn, name, class_id, academic_year } = req.body;

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

      // Add to academic history
      await pool.query(
        "INSERT INTO student_academic_history (student_id, class_id, academic_year, is_current) VALUES (?, ?, ?, 1)",
        [studentId, class_id, academicYear]
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

  // PUT /:id - Update student (perbaikan path dari /students/:id menjadi /:id)
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

      // Check if NISN already exists for different student
      if (nisn !== existingStudent[0].nisn) {
        const [duplicateStudent] = await pool.query(
          "SELECT id FROM students WHERE nisn = ? AND id != ? AND is_deleted = 0",
          [nisn, id]
        );

        if (duplicateStudent.length > 0) {
          return res.status(400).json({ error: "NISN sudah terdaftar" });
        }
      }

      // Update student
      await pool.query("UPDATE students SET nisn = ?, name = ? WHERE id = ?", [
        nisn,
        name,
        id,
      ]);

      // Update academic history if class changed
      if (class_id && class_id !== existingStudent[0].class_id) {
        await pool.query(
          "UPDATE student_academic_history SET is_current = 0 WHERE student_id = ?",
          [id]
        );

        await pool.query(
          "INSERT INTO student_academic_history (student_id, class_id, academic_year, is_current) VALUES (?, ?, ?, 1)",
          [id, class_id, academic_year || existingStudent[0].academic_year]
        );
      }

      res.json({
        id: parseInt(id),
        nisn,
        name,
        academic_year: academic_year || existingStudent[0].academic_year,
        is_active: existingStudent[0].is_active,
      });
    })
  );

  // DELETE /:id - Delete student (perbaikan path dari /students/:id menjadi /:id)
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

  // POST /:id/move-class - Move student to different class (perbaikan path dari /students/:id/move-class menjadi /:id/move-class)
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

      // Update academic history
      await pool.query(
        "UPDATE student_academic_history SET is_current = 0 WHERE student_id = ?",
        [id]
      );

      await pool.query(
        "INSERT INTO student_academic_history (student_id, class_id, academic_year, is_current) VALUES (?, ?, ?, 1)",
        [id, classId, targetClass[0].academic_year]
      );

      res.json({ success: true, message: "Siswa berhasil dipindahkan kelas" });
    })
  );

  // POST /import - Import students from Excel (perbaikan path tetap /import karena sudah benar)
  // src/routes/studentRoutes.js
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

        // Response dengan struktur yang benar
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
