// backend/src/models/attendanceModel.js
const attendanceModelFactory = ({ pool }) => {
  // Get students by class
  const getStudentsByClass = async (classId) => {
    const [students] = await pool.query(
      `SELECT s.id, s.nisn, s.name
       FROM students s
       JOIN student_academic_history sah ON s.id = sah.student_id AND sah.is_current = 1
       WHERE sah.class_id = ? AND s.is_active = TRUE
       ORDER BY s.name`,
      [classId]
    );

    return students;
  };

  // Get attendance by date and class
  const getAttendanceByDateAndClass = async (date, classId) => {
    const [attendance] = await pool.query(
      `SELECT a.student_id, a.status, a.notes
       FROM attendances a
       JOIN student_academic_history sah ON a.student_id = sah.student_id AND sah.is_current = 1
       WHERE a.date = ? AND sah.class_id = ?`,
      [date, classId]
    );

    return attendance;
  };

  // Get attendance recap by period
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

  // Get attendance by student and date range
  const getAttendanceByStudentAndDateRange = async (
    studentId,
    startDate,
    endDate
  ) => {
    const [attendance] = await pool.query(
      `SELECT date, status, notes, recorded_at
       FROM attendances
       WHERE student_id = ? AND date BETWEEN ? AND ?
       ORDER BY date DESC`,
      [studentId, startDate, endDate]
    );

    return attendance;
  };

  // Get attendance statistics
  const getAttendanceStats = async (startDate, endDate) => {
    const [stats] = await pool.query(
      `SELECT 
        status,
        COUNT(*) as count
       FROM attendances
       WHERE date BETWEEN ? AND ?
       GROUP BY status`,
      [startDate, endDate]
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

  // Get today's attendance statistics
  const getTodayAttendanceStats = async (date) => {
    // Check if it's a holiday
    const [holidayCheck] = await pool.query(
      "SELECT COUNT(*) as count FROM school_holidays WHERE date = ?",
      [date]
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
      const key = `total${
        stat.status.charAt(0).toUpperCase() + stat.status.slice(1)
      }`;
      if (result.hasOwnProperty(key)) {
        result[key] = stat.count;
      }
    });

    return result;
  };

  // Get archived attendance data
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

  // Check existing attendance
  const checkExistingAttendance = async (date, classId) => {
    const [existing] = await pool.query(
      `SELECT a.student_id, a.status, a.notes
       FROM attendances a
       JOIN student_academic_history sah ON a.student_id = sah.student_id AND sah.is_current = 1
       WHERE a.date = ? AND sah.class_id = ?`,
      [date, classId]
    );

    return existing;
  };

  // Get attendance by date
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
      [date]
    );

    return attendance;
  };

  // Get classes
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
       ORDER BY c.academic_year DESC, c.name`
    );

    return classes;
  };

  // Get holidays
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

  // Get holiday by date
  const getHolidayByDate = async (date) => {
    const [holiday] = await pool.query(
      "SELECT * FROM school_holidays WHERE date = ?",
      [date]
    );

    return holiday[0] || null;
  };

  // Archive attendance data
  const archiveAttendanceData = async (academicYear, semester) => {
    // Get all students with their attendance data
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
      [semester, academicYear]
    );

    // Calculate percentage and insert into archive table
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
        ]
      );
    }

    return { success: true, message: "Data presensi berhasil diarsipkan" };
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
  };
};

export default attendanceModelFactory;
