// src/controllers/attendanceController.js
import attendanceModelFactory from "../models/attendanceModel.js";

const attendanceControllerFactory = ({ pool }) => {
  const attendanceModel = attendanceModelFactory({ pool });

  // Save attendance data using UPSERT
  const saveAttendance = async (req, res) => {
    const { classId, date, attendances } = req.body;

    try {
      // Check if it's a holiday using model
      const holiday = await attendanceModel.getHolidayByDate(date);

      if (holiday) {
        return res.status(400).json({ error: "Tanggal ini adalah hari libur" });
      }

      if (!Array.isArray(attendances) || attendances.length === 0) {
        return res.status(400).json({
          error:
            "Tidak ada data presensi yang disimpan. Pastikan ada siswa di kelas ini.",
        });
      }

      // Prepare values for UPSERT
      const values = attendances.map((att) => [
        att.studentId,
        date,
        att.status,
        att.notes || null,
        req.user.id,
      ]);

      // Single UPSERT operation (more efficient than DELETE + INSERT)
      const [result] = await pool.query(
        `INSERT INTO attendances (student_id, date, status, notes, recorded_by) 
         VALUES ? 
         ON DUPLICATE KEY UPDATE 
           status = VALUES(status), 
           notes = VALUES(notes), 
           recorded_by = VALUES(recorded_by),
           updated_at = CURRENT_TIMESTAMP`,
        [values]
      );

      res.json({
        success: true,
        message: "Data presensi berhasil disimpan",
        affectedRows: result.affectedRows,
      });
    } catch (error) {
      console.error("Error saving attendance:", error);
      res.status(500).json({ error: "Gagal menyimpan data presensi" });
    }
  };

  // Get attendance by date and class
  const getAttendanceByDateAndClass = async (req, res) => {
    const { classId, date } = req.query;

    try {
      const attendance = await attendanceModel.getAttendanceByDateAndClass(
        date,
        classId
      );
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ error: "Gagal mengambil data presensi" });
    }
  };

  // Get students by class
  const getStudentsByClass = async (req, res) => {
    const { classId } = req.query;

    try {
      const students = await attendanceModel.getStudentsByClass(classId);
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ error: "Gagal mengambil data siswa" });
    }
  };

  // Get attendance recap
  const getAttendanceRecap = async (req, res) => {
    const { classId, period, startDate, endDate } = req.query;

    try {
      const recap = await attendanceModel.getAttendanceRecap(
        classId,
        period,
        startDate,
        endDate
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
  };

  // Get attendance by student and date range
  const getAttendanceByStudentAndDateRange = async (req, res) => {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    try {
      if (!startDate || !endDate) {
        return res.status(400).json({
          error: "Parameter startDate dan endDate wajib diisi",
        });
      }

      const attendance =
        await attendanceModel.getAttendanceByStudentAndDateRange(
          studentId,
          startDate,
          endDate
        );

      res.json(attendance);
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      res.status(500).json({ error: "Gagal mengambil data presensi siswa" });
    }
  };

  // Get attendance statistics
  const getAttendanceStats = async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
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
    } catch (error) {
      console.error("Error fetching attendance stats:", error);
      res
        .status(500)
        .json({ error: "Gagal mengambil data statistik presensi" });
    }
  };

  // Get today's attendance statistics
  const getTodayAttendanceStats = async (req, res) => {
    const { date } = req.query;

    try {
      if (!date) {
        return res.status(400).json({
          error: "Parameter date wajib diisi",
        });
      }

      const stats = await attendanceModel.getTodayAttendanceStats(date);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching today's attendance stats:", error);
      res
        .status(500)
        .json({ error: "Gagal mengambil data statistik presensi hari ini" });
    }
  };

  // Get archived attendance data
  const getArchivedAttendanceData = async (req, res) => {
    const { academicYear, semester, classId } = req.query;

    try {
      const archivedData = await attendanceModel.getArchivedAttendanceData(
        academicYear,
        semester,
        classId
      );

      res.json(archivedData);
    } catch (error) {
      console.error("Error fetching archived attendance data:", error);
      res.status(500).json({ error: "Gagal mengambil data arsip presensi" });
    }
  };

  // Check existing attendance
  const checkExistingAttendance = async (req, res) => {
    const { classId, date } = req.query;

    try {
      if (!classId || !date) {
        return res.status(400).json({
          error: "Parameter classId dan date wajib diisi",
        });
      }

      const existing = await attendanceModel.checkExistingAttendance(
        date,
        classId
      );
      res.json({ existing });
    } catch (error) {
      console.error("Error checking existing attendance:", error);
      res.status(500).json({ error: "Gagal mengecek data presensi yang ada" });
    }
  };

  // Get attendance by date
  const getAttendanceByDate = async (req, res) => {
    const { date } = req.query;

    try {
      if (!date) {
        return res.status(400).json({
          error: "Parameter date wajib diisi",
        });
      }

      const attendance = await attendanceModel.getAttendanceByDate(date);
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance by date:", error);
      res
        .status(500)
        .json({ error: "Gagal mengambil data presensi berdasarkan tanggal" });
    }
  };

  // Get classes
  const getClasses = async (req, res) => {
    try {
      const classes = await attendanceModel.getClasses();
      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ error: "Gagal mengambil data kelas" });
    }
  };

  // Get holidays
  const getHolidays = async (req, res) => {
    const { academicYear } = req.query;

    try {
      const holidays = await attendanceModel.getHolidays(academicYear);
      res.json(holidays);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      res.status(500).json({ error: "Gagal mengambil data hari libur" });
    }
  };

  // Get holiday by date
  const getHolidayByDate = async (req, res) => {
    const { date } = req.query;

    try {
      if (!date) {
        return res.status(400).json({
          error: "Parameter date wajib diisi",
        });
      }

      const holiday = await attendanceModel.getHolidayByDate(date);
      res.json(holiday);
    } catch (error) {
      console.error("Error fetching holiday by date:", error);
      res
        .status(500)
        .json({ error: "Gagal mengambil data hari libur berdasarkan tanggal" });
    }
  };

  // Archive attendance data
  const archiveAttendanceData = async (req, res) => {
    const { academicYear, semester } = req.body;

    try {
      if (!academicYear || !semester) {
        return res.status(400).json({
          error: "Parameter academicYear dan semester wajib diisi",
        });
      }

      const result = await attendanceModel.archiveAttendanceData(
        academicYear,
        semester
      );
      res.json(result);
    } catch (error) {
      console.error("Error archiving attendance data:", error);
      res.status(500).json({ error: "Gagal mengarsipkan data presensi" });
    }
  };

  return {
    saveAttendance,
    getAttendanceByDateAndClass,
    getStudentsByClass,
    getAttendanceRecap,
    getAttendanceByStudentAndDateRange,
    getAttendanceStats,
    getTodayAttendanceStats,
    getArchivedAttendanceData,
    checkExistingAttendance,
    getAttendanceByDate,
    getClasses,
    getHolidays,
    getHolidayByDate,
    archiveAttendanceData,
  };
};

export default attendanceControllerFactory;
