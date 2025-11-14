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
import attendanceModelFactory from "../models/attendanceModel.js";
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
  const attendanceModel = attendanceModelFactory({ pool });

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

      const existing = await attendanceModel.checkExistingAttendance(
        date,
        classId
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

      const attendance = await attendanceModel.getAttendanceByDate(date);

      // Filter by class
      const filteredAttendance = attendance.filter(
        (att) => att.class_id === parseInt(classId)
      );

      res.json({
        count: filteredAttendance.length,
        data: filteredAttendance,
      });
    })
  );

  // GET /classes - Get classes list
  router.get(
    "/classes",
    asyncHandler(async (req, res) => {
      const classes = await attendanceModel.getClasses();
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

      const attendances =
        await attendanceModel.getAttendanceByStudentAndDateRange(
          studentId,
          startDate,
          endDate
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

      const stats = await attendanceModel.getTodayAttendanceStats(date);
      res.json(stats);
    })
  );

  // GET /stats - Get attendance statistics for date range
  router.get(
    "/stats",
    asyncHandler(async (req, res) => {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: "Parameter startDate dan endDate wajib diisi",
        });
      }

      const stats = await attendanceModel.getAttendanceStats(
        startDate,
        endDate
      );
      res.json(stats);
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
      const existingHoliday = await attendanceModel.getHolidayByDate(date);

      if (existingHoliday) {
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

      const holidays = await attendanceModel.getHolidays(academicYear);
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

      // Get recap data directly from model
      const recap = await attendanceModel.getAttendanceRecap(
        classId,
        period,
        startDate,
        endDate
      );

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
        result = await exportToExcel(recap, {
          classId,
          period,
          className,
          academicYear,
          semester,
          startDate,
          endDate,
        });
      } else if (format === "pdf") {
        result = await exportToPDF(recap, {
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

  // POST /archive - Archive attendance data
  router.post(
    "/archive",
    restrictTo(["guru_bk", "super_admin"]),
    asyncHandler(async (req, res) => {
      const { academicYear, semester } = req.body;

      validateRequiredParams({ academicYear, semester }, [
        "academicYear",
        "semester",
      ]);

      const result = await attendanceModel.archiveAttendanceData(
        academicYear,
        semester
      );

      res.json(result);
    })
  );

  // GET /archive - Get archived attendance data
  router.get(
    "/archive",
    asyncHandler(async (req, res) => {
      const { academicYear, semester, classId } = req.query;

      const archivedData = await attendanceModel.getArchivedAttendanceData(
        academicYear,
        semester,
        classId
      );

      res.json(archivedData);
    })
  );

  // GET /archive/export - Export archived attendance data
  router.get(
    "/archive/export",
    restrictTo(["guru_bk", "super_admin"]),
    asyncHandler(async (req, res) => {
      const { academicYear, semester, classId, format } = req.query;

      validateRequiredParams({ academicYear, semester, format }, [
        "academicYear",
        "semester",
        "format",
      ]);
      validateEnumValue(format, ["excel", "pdf"], "Format");

      const archivedData = await attendanceModel.getArchivedAttendanceData(
        academicYear,
        semester,
        classId
      );

      // Get class info if classId is provided
      let className = "";
      if (classId) {
        const [classInfo] = await pool.query(
          "SELECT name FROM classes WHERE id = ?",
          [classId]
        );
        className = classInfo[0]?.name || "";
      }

      // Generate file based on format
      let result;
      if (format === "excel") {
        result = await exportToExcel(archivedData, {
          classId,
          period: "archive",
          className,
          academicYear,
          semester,
        });
      } else if (format === "pdf") {
        result = await exportToPDF(archivedData, {
          classId,
          period: "archive",
          className,
          academicYear,
          semester,
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
