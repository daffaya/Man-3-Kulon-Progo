import attendanceModelFactory from "../models/attendanceModel.js";
import attendanceSaveServiceFactory from "../services/attendanceSaveService.js";
import { sendError } from "../utils/errorResponse.js";
import { isValidDateStr } from "../utils/dateUtils.js";

const requireDates = (res, ...values) => {
  if (values.some((v) => !v)) {
    res.status(400).json({ error: "Parameter tanggal wajib diisi" });
    return false;
  }
  if (values.some((v) => !isValidDateStr(v))) {
    res.status(400).json({ error: "Tanggal harus berformat YYYY-MM-DD" });
    return false;
  }
  return true;
};

/**
 * Factory function to create an attendance controller.
 * @param {Object} dependencies
 * @param {Object} dependencies.pool - The database connection pool.
 * @param {() => Date} [dependencies.now] - Injectable clock (tests).
 */
const attendanceControllerFactory = ({ pool, now }) => {
  const attendanceModel = attendanceModelFactory({ pool, now });
  const saveService = attendanceSaveServiceFactory({ pool, now });

  /**
   * POST /attendance — saves a whole class for a date in one transaction.
   * Validation (year, school day, holiday, roster, correction window) lives
   * in attendanceSaveService; `recorded_by` always comes from the token.
   */
  const saveAttendance = async (req, res) => {
    try {
      const { classId, date, attendances, override, reason } = req.body || {};
      const result = await saveService.saveAttendance({
        classId,
        date,
        attendances,
        user: req.user,
        override,
        reason,
      });
      res.json(result);
    } catch (error) {
      sendError(res, error, "Gagal menyimpan data presensi");
    }
  };

  const getAttendanceByDateAndClass = async (req, res) => {
    const { classId, date } = req.query;
    try {
      if (!classId || !requireDates(res, date)) return;
      res.json(await attendanceModel.getAttendanceByDateAndClass(date, classId));
    } catch (error) {
      sendError(res, error, "Gagal mengambil data presensi");
    }
  };

  const getStudentsByClass = async (req, res) => {
    const { classId, date } = req.query;
    try {
      if (!classId) return res.status(400).json({ error: "Parameter classId wajib diisi" });
      if (date && !requireDates(res, date)) return;
      res.json(await attendanceModel.getStudentsByClass(classId, date || undefined));
    } catch (error) {
      sendError(res, error, "Gagal mengambil data siswa");
    }
  };

  const getAttendanceRecap = async (req, res) => {
    const { classId, period, startDate, endDate } = req.query;
    try {
      if (!classId || !["daily", "monthly", "semester"].includes(period)) {
        return res.status(400).json({ error: "Parameter classId dan period wajib diisi" });
      }
      if (!requireDates(res, startDate)) return;
      if (endDate && !requireDates(res, endDate)) return;
      const recap = await attendanceModel.getAttendanceRecap(classId, period, startDate, endDate);
      res.json({ period, classId, startDate, endDate, data: recap });
    } catch (error) {
      sendError(res, error, "Gagal mengambil data rekap presensi");
    }
  };

  const getAttendanceByStudentAndDateRange = async (req, res) => {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;
    try {
      if (!requireDates(res, startDate, endDate)) return;
      res.json(
        await attendanceModel.getAttendanceByStudentAndDateRange(studentId, startDate, endDate),
      );
    } catch (error) {
      sendError(res, error, "Gagal mengambil data presensi siswa");
    }
  };

  const getAttendanceStats = async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
      if (!requireDates(res, startDate, endDate)) return;
      res.json(await attendanceModel.getAttendanceStats(startDate, endDate));
    } catch (error) {
      sendError(res, error, "Gagal mengambil data statistik presensi");
    }
  };

  const getTodayAttendanceStats = async (req, res) => {
    const { date } = req.query;
    try {
      if (!requireDates(res, date)) return;
      res.json(await attendanceModel.getTodayAttendanceStats(date));
    } catch (error) {
      sendError(res, error, "Gagal mengambil data statistik presensi hari ini");
    }
  };

  const getArchivedAttendanceData = async (req, res) => {
    const { academicYear, semester, classId } = req.query;
    try {
      res.json(await attendanceModel.getArchivedAttendanceData(academicYear, semester, classId));
    } catch (error) {
      sendError(res, error, "Gagal mengambil data arsip presensi");
    }
  };

  const checkExistingAttendance = async (req, res) => {
    const { classId, date } = req.query;
    try {
      if (!classId || !requireDates(res, date)) return;
      res.json({ existing: await attendanceModel.checkExistingAttendance(date, classId) });
    } catch (error) {
      sendError(res, error, "Gagal mengecek data presensi yang ada");
    }
  };

  const getAttendanceByDate = async (req, res) => {
    const { date } = req.query;
    try {
      if (!requireDates(res, date)) return;
      res.json(await attendanceModel.getAttendanceByDate(date));
    } catch (error) {
      sendError(res, error, "Gagal mengambil data presensi berdasarkan tanggal");
    }
  };

  /** GET /attendance/classes?date= — classes of the academic year containing the date (default today). */
  const getClasses = async (req, res) => {
    const { date } = req.query;
    try {
      if (date && !requireDates(res, date)) return;
      res.json(await attendanceModel.getClasses(date || undefined));
    } catch (error) {
      sendError(res, error, "Gagal mengambil data kelas");
    }
  };

  const getHolidays = async (req, res) => {
    const { academicYear } = req.query;
    try {
      res.json(await attendanceModel.getHolidays(academicYear));
    } catch (error) {
      sendError(res, error, "Gagal mengambil data hari libur");
    }
  };

  const getHolidayByDate = async (req, res) => {
    const { date } = req.query;
    try {
      if (!requireDates(res, date)) return;
      res.json(await attendanceModel.getHolidayByDate(date));
    } catch (error) {
      sendError(res, error, "Gagal mengambil data hari libur berdasarkan tanggal");
    }
  };

  const archiveAttendanceData = async (req, res) => {
    const { academicYear, semester } = req.body || {};
    try {
      if (!/^\d{4}\/\d{4}$/.test(academicYear || "") || !["ganjil", "genap"].includes(semester)) {
        return res.status(400).json({
          error: "academicYear (YYYY/YYYY) dan semester (ganjil/genap) wajib diisi",
        });
      }
      res.json(await attendanceModel.archiveAttendanceData(academicYear, semester));
    } catch (error) {
      sendError(res, error, "Gagal mengarsipkan data presensi");
    }
  };

  const getAbsenceByDayOfWeek = async (req, res) => {
    const { classId, startDate, endDate } = req.query;
    try {
      if (!requireDates(res, startDate, endDate)) return;
      const data = await attendanceModel.getAbsenceByDayOfWeek(classId, startDate, endDate);
      res.json({ classId, startDate, endDate, data });
    } catch (error) {
      sendError(res, error, "Gagal mengambil data analisis alpa");
    }
  };

  const getAbsenceByDate = async (req, res) => {
    const { classId, startDate, endDate } = req.query;
    try {
      if (!requireDates(res, startDate, endDate)) return;
      const data = await attendanceModel.getAbsenceByDate(classId, startDate, endDate);
      res.json({ classId, startDate, endDate, data });
    } catch (error) {
      sendError(res, error, "Gagal mengambil data alpa per tanggal");
    }
  };

  const getStudentAbsencesByDate = async (req, res) => {
    const { classId, date } = req.query;
    try {
      if (!requireDates(res, date)) return;
      const data = await attendanceModel.getStudentAbsencesByDate(classId, date);
      res.json({ classId, date, data });
    } catch (error) {
      sendError(res, error, "Gagal mengambil data siswa yang alpa");
    }
  };

  const getMonthlyAbsenceTrends = async (req, res) => {
    const { classId } = req.query;
    try {
      res.json({ classId, data: await attendanceModel.getMonthlyAbsenceTrends(classId) });
    } catch (error) {
      sendError(res, error, "Gagal mengambil data tren alpa bulanan");
    }
  };

  /** GET /attendance/missing?startDate=&endDate= (also accepts from/to). */
  const getMissingAttendanceByDateRange = async (req, res) => {
    const startDate = req.query.startDate || req.query.from;
    const endDate = req.query.endDate || req.query.to;
    try {
      if (!requireDates(res, startDate, endDate)) return;
      res.json(await attendanceModel.getMissingAttendanceByDateRange(startDate, endDate));
    } catch (error) {
      sendError(res, error, "Gagal mengambil data presensi yang hilang");
    }
  };

  const getStudentAbsencesByDayOfWeek = async (req, res) => {
    const { classId, startDate, endDate, dayOfWeek } = req.query;
    try {
      if (!dayOfWeek || !requireDates(res, startDate, endDate)) return;
      const data = await attendanceModel.getStudentAbsencesByDayOfWeek(
        classId,
        startDate,
        endDate,
        dayOfWeek,
      );
      res.json({ data });
    } catch (error) {
      sendError(res, error, "Gagal mengambil data siswa yang alpa per hari");
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
    getStudentAbsencesByDayOfWeek,
  };
};

export default attendanceControllerFactory;
