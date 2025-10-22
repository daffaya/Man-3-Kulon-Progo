import { Router } from "express";
import {
  authenticateTokenFactory,
  restrictTo,
} from "../middleware/authMiddleware.js";

const attendanceRouterFactory = ({ pool, JWT_SECRET }) => {
  const router = Router();
  const authenticateToken = authenticateTokenFactory({ JWT_SECRET });

  router.use(authenticateToken);

  router.post("/", restrictTo(["guru_bk", "super_admin"]), async (req, res) => {
    try {
      const { classId, date } = req.query;

      if (!classId || !date) {
        return res.status(400).json({
          error: "Parameter classId dan date wajib diisi",
        });
      }

      const [attendance] = await pool.query(
        `
      SELECT 
        a.student_id,
        a.status,
        a.notes
      FROM attendances a
      JOIN student_academic_history sah ON a.student_id = sah.student_id AND sah.is_current = 1
      WHERE a.date = ? AND sah.class_id = ?
    `,
        [date, classId]
      );

      res.json(attendance);
    } catch (error) {
      console.error("Error getting attendance:", error);
      res.status(500).json({
        error: "Gagal mengambil data presensi",
      });
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
          LEFT JOIN student_academic_history sah ON s.id = sah.student_id AND sah.is_current = 1
          LEFT JOIN attendances a ON s.id = a.student_id AND a.date = ?
          WHERE sah.class_id = ? AND s.is_active = TRUE
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
          LEFT JOIN student_academic_history sah ON s.id = sah.student_id AND sah.is_current = 1
          LEFT JOIN attendances a ON s.id = a.student_id 
            AND a.date BETWEEN ? AND ?
          WHERE sah.class_id = ? AND s.is_active = TRUE
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
          LEFT JOIN student_academic_history sah ON s.id = sah.student_id AND sah.is_current = 1
          LEFT JOIN attendances a ON s.id = a.student_id 
            AND a.date BETWEEN ? AND ?
          WHERE sah.class_id = ? AND s.is_active = TRUE
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
        COUNT(sah.student_id) as total_siswa
      FROM classes c
      LEFT JOIN student_academic_history sah ON c.id = sah.class_id AND sah.is_current = 1
      LEFT JOIN students s ON sah.student_id = s.id AND s.is_active = TRUE
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

  // Get students by class
  router.get("/students", async (req, res) => {
    try {
      const { classId } = req.query;

      if (!classId) {
        return res.status(400).json({
          error: "Parameter classId wajib diisi",
        });
      }

      const [students] = await pool.query(
        `
      SELECT s.id, s.nisn, s.name
      FROM students s
      JOIN student_academic_history sah ON s.id = sah.student_id AND sah.is_current = 1
      WHERE sah.class_id = ? AND s.is_active = TRUE
      ORDER BY s.name
    `,
        [classId]
      );

      res.json(students);
    } catch (error) {
      console.error("Error getting students:", error);
      res.status(500).json({
        error: "Gagal mengambil data siswa",
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

  router.post(
    "/holidays",
    restrictTo(["guru_bk", "super_admin"]),
    async (req, res) => {
      try {
        const { date, description, academicYear } = req.body;

        // Validasi input
        if (!date || !description || !academicYear) {
          return res.status(400).json({ error: "Semua field harus diisi" });
        }

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
      } catch (error) {
        console.error("Error adding holiday:", error);
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Endpoint untuk mendapatkan daftar hari libur
  router.get("/holidays", async (req, res) => {
    try {
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
    } catch (error) {
      console.error("Error getting holidays:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Endpoint untuk menghapus hari libur
  router.delete(
    "/holidays/:id",
    restrictTo(["guru_bk", "super_admin"]),
    async (req, res) => {
      try {
        const { id } = req.params;

        await pool.query("DELETE FROM school_holidays WHERE id = ?", [id]);

        res.json({ success: true, message: "Hari libur berhasil dihapus" });
      } catch (error) {
        console.error("Error deleting holiday:", error);
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Endpoint untuk export data presensi
  router.get(
    "/export",
    restrictTo(["guru_bk", "super_admin"]),
    async (req, res) => {
      try {
        const { classId, period, startDate, endDate, format } = req.query;

        // Validasi parameter
        if (!classId || !period || !format) {
          return res.status(400).json({
            error: "Parameter classId, period, dan format wajib diisi",
          });
        }

        if (!["excel", "pdf"].includes(format)) {
          return res
            .status(400)
            .json({ error: "Format harus 'excel' atau 'pdf'" });
        }

        // Ambil data rekap presensi (gunakan query yang sama seperti endpoint /recap)
        let query = "";
        let queryParams = [];

        // ... query berdasarkan periode (sama seperti di endpoint /recap) ...

        const [recap] = await pool.query(query, queryParams);

        // Generate file berdasarkan format
        if (format === "excel") {
          // Implementasi export ke Excel
          // Anda bisa menggunakan library seperti exceljs
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet("Rekap Presensi");

          // Add headers
          worksheet.addRow([
            "NISN",
            "Nama",
            "Total Hari",
            "Hadir",
            "Izin",
            "Sakit",
            "Alpa",
            "Persentase Kehadiran",
          ]);

          // Add data
          recap.forEach((student) => {
            worksheet.addRow([
              student.nisn,
              student.name,
              student.total_hari,
              student.hadir,
              student.izin,
              student.sakit,
              student.alpa,
              `${student.persentase_kehadiran}%`,
            ]);
          });

          // Set response headers
          res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
          res.setHeader(
            "Content-Disposition",
            `attachment; filename=rekap_presensi_${period}_${classId}.xlsx`
          );

          // Send file
          await workbook.xlsx.write(res);
          res.end();
        } else if (format === "pdf") {
          // Implementasi export ke PDF
          // Anda bisa menggunakan library seperti pdfkit atau puppeteer
          const doc = new PDFDocument();

          // Set response headers
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename=rekap_presensi_${period}_${classId}.pdf`
          );

          // Pipe PDF to response
          doc.pipe(res);

          // Add content to PDF
          doc.fontSize(20).text("Rekap Presensi Siswa", { align: "center" });
          doc.moveDown();
          doc.fontSize(12).text(`Kelas: ${classId}`);
          doc.text(`Periode: ${period}`);
          doc.text(`Tanggal: ${startDate} - ${endDate}`);
          doc.moveDown();

          // Add table
          // ... implementasi tabel di PDF ...

          // Finalize PDF
          doc.end();
        }
      } catch (error) {
        console.error("Error exporting attendance:", error);
        res.status(500).json({ error: error.message });
      }
    }
  );

  return router;
};

export default attendanceRouterFactory;
