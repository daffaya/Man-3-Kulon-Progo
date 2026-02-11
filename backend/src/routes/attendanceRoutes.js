/**
 * @fileoverview Router for managing attendance-related endpoints.
 * This module defines and configures an Express router for attendance operations,
 * including recording attendance, generating reports, managing holidays, and archiving data.
 */

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Validates that all required parameters are present in the provided params object.
 * @param {object} params - The parameters to validate.
 * @param {string[]} requiredParams - Array of required parameter names.
 * @throws {Error} If any required parameter is missing.
 */
const validateRequiredParams = (params, requiredParams) => {
  const missingParams = requiredParams.filter((param) => !params[param]);
  if (missingParams.length > 0) {
    throw new Error(`Parameter ${missingParams.join(", ")} wajib diisi`);
  }
};

/**
 * Validates that a value is one of the allowed enum values.
 * @param {string} value - The value to validate.
 * @param {string[]} validValues - Array of valid values.
 * @param {string} paramName - The name of the parameter being validated.
 * @throws {Error} If the value is not in the validValues array.
 */
const validateEnumValue = (value, validValues, paramName) => {
  if (!validValues.includes(value)) {
    throw new Error(
      `${paramName} tidak valid. Gunakan: ${validValues.join(", ")}`,
    );
  }
};

/**
 * Error handler middleware for async route handlers.
 * @param {Function} fn - The async route handler function.
 * @returns {Function} Middleware function that catches errors and forwards them to the error handler.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Factory function that creates and configures the attendance router.
 * This router handles all attendance-related endpoints including recording attendance,
 * generating reports, managing holidays, and archiving data.
 *
 * @param {object} options - The options object.
 * @param {import('mysql2/promise').Pool} options.pool - MySQL connection pool.
 * @param {string} options.JWT_SECRET - Secret key for JWT authentication.
 * @returns {import('express').Router} Configured Express router for attendance endpoints.
 */
const attendanceRouterFactory = ({ pool, JWT_SECRET }) => {
  const router = Router();
  const authenticateToken = authenticateTokenFactory({ JWT_SECRET });
  const attendanceController = attendanceControllerFactory({ pool });
  const attendanceModel = attendanceModelFactory({ pool });

  router.use(authenticateToken);

  /**
   * @route   POST /
   * @desc    Save attendance records for a specific class and date.
   * @access  Private (guru_bk, super_admin)
   */
  router.post(
    "/",
    restrictTo(["guru_bk", "super_admin"]),
    attendanceController.saveAttendance,
  );

  /**
   * @route   GET /
   * @desc    Get attendance records filtered by date and class.
   * @access  Private
   */
  router.get("/", attendanceController.getAttendanceByDateAndClass);

  /**
   * @route   GET /students
   * @desc    Get a list of students filtered by class.
   * @access  Private
   */
  router.get("/students", attendanceController.getStudentsByClass);

  /**
   * @route   GET /recap
   * @desc    Get a recap of attendance records.
   * @access  Private
   */
  router.get("/recap", attendanceController.getAttendanceRecap);

  /**
   * @route   GET /check-existing
   * @desc    Check if attendance data already exists for a given class and date.
   * @access  Private
   */
  router.get(
    "/check-existing",
    asyncHandler(async (req, res) => {
      const { classId, date } = req.query;

      validateRequiredParams({ classId, date }, ["classId", "date"]);

      const existing = await attendanceModel.checkExistingAttendance(
        date,
        classId,
      );
      res.json({ existing });
    }),
  );

  /**
   * @route   GET /verify
   * @desc    Verify and retrieve attendance data for a specific class and date.
   * @access  Private
   */
  router.get(
    "/verify",
    asyncHandler(async (req, res) => {
      const { classId, date } = req.query;

      validateRequiredParams({ classId, date }, ["classId", "date"]);

      const attendance = await attendanceModel.getAttendanceByDate(date);

      const filteredAttendance = attendance.filter(
        (att) => att.class_id === parseInt(classId),
      );

      res.json({
        count: filteredAttendance.length,
        data: filteredAttendance,
      });
    }),
  );

  /**
   * @route   GET /classes
   * @desc    Get a list of all available classes.
   * @access  Private
   */
  router.get(
    "/classes",
    asyncHandler(async (req, res) => {
      const classes = await attendanceModel.getClasses();
      res.json(classes);
    }),
  );

  /**
   * @route   GET /student/:studentId
   * @desc    Get attendance records for a specific student within a date range.
   * @access  Private
   */
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
          endDate,
        );

      res.json(attendances);
    }),
  );

  /**
   * @route   GET /today-stats
   * @desc    Get attendance statistics for a specific date.
   * @access  Private
   */
  router.get(
    "/today-stats",
    asyncHandler(async (req, res) => {
      const { date } = req.query;

      validateRequiredParams({ date }, ["date"]);

      const stats = await attendanceModel.getTodayAttendanceStats(date);
      res.json(stats);
    }),
  );

  /**
   * @route   GET /stats
   * @desc    Get attendance statistics for a date range.
   * @access  Private
   */
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
        endDate,
      );
      res.json(stats);
    }),
  );

  /**
   * @route   POST /holidays
   * @desc    Add a new school holiday.
   * @access  Private (guru_bk, super_admin)
   */
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

      const existingHoliday = await attendanceModel.getHolidayByDate(date);

      if (existingHoliday) {
        return res.status(400).json({ error: "Tanggal libur sudah ada" });
      }

      try {
        await pool.query(
          "INSERT INTO school_holidays (date, description, academic_year) VALUES (?, ?, ?)",
          [date, description, academicYear],
        );

        res.json({ success: true, message: "Hari libur berhasil ditambahkan" });
      } catch (error) {
        console.error("Error adding holiday:", error);

        if (error.code === "ER_DUP_ENTRY") {
          if (error.message.includes("PRIMARY")) {
            return res.status(500).json({
              error:
                "Terjadi kesalahan dengan ID primary key. Silakan hubungi administrator.",
            });
          } else if (error.message.includes("date")) {
            return res.status(400).json({ error: "Tanggal libur sudah ada" });
          }
        }

        res.status(500).json({ error: "Gagal menambahkan hari libur" });
      }
    }),
  );

  /**
   * @route   GET /holidays
   * @desc    Get a list of school holidays for a specific academic year.
   * @access  Private
   */
  router.get(
    "/holidays",
    asyncHandler(async (req, res) => {
      const { academicYear } = req.query;

      const holidays = await attendanceModel.getHolidays(academicYear);
      res.json(holidays);
    }),
  );

  /**
   * @route   DELETE /holidays/:id
   * @desc    Delete a school holiday by its ID.
   * @access  Private (guru_bk, super_admin)
   */
  router.delete(
    "/holidays/:id",
    restrictTo(["guru_bk", "super_admin"]),
    asyncHandler(async (req, res) => {
      const { id } = req.params;

      const [result] = await pool.query(
        "DELETE FROM school_holidays WHERE id = ?",
        [id],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Hari libur tidak ditemukan" });
      }

      res.json({ success: true, message: "Hari libur berhasil dihapus" });
    }),
  );

  /**
   * @route   GET /export
   * @desc    Export attendance data to an Excel or PDF file.
   * @access  Private (guru_bk, super_admin)
   */
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

      const recap = await attendanceModel.getAttendanceRecap(
        classId,
        period,
        startDate,
        endDate,
      );

      const [classInfo] = await pool.query(
        "SELECT name, academic_year, semester FROM classes WHERE id = ?",
        [classId],
      );

      const className = classInfo[0]?.name || "";
      const academicYear = classInfo[0]?.academic_year || "";
      const semester = classInfo[0]?.semester || "";

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

      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      res.setHeader("Content-Type", result.mimetype);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.filename}"`,
      );

      res.sendFile(result.filepath, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).json({ error: "Gagal mengirim file" });
        } else {
          fs.unlink(result.filepath, (unlinkErr) => {
            if (unlinkErr) console.error("Error deleting file:", unlinkErr);
          });
        }
      });
    }),
  );

  /**
   * @route   POST /archive
   * @desc    Archive attendance data for a specific academic year and semester.
   * @access  Private (guru_bk, super_admin)
   */
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
        semester,
      );

      res.json(result);
    }),
  );

  /**
   * @route   GET /archive
   * @desc    Get archived attendance data.
   * @access  Private
   */
  router.get(
    "/archive",
    asyncHandler(async (req, res) => {
      const { academicYear, semester, classId } = req.query;

      const archivedData = await attendanceModel.getArchivedAttendanceData(
        academicYear,
        semester,
        classId,
      );

      res.json(archivedData);
    }),
  );

  /**
   * @route   GET /archive/export
   * @desc    Export archived attendance data to an Excel or PDF file.
   * @access  Private (guru_bk, super_admin)
   */
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
        classId,
      );

      let className = "";
      if (classId) {
        const [classInfo] = await pool.query(
          "SELECT name FROM classes WHERE id = ?",
          [classId],
        );
        className = classInfo[0]?.name || "";
      }

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

      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      res.setHeader("Content-Type", result.mimetype);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.filename}"`,
      );

      res.sendFile(result.filepath, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).json({ error: "Gagal mengirim file" });
        } else {
          fs.unlink(result.filepath, (unlinkErr) => {
            if (unlinkErr) console.error("Error deleting file:", unlinkErr);
          });
        }
      });
    }),
  );

  /**
   * @route   GET /absence-analysis/day-of-week
   * @desc    Get absence data grouped by day of the week.
   * @access  Private
   */
  router.get(
    "/absence-analysis/day-of-week",
    asyncHandler(async (req, res) => {
      const { classId, startDate, endDate } = req.query;

      validateRequiredParams({ startDate, endDate }, ["startDate", "endDate"]);

      const absenceData = await attendanceModel.getAbsenceByDayOfWeek(
        classId,
        startDate,
        endDate,
      );
      res.json({
        classId,
        startDate,
        endDate,
        data: absenceData,
      });
    }),
  );

  /**
   * @route   GET /absence-analysis/by-date
   * @desc    Get absence data for each calendar date in a date range.
   * @access  Private
   */
  router.get(
    "/absence-analysis/by-date",
    asyncHandler(async (req, res) => {
      const { classId, startDate, endDate } = req.query;

      validateRequiredParams({ startDate, endDate }, ["startDate", "endDate"]);

      const absenceData = await attendanceModel.getAbsenceByDate(
        classId,
        startDate,
        endDate,
      );
      res.json({
        classId,
        startDate,
        endDate,
        data: absenceData,
      });
    }),
  );

  /**
   * @route   GET /absence-analysis/students-by-date
   * @desc    Get detailed student absence data for a specific date.
   * @access  Private
   */
  router.get(
    "/absence-analysis/students-by-date",
    asyncHandler(async (req, res) => {
      const { classId, date } = req.query;

      validateRequiredParams({ date }, ["date"]);

      const students = await attendanceModel.getStudentAbsencesByDate(
        classId,
        date,
      );
      res.json({
        classId,
        date,
        data: students,
      });
    }),
  );

  /**
   * @route   GET /absence-analysis/monthly-trends
   * @desc    Get monthly absence trends for a specific class and academic year.
   * @access  Private
   */
  router.get(
    "/absence-analysis/monthly-trends",
    asyncHandler(async (req, res) => {
      const { classId } = req.query;

      const trends = await attendanceModel.getMonthlyAbsenceTrends(classId);
      res.json({
        classId,
        data: trends,
      });
    }),
  );

  /**
   * Global error handler for this router.
   * Catches any errors from the above routes and sends a JSON response.
   */
  router.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
      error: err.message || "Terjadi kesalahan pada server",
    });
  });
  
  /**
   * @route   GET /missing
   * @desc    Get dates with missing attendance and the classes that are missing.
   * @access  Private (guru_bk, super_admin)
   */
  router.get(
    "/missing",
    restrictTo(["guru_bk", "super_admin"]),
    attendanceController.getMissingAttendanceByDateRange,
  );

  return router;
};

export default attendanceRouterFactory;
