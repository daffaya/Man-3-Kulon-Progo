/**
 * @fileoverview Router for student endpoints: listing, CRUD, transfer,
 * leaving school, and the two-step Excel import (preview -> commit).
 *
 * Class membership is read from `student_enrollments` (open enrollment =
 * current class). `student_academic_history` is only written by the lifecycle
 * services as a legacy mirror and is never read here.
 *
 * Replaced by the year-transition wizard (POST /api/year-transition):
 *  - POST /bulk-move-class and POST /graduate (respond 410 Gone)
 *  - POST /import (single-step import; replaced by /import/preview + /import/commit)
 */

import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { authenticateTokenFactory, restrictTo } from "../middleware/authMiddleware.js";
import importStudentServiceFactory from "../services/importStudentService.js";
import studentLifecycleServiceFactory, { clampToYear, closeLegacyHistory } from "../services/studentLifecycleService.js";
import academicYearServiceFactory from "../services/academicYearService.js";
import { HttpError } from "../utils/errorResponse.js";
import { todayStr } from "../utils/dateUtils.js";

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
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}${ext}`); // never re-use originalname itself (AUDIT-001)
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /xlsx|xls/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

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

const MANAGE_ROLES = ["guru_bk", "super_admin"];
const GONE_MESSAGE =
  "Fitur ini telah digantikan oleh Wizard Tahun Ajaran Baru (menu Tahun Ajaran). Gunakan wizard untuk menaikkan kelas dan meluluskan siswa.";

/**
 * @param {object} options
 * @param {import('mysql2/promise').Pool} options.pool
 * @param {string} options.JWT_SECRET
 * @param {() => Date} [options.now] - Injectable clock (tests).
 */
const studentRouterFactory = ({ pool, JWT_SECRET, now = () => new Date() }) => {
  const router = Router();
  const authenticateToken = authenticateTokenFactory({ JWT_SECRET });

  const lifecycle = studentLifecycleServiceFactory({ pool, now });
  const yearService = academicYearServiceFactory({ pool, now });
  const importService = importStudentServiceFactory({ pool, now });

  router.get("/template", (req, res) => {
    const filePath = path.join(__dirname, "../../template/template-import-siswa.xlsx");

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Template tidak ditemukan" });
    }

    res.download(filePath, "template-import-siswa.xlsx");
  });

  router.use(authenticateToken);

  const angkatanList = async () => {
    const [rows] = await pool.query(
      `SELECT CAST(s.angkatan AS CHAR) AS angkatan, COUNT(*) AS count
         FROM students s
        WHERE s.is_deleted = 0 AND s.is_active = 1
          AND s.angkatan IS NOT NULL AND s.angkatan != ''
        GROUP BY s.angkatan
        ORDER BY s.angkatan DESC`,
    );
    return rows;
  };

  const classesOfYear = async ({ academicYear, level } = {}) => {
    let label = academicYear;
    if (!label) {
      const { year } = await yearService.resolveForDate(todayStr(now()));
      label = year ? year.label : null;
    }
    if (!label) return [];
    const params = [label];
    let sql = `SELECT id, name, grade_level, academic_year, semester
                 FROM classes WHERE academic_year = ?`;
    if (level) {
      sql += " AND name LIKE ?";
      params.push(`${level}-%`);
    }
    sql += " ORDER BY grade_level, name";
    const [rows] = await pool.query(sql, params);
    return rows;
  };

  // ---- static GET routes first (they used to be shadowed by "/:id") ----------

  router.get(
    "/angkatans",
    asyncHandler(async (req, res) => {
      res.json(await angkatanList());
    }),
  );

  /** Classes of one academic year (default: the current year), optional ?academicYear=. */
  router.get(
    "/classes",
    asyncHandler(async (req, res) => {
      res.json(await classesOfYear({ academicYear: req.query.academicYear }));
    }),
  );

  router.get(
    "/classes-by-level",
    asyncHandler(async (req, res) => {
      const { level, academicYear } = req.query;
      if (!level) {
        return res.status(400).json({ error: "Level is required" });
      }
      res.json(await classesOfYear({ academicYear, level }));
    }),
  );

  router.get(
    "/nisn/:nisn",
    asyncHandler(async (req, res) => {
      const [students] = await pool.query("SELECT * FROM students WHERE nisn = ?", [
        req.params.nisn,
      ]);
      if (students.length === 0) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json(students[0]);
    }),
  );

  /**
   * GET /students — paginated list of ACTIVE students with their current
   * (open-enrollment) class. Special modes: getAngkatans, getClassesByAngkatan,
   * getClassesByLevel.
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
        return res.json(await angkatanList());
      }

      if (getClassesByAngkatan) {
        const [angkatanCheck] = await pool.query(
          "SELECT 1 FROM students WHERE angkatan = ? AND is_deleted = 0 LIMIT 1",
          [angkatan],
        );
        if (angkatanCheck.length === 0) {
          return res.status(404).json({ error: "Angkatan tidak ditemukan" });
        }

        const [classes] = await pool.query(
          `SELECT DISTINCT c.id, c.name, c.academic_year, c.semester
             FROM classes c
             JOIN student_enrollments e ON e.class_id = c.id AND e.end_date IS NULL
             JOIN students s ON s.id = e.student_id
            WHERE s.angkatan = ? AND s.is_deleted = 0 AND s.is_active = 1
            ORDER BY c.name`,
          [angkatan],
        );
        return res.json(classes);
      }

      if (getClassesByLevel) {
        return res.json(await classesOfYear({ academicYear, level: getClassesByLevel }));
      }

      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.min(200, Math.max(1, parseInt(limit) || 30));
      const offset = (pageNum - 1) * limitNum;

      const from = `
          FROM students s
          LEFT JOIN student_enrollments e ON e.student_id = s.id AND e.end_date IS NULL
          LEFT JOIN classes c ON c.id = e.class_id
          WHERE s.is_deleted = 0 AND s.is_active = 1`;
      let where = "";
      const params = [];

      if (classId) {
        where += " AND e.class_id = ?";
        params.push(classId);
      }
      if (search) {
        where += " AND (s.nisn LIKE ? OR s.name LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
      }
      if (academicYear) {
        where += " AND c.academic_year = ?";
        params.push(academicYear);
      }
      if (angkatan) {
        where += " AND s.angkatan = ?";
        params.push(angkatan);
      }

      const [countResult] = await pool.query(`SELECT COUNT(*) AS total ${from}${where}`, params);
      const totalItems = countResult[0].total;

      const [students] = await pool.query(
        `SELECT s.id, s.nisn, s.name,
                COALESCE(c.academic_year, s.academic_year) AS academic_year,
                s.is_active, s.is_deleted, s.angkatan,
                c.name AS class_name, c.id AS class_id
           ${from}${where}
          ORDER BY c.name, s.name LIMIT ? OFFSET ?`,
        [...params, limitNum, offset],
      );

      res.json({
        data: students,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalItems / limitNum),
          totalItems,
          itemsPerPage: limitNum,
        },
      });
    }),
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const [student] = await pool.query(
        `SELECT s.*, c.name AS class_name, c.id AS class_id,
                COALESCE(c.academic_year, s.academic_year) AS academic_year
           FROM students s
           LEFT JOIN student_enrollments e ON e.student_id = s.id AND e.end_date IS NULL
           LEFT JOIN classes c ON c.id = e.class_id
          WHERE s.id = ? AND s.is_deleted = 0`,
        [req.params.id],
      );

      if (student.length === 0) {
        return res.status(404).json({ error: "Siswa tidak ditemukan" });
      }
      res.json(student[0]);
    }),
  );

  // ---- write routes ----------------------------------------------------------

  /** POST /students — new student + first enrollment (class_id required). */
  router.post(
    "/",
    restrictTo(MANAGE_ROLES),
    asyncHandler(async (req, res) => {
      const { nisn, name, class_id } = req.body || {};
      if (!nisn || !String(nisn).trim() || !name || !String(name).trim() || !class_id) {
        throw new HttpError(400, "NISN, nama, dan kelas wajib diisi");
      }
      const created = await lifecycle.createStudent({
        ...req.body,
        nisn: String(nisn).trim(),
        name: String(name).trim(),
      });
      res.status(201).json({
        id: created.id,
        nisn: String(nisn).trim(),
        name: String(name).trim(),
        jenis_kelamin: req.body.jenis_kelamin,
        academic_year: created.academic_year,
        is_active: true,
        nik: req.body.nik,
        birth_place: req.body.birth_place,
        birth_date: req.body.birth_date,
        address: req.body.address,
        phone: req.body.phone,
        parent_name: req.body.parent_name,
        angkatan: created.angkatan,
      });
    }),
  );

  /**
   * PUT /students/:id — profile fields. A changed `class_id` is executed as a
   * transfer effective today (same grade level and academic year only).
   */
  router.put(
    "/:id",
    restrictTo(MANAGE_ROLES),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const {
        nisn,
        name,
        jenis_kelamin,
        class_id,
        nik,
        birth_place,
        birth_date,
        address,
        phone,
        parent_name,
        angkatan,
      } = req.body || {};

      const [existing] = await pool.query(
        "SELECT * FROM students WHERE id = ? AND is_deleted = 0",
        [id],
      );
      if (existing.length === 0) {
        return res.status(404).json({ error: "Siswa tidak ditemukan" });
      }
      if (!nisn || !name) {
        return res.status(400).json({ error: "NISN dan nama wajib diisi" });
      }

      if (nisn !== existing[0].nisn) {
        const [duplicate] = await pool.query(
          "SELECT id FROM students WHERE nisn = ? AND id != ?",
          [nisn, id],
        );
        if (duplicate.length > 0) {
          return res.status(409).json({ error: "NISN sudah terdaftar" });
        }
      }

      await pool.query(
        `UPDATE students SET
           nisn = ?, name = ?, jenis_kelamin = ?, nik = ?, birth_place = ?,
           birth_date = ?, address = ?, phone = ?, parent_name = ?, angkatan = ?
         WHERE id = ?`,
        [
          nisn,
          name,
          jenis_kelamin || null,
          nik || null,
          birth_place || null,
          birth_date || null,
          address || null,
          phone || null,
          parent_name || null,
          angkatan || existing[0].angkatan,
          id,
        ],
      );

      if (class_id) {
        const [open] = await pool.query(
          "SELECT class_id FROM student_enrollments WHERE student_id = ? AND end_date IS NULL",
          [id],
        );
        if (!open[0] || Number(open[0].class_id) !== Number(class_id)) {
          const target = await lifecycle.getClass(Number(class_id));
          if (!target) throw new HttpError(422, "Kelas tujuan tidak ditemukan");
          const year = await yearService.getById(target.academic_year_id);
          await lifecycle.transferStudent(Number(id), {
            to_class_id: target.id,
            effective_date: clampToYear(todayStr(now()), year),
          });
        }
      }

      res.json({
        id: parseInt(id),
        nisn,
        name,
        jenis_kelamin,
        is_active: existing[0].is_active,
        nik,
        birth_place,
        birth_date,
        address,
        phone,
        parent_name,
        angkatan: angkatan || existing[0].angkatan,
      });
    }),
  );

  /** DELETE /students/:id — soft delete. Attendance history is kept. */
  router.delete(
    "/:id",
    restrictTo(MANAGE_ROLES),
    asyncHandler(async (req, res) => {
      const { id } = req.params;

      const [result] = await pool.query(
        "UPDATE students SET is_deleted = 1, is_active = 0 WHERE id = ?",
        [id],
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Siswa tidak ditemukan" });
      }
      await closeLegacyHistory(pool, id);

      res.json({ success: true, message: "Siswa berhasil dihapus" });
    }),
  );

  /** POST /students/:id/transfer { to_class_id, effective_date } */
  router.post(
    "/:id/transfer",
    restrictTo(MANAGE_ROLES),
    asyncHandler(async (req, res) => {
      const { to_class_id, effective_date } = req.body || {};
      if (!to_class_id || !effective_date) {
        throw new HttpError(400, "Kelas tujuan dan tanggal efektif wajib diisi");
      }
      res.json(await lifecycle.transferStudent(Number(req.params.id), { to_class_id, effective_date }));
    }),
  );

  /** POST /students/:id/move-class { classId } — legacy body, executes a transfer effective today. */
  router.post(
    "/:id/move-class",
    restrictTo(MANAGE_ROLES),
    asyncHandler(async (req, res) => {
      const { classId } = req.body || {};
      if (!classId) throw new HttpError(400, "Kelas tujuan wajib diisi");
      const target = await lifecycle.getClass(Number(classId));
      if (!target) throw new HttpError(400, "Kelas tujuan tidak ditemukan");
      const year = await yearService.getById(target.academic_year_id);
      await lifecycle.transferStudent(Number(req.params.id), {
        to_class_id: target.id,
        effective_date: clampToYear(todayStr(now()), year),
      });
      res.json({ success: true, message: "Siswa berhasil dipindahkan kelas" });
    }),
  );

  /** POST /students/:id/leave { effective_date, reason } — super_admin only. */
  router.post(
    "/:id/leave",
    restrictTo([]),
    asyncHandler(async (req, res) => {
      res.json(await lifecycle.leaveSchool(Number(req.params.id), req.body || {}));
    }),
  );

  // ---- import: preview -> commit (super_admin) -------------------------------

  router.post(
    "/import/preview",
    restrictTo([]),
    upload.single("file"),
    asyncHandler(async (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: "Tidak ada file yang diupload" });
      }
      const academicYearId = Number(req.body?.academic_year_id);
      if (!Number.isInteger(academicYearId) || academicYearId <= 0) {
        fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "Tahun ajaran tujuan wajib dipilih" });
      }
      res.json(
        await importService.previewImport({
          filePath: req.file.path,
          academicYearId,
          userId: req.user.id,
        }),
      );
    }),
  );

  router.post(
    "/import/commit",
    restrictTo([]),
    asyncHandler(async (req, res) => {
      const { batch_id, actions } = req.body || {};
      if (!batch_id) throw new HttpError(400, "batch_id wajib diisi");
      res.json(await importService.commitImport({ batchId: batch_id, actions }));
    }),
  );

  // ---- replaced endpoints ------------------------------------------------------

  router.post("/import", (req, res) =>
    res.status(410).json({ error: "Gunakan pratinjau import (/students/import/preview)" }),
  );
  router.post("/bulk-move-class", (req, res) => res.status(410).json({ error: GONE_MESSAGE }));
  router.post("/graduate", (req, res) => res.status(410).json({ error: GONE_MESSAGE }));

  router.use((err, req, res, next) => {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Ukuran file terlalu besar. Maksimal 5MB" });
    }
    if (err.message === "Hanya file Excel yang diizinkan (.xlsx, .xls)") {
      return res.status(400).json({ error: err.message });
    }
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error("[Students Route Error]", err);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  });

  return router;
};

export default studentRouterFactory;
