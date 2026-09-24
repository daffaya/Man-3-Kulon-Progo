// In backend/src/routes/publicAttendanceRoutes.js
import { Router } from "express";
import attendanceControllerFactory from "../controllers/attendanceController.js";
import attendanceModelFactory from "../models/attendanceModel.js";
import rateLimiter from "../middleware/rateLimiter.js";

const publicAttendanceRouterFactory = ({ pool, PUBLIC_ATTENDANCE_PASSWORD }) => {
  const router = Router();
  const attendanceController = attendanceControllerFactory({ pool });
  const attendanceModel = attendanceModelFactory({ pool });

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
    if (password === PUBLIC_ATTENDANCE_PASSWORD) {
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
      const { classId, period, startDate, endDate, password } = req.query;

      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }

      // Verify password
      if (password !== PUBLIC_ATTENDANCE_PASSWORD) {
        return res.status(401).json({ error: "Invalid password" });
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
        data: recap,
      });
    } catch (error) {
      console.error("Error fetching attendance recap:", error);
      res.status(500).json({ error: "Gagal mengambil data rekap presensi" });
    }
  });

  /**
   * @route   GET /classes
   * @desc    Get list of classes (no password required)
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
