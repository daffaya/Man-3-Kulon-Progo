/**
 * @fileoverview Data access layer for attendance.
 *
 * Model (see docs/Dokumen Desain Sistem Presensi):
 *  - A student's class on a date comes from `student_enrollments`
 *    (start_date inclusive, end_date exclusive) — R2.
 *  - Every attendance row carries a snapshot `class_id`, so history never
 *    moves when a student changes class.
 *  - Percentages are computed over recorded, non-`libur` days.
 */
import academicYearServiceFactory, { resolveAcademicYear } from "../services/academicYearService.js";
import { addDays, diffDays, isoWeekday, todayStr } from "../utils/dateUtils.js";

const DAY_NAMES = {
  1: "Minggu",
  2: "Senin",
  3: "Selasa",
  4: "Rabu",
  5: "Kamis",
  6: "Jumat",
  7: "Sabtu",
};

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DEFAULT_SCHOOL_DAYS = [1, 2, 3, 4, 5];

const emptyStats = () => ({
  totalHadir: 0,
  totalIzin: 0,
  totalSakit: 0,
  totalAlpa: 0,
  totalLibur: 0,
});

const hasClass = (classId) => classId && classId !== "all";

/**
 * @param {object} options
 * @param {mysql.Pool} options.pool
 * @param {() => Date} [options.now] - Injectable clock (tests).
 */
const attendanceModelFactory = ({ pool, now = () => new Date() }) => {
  const yearService = academicYearServiceFactory({ pool, now });

  /**
   * R2: roster of a class on a date — enrollments covering the date,
   * excluding soft-deleted students.
   */
  const getRoster = async (classId, date, executor = pool) => {
    const [students] = await executor.query(
      `SELECT s.id, s.nisn, s.name
         FROM student_enrollments e
         JOIN students s ON s.id = e.student_id AND s.is_deleted = 0
        WHERE e.class_id = ?
          AND e.start_date <= ?
          AND (e.end_date IS NULL OR e.end_date > ?)
        ORDER BY s.name`,
      [classId, date, date],
    );
    return students;
  };

  // Kept for the existing route/controller name.
  const getStudentsByClass = (classId, date = todayStr(now())) => getRoster(classId, date);

  /**
   * Classes of the academic year that contains `date` (default: today), with
   * the roster size on that date. Only that year's classes are returned (B6).
   */
  const getClasses = async (date = todayStr(now())) => {
    const { year } = await yearService.resolveForDate(date);
    if (!year) return [];

    const [classes] = await pool.query(
      `SELECT c.id, c.name, c.grade_level, c.academic_year, c.semester,
              COUNT(s.id) AS student_count
         FROM classes c
         LEFT JOIN student_enrollments e
                ON e.class_id = c.id
               AND e.start_date <= ?
               AND (e.end_date IS NULL OR e.end_date > ?)
         LEFT JOIN students s ON s.id = e.student_id AND s.is_deleted = 0
        WHERE c.academic_year_id = ?
        GROUP BY c.id
        ORDER BY c.grade_level, c.name`,
      [date, date, year.id],
    );

    return classes.map((c) => ({
      ...c,
      student_count: Number(c.student_count),
      total_siswa: Number(c.student_count), // legacy field name used by the UI
    }));
  };

  const getAttendanceByDateAndClass = async (date, classId) => {
    const [attendance] = await pool.query(
      `SELECT student_id, class_id, status, notes
         FROM attendances
        WHERE date = ? AND class_id = ?`,
      [date, classId],
    );
    return attendance;
  };

  const checkExistingAttendance = getAttendanceByDateAndClass;

  /**
   * Recap of a class. daily: one row per roster student for the date.
   * monthly/semester: totals per student over [startDate, endDate]; the
   * student list is everyone enrolled in the class during that range, counts
   * use the class snapshot on each row; percentage is over recorded
   * non-`libur` days (B10).
   */
  const getAttendanceRecap = async (classId, period, startDate, endDate) => {
    if (period === "daily") {
      const [rows] = await pool.query(
        `SELECT s.id, s.nisn, s.name,
                DATE_FORMAT(a.date, '%Y-%m-%d') AS date, a.status, a.notes
           FROM student_enrollments e
           JOIN students s ON s.id = e.student_id AND s.is_deleted = 0
           LEFT JOIN attendances a ON a.student_id = s.id AND a.date = ? AND a.class_id = e.class_id
          WHERE e.class_id = ?
            AND e.start_date <= ?
            AND (e.end_date IS NULL OR e.end_date > ?)
          ORDER BY s.name`,
        [startDate, classId, startDate, startDate],
      );
      return rows;
    }

    const to = endDate || startDate;
    const [rows] = await pool.query(
      `SELECT s.id, s.nisn, s.name,
              COUNT(a.id) AS total_hari,
              COALESCE(SUM(a.status = 'hadir'), 0) AS hadir,
              COALESCE(SUM(a.status = 'izin'), 0) AS izin,
              COALESCE(SUM(a.status = 'sakit'), 0) AS sakit,
              COALESCE(SUM(a.status = 'alpa'), 0) AS alpa,
              CASE WHEN COUNT(a.id) = 0 THEN NULL
                   ELSE ROUND(SUM(a.status = 'hadir') / COUNT(a.id) * 100, 2) END AS persentase_kehadiran
         FROM students s
         LEFT JOIN attendances a
                ON a.student_id = s.id AND a.class_id = ?
               AND a.date BETWEEN ? AND ? AND a.status <> 'libur'
        WHERE s.is_deleted = 0
          AND s.id IN (
                SELECT e.student_id FROM student_enrollments e
                 WHERE e.class_id = ?
                   AND e.start_date <= ?
                   AND (e.end_date IS NULL OR e.end_date > ?))
        GROUP BY s.id, s.nisn, s.name
        ORDER BY s.name`,
      [classId, startDate, to, classId, to, startDate],
    );

    return rows.map((r) => ({
      ...r,
      total_hari: Number(r.total_hari),
      hadir: Number(r.hadir),
      izin: Number(r.izin),
      sakit: Number(r.sakit),
      alpa: Number(r.alpa),
      persentase_kehadiran:
        r.persentase_kehadiran === null ? null : Number(r.persentase_kehadiran),
    }));
  };

  const getAttendanceByStudentAndDateRange = async (studentId, startDate, endDate) => {
    const [attendance] = await pool.query(
      `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date, class_id, status, notes,
              updated_at AS recorded_at
         FROM attendances
        WHERE student_id = ? AND date BETWEEN ? AND ?
        ORDER BY date DESC`,
      [studentId, startDate, endDate],
    );
    return attendance;
  };

  const foldStats = (rows) => {
    const result = emptyStats();
    rows.forEach((row) => {
      const key = `total${row.status.charAt(0).toUpperCase() + row.status.slice(1)}`;
      if (Object.prototype.hasOwnProperty.call(result, key)) result[key] = Number(row.count);
    });
    return result;
  };

  const getAttendanceStats = async (startDate, endDate) => {
    const [stats] = await pool.query(
      `SELECT status, COUNT(*) AS count FROM attendances
        WHERE date BETWEEN ? AND ? GROUP BY status`,
      [startDate, endDate],
    );
    return foldStats(stats);
  };

  const getHolidayByDate = async (date) => {
    const [holiday] = await pool.query(
      `SELECT id, DATE_FORMAT(date, '%Y-%m-%d') AS date, description, academic_year
         FROM school_holidays WHERE date = ?`,
      [date],
    );
    return holiday[0] || null;
  };

  const getTodayAttendanceStats = async (date) => {
    if (await getHolidayByDate(date)) {
      return { ...emptyStats(), totalLibur: 1 };
    }
    const [stats] = await pool.query(
      `SELECT status, COUNT(*) AS count FROM attendances WHERE date = ? GROUP BY status`,
      [date],
    );
    return foldStats(stats);
  };

  const getHolidays = async (academicYear) => {
    let query = `SELECT id, DATE_FORMAT(date, '%Y-%m-%d') AS date, description, academic_year
                   FROM school_holidays`;
    const params = [];
    if (academicYear) {
      query += " WHERE academic_year = ?";
      params.push(academicYear);
    }
    query += " ORDER BY date";
    const [holidays] = await pool.query(query, params);
    return holidays;
  };

  /**
   * Adds a holiday; the academic year is derived from the date on the server
   * (the client-supplied year is ignored). Returns null if the date is
   * outside every academic year.
   */
  const addHoliday = async (date, description) => {
    const { year, exact } = await yearService.resolveForDate(date);
    if (!year || !exact) return { error: "outside_year" };
    await pool.query(
      "INSERT INTO school_holidays (date, description, academic_year) VALUES (?, ?, ?)",
      [date, description, year.label],
    );
    return { academic_year: year.label };
  };

  const getAttendanceByDate = async (date) => {
    const [attendance] = await pool.query(
      `SELECT a.student_id, a.class_id, a.status, a.notes, s.nisn, s.name, c.name AS class_name
         FROM attendances a
         JOIN students s ON s.id = a.student_id
         JOIN classes c ON c.id = a.class_id
        WHERE a.date = ?
        ORDER BY c.name, s.name`,
      [date],
    );
    return attendance;
  };

  const getArchivedAttendanceData = async (academicYear, semester, classId) => {
    let query = `
      SELECT aa.*, s.nisn, s.name, c.name AS class_name
        FROM attendance_archives aa
        JOIN students s ON aa.student_id = s.id
        JOIN classes c ON aa.class_id = c.id
       WHERE 1=1`;
    const params = [];
    if (academicYear) {
      query += " AND aa.academic_year = ?";
      params.push(academicYear);
    }
    if (semester) {
      query += " AND aa.semester = ?";
      params.push(semester);
    }
    if (classId) {
      query += " AND aa.class_id = ?";
      params.push(classId);
    }
    query += " ORDER BY c.name, s.name";
    const [archives] = await pool.query(query, params);
    return archives;
  };

  /**
   * Snapshot of a semester computed straight from attendance rows (B7):
   * ganjil = Jul–Dec of the academic year's start year, genap = Jan–Jun of
   * the following year. A student who changed class is archived under the
   * class of their latest row in the semester.
   */
  const archiveAttendanceData = async (academicYear, semester) => {
    const startYear = Number(String(academicYear).slice(0, 4));
    const range =
      semester === "ganjil"
        ? [`${startYear}-07-01`, `${startYear}-12-31`]
        : [`${startYear + 1}-01-01`, `${startYear + 1}-06-30`];

    const [result] = await pool.query(
      `INSERT INTO attendance_archives
         (student_id, class_id, academic_year, semester, total_hadir, total_izin,
          total_sakit, total_alpa, total_libur, percentage_kehadiran)
       SELECT a.student_id,
              CAST(SUBSTRING_INDEX(GROUP_CONCAT(a.class_id ORDER BY a.date DESC), ',', 1) AS UNSIGNED),
              ?, ?,
              SUM(a.status = 'hadir'), SUM(a.status = 'izin'), SUM(a.status = 'sakit'),
              SUM(a.status = 'alpa'), SUM(a.status = 'libur'),
              CASE WHEN SUM(a.status <> 'libur') = 0 THEN NULL
                   ELSE ROUND(SUM(a.status = 'hadir') / SUM(a.status <> 'libur') * 100, 2) END
         FROM attendances a
        WHERE a.date BETWEEN ? AND ? AND a.class_id IS NOT NULL
        GROUP BY a.student_id
       ON DUPLICATE KEY UPDATE
         class_id = VALUES(class_id),
         total_hadir = VALUES(total_hadir),
         total_izin = VALUES(total_izin),
         total_sakit = VALUES(total_sakit),
         total_alpa = VALUES(total_alpa),
         total_libur = VALUES(total_libur),
         percentage_kehadiran = VALUES(percentage_kehadiran),
         archived_at = CURRENT_TIMESTAMP`,
      [academicYear, semester, range[0], range[1]],
    );

    return {
      success: true,
      message: "Data presensi berhasil diarsipkan",
      affectedRows: result.affectedRows,
    };
  };

  // ---- absence analysis (class filter = snapshot class_id) -----------------

  const classClause = (classId, params, alias = "a") => {
    if (!hasClass(classId)) return "";
    params.push(classId);
    return ` AND ${alias}.class_id = ?`;
  };

  const getAbsenceByDayOfWeek = async (classId, startDate, endDate) => {
    const params = [startDate, endDate];
    const clause = classClause(classId, params);
    const [total] = await pool.query(
      `SELECT COUNT(*) AS total FROM attendances a
        WHERE a.status <> 'libur' AND a.date BETWEEN ? AND ?${clause}`,
      params,
    );
    const denominator = Number(total[0]?.total) || 0;

    const params2 = [startDate, endDate];
    const clause2 = classClause(classId, params2);
    const [absences] = await pool.query(
      `SELECT DAYOFWEEK(a.date) AS day_number, COUNT(*) AS total_alpa
         FROM attendances a
        WHERE a.status = 'alpa' AND a.date BETWEEN ? AND ?${clause2}
        GROUP BY DAYOFWEEK(a.date)
        ORDER BY DAYOFWEEK(a.date)`,
      params2,
    );

    return absences.map((row) => ({
      day_number: row.day_number,
      day_name: DAY_NAMES[row.day_number],
      total_alpa: Number(row.total_alpa),
      percentage: denominator
        ? parseFloat(((Number(row.total_alpa) * 100) / denominator).toFixed(2))
        : 0,
    }));
  };

  /** Only dates that have attendance rows; the client fills in the zeros. */
  const getAbsenceByDate = async (classId, startDate, endDate) => {
    const params = [startDate, endDate];
    const clause = classClause(classId, params);
    const [absences] = await pool.query(
      `SELECT DATE_FORMAT(a.date, '%Y-%m-%d') AS date,
              SUM(a.status = 'alpa') AS total_alpa,
              COUNT(*) AS total_attendance
         FROM attendances a
        WHERE a.status <> 'libur' AND a.date BETWEEN ? AND ?${clause}
        GROUP BY a.date
        ORDER BY a.date`,
      params,
    );
    return absences.map((row) => {
      const alpa = Number(row.total_alpa) || 0;
      const total = Number(row.total_attendance) || 0;
      return {
        date: row.date,
        total_alpa: alpa,
        total_attendance: total,
        percentage: total ? parseFloat(((alpa * 100) / total).toFixed(2)) : 0,
      };
    });
  };

  const getStudentAbsencesByDate = async (classId, date) => {
    const params = [date];
    const clause = classClause(classId, params);
    const [students] = await pool.query(
      `SELECT s.id, s.nisn, s.name, a.notes, a.updated_at, c.name AS class_name
         FROM attendances a
         JOIN students s ON s.id = a.student_id
         JOIN classes c ON c.id = a.class_id
        WHERE a.status = 'alpa' AND a.date = ?${clause}
        ORDER BY c.name, s.name`,
      params,
    );
    return students;
  };

  const getMonthlyAbsenceTrends = async (classId) => {
    const params = [];
    const clause = classClause(classId, params);
    const [trends] = await pool.query(
      `SELECT MONTH(a.date) AS month, YEAR(a.date) AS year,
              SUM(a.status = 'alpa') AS total_alpa, COUNT(*) AS total
         FROM attendances a
        WHERE a.status <> 'libur'${clause}
        GROUP BY YEAR(a.date), MONTH(a.date)
        HAVING SUM(a.status = 'alpa') > 0
        ORDER BY YEAR(a.date), MONTH(a.date)`,
      params,
    );
    return trends.map((t) => ({
      month: t.month,
      year: t.year,
      total_alpa: Number(t.total_alpa),
      month_name: `${MONTH_NAMES[t.month - 1]} ${t.year}`,
      percentage: t.total ? parseFloat(((Number(t.total_alpa) * 100) / Number(t.total)).toFixed(2)) : 0,
    }));
  };

  const getStudentAbsencesByDayOfWeek = async (classId, startDate, endDate, dayOfWeek) => {
    const params = [dayOfWeek, startDate, endDate];
    const clause = classClause(classId, params);
    const [students] = await pool.query(
      `SELECT DISTINCT s.id, s.nisn, s.name, c.name AS class_name
         FROM attendances a
         JOIN students s ON s.id = a.student_id
         JOIN classes c ON c.id = a.class_id
        WHERE a.status = 'alpa' AND DAYOFWEEK(a.date) = ? AND a.date BETWEEN ? AND ?${clause}
        ORDER BY c.name, s.name`,
      params,
    );
    return students;
  };

  // ---- missing attendance ---------------------------------------------------

  const getSchoolDays = async () => {
    try {
      const [rows] = await pool.query(
        "SELECT value FROM attendance_system_settings WHERE `key` = 'school_days'",
      );
      const parsed = String(rows[0]?.value || "")
        .split(",")
        .map((n) => Number(n.trim()))
        .filter((n) => n >= 1 && n <= 7);
      return parsed.length ? parsed : DEFAULT_SCHOOL_DAYS;
    } catch {
      return DEFAULT_SCHOOL_DAYS;
    }
  };

  /**
   * Classes that have no attendance on each school day (R3) in the range.
   * Only classes of the year containing that date, only classes that have a
   * roster on that date, and never future days. Constant number of queries.
   * @returns {Promise<Object<string, {id:number,name:string}[]>>}
   */
  const getMissingAttendanceByDateRange = async (startDate, endDate) => {
    const lastDay = todayStr(now());
    const effectiveEnd = endDate < lastDay ? endDate : lastDay;
    if (startDate > effectiveEnd) return {};

    const [holidays] = await pool.query(
      "SELECT DATE_FORMAT(date, '%Y-%m-%d') AS d FROM school_holidays WHERE date BETWEEN ? AND ?",
      [startDate, effectiveEnd],
    );
    const holidayDates = new Set(holidays.map((h) => h.d));

    const years = await yearService.list();
    const schoolDays = await getSchoolDays();

    const [classes] = await pool.query(
      `SELECT c.id, c.name, c.academic_year_id, c.grade_level FROM classes c
        ORDER BY c.grade_level, c.name`,
    );

    const [intervals] = await pool.query(
      `SELECT e.class_id,
              DATE_FORMAT(e.start_date, '%Y-%m-%d') AS start_date,
              DATE_FORMAT(e.end_date, '%Y-%m-%d') AS end_date
         FROM student_enrollments e
         JOIN students s ON s.id = e.student_id AND s.is_deleted = 0
        WHERE e.start_date <= ? AND (e.end_date IS NULL OR e.end_date > ?)`,
      [effectiveEnd, startDate],
    );
    const intervalsByClass = new Map();
    intervals.forEach((i) => {
      if (!intervalsByClass.has(i.class_id)) intervalsByClass.set(i.class_id, []);
      intervalsByClass.get(i.class_id).push(i);
    });

    const [existing] = await pool.query(
      `SELECT DISTINCT DATE_FORMAT(date, '%Y-%m-%d') AS date_str, class_id
         FROM attendances WHERE date BETWEEN ? AND ? AND class_id IS NOT NULL`,
      [startDate, effectiveEnd],
    );
    const attendedSet = new Set(existing.map((r) => `${r.date_str}_${r.class_id}`));

    const results = {};
    const days = diffDays(startDate, effectiveEnd);
    for (let i = 0; i <= days; i++) {
      const dateStr = addDays(startDate, i);
      if (!schoolDays.includes(isoWeekday(dateStr)) || holidayDates.has(dateStr)) continue;

      const { year, exact } = resolveAcademicYear(years, dateStr);
      if (!year || !exact) continue;

      const missing = [];
      for (const c of classes) {
        if (c.academic_year_id !== year.id) continue;
        const hasRoster = (intervalsByClass.get(c.id) || []).some(
          (iv) => iv.start_date <= dateStr && (iv.end_date === null || iv.end_date > dateStr),
        );
        if (!hasRoster) continue;
        if (!attendedSet.has(`${dateStr}_${c.id}`)) missing.push({ id: c.id, name: c.name });
      }
      if (missing.length > 0) results[dateStr] = missing;
    }
    return results;
  };

  return {
    getRoster,
    getStudentsByClass,
    getAttendanceByDateAndClass,
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
    addHoliday,
    archiveAttendanceData,
    getAbsenceByDayOfWeek,
    getAbsenceByDate,
    getStudentAbsencesByDate,
    getMonthlyAbsenceTrends,
    getMissingAttendanceByDateRange,
    getStudentAbsencesByDayOfWeek,
    getSchoolDays,
  };
};

export default attendanceModelFactory;
