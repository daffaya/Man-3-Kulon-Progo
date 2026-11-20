/**
 * @fileoverview Student lifecycle on top of `student_enrollments`:
 * create (with first enrollment), transfer between classes (R5, B11),
 * leave school, and the legacy `student_academic_history` sync.
 *
 * Legacy sync: `student_academic_history` / `is_current` is kept up to date
 * as a rollback safety net and for code that still reads it (e.g. public
 * student statistics). New logic must NOT read it — use enrollments.
 */
import academicYearServiceFactory, { computeAngkatan } from "./academicYearService.js";
import { HttpError } from "../utils/errorResponse.js";
import { addDays, isValidDateStr, todayStr } from "../utils/dateUtils.js";

/** Clamp a date into [year.start_date, year.end_date - 1 day]. */
export const clampToYear = (dateStr, year) => {
  const lastDay = addDays(year.end_date, -1);
  if (dateStr < year.start_date) return year.start_date;
  if (dateStr > lastDay) return lastDay;
  return dateStr;
};

/**
 * Writes the legacy history row for (student, year) and flips is_current so
 * exactly this row is current. UNIQUE(student_id, academic_year) means a
 * same-year class change updates the row instead of inserting (B11).
 */
export const syncLegacyHistory = async (conn, { studentId, classId, yearLabel, angkatan }) => {
  await conn.query("UPDATE student_academic_history SET is_current = 0 WHERE student_id = ?", [
    studentId,
  ]);
  await conn.query(
    `INSERT INTO student_academic_history (student_id, class_id, academic_year, is_current, angkatan)
     VALUES (?, ?, ?, 1, ?)
     ON DUPLICATE KEY UPDATE class_id = VALUES(class_id), is_current = 1,
       angkatan = COALESCE(student_academic_history.angkatan, VALUES(angkatan))`,
    [studentId, classId, yearLabel, angkatan || null],
  );
};

export const closeLegacyHistory = async (conn, studentId) => {
  await conn.query("UPDATE student_academic_history SET is_current = 0 WHERE student_id = ?", [
    studentId,
  ]);
};

/**
 * Moves a student's OPEN enrollment to `toClass` effective `effectiveDate`.
 * - no open enrollment      -> just opens one
 * - effective <= its start   -> changes the class in place (wrong-class correction)
 * - otherwise                -> closes it at the effective date with `reason`
 *                               and opens a new one (end exclusive = start of new)
 * Attendance rows on/after the effective date get the new class snapshot;
 * earlier rows are untouched. Legacy history is kept in sync.
 * Must run inside the caller's transaction.
 */
export const moveEnrollment = async (
  conn,
  { studentId, toClass, effectiveDate, reason = "transferred_class", angkatan = null },
) => {
  const [open] = await conn.query(
    `SELECT id, DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date
       FROM student_enrollments WHERE student_id = ? AND end_date IS NULL FOR UPDATE`,
    [studentId],
  );
  const current = open[0];
  let correctedInPlace = false;

  if (!current) {
    await conn.query(
      "INSERT INTO student_enrollments (student_id, class_id, start_date) VALUES (?, ?, ?)",
      [studentId, toClass.id, effectiveDate],
    );
  } else if (effectiveDate <= current.start_date) {
    await conn.query("UPDATE student_enrollments SET class_id = ? WHERE id = ?", [
      toClass.id,
      current.id,
    ]);
    correctedInPlace = true;
  } else {
    await conn.query(
      "UPDATE student_enrollments SET end_date = ?, end_reason = ? WHERE id = ?",
      [effectiveDate, reason, current.id],
    );
    await conn.query(
      "INSERT INTO student_enrollments (student_id, class_id, start_date) VALUES (?, ?, ?)",
      [studentId, toClass.id, effectiveDate],
    );
  }

  const [moved] = await conn.query(
    "UPDATE attendances SET class_id = ? WHERE student_id = ? AND date >= ?",
    [toClass.id, studentId, effectiveDate],
  );
  await syncLegacyHistory(conn, {
    studentId,
    classId: toClass.id,
    yearLabel: toClass.academic_year,
    angkatan,
  });

  return { correctedInPlace, attendanceRowsUpdated: moved.affectedRows };
};

const studentLifecycleServiceFactory = ({ pool, now = () => new Date() }) => {
  const yearService = academicYearServiceFactory({ pool, now });

  const withTransaction = async (fn) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const result = await fn(conn);
      await conn.commit();
      return result;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  };

  const getClass = async (classId, conn = pool) => {
    const [rows] = await conn.query(
      `SELECT c.id, c.name, c.grade_level, c.academic_year, c.academic_year_id
         FROM classes c WHERE c.id = ?`,
      [classId],
    );
    return rows[0] || null;
  };

  const getYearOfClass = async (cls, conn = pool) =>
    yearService.getById(cls.academic_year_id, conn);

  /**
   * Creates a student and the first enrollment. The student's `academic_year`
   * is the class's year (never a hardcoded fallback); `angkatan` is computed
   * (R7) unless supplied.
   */
  const createStudent = async (data) => {
    const cls = await getClass(Number(data.class_id));
    if (!cls) throw new HttpError(422, "Kelas tidak ditemukan");
    const year = await getYearOfClass(cls);
    const startDate = clampToYear(todayStr(now()), year);
    const angkatan = data.angkatan || computeAngkatan(year.label, cls.grade_level);

    return withTransaction(async (conn) => {
      const [dup] = await conn.query("SELECT id, is_deleted FROM students WHERE nisn = ?", [
        data.nisn,
      ]);
      if (dup.length > 0) {
        throw new HttpError(
          409,
          dup[0].is_deleted ? "NISN pernah terdaftar dan sudah dihapus" : "NISN sudah terdaftar",
        );
      }

      const [result] = await conn.query(
        `INSERT INTO students
           (nisn, name, jenis_kelamin, academic_year, is_active, is_deleted,
            nik, birth_place, birth_date, address, phone, parent_name, angkatan)
         VALUES (?, ?, ?, ?, 1, 0, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.nisn,
          data.name,
          data.jenis_kelamin || null,
          year.label,
          data.nik || null,
          data.birth_place || null,
          data.birth_date || null,
          data.address || null,
          data.phone || null,
          data.parent_name || null,
          angkatan,
        ],
      );
      const studentId = result.insertId;

      await conn.query(
        "INSERT INTO student_enrollments (student_id, class_id, start_date) VALUES (?, ?, ?)",
        [studentId, cls.id, startDate],
      );
      await syncLegacyHistory(conn, {
        studentId,
        classId: cls.id,
        yearLabel: year.label,
        angkatan,
      });

      return { id: studentId, academic_year: year.label, angkatan, class_id: cls.id, start_date: startDate };
    });
  };

  /**
   * R5 transfer. Same grade level and same academic year only. If the
   * effective date equals the current enrollment's start, it is treated as a
   * wrong-class correction (class changed in place). Attendance rows on/after
   * the effective date get the new class snapshot; earlier rows are untouched.
   */
  const transferStudent = async (studentId, { to_class_id, effective_date }) => {
    if (!isValidDateStr(effective_date)) {
      throw new HttpError(400, "Tanggal efektif harus berformat YYYY-MM-DD");
    }
    const toClass = await getClass(Number(to_class_id));
    if (!toClass) throw new HttpError(404, "Kelas tujuan tidak ditemukan");

    return withTransaction(async (conn) => {
      const [students] = await conn.query(
        "SELECT id, angkatan FROM students WHERE id = ? AND is_deleted = 0 FOR UPDATE",
        [studentId],
      );
      if (students.length === 0) throw new HttpError(404, "Siswa tidak ditemukan");

      const [open] = await conn.query(
        "SELECT * FROM student_enrollments WHERE student_id = ? AND end_date IS NULL FOR UPDATE",
        [studentId],
      );
      const current = open[0];
      if (!current) throw new HttpError(422, "Siswa tidak sedang terdaftar di kelas mana pun");

      const fromClass = await getClass(current.class_id, conn);
      if (fromClass.id === toClass.id) throw new HttpError(409, "Siswa sudah di kelas ini");
      if (fromClass.grade_level !== toClass.grade_level) {
        throw new HttpError(422, "Pindah kelas hanya antar kelas dengan tingkat yang sama");
      }
      if (fromClass.academic_year_id !== toClass.academic_year_id) {
        throw new HttpError(422, "Pindah kelas hanya dalam satu tahun ajaran");
      }

      const year = await getYearOfClass(toClass, conn);
      if (effective_date < year.start_date || effective_date >= year.end_date) {
        throw new HttpError(422, "Tanggal efektif di luar tahun ajaran kelas tujuan");
      }
      const [startRow] = await conn.query(
        "SELECT DATE_FORMAT(start_date, '%Y-%m-%d') AS d FROM student_enrollments WHERE id = ?",
        [current.id],
      );
      const startDate = startRow[0].d;
      if (effective_date < startDate) {
        throw new HttpError(422, "Tanggal efektif tidak boleh sebelum siswa masuk kelas saat ini");
      }

      const moved = await moveEnrollment(conn, {
        studentId,
        toClass,
        effectiveDate: effective_date,
        reason: "transferred_class",
        angkatan: students[0].angkatan,
      });

      return {
        success: true,
        corrected_in_place: moved.correctedInPlace,
        attendance_rows_updated: moved.attendanceRowsUpdated,
        from_class: fromClass.name,
        to_class: toClass.name,
      };
    });
  };

  /** Student leaves school: close enrollment, deactivate; attendance history stays. */
  const leaveSchool = async (studentId, { effective_date, reason }) => {
    if (!isValidDateStr(effective_date)) {
      throw new HttpError(400, "Tanggal efektif harus berformat YYYY-MM-DD");
    }
    if (!String(reason || "").trim()) throw new HttpError(400, "Alasan wajib diisi");

    return withTransaction(async (conn) => {
      const [students] = await conn.query(
        "SELECT id FROM students WHERE id = ? AND is_deleted = 0 FOR UPDATE",
        [studentId],
      );
      if (students.length === 0) throw new HttpError(404, "Siswa tidak ditemukan");

      const [open] = await conn.query(
        `SELECT id, DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date
           FROM student_enrollments WHERE student_id = ? AND end_date IS NULL FOR UPDATE`,
        [studentId],
      );
      if (open.length === 0) throw new HttpError(409, "Siswa sudah tidak terdaftar di kelas mana pun");
      if (effective_date <= open[0].start_date) {
        throw new HttpError(422, "Tanggal efektif harus setelah tanggal siswa masuk kelas");
      }

      await conn.query(
        "UPDATE student_enrollments SET end_date = ?, end_reason = 'left_school' WHERE id = ?",
        [effective_date, open[0].id],
      );
      await conn.query("UPDATE students SET is_active = 0 WHERE id = ?", [studentId]);
      await closeLegacyHistory(conn, studentId);

      return { success: true, message: "Siswa ditandai keluar", effective_date };
    });
  };

  return { createStudent, transferStudent, leaveSchool, withTransaction, getClass };
};

export default studentLifecycleServiceFactory;
