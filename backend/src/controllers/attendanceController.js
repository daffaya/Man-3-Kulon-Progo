// src/controllers/attendanceController.js
const attendanceControllerFactory = ({ pool }) => {
  // Save attendance data
  const saveAttendance = async (req, res) => {
    const { classId, date, attendances } = req.body;

    try {
      // Check if it's a holiday
      const [holidayCheck] = await pool.query(
        "SELECT COUNT(*) as count FROM school_holidays WHERE date = ?",
        [date]
      );

      if (holidayCheck[0].count > 0) {
        return res.status(400).json({ error: "Tanggal ini adalah hari libur" });
      }

      if (!Array.isArray(attendances) || attendances.length === 0) {
        return res.status(400).json({
          error:
            "Tidak ada data presensi yang disimpan. Pastikan ada siswa di kelas ini.",
        });
      }

      // Get connection for transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Delete existing attendance data for this date and class
        await connection.query(
          `DELETE a FROM attendances a
           JOIN student_academic_history sah ON a.student_id = sah.student_id AND sah.is_current = 1
           WHERE a.date = ? AND sah.class_id = ?`,
          [date, classId]
        );

        // Prepare values for insert
        const values = attendances.map((att) => [
          att.studentId,
          date,
          att.status,
          att.notes || null,
          req.user.id,
        ]);

        // Insert new attendance data
        const [result] = await connection.query(
          "INSERT INTO attendances (student_id, date, status, notes, recorded_by) VALUES ?",
          [values]
        );

        // Commit transaction
        await connection.commit();

        res.json({
          success: true,
          message: "Data presensi berhasil disimpan",
          affectedRows: result.affectedRows,
        });
      } catch (error) {
        // Rollback on error
        await connection.rollback();
        throw error;
      } finally {
        // Release connection
        connection.release();
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      res.status(500).json({ error: "Gagal menyimpan data presensi" });
    }
  };

  // Get attendance by date and class
  const getAttendanceByDateAndClass = async (req, res) => {
    const { classId, date } = req.query;

    try {
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
      console.error("Error fetching attendance:", error);
      res.status(500).json({ error: "Gagal mengambil data presensi" });
    }
  };

  // Get students by class
  const getStudentsByClass = async (req, res) => {
    const { classId } = req.query;

    try {
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
      console.error("Error fetching students:", error);
      res.status(500).json({ error: "Gagal mengambil data siswa" });
    }
  };

  // Get attendance recap
  const getAttendanceRecap = async (req, res) => {
    const { classId, period, startDate, endDate } = req.query;

    try {
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

  return {
    saveAttendance,
    getAttendanceByDateAndClass,
    getStudentsByClass,
    getAttendanceRecap,
  };
};

export default attendanceControllerFactory;
