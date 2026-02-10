/**
 * @fileoverview Data access layer for attendance-related operations.
 * This module provides a factory function to create an attendance model object with methods
 * for retrieving and managing attendance data in the database.
 */

/**
 * Creates an attendance model with methods to interact with the attendance database tables.
 * @param {object} options - The options object.
 * @param {mysql.Pool} options.pool - The database connection pool.
 * @returns {object} An object containing attendance model methods.
 */
const attendanceModelFactory = ({ pool }) => {
  /**
   * Retrieves all active students in a specific class.
   * @async
   * @param {number} classId - The ID of the class.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of student objects with id, nisn, and name.
   */
  const getStudentsByClass = async (classId) => {
    const [students] = await pool.query(
      `SELECT s.id, s.nisn, s.name
       FROM students s
       JOIN student_academic_history sah ON s.id = sah.student_id AND sah.is_current = 1
       WHERE sah.class_id = ? AND s.is_active = TRUE
       ORDER BY s.name`,
      [classId],
    );

    return students;
  };

  /**
   * Retrieves attendance records for a specific date and class.
   * @async
   * @param {string} date - The date in YYYY-MM-DD format.
   * @param {number} classId - The ID of the class.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of attendance objects.
   */
  const getAttendanceByDateAndClass = async (date, classId) => {
    const [attendance] = await pool.query(
      `SELECT a.student_id, a.status, a.notes
       FROM attendances a
       JOIN student_academic_history sah ON a.student_id = sah.student_id AND sah.is_current = 1
       WHERE a.date = ? AND sah.class_id = ?`,
      [date, classId],
    );

    return attendance;
  };

  /**
   * Retrieves attendance recapitulation for a class within a specific period.
   * @async
   * @param {number} classId - The ID of the class.
   * @param {string} period - The period type ('daily', 'monthly', or 'semester').
   * @param {string} startDate - The start date in YYYY-MM-DD format.
   * @param {string} endDate - The end date in YYYY-MM-DD format.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of attendance recap data.
   */
  const getAttendanceRecap = async (classId, period, startDate, endDate) => {
    let query = "";
    let queryParams = [];

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
          ORDER BY s.name`;
        queryParams = [startDate, classId];
        break;

      case "monthly":
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
          ORDER BY s.name`;
        queryParams = [startDate, endDate, classId];
        break;
    }

    const [recap] = await pool.query(query, queryParams);
    return recap;
  };

  /**
   * Retrieves attendance records for a specific student within a date range.
   * @async
   * @param {number} studentId - The ID of the student.
   * @param {string} startDate - The start date in YYYY-MM-DD format.
   * @param {string} endDate - The end date in YYYY-MM-DD format.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of attendance objects.
   */
  const getAttendanceByStudentAndDateRange = async (
    studentId,
    startDate,
    endDate,
  ) => {
    const [attendance] = await pool.query(
      `SELECT date, status, notes, recorded_at
       FROM attendances
       WHERE student_id = ? AND date BETWEEN ? AND ?
       ORDER BY date DESC`,
      [studentId, startDate, endDate],
    );

    return attendance;
  };

  /**
   * Retrieves attendance statistics for a specific date range.
   * @async
   * @param {string} startDate - The start date in YYYY-MM-DD format.
   * @param {string} endDate - The end date in YYYY-MM-DD format.
   * @returns {Promise<object>} A promise that resolves to an object containing attendance counts by status.
   */
  const getAttendanceStats = async (startDate, endDate) => {
    const [stats] = await pool.query(
      `SELECT 
        status,
        COUNT(*) as count
       FROM attendances
       WHERE date BETWEEN ? AND ?
       GROUP BY status`,
      [startDate, endDate],
    );

    const result = {
      totalHadir: 0,
      totalIzin: 0,
      totalSakit: 0,
      totalAlpa: 0,
      totalLibur: 0,
    };

    stats.forEach((stat) => {
      const key = `total${
        stat.status.charAt(0).toUpperCase() + stat.status.slice(1)
      }`;
      if (result.hasOwnProperty(key)) {
        result[key] = stat.count;
      }
    });

    return result;
  };

  /**
   * Retrieves attendance statistics for a specific date, considering holidays.
   * @async
   * @param {string} date - The date in YYYY-MM-DD format.
   * @returns {Promise<object>} A promise that resolves to an object containing attendance counts by status.
   */
  const getTodayAttendanceStats = async (date) => {
    const [holidayCheck] = await pool.query(
      "SELECT COUNT(*) as count FROM school_holidays WHERE date = ?",
      [date],
    );

    if (holidayCheck[0].count > 0) {
      return {
        totalHadir: 0,
        totalIzin: 0,
        totalSakit: 0,
        totalAlpa: 0,
        totalLibur: 1,
      };
    }

    const [stats] = await pool.query(
      `SELECT 
        status,
        COUNT(*) as count
       FROM attendances
       WHERE date = ?
       GROUP BY status`,
      [date],
    );

    const result = {
      totalHadir: 0,
      totalIzin: 0,
      totalSakit: 0,
      totalAlpa: 0,
      totalLibur: 0,
    };

    stats.forEach((stat) => {
      const key = `total${
        stat.status.charAt(0).toUpperCase() + stat.status.slice(1)
      }`;
      if (result.hasOwnProperty(key)) {
        result[key] = stat.count;
      }
    });

    return result;
  };

  /**
   * Retrieves archived attendance data with optional filtering.
   * @async
   * @param {string} [academicYear] - The academic year to filter by.
   * @param {string} [semester] - The semester to filter by.
   * @param {number} [classId] - The class ID to filter by.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of archived attendance records.
   */
  const getArchivedAttendanceData = async (academicYear, semester, classId) => {
    let query = `
      SELECT 
        aa.*,
        s.nisn,
        s.name,
        c.name as class_name
      FROM attendance_archives aa
      JOIN students s ON aa.student_id = s.id
      JOIN classes c ON aa.class_id = c.id
      WHERE 1=1`;

    const queryParams = [];

    if (academicYear) {
      query += " AND aa.academic_year = ?";
      queryParams.push(academicYear);
    }

    if (semester) {
      query += " AND aa.semester = ?";
      queryParams.push(semester);
    }

    if (classId) {
      query += " AND aa.class_id = ?";
      queryParams.push(classId);
    }

    query += " ORDER BY c.name, s.name";

    const [archives] = await pool.query(query, queryParams);
    return archives;
  };

  /**
   * Checks if attendance records already exist for a specific date and class.
   * @async
   * @param {string} date - The date in YYYY-MM-DD format.
   * @param {number} classId - The ID of the class.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of existing attendance records.
   */
  const checkExistingAttendance = async (date, classId) => {
    const [existing] = await pool.query(
      `SELECT a.student_id, a.status, a.notes
       FROM attendances a
       JOIN student_academic_history sah ON a.student_id = sah.student_id AND sah.is_current = 1
       WHERE a.date = ? AND sah.class_id = ?`,
      [date, classId],
    );

    return existing;
  };

  /**
   * Retrieves all attendance records for a specific date, including student and class information.
   * @async
   * @param {string} date - The date in YYYY-MM-DD format.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of attendance records with student and class details.
   */
  const getAttendanceByDate = async (date) => {
    const [attendance] = await pool.query(
      `SELECT 
        a.student_id,
        a.status,
        a.notes,
        s.nisn,
        s.name,
        c.name as class_name
       FROM attendances a
       JOIN students s ON a.student_id = s.id
       JOIN student_academic_history sah ON s.id = sah.student_id AND sah.is_current = 1
       JOIN classes c ON sah.class_id = c.id
       WHERE a.date = ?
       ORDER BY c.name, s.name`,
      [date],
    );

    return attendance;
  };

  /**
   * Retrieves all classes with their student counts.
   * @async
   * @returns {Promise<Array<object>>} A promise that resolves to an array of class objects with student counts.
   */
  const getClasses = async () => {
    const [classes] = await pool.query(
      `SELECT 
        c.id,
        c.name,
        c.academic_year,
        c.semester,
        COUNT(sah.student_id) as total_siswa
       FROM classes c
       LEFT JOIN student_academic_history sah ON c.id = sah.class_id AND sah.is_current = 1
       LEFT JOIN students s ON sah.student_id = s.id AND s.is_active = TRUE
       GROUP BY c.id
       ORDER BY c.academic_year DESC, c.name`,
    );

    return classes;
  };

  /**
   * Retrieves school holidays with optional filtering by academic year.
   * @async
   * @param {string} [academicYear] - The academic year to filter by.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of holiday objects.
   */
  const getHolidays = async (academicYear) => {
    let query = "SELECT * FROM school_holidays";
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
   * Retrieves a specific holiday by date.
   * @async
   * @param {string} date - The date in YYYY-MM-DD format.
   * @returns {Promise<object|null>} A promise that resolves to a holiday object or null if not found.
   */
  const getHolidayByDate = async (date) => {
    const [holiday] = await pool.query(
      "SELECT * FROM school_holidays WHERE date = ?",
      [date],
    );

    return holiday[0] || null;
  };

  /**
   * Archives attendance data for a specific academic year and semester.
   * @async
   * @param {string} academicYear - The academic year to archive.
   * @param {string} semester - The semester to archive.
   * @returns {Promise<object>} A promise that resolves to an object indicating the success of the operation.
   */
  const archiveAttendanceData = async (academicYear, semester) => {
    const [students] = await pool.query(
      `SELECT 
        s.id as student_id,
        sah.class_id,
        s.academic_year,
        ? as semester,
        COUNT(a.id) as total_days,
        SUM(CASE WHEN a.status = 'hadir' THEN 1 ELSE 0 END) as total_hadir,
        SUM(CASE WHEN a.status = 'izin' THEN 1 ELSE 0 END) as total_izin,
        SUM(CASE WHEN a.status = 'sakit' THEN 1 ELSE 0 END) as total_sakit,
        SUM(CASE WHEN a.status = 'alpa' THEN 1 ELSE 0 END) as total_alpa,
        SUM(CASE WHEN a.status = 'libur' THEN 1 ELSE 0 END) as total_libur
       FROM students s
       JOIN student_academic_history sah ON s.id = sah.student_id
       LEFT JOIN attendances a ON s.id = a.student_id
       WHERE s.academic_year = ? AND sah.is_current = 1
       GROUP BY s.id, sah.class_id`,
      [semester, academicYear],
    );

    for (const student of students) {
      const percentage =
        student.total_days > 0
          ? (student.total_hadir / student.total_days) * 100
          : 0;

      await pool.query(
        `INSERT INTO attendance_archives 
         (student_id, class_id, academic_year, semester, total_hadir, total_izin, total_sakit, total_alpa, total_libur, percentage_kehadiran)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           total_hadir = VALUES(total_hadir),
           total_izin = VALUES(total_izin),
           total_sakit = VALUES(total_sakit),
           total_alpa = VALUES(total_alpa),
           total_libur = VALUES(total_libur),
           percentage_kehadiran = VALUES(percentage_kehadiran),
           archived_at = CURRENT_TIMESTAMP`,
        [
          student.student_id,
          student.class_id,
          student.academic_year,
          semester,
          student.total_hadir,
          student.total_izin,
          student.total_sakit,
          student.total_alpa,
          student.total_libur,
          percentage,
        ],
      );
    }

    return { success: true, message: "Data presensi berhasil diarsipkan" };
  };

  /**
   * Retrieves absence data grouped by day of the week for a specific class and date range.
   * @async
   * @param {number} classId - The ID of the class.
   * @param {string} startDate - The start date in YYYY-MM-DD format.
   * @param {string} endDate - The end date in YYYY-MM-DD format.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of objects with day name and absence count.
   */
  const getAbsenceByDayOfWeek = async (classId, startDate, endDate) => {
    let query = `
    SELECT 
      DAYNAME(a.date) as day_name,
      DAYOFWEEK(a.date) as day_number,
      COUNT(*) as total_alpa,
      COUNT(*) * 100.0 / (
        SELECT COUNT(*) FROM attendances a2 
        JOIN student_academic_history sah2 ON a2.student_id = sah2.student_id AND sah2.is_current = 1 
        ${classId && classId !== "all" ? "WHERE sah2.class_id = ?" : ""}
      ) as percentage
     FROM attendances a
     JOIN student_academic_history sah ON a.student_id = sah.student_id AND sah.is_current = 1
     WHERE a.status = 'alpa' 
       AND a.date BETWEEN ? AND ?
       ${classId && classId !== "all" ? "AND sah.class_id = ?" : ""}
     GROUP BY DAYNAME(a.date), DAYOFWEEK(a.date)
     ORDER BY DAYOFWEEK(a.date)`;

    let params = [];
    if (classId && classId !== "all") {
      params = [classId, startDate, endDate, classId];
    } else {
      params = [startDate, endDate];
    }

    const [absences] = await pool.query(query, params);

    // Map day numbers to Indonesian day names
    const dayNames = {
      1: "Minggu",
      2: "Senin",
      3: "Selasa",
      4: "Rabu",
      5: "Kamis",
      6: "Jumat",
      7: "Sabtu",
    };

    return absences.map((absence) => ({
      ...absence,
      day_name: dayNames[absence.day_number] || absence.day_name,
      percentage: parseFloat(Number(absence.percentage || 0).toFixed(2)),
    }));
  };

  /**
   * Retrieves absence data for each calendar date in a date range.
   * BEST PRACTICE VERSION: Only returns dates that have attendance records.
   * Frontend will handle generating all dates in the range and filling in zeros.
   * @async
   * @param {number} classId - The ID of the class.
   * @param {string} startDate - The start date in YYYY-MM-DD format.
   * @param {string} endDate - The end date in YYYY-MM-DD format.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of objects with date and absence count.
   */
  const getAbsenceByDate = async (classId, startDate, endDate) => {
    let query = `
      SELECT 
        DATE_FORMAT(a.date, '%Y-%m-%d') as date,
        COUNT(CASE WHEN a.status = 'alpa' THEN 1 END) as total_alpa,
        COUNT(*) as total_attendance,
        ROUND(COUNT(CASE WHEN a.status = 'alpa' THEN 1 END) * 100.0 / COUNT(*), 2) as percentage
      FROM attendances a
      JOIN student_academic_history sah ON a.student_id = sah.student_id AND sah.is_current = 1
      WHERE a.date BETWEEN ? AND ?
        ${classId && classId !== "all" ? "AND sah.class_id = ?" : ""}
      GROUP BY a.date
      ORDER BY a.date`;

    let params = [];
    if (classId && classId !== "all") {
      params = [startDate, endDate, classId];
    } else {
      params = [startDate, endDate];
    }

    const [absences] = await pool.query(query, params);

    return absences.map((absence) => ({
      date: absence.date,
      total_alpa: Number(absence.total_alpa) || 0,
      total_attendance: Number(absence.total_attendance) || 0,
      percentage: parseFloat(Number(absence.percentage || 0).toFixed(2)),
    }));
  };

  /**
   * Retrieves detailed student absence data for a specific date.
   * @async
   * @param {number} classId - The ID of the class.
   * @param {string} date - The date in YYYY-MM-DD format.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of student objects with absence details.
   */
  const getStudentAbsencesByDate = async (classId, date) => {
    let query = `
    SELECT 
      s.id,
      s.nisn,
      s.name,
      a.notes,
      a.updated_at,
      c.name as class_name
    FROM attendances a
    JOIN students s ON a.student_id = s.id
    JOIN student_academic_history sah ON s.id = sah.student_id AND sah.is_current = 1
    JOIN classes c ON sah.class_id = c.id
    WHERE a.status = 'alpa' 
      AND a.date = ?
      ${classId && classId !== "all" ? "AND sah.class_id = ?" : ""}
    ORDER BY c.name, s.name`;

    let params = [date];
    if (classId && classId !== "all") {
      params.push(classId);
    }

    const [students] = await pool.query(query, params);
    return students;
  };

  /**
   * Retrieves monthly absence trends for a specific class.
   * FIXED VERSION - Properly formats month names without undefined field.
   * @async
   * @param {number} classId - The ID of the class.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of monthly absence data.
   */
  const getMonthlyAbsenceTrends = async (classId) => {
    let query = `
    SELECT 
      MONTH(a.date) as month,
      YEAR(a.date) as year,
      COUNT(*) as total_alpa,
      COUNT(*) * 100.0 / (
        SELECT COUNT(*) FROM attendances a2 
        JOIN student_academic_history sah2 ON a2.student_id = sah2.student_id AND sah2.is_current = 1 
        WHERE MONTH(a2.date) = MONTH(a.date) AND YEAR(a2.date) = YEAR(a.date)
        ${classId && classId !== "all" ? "AND sah2.class_id = ?" : ""}
      ) as percentage
     FROM attendances a
     JOIN student_academic_history sah ON a.student_id = sah.student_id AND sah.is_current = 1
     WHERE a.status = 'alpa' 
       ${classId && classId !== "all" ? "AND sah.class_id = ?" : ""}
     GROUP BY MONTH(a.date), YEAR(a.date)
     ORDER BY YEAR(a.date), MONTH(a.date)`;

    let params = [];
    if (classId && classId !== "all") {
      params = [classId, classId];
    }

    const [trends] = await pool.query(query, params);

    // Map month numbers to Indonesian month names
    const monthNames = [
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

    return trends.map((trend) => ({
      ...trend,
      month_name: `${monthNames[trend.month - 1]} ${trend.year}`,
      percentage: parseFloat(Number(trend.percentage || 0).toFixed(2)),
    }));
  };

  return {
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
    archiveAttendanceData,
    getAbsenceByDayOfWeek,
    getAbsenceByDate,
    getStudentAbsencesByDate,
    getMonthlyAbsenceTrends,
  };
};

export default attendanceModelFactory;
