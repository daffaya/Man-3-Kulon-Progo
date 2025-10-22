const attendanceModelFactory = ({ pool }) => {
  // Get students by class
  const getStudentsByClass = async (classId) => {
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

    return students;
  };

  // Get attendance by date and class
  const getAttendanceByDateAndClass = async (date, classId) => {
    const [attendance] = await pool.query(
      `
    SELECT a.student_id, a.status, a.notes
    FROM attendances a
    JOIN student_academic_history sah ON a.student_id = sah.student_id AND sah.is_current = 1
    WHERE a.date = ? AND sah.class_id = ?
  `,
      [date, classId]
    );

    return attendance;
  };

  // Get attendance recap
  const getAttendanceRecap = async (classId, period, startDate, endDate) => {
    let query = "";
    let queryParams = [];

    // Query berdasarkan periode (sama seperti di route)
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
    }

    const [recap] = await pool.query(query, queryParams);
    return recap;
  };

  // Archive attendance data
  const archiveAttendanceData = async (academicYear, semester) => {
    // Get all students with their attendance data
    const [students] = await pool.query(
      `
      SELECT 
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
      GROUP BY s.id, sah.class_id
    `,
      [semester, academicYear]
    );

    // Calculate percentage and insert into archive table
    for (const student of students) {
      const percentage =
        student.total_days > 0
          ? (student.total_hadir / student.total_days) * 100
          : 0;

      await pool.query(
        `
        INSERT INTO attendance_archives 
        (student_id, class_id, academic_year, semester, total_hadir, total_izin, total_sakit, total_alpa, total_libur, percentage_kehadiran)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        total_hadir = VALUES(total_hadir),
        total_izin = VALUES(total_izin),
        total_sakit = VALUES(total_sakit),
        total_alpa = VALUES(total_alpa),
        total_libur = VALUES(total_libur),
        percentage_kehadiran = VALUES(percentage_kehadiran),
        archived_at = CURRENT_TIMESTAMP
      `,
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
    archiveAttendanceData,
  };
};

export default attendanceModelFactory;
