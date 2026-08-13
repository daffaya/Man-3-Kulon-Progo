// In backend/src/routes/publicAttendanceRoutes.js
import { Router } from "express";
import attendanceControllerFactory from "../controllers/attendanceController.js";
import attendanceModelFactory from "../models/attendanceModel.js";

const publicAttendanceRouterFactory = ({ pool }) => {
  const router = Router();
  const attendanceController = attendanceControllerFactory({ pool });
  const attendanceModel = attendanceModelFactory({ pool });

  // Password for public access (stored in environment variables)
  const PUBLIC_ATTENDANCE_PASSWORD =
    process.env.PUBLIC_ATTENDANCE_PASSWORD || "parent123";

  /**
   * @route   POST /verify-password
   * @desc    Verify password for public access to attendance data
   * @access  Public
   */
  router.post("/verify-password", (req, res) => {
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
  router.get("/recap", async (req, res) => {
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
