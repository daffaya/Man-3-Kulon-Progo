/**
 * @fileoverview Saving daily attendance (R2–R4, FR-03–08, FR-14).
 *
 * The request carries `classId` + `date`; everything is validated against
 * that date, never against a global "active year". All roster students are
 * written in one transaction; students missing from the payload are `hadir`.
 */
import academicYearServiceFactory from "./academicYearService.js";
import { HttpError } from "../utils/errorResponse.js";
import { diffDays, isValidDateStr, isoWeekday, todayStr } from "../utils/dateUtils.js";

export const SAVEABLE_STATUSES = ["hadir", "izin", "sakit", "alpa"];
const DEFAULT_CORRECTION_WINDOW_DAYS = 7;
const DEFAULT_SCHOOL_DAYS = [1, 2, 3, 4, 5];

const attendanceSaveServiceFactory = ({ pool, now = () => new Date() }) => {
  const yearService = academicYearServiceFactory({ pool, now });

  const readSettings = async (conn) => {
    const [rows] = await conn.query(
      "SELECT `key`, `value` FROM attendance_system_settings WHERE `key` IN ('school_days','correction_window_days')",
    );
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    const days = String(map.school_days || "")
      .split(",")
      .map((n) => Number(n.trim()))
      .filter((n) => n >= 1 && n <= 7);
    const windowDays = Number(map.correction_window_days);
    return {
      schoolDays: days.length ? days : DEFAULT_SCHOOL_DAYS,
      correctionWindowDays:
        Number.isFinite(windowDays) && windowDays >= 0 ? windowDays : DEFAULT_CORRECTION_WINDOW_DAYS,
    };
  };

  /**
   * @param {object} input
   * @param {number|string} input.classId
   * @param {string} input.date - YYYY-MM-DD
   * @param {{studentId:number,status:string,notes?:string}[]} [input.attendances]
   * @param {{id:number, role:string}} input.user
   * @param {boolean} [input.override] - super_admin only: allow a holiday.
   * @param {string} [input.reason] - required of super_admin beyond the correction window.
   */
  const saveAttendance = async ({ classId, date, attendances, user, override, reason }) => {
    // --- shape validation -----------------------------------------------------
    const classIdNum = Number(classId);
    if (!Number.isInteger(classIdNum) || classIdNum <= 0) {
      throw new HttpError(400, "classId tidak valid");
    }
    if (!isValidDateStr(date)) {
      throw new HttpError(400, "Tanggal harus berformat YYYY-MM-DD");
    }
    const entries = attendances === undefined || attendances === null ? [] : attendances;
    if (!Array.isArray(entries)) {
      throw new HttpError(400, "Data presensi harus berupa daftar");
    }

    const byStudent = new Map();
    for (const entry of entries) {
      const studentId = Number(entry?.studentId);
      if (!Number.isInteger(studentId) || studentId <= 0) {
        throw new HttpError(400, "studentId tidak valid");
      }
      if (!SAVEABLE_STATUSES.includes(entry.status)) {
        throw new HttpError(
          400,
          `Status tidak valid. Gunakan: ${SAVEABLE_STATUSES.join(", ")}`,
        );
      }
      byStudent.set(studentId, {
        status: entry.status,
        notes: entry.notes ? String(entry.notes).slice(0, 1000) : null,
      });
    }

    const isSuperAdmin = String(user?.role || "").toLowerCase() === "super_admin";
    const today = todayStr(now());

    if (date > today) {
      throw new HttpError(422, "Tidak dapat menyimpan presensi untuk tanggal yang belum terjadi");
    }

    const conn = await pool.getConnection();
    try {
      // --- business rules (R1, R3, R4) -------------------------------------------
      const [classRows] = await conn.query(
        "SELECT id, name, academic_year_id FROM classes WHERE id = ?",
        [classIdNum],
      );
      const cls = classRows[0];
      if (!cls) throw new HttpError(404, "Kelas tidak ditemukan");

      const { year, exact } = await yearService.resolveForDate(date, conn);
      if (!year || !exact) {
        throw new HttpError(422, "Tanggal ini berada di luar semua tahun ajaran");
      }
      if (cls.academic_year_id !== year.id) {
        throw new HttpError(
          422,
          `Kelas ${cls.name} bukan kelas tahun ajaran ${year.label} (tahun ajaran pada tanggal ini)`,
        );
      }

      const { schoolDays, correctionWindowDays } = await readSettings(conn);
      if (!schoolDays.includes(isoWeekday(date))) {
        throw new HttpError(422, "Tanggal ini bukan hari sekolah");
      }

      const [holidayRows] = await conn.query(
        "SELECT description FROM school_holidays WHERE date = ?",
        [date],
      );
      if (holidayRows.length > 0 && !(isSuperAdmin && override === true)) {
        throw new HttpError(
          422,
          `Tanggal ini adalah hari libur (${holidayRows[0].description})`,
        );
      }

      // --- correction window (FR-14) --------------------------------------------
      const beyondWindow = diffDays(date, today) > correctionWindowDays;
      let correctionNote = null;
      if (beyondWindow) {
        if (!isSuperAdmin) {
          throw new HttpError(
            403,
            `Presensi lebih dari ${correctionWindowDays} hari lalu hanya dapat diubah oleh super admin`,
          );
        }
        const trimmed = String(reason || "").trim();
        if (!trimmed) {
          throw new HttpError(
            422,
            "Alasan koreksi wajib diisi untuk presensi di luar batas koreksi",
          );
        }
        correctionNote = `[koreksi: ${trimmed.slice(0, 200)}]`;
      }

      // --- roster (R2) ------------------------------------------------------------
      const [roster] = await conn.query(
        `SELECT s.id
           FROM student_enrollments e
           JOIN students s ON s.id = e.student_id AND s.is_deleted = 0
          WHERE e.class_id = ? AND e.start_date <= ?
            AND (e.end_date IS NULL OR e.end_date > ?)
          ORDER BY s.id`,
        [classIdNum, date, date],
      );
      if (roster.length === 0) {
        throw new HttpError(422, "Tidak ada siswa di kelas ini pada tanggal tersebut");
      }
      const rosterIds = new Set(roster.map((r) => r.id));
      const outside = [...byStudent.keys()].filter((id) => !rosterIds.has(id));
      if (outside.length > 0) {
        throw new HttpError(
          422,
          `Siswa di luar daftar kelas pada tanggal ini (ID: ${outside.slice(0, 5).join(", ")})`,
        );
      }

      // --- write, one transaction -------------------------------------------------
      const values = roster.map((r) => {
        const entry = byStudent.get(r.id) || { status: "hadir", notes: null };
        const notes = [entry.notes, correctionNote].filter(Boolean).join(" ") || null;
        return [r.id, classIdNum, date, entry.status, notes, user.id];
      });

      await conn.beginTransaction();
      try {
        await conn.query(
          `INSERT INTO attendances (student_id, class_id, date, status, notes, recorded_by)
           VALUES ?
           ON DUPLICATE KEY UPDATE
             class_id = VALUES(class_id),
             status = VALUES(status),
             notes = VALUES(notes),
             recorded_by = VALUES(recorded_by),
             updated_at = CURRENT_TIMESTAMP`,
          [values],
        );
        await conn.commit();
      } catch (error) {
        await conn.rollback();
        throw error;
      }

      return {
        success: true,
        message: "Data presensi berhasil disimpan",
        saved: roster.length,
        defaulted_hadir: roster.length - byStudent.size,
      };
    } finally {
      conn.release();
    }
  };

  return { saveAttendance };
};

export default attendanceSaveServiceFactory;
