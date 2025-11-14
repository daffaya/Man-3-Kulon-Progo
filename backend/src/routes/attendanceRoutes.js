// src/routes/attendanceRoutes.js
import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  authenticateTokenFactory,
  restrictTo,
} from "../middleware/authMiddleware.js";
import attendanceControllerFactory from "../controllers/attendanceController.js";
import { exportToExcel, exportToPDF } from "../services/exportService.js";

// Helper untuk mendapatkan __dirname di ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper functions untuk validasi input
const validateRequiredParams = (params, requiredParams) => {
  const missingParams = requiredParams.filter((param) => !params[param]);
  if (missingParams.length > 0) {
    throw new Error(`Parameter ${missingParams.join(", ")} wajib diisi`);
  }
};

const validateEnumValue = (value, validValues, paramName) => {
  if (!validValues.includes(value)) {
    throw new Error(
      `${paramName} tidak valid. Gunakan: ${validValues.join(", ")}`
    );
  }
};

// Error handler middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const attendanceRouterFactory = ({ pool, JWT_SECRET }) => {
  const router = Router();
  const authenticateToken = authenticateTokenFactory({ JWT_SECRET });
  const attendanceController = attendanceControllerFactory({ pool });

  router.use(authenticateToken);

  // POST / - Save attendance data
  router.post(
    "/",
    restrictTo(["guru_bk", "super_admin"]),
    attendanceController.saveAttendance
  );

  // GET / - Get attendance data
  router.get("/", attendanceController.getAttendanceByDateAndClass);

  // GET /students - Get students by class
  router.get("/students", attendanceController.getStudentsByClass);

  // GET /recap - Get attendance recap
  router.get("/recap", attendanceController.getAttendanceRecap);

  // GET /check-existing - Check existing attendance for date
  router.get(
    "/check-existing",
    asyncHandler(async (req, res) => {
      const { classId, date } = req.query;

      validateRequiredParams({ classId, date }, ["classId", "date"]);

      const [existing] = await pool.query(
        `
      SELECT a.student_id, a.status, a.notes
      FROM attendances a
      JOIN student_academic_history sah ON a.student_id = sah.student_id AND sah.is_current = 1
      WHERE a.date = ? AND sah.class_id = ?
    `,
        [date, classId]
      );

      res.json({ existing });
    })
  );

  // GET /verify - Verify attendance data after save
  router.get(
    "/verify",
    asyncHandler(async (req, res) => {
      const { classId, date } = req.query;

      validateRequiredParams({ classId, date }, ["classId", "date"]);

      const [attendance] = await pool.query(
        `
      SELECT 
        s.id,
        s.nisn,
        s.name,
        a.status,
        a.notes
      FROM students s
      JOIN student_academic_history sah ON s.id = sah.student_id AND sah.is_current = 1
      LEFT JOIN attendances a ON s.id = a.student_id AND a.date = ?
      WHERE sah.class_id = ? AND s.is_active = TRUE
      ORDER BY s.name
    `,
        [date, classId]
      );

      res.json({
        count: attendance.length,
        data: attendance,
      });
    })
  );

  // GET /classes - Get classes list
  router.get(
    "/classes",
    asyncHandler(async (req, res) => {
      const [classes] = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.academic_year,
        c.semester,
        COUNT(sah.student_id) as total_siswa
      FROM classes c
      LEFT JOIN student_academic_history sah ON c.id = sah.class_id AND sah.is_current = 1
      LEFT JOIN students s ON sah.student_id = s.id AND s.is_active = TRUE
      GROUP BY c.id
      ORDER BY c.academic_year DESC, c.name
    `);

      res.json(classes);
    })
  );

  // GET /student/:studentId - Get student attendance details
  router.get(
    "/student/:studentId",
    asyncHandler(async (req, res) => {
      const { studentId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: "Parameter startDate dan endDate wajib diisi",
        });
      }

      const [attendances] = await pool.query(
        `
      SELECT 
        date,
        status,
        notes,
        recorded_at
      FROM attendances
      WHERE student_id = ? 
        AND date BETWEEN ? AND ?
      ORDER BY date DESC
    `,
        [studentId, startDate, endDate]
      );

      res.json(attendances);
    })
  );

  // GET /today-stats - Get today's attendance statistics
  router.get(
    "/today-stats",
    asyncHandler(async (req, res) => {
      const { date } = req.query;

      validateRequiredParams({ date }, ["date"]);

      // Check if it's a holiday
      const [holidayCheck] = await pool.query(
        "SELECT COUNT(*) as count FROM school_holidays WHERE date = ?",
        [date]
      );

      if (holidayCheck[0].count > 0) {
        return res.json({
          totalHadir: 0,
          totalIzin: 0,
          totalSakit: 0,
          totalAlpa: 0,
          totalLibur: 1,
        });
      }

      // Get attendance stats
      const [stats] = await pool.query(
        `
      SELECT 
        status,
        COUNT(*) as count
      FROM attendances
      WHERE date = ?
      GROUP BY status
    `,
        [date]
      );

      const result = {
        totalHadir: 0,
        totalIzin: 0,
        totalSakit: 0,
        totalAlpa: 0,
        totalLibur: 0,
      };

      stats.forEach((stat) => {
        if (
          result.hasOwnProperty(
            `total${stat.status.charAt(0).toUpperCase() + stat.status.slice(1)}`
          )
        ) {
          result[
            `total${stat.status.charAt(0).toUpperCase() + stat.status.slice(1)}`
          ] = stat.count;
        }
      });

      res.json(result);
    })
  );

  // POST /holidays - Add holiday
  router.post(
    "/holidays",
    restrictTo(["guru_bk", "super_admin"]),
    asyncHandler(async (req, res) => {
      const { date, description, academicYear } = req.body;

      validateRequiredParams({ date, description, academicYear }, [
        "date",
        "description",
        "academicYear",
      ]);

      // Cek apakah tanggal sudah ada
      const [existingHoliday] = await pool.query(
        "SELECT id FROM school_holidays WHERE date = ?",
        [date]
      );

      if (existingHoliday.length > 0) {
        return res.status(400).json({ error: "Tanggal libur sudah ada" });
      }

      // Insert hari libur
      await pool.query(
        "INSERT INTO school_holidays (date, description, academic_year) VALUES (?, ?, ?)",
        [date, description, academicYear]
      );

      res.json({ success: true, message: "Hari libur berhasil ditambahkan" });
    })
  );

  // GET /holidays - Get holidays list
  router.get(
    "/holidays",
    asyncHandler(async (req, res) => {
      const { academicYear } = req.query;

      let query = "SELECT * FROM school_holidays";
      let params = [];

      if (academicYear) {
        query += " WHERE academic_year = ?";
        params.push(academicYear);
      }

      query += " ORDER BY date";

      const [holidays] = await pool.query(query, params);
      res.json(holidays);
    })
  );

  // DELETE /holidays/:id - Delete holiday
  router.delete(
    "/holidays/:id",
    restrictTo(["guru_bk", "super_admin"]),
    asyncHandler(async (req, res) => {
      const { id } = req.params;

      const [result] = await pool.query(
        "DELETE FROM school_holidays WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Hari libur tidak ditemukan" });
      }

      res.json({ success: true, message: "Hari libur berhasil dihapus" });
    })
  );

  // GET /export - Export attendance data
  router.get(
    "/export",
    restrictTo(["guru_bk", "super_admin"]),
    asyncHandler(async (req, res) => {
      const { classId, period, startDate, endDate, format } = req.query;

      validateRequiredParams({ classId, period, format }, [
        "classId",
        "period",
        "format",
      ]);
      validateEnumValue(format, ["excel", "pdf"], "Format");

      // Get recap data using helper function
      const recap = await attendanceController.getAttendanceRecap({
        query: { classId, period, startDate, endDate },
      });

      // Get class info
      const [classInfo] = await pool.query(
        "SELECT name, academic_year, semester FROM classes WHERE id = ?",
        [classId]
      );

      const className = classInfo[0]?.name || "";
      const academicYear = classInfo[0]?.academic_year || "";
      const semester = classInfo[0]?.semester || "";

      // Generate file based on format
      let result;
      if (format === "excel") {
        result = await exportToExcel(recap.data, {
          classId,
          period,
          className,
          academicYear,
          semester,
          startDate,
          endDate,
        });
      } else if (format === "pdf") {
        result = await exportToPDF(recap.data, {
          classId,
          period,
          className,
          academicYear,
          semester,
          startDate,
          endDate,
        });
      }

      // Ensure temp directory exists
      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Set response headers
      res.setHeader("Content-Type", result.mimetype);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.filename}"`
      );

      // Send file
      res.sendFile(result.filepath, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).json({ error: "Gagal mengirim file" });
        } else {
          // Delete the file after sending
          fs.unlink(result.filepath, (unlinkErr) => {
            if (unlinkErr) console.error("Error deleting file:", unlinkErr);
          });
        }
      });
    })
  );

  // Error handling middleware
  router.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
      error: err.message || "Terjadi kesalahan pada server",
    });
  });

  return router;
};

export default attendanceRouterFactory;
