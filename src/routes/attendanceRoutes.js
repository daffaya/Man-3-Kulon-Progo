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
import { HttpError } from "../utils/errorResponse.js";
import { isValidDateStr } from "../utils/dateUtils.js";

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
const READ_ROLES = ["guru_bk", "super_admin"];

const attendanceRouterFactory = ({ pool, JWT_SECRET, now }) => {
  const router = Router();
  const authenticateToken = authenticateTokenFactory({ JWT_SECRET });
  const attendanceController = attendanceControllerFactory({ pool, now });
  const attendanceModel = attendanceModelFactory({ pool, now });

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
  router.get(
    "/",
    restrictTo(READ_ROLES),
    attendanceController.getAttendanceByDateAndClass,
  );

  /**
   * @route   GET /students
   * @desc    Get a list of students filtered by class.
   * @access  Private
   */
  router.get(
    "/students",
    restrictTo(READ_ROLES),
    attendanceController.getStudentsByClass,
  );

  /**
   * @route   GET /recap
   * @desc    Get a recap of attendance records.
   * @access  Private
   */
  router.get(
    "/recap",
    restrictTo(READ_ROLES),
    attendanceController.getAttendanceRecap,
  );

  /**
   * @route   GET /check-existing
   * @desc    Check if attendance data already exists for a given class and date.
   * @access  Private (guru_bk, super_admin)
   */
  router.get(
    "/check-existing",
    restrictTo(READ_ROLES),
    attendanceController.checkExistingAttendance,
  );

  /**
   * @route   GET /verify
   * @desc    Verify and retrieve attendance data for a specific class and date.
   * @access  Private (guru_bk, super_admin)
   */
  router.get(
    "/verify",
    restrictTo(READ_ROLES),
    asyncHandler(async (req, res) => {
      const { classId, date } = req.query;

      validateRequiredParams({ classId, date }, ["classId", "date"]);

      const attendance = await attendanceModel.getAttendanceByDate(date);
      const filteredAttendance = attendance.filter(
        (att) => att.class_id === parseInt(classId),
      );

      res.json({ count: filteredAttendance.length, data: filteredAttendance });
    }),
  );

  /**
   * @route   GET /classes?date=
   * @desc    Classes of the academic year containing `date` (default today).
   * @access  Private (guru_bk, super_admin)
   */
  router.get("/classes", restrictTo(READ_ROLES), attendanceController.getClasses);

  /**
   * @route   GET /student/:studentId
   * @desc    Attendance records of one student within a date range.
   * @access  Private (guru_bk, super_admin)
   */
  router.get(
    "/student/:studentId",
    restrictTo(READ_ROLES),
    attendanceController.getAttendanceByStudentAndDateRange,
  );

  /**
   * @route   GET /today-stats
   * @desc    Get attendance statistics for a specific date.
   * @access  Private
   */
  router.get("/today-stats", attendanceController.getTodayAttendanceStats);

  /**
   * @route   GET /stats
   * @desc    Get attendance statistics for a date range.
   * @access  Private
   */
  router.get("/stats", attendanceController.getAttendanceStats);

  /**
   * @route   POST /holidays
   * @desc    Add a school holiday. The academic year is derived from the
   *          date on the server; a client-supplied year is ignored.
   * @access  Private (super_admin)
   */
  router.post(
    "/holidays",
    restrictTo([]),
    asyncHandler(async (req, res) => {
      const { date, description } = req.body || {};

      validateRequiredParams({ date, description }, ["date", "description"]);
      if (!isValidDateStr(date)) {
        return res.status(400).json({ error: "Tanggal harus berformat YYYY-MM-DD" });
      }

      if (await attendanceModel.getHolidayByDate(date)) {
        return res.status(409).json({ error: "Tanggal libur sudah ada" });
      }

      try {
        const result = await attendanceModel.addHoliday(date, String(description).slice(0, 100));
        if (result.error === "outside_year") {
          return res
            .status(422)
            .json({ error: "Tanggal berada di luar semua tahun ajaran" });
        }
        res.status(201).json({
          success: true,
          message: "Hari libur berhasil ditambahkan",
          academic_year: result.academic_year,
        });
      } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ error: "Tanggal libur sudah ada" });
        }
        throw error;
      }
    }),
  );

  /**
   * @route   GET /holidays
   * @desc    Get school holidays, optionally for one academic year.
   * @access  Private (guru_bk, super_admin)
   */
  router.get("/holidays", restrictTo(READ_ROLES), attendanceController.getHolidays);

  /**
   * @route   DELETE /holidays/:id
   * @desc    Delete a school holiday by its ID.
   * @access  Private (super_admin)
   */
  router.delete(
    "/holidays/:id",
    restrictTo([]),
    asyncHandler(async (req, res) => {
      const { id } = req.params;

      const [result] = await pool.query("DELETE FROM school_holidays WHERE id = ?", [id]);

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
    attendanceController.archiveAttendanceData,
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

  /** Absence analysis (read) — guru_bk, super_admin. */
  router.get(
    "/absence-analysis/day-of-week",
    restrictTo(READ_ROLES),
    attendanceController.getAbsenceByDayOfWeek,
  );
  router.get(
    "/absence-analysis/by-date",
    restrictTo(READ_ROLES),
    attendanceController.getAbsenceByDate,
  );
  router.get(
    "/absence-analysis/students-by-date",
    restrictTo(READ_ROLES),
    attendanceController.getStudentAbsencesByDate,
  );
  router.get(
    "/absence-analysis/monthly-trends",
    restrictTo(READ_ROLES),
    attendanceController.getMonthlyAbsenceTrends,
  );
  router.get(
    "/absence-analysis/students-by-day-of-week",
    restrictTo(READ_ROLES),
    attendanceController.getStudentAbsencesByDayOfWeek,
  );

  /**
   * @route   GET /missing
   * @desc    Dates with missing attendance and the classes that are missing.
   * @access  Private (guru_bk, super_admin)
   */
  router.get(
    "/missing",
    restrictTo(["guru_bk", "super_admin"]),
    attendanceController.getMissingAttendanceByDateRange,
  );

  /**
   * Router-level error handler. Never leaks error.message (AUDIT-012).
   */
  router.use((err, req, res, next) => {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(err);
    const status = err.message && err.message.startsWith("Parameter ") ? 400 : 500;
    res.status(status).json({
      error: status === 400 ? err.message : "Terjadi kesalahan pada server",
    });
  });

  return router;
};

export default attendanceRouterFactory;
