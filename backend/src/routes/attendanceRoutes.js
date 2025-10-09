import { Router } from "express";
import {
  authenticateTokenFactory,
  restrictTo,
} from "../middleware/authMiddleware.js";

const attendanceRouterFactory = ({ pool, JWT_SECRET }) => {
  const router = Router();
  const authenticateToken = authenticateTokenFactory({ JWT_SECRET });

  router.use(authenticateToken);

  router.post("/", async (req, res) => {
    try {
      const { classId, date, attendances } = req.body;

      if (!classId || !date || !attendances || !Array.isArray(attendances)) {
        return res.status(400).json({ error: "Invalid input data" });
      }

      if (!isValidDate(date)) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      const [holidayCheck] = await pool.query(
        "SELECT COUNT(*) as count FROM school_holidays WHERE date = ?",
        [date]
      );

      if (holidayCheck[0].count > 0) {
        return res.status(400).json({ error: "Tanggal ini adalah hari libur" });
      }

      const values = attendances.map((att) => [
        att.studentId,
        date,
        att.status,
        att.notes || null,
        req.user.id,
      ]);

      // Use parameterized query for bulk insert
      await pool.query(
        "INSERT INTO attendances (student_id, date, status, notes, recorder_by) VALUES ? ON DUPLICATE KEY UPDATE status = VALUES(status), notes = VALUES(notes), recorder_by = VALUES(recorder_by)",
        [values]
      );

      res.json({ success: true });
    } catch (error) {
      console.error("Error saving attendance:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/recap", async (req, res) => {
    try {
      const { classId, period, startDate, endDate } = req.query;

      // Validasi parameter
      if (!classId || !period) {
        return res.status(400).json({
          error: "Parameter classId dan period wajib diisi",
        });
      }

      let query = "";
      let queryParams = [];

      // Query berdasarkan periode
      switch (period) {
        case "daily":
          query = `
          SELECT 
            s.id,
            s.nisn,
            s.name,
            a.date,
            a.status,
            a.notes
          FROM students s
          LEFT JOIN attendances a ON s.id = a.student_id AND a.date = ?
          WHERE s.class_id = ? AND s.is_active = TRUE
          ORDER BY s.name
        `;
          queryParams = [startDate, classId];
          break;

        case "monthly":
          query = `
          SELECT 
            s.id,
            s.nisn,
            s.name,
            COUNT(a.id) as total_hari,
            SUM(CASE WHEN a.status = 'hadir' THEN 1 ELSE 0 END) as hadir,
            SUM(CASE WHEN a.status = 'izin' THEN 1 ELSE 0 END) as izin,
            SUM(CASE WHEN a.status = 'sakit' THEN 1 ELSE 0 END) as sakit,
            SUM(CASE WHEN a.status = 'alpa' THEN 1 ELSE 0 END) as alpa,
            ROUND(
              (SUM(CASE WHEN a.status = 'hadir' THEN 1 ELSE 0 END) / 
              COUNT(a.id)) * 100, 2
            ) as persentase_kehadiran
          FROM students s
          LEFT JOIN attendances a ON s.id = a.student_id 
            AND a.date BETWEEN ? AND ?
          WHERE s.class_id = ? AND s.is_active = TRUE
          GROUP BY s.id
          ORDER BY s.name
        `;
          queryParams = [startDate, endDate, classId];
          break;

        case "semester":
          query = `
          SELECT 
            s.id,
            s.nisn,
            s.name,
            COUNT(a.id) as total_hari,
            SUM(CASE WHEN a.status = 'hadir' THEN 1 ELSE 0 END) as hadir,
            SUM(CASE WHEN a.status = 'izin' THEN 1 ELSE 0 END) as izin,
            SUM(CASE WHEN a.status = 'sakit' THEN 1 ELSE 0 END) as sakit,
            SUM(CASE WHEN a.status = 'alpa' THEN 1 ELSE 0 END) as alpa,
            ROUND(
              (SUM(CASE WHEN a.status = 'hadir' THEN 1 ELSE 0 END) / 
              COUNT(a.id)) * 100, 2
            ) as persentase_kehadiran
          FROM students s
          LEFT JOIN attendances a ON s.id = a.student_id 
            AND a.date BETWEEN ? AND ?
          WHERE s.class_id = ? AND s.is_active = TRUE
          GROUP BY s.id
          ORDER BY s.name
        `;
          queryParams = [startDate, endDate, classId];
          break;

        default:
          return res.status(400).json({
            error:
              "Periode tidak valid. Gunakan: daily, monthly, atau semester",
          });
      }

      const [recap] = await pool.query(query, queryParams);

      // Tambahkan informasi periode
      const result = {
        period,
        classId,
        startDate,
        endDate,
        data: recap,
      };

      res.json(result);
    } catch (error) {
      console.error("Error getting attendance recap:", error);
      res.status(500).json({
        error: "Gagal mengambil data rekap presensi",
      });
    }
  });

  // Get daftar kelas untuk filter
  router.get("/classes", async (req, res) => {
    try {
      const [classes] = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.academic_year,
        c.semester,
        COUNT(s.id) as total_siswa
      FROM classes c
      LEFT JOIN students s ON c.id = s.class_id AND s.is_active = TRUE
      GROUP BY c.id
      ORDER BY c.academic_year DESC, c.name
    `);

      res.json(classes);
    } catch (error) {
      console.error("Error getting classes:", error);
      res.status(500).json({
        error: "Gagal mengambil data kelas",
      });
    }
  });

  // Get detail presensi per siswa
  router.get("/student/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;
      const { startDate, endDate } = req.query;

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
    } catch (error) {
      console.error("Error getting student attendance:", error);
      res.status(500).json({
        error: "Gagal mengambil data presensi siswa",
      });
    }
  });

  // Get today's attendance statistics
  router.get("/today-stats", async (req, res) => {
    try {
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ error: "Date parameter is required" });
      }

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
        `SELECT 
        status,
        COUNT(*) as count
      FROM attendances
      WHERE date = ?
      GROUP BY status`,
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
        switch (stat.status) {
          case "hadir":
            result.totalHadir = stat.count;
            break;
          case "izin":
            result.totalIzin = stat.count;
            break;
          case "sakit":
            result.totalSakit = stat.count;
            break;
          case "alpa":
            result.totalAlpa = stat.count;
            break;
        }
      });

      res.json(result);
    } catch (error) {
      console.error("Error getting today's stats:", error);
      res.status(500).json({ error: "Failed to fetch today's stats" });
    }
  });

  return router;
};

export default attendanceRouterFactory;
