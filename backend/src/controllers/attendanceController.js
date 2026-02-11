import attendanceModelFactory from "../models/attendanceModel.js";

/**
 * Factory function to create an attendance controller.
 * @param {Object} dependencies - The dependencies to be injected.
 * @param {Object} dependencies.pool - The database connection pool.
 * @returns {Object} An object containing attendance controller methods.
 */
const attendanceControllerFactory = ({ pool }) => {
  const attendanceModel = attendanceModelFactory({ pool });

  /**
   * Saves attendance data for a specific class and date.
   * Uses an UPSERT operation to create new records or update existing ones.
   * @param {Object} req - The Express request object.
   * @param {Object} req.body - The request body.
   * @param {string} req.body.classId - The ID of the class.
   * @param {string} req.body.date - The date of attendance (YYYY-MM-DD).
   * @param {Array<Object>} req.body.attendances - An array of attendance objects.
   * @param {Object} res - The Express response object.
   * @returns {Promise<void>}
   */
  const saveAttendance = async (req, res) => {
    const { classId, date, attendances } = req.body;

    try {
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

      const values = attendances.map((att) => [
        att.studentId,
        date,
        att.status,
        att.notes || null,
        req.user.id,
      ]);

      const [result] = await pool.query(
        `INSERT INTO attendances (student_id, date, status, notes, recorded_by) 
         VALUES ? 
         ON DUPLICATE KEY UPDATE 
           status = VALUES(status), 
           notes = VALUES(notes), 
           recorded_by = VALUES(recorded_by),
           updated_at = CURRENT_TIMESTAMP`,
        [values],
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

  /**
   * Retrieves attendance data for a specific class and date.
   * @param {Object} req - The Express request object.
   * @param {Object} req.query - The query parameters.
   * @param {string} req.query.classId - The ID of the class.
   * @param {string} req.query.date - The date of attendance (YYYY-MM-DD).
   * @param {Object} res - The Express response object.
   * @returns {Promise<void>}
   */
  const getAttendanceByDateAndClass = async (req, res) => {
    const { classId, date } = req.query;

    try {
      const attendance = await attendanceModel.getAttendanceByDateAndClass(
        date,
        classId,
      );
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ error: "Gagal mengambil data presensi" });
    }
  };

  /**
   * Retrieves a list of students for a specific class.
   * @param {Object} req - The Express request object.
   * @param {Object} req.query - The query parameters.
   * @param {string} req.query.classId - The ID of the class.
   * @param {Object} res - The Express response object.
   * @returns {Promise<void>}
   */
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

  /**
   * Retrieves a recap of attendance data for a class over a period.
   * @param {Object} req - The Express request object.
   * @param {Object} req.query - The query parameters.
   * @param {string} req.query.classId - The ID of the class.
   * @param {string} [req.query.period] - The period (e.g., 'monthly').
   * @param {string} [req.query.startDate] - The start date of the period (YYYY-MM-DD).
   * @param {string} [req.query.endDate] - The end date of the period (YYYY-MM-DD).
   * @param {Object} res - The Express response object.
   * @returns {Promise<void>}
   */
  const getAttendanceRecap = async (req, res) => {
    const { classId, period, startDate, endDate } = req.query;

    try {
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
  };

  /**
   * Retrieves attendance records for a specific student within a date range.
   * @param {Object} req - The Express request object.
   * @param {Object} req.params - The route parameters.
   * @param {string} req.params.studentId - The ID of the student.
   * @param {Object} req.query - The query parameters.
   * @param {string} req.query.startDate - The start date (YYYY-MM-DD).
   * @param {string} req.query.endDate - The end date (YYYY-MM-DD).
   * @param {Object} res - The Express response object.
   * @returns {Promise<void>}
   */
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
          endDate,
        );

      res.json(attendance);
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      res.status(500).json({ error: "Gagal mengambil data presensi siswa" });
    }
  };

  /**
   * Retrieves overall attendance statistics within a given date range.
   * @param {Object} req - The Express request object.
   * @param {Object} req.query - The query parameters.
   * @param {string} req.query.startDate - The start date (YYYY-MM-DD).
   * @param {string} req.query.endDate - The end date (YYYY-MM-DD).
   * @param {Object} res - The Express response object.
   * @returns {Promise<void>}
   */
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
        endDate,
      );
      res.json(stats);
    } catch (error) {
      console.error("Error fetching attendance stats:", error);
      res
        .status(500)
        .json({ error: "Gagal mengambil data statistik presensi" });
    }
  };

  /**
   * Retrieves attendance statistics for a specific day.
   * @param {Object} req - The Express request object.
   * @param {Object} req.query - The query parameters.
   * @param {string} req.query.date - The date (YYYY-MM-DD).
   * @param {Object} res - The Express response object.
   * @returns {Promise<void>}
   */
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

  /**
   * Retrieves archived attendance data for a specific academic year and semester.
   * @param {Object} req - The Express request object.
   * @param {Object} req.query - The query parameters.
   * @param {string} req.query.academicYear - The academic year (e.g., '2023/2024').
   * @param {string} req.query.semester - The semester (e.g., '1' or '2').
   * @param {string} [req.query.classId] - The ID of the class to filter by.
   * @param {Object} res - The Express response object.
   * @returns {Promise<void>}
   */
  const getArchivedAttendanceData = async (req, res) => {
    const { academicYear, semester, classId } = req.query;

    try {
      const archivedData = await attendanceModel.getArchivedAttendanceData(
        academicYear,
        semester,
        classId,
      );

      res.json(archivedData);
    } catch (error) {
      console.error("Error fetching archived attendance data:", error);
      res.status(500).json({ error: "Gagal mengambil data arsip presensi" });
    }
  };

  /**
   * Checks if attendance data already exists for a specific class and date.
   * @param {Object} req - The Express request object.
   * @param {Object} req.query - The query parameters.
   * @param {string} req.query.classId - The ID of the class.
   * @param {string} req.query.date - The date (YYYY-MM-DD).
   * @param {Object} res - The Express response object.
   * @returns {Promise<void>}
   */
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
        classId,
      );
      res.json({ existing });
    } catch (error) {
      console.error("Error checking existing attendance:", error);
      res.status(500).json({ error: "Gagal mengecek data presensi yang ada" });
    }
  };

  /**
   * Retrieves all attendance records for a specific date.
   * @param {Object} req - The Express request object.
   * @param {Object} req.query - The query parameters.
   * @param {string} req.query.date - The date (YYYY-MM-DD).
   * @param {Object} res - The Express response object.
   * @returns {Promise<void>}
   */
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

  /**
   * Retrieves a list of all classes.
   * @param {Object} req - The Express request object.
   * @param {Object} res - The Express response object.
   * @returns {Promise<void>}
   */
  const getClasses = async (req, res) => {
    try {
      const classes = await attendanceModel.getClasses();
      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ error: "Gagal mengambil data kelas" });
    }
  };

  /**
   * Retrieves a list of holidays for a given academic year.
   * @param {Object} req - The Express request object.
   * @param {Object} req.query - The query parameters.
   * @param {string} [req.query.academicYear] - The academic year to filter holidays by.
   * @param {Object} res - The Express response object.
   * @returns {Promise<void>}
   */
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

  /**
   * Checks if a specific date is a holiday.
   * @param {Object} req - The Express request object.
   * @param {Object} req.query - The query parameters.
   * @param {string} req.query.date - The date to check (YYYY-MM-DD).
   * @param {Object} res - The Express response object.
   * @returns {Promise<void>}
   */
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

  /**
   * Archives attendance data for a completed academic year and semester.
   * @param {Object} req - The Express request object.
   * @param {Object} req.body - The request body.
   * @param {string} req.body.academicYear - The academic year to archive (e.g., '2023/2024').
   * @param {string} req.body.semester - The semester to archive (e.g., '1' or '2').
   * @param {Object} res - The Express response object.
   * @returns {Promise<void>}
   */
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
        semester,
      );
      res.json(result);
    } catch (error) {
      console.error("Error archiving attendance data:", error);
      res.status(500).json({ error: "Gagal mengarsipkan data presensi" });
    }
  };

  /**
   * Retrieves absence data grouped by day of the week for a specific class and date range.
   * @param {Object} req - The Express request object.
   * @param {Object} req.query - The query parameters.
   * @param {string} req.query.classId - The ID of the class.
   * @param {string} req.query.startDate - The start date (YYYY-MM-DD).
   * @param {string} req.query.endDate - The end date (YYYY-MM-DD).
   * @param {Object} res - The Express response object.
   * @returns {Promise<void>}
   */
  const getAbsenceByDayOfWeek = async (req, res) => {
    const { classId, startDate, endDate } = req.query;

    try {
      if (!startDate || !endDate) {
        return res.status(400).json({
          error: "Parameter startDate dan endDate wajib diisi",
        });
      }

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
    } catch (error) {
      console.error("Error fetching absence by day of week:", error);
      res.status(500).json({ error: "Gagal mengambil data analisis alpa" });
    }
  };

  /**
   * Retrieves absence data for each calendar date in a date range.
   * @param {Object} req - The Express request object.
   * @param {Object} req.query - The query parameters.
   * @param {string} req.query.classId - The ID of the class.
   * @param {string} req.query.startDate - The start date (YYYY-MM-DD).
   * @param {string} req.query.endDate - The end date (YYYY-MM-DD).
   * @param {Object} res - The Express response object.
   * @returns {Promise<void>}
   */
  const getAbsenceByDate = async (req, res) => {
    const { classId, startDate, endDate } = req.query;

    try {
      if (!startDate || !endDate) {
        return res.status(400).json({
          error: "Parameter startDate dan endDate wajib diisi",
        });
      }

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
    } catch (error) {
      console.error("Error fetching absence by date:", error);
      res.status(500).json({ error: "Gagal mengambil data alpa per tanggal" });
    }
  };

  /**
   * Retrieves detailed student absence data for a specific date.
   * @param {Object} req - The Express request object.
   * @param {Object} req.query - The query parameters.
   * @param {string} req.query.classId - The ID of the class.
   * @param {string} req.query.date - The date (YYYY-MM-DD).
   * @param {Object} res - The Express response object.
   * @returns {Promise<void>}
   */
  const getStudentAbsencesByDate = async (req, res) => {
    const { classId, date } = req.query;

    try {
      if (!date) {
        return res.status(400).json({
          error: "Parameter date wajib diisi",
        });
      }

      const students = await attendanceModel.getStudentAbsencesByDate(
        classId,
        date,
      );

      res.json({
        classId,
        date,
        data: students,
      });
    } catch (error) {
      console.error("Error fetching student absences by date:", error);
      res.status(500).json({ error: "Gagal mengambil data siswa yang alpa" });
    }
  };

  /**
   * Retrieves monthly absence trends for a specific class and academic year.
   * @param {Object} req - The Express request object.
   * @param {Object} req.query - The query parameters.
   * @param {string} req.query.classId - The ID of the class.
   * @param {string} req.query.academicYear - The academic year (e.g., '2023/2024').
   * @param {Object} res - The Express response object.
   * @returns {Promise<void>}
   */
  const getMonthlyAbsenceTrends = async (req, res) => {
    const { classId } = req.query;

    try {
      const trends = await attendanceModel.getMonthlyAbsenceTrends(classId);
      res.json({
        classId,
        data: trends,
      });
    } catch (error) {
      console.error("Error fetching monthly absence trends:", error);
      res.status(500).json({ error: "Gagal mengambil data tren alpa bulanan" });
    }
  };

  /**
   * Retrieves classes with missing attendance for each date in a date range.
   * Only checks weekdays (Monday-Friday) and excludes holidays.
   * @param {Object} req - The Express request object.
   * @param {Object} req.query - The query parameters.
   * @param {string} req.query.startDate - The start date (YYYY-MM-DD).
   * @param {string} req.query.endDate - The end date (YYYY-MM-DD).
   * @param {Object} res - The Express response object.
   * @returns {Promise<void>}
   */
  const getMissingAttendanceByDateRange = async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
      if (!startDate || !endDate) {
        return res.status(400).json({
          error: "Parameter startDate dan endDate wajib diisi",
        });
      }

      const missingData = await attendanceModel.getMissingAttendanceByDateRange(
        startDate,
        endDate,
      );

      res.json(missingData);
    } catch (error) {
      console.error("Error fetching missing attendance:", error);
      res
        .status(500)
        .json({ error: "Gagal mengambil data presensi yang hilang" });
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
    getAbsenceByDayOfWeek,
    getAbsenceByDate,
    getStudentAbsencesByDate,
    getMonthlyAbsenceTrends,
    getMissingAttendanceByDateRange,
  };
};

export default attendanceControllerFactory;
