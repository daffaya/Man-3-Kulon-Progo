// In backend/src/routes/publicAttendanceRoutes.js
import { Router } from "express";
import attendanceModelFactory from "../models/attendanceModel.js";
import rateLimiter from "../middleware/rateLimiter.js";
import crypto from "crypto";
import { isValidDateStr } from "../utils/dateUtils.js";

/** Constant-time comparison so response timing does not reveal the password. */
const passwordMatches = (given, expected) => {
  if (typeof given !== "string" || typeof expected !== "string") return false;
  const a = crypto.createHash("sha256").update(given).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
};

/** Public pages never show a full NISN: keep only the last 4 digits. */
const maskNisn = (nisn) => {
  const digits = String(nisn ?? "");
  return digits.length > 4 ? `${"*".repeat(digits.length - 4)}${digits.slice(-4)}` : digits;
};

const publicAttendanceRouterFactory = ({ pool, PUBLIC_ATTENDANCE_PASSWORD, now }) => {
  const router = Router();
  const attendanceModel = attendanceModelFactory({ pool, now });

  // AUDIT-006: no hardcoded fallback — bootstrap.js already fails startup
  // if PUBLIC_ATTENDANCE_PASSWORD isn't set, so this is always a real value.

  // AUDIT-006: rate-limit both password-guessing vectors (body + query string)
  const passwordGuessLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "Terlalu banyak percobaan. Coba lagi nanti" },
  });

  /**
   * @route   POST /verify-password
   * @desc    Verify password for public access to attendance data
   * @access  Public
   */
  router.post("/verify-password", passwordGuessLimiter, (req, res) => {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    // Simple password comparison
    if (passwordMatches(password, PUBLIC_ATTENDANCE_PASSWORD)) {
      return res.json({
        success: true,
        message: "Password verified successfully",
      });
    } else {
      return res.status(401).json({ error: "Invalid password" });
    }
  });

  /**
   * @route   GET /recap
   * @desc    Get attendance recap with password protection
   * @access  Public (with password)
   */
  router.get("/recap", passwordGuessLimiter, async (req, res) => {
    try {
      // B13: the password travels in a header, never in the URL (URLs end up
      // in access logs, browser history and Referer headers).
      const password = req.get("X-Attendance-Password");
      const { classId, period, startDate, endDate } = req.query;

      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }

      if (!passwordMatches(password, PUBLIC_ATTENDANCE_PASSWORD)) {
        return res.status(401).json({ error: "Invalid password" });
      }

      if (
        !classId ||
        !["daily", "monthly", "semester"].includes(period) ||
        !isValidDateStr(startDate) ||
        (endDate && !isValidDateStr(endDate))
      ) {
        return res.status(400).json({ error: "Parameter tidak valid" });
      }

      // Get attendance recap data
      const recap = await attendanceModel.getAttendanceRecap(
        classId,
        period,
        startDate,
        endDate,
      );

      res.json({
        period,
        classId,
        startDate,
        endDate,
        data: recap.map((row) => ({ ...row, nisn: maskNisn(row.nisn) })),
      });
    } catch (error) {
      console.error("Error fetching attendance recap:", error);
      res.status(500).json({ error: "Gagal mengambil data rekap presensi" });
    }
  });

  /**
   * @route   GET /classes
   * @desc    Get list of classes of the current academic year (no password required)
   * @access  Public
   */
  router.get("/classes", async (req, res) => {
    try {
      const classes = await attendanceModel.getClasses();
      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ error: "Gagal mengambil data kelas" });
    }
  });

  return router;
};

export default publicAttendanceRouterFactory;
