/**
 * @fileoverview Year transition wizard (R6, FR-09, FR-11).
 *
 *  preview  — computes the plan (classes to create, 1:1 promotion mapping,
 *             graduation) without writing anything.
 *  execute  — runs the plan in ONE transaction; safe to run twice because
 *             classes are guarded by UNIQUE(academic_year, name) and only
 *             OPEN enrollments of the source classes are processed.
 *
 * No repeating a grade exists (school rule): every X/XI student is promoted
 * 1:1, every XII student graduates.
 */
import academicYearServiceFactory, { computeAngkatan } from "./academicYearService.js";
import { HttpError } from "../utils/errorResponse.js";
import { syncLegacyHistory, closeLegacyHistory } from "./studentLifecycleService.js";

const ROMAN = { 10: "X", 11: "XI", 12: "XII" };

/** "XI-A" -> "A" (everything after the first dash). */
const rombelOf = (className) => String(className).split("-").slice(1).join("-");

const letterName = (index) => String.fromCharCode(65 + index); // 0 -> A

const yearTransitionServiceFactory = ({ pool, now = () => new Date() }) => {
  const yearService = academicYearServiceFactory({ pool, now });

  const loadYears = async (fromYearId, toYearId, executor = pool) => {
    const from = await yearService.getById(Number(fromYearId), executor);
    const to = await yearService.getById(Number(toYearId), executor);
    if (!from || !to) throw new HttpError(404, "Tahun ajaran asal atau tujuan tidak ditemukan");
    if (from.id === to.id || to.start_date < from.end_date) {
      throw new HttpError(422, "Tahun ajaran tujuan harus dimulai setelah tahun ajaran asal berakhir");
    }
    return { from, to };
  };

  const parseNewClassCounts = (raw) => {
    const x = Number(raw?.X ?? 0);
    if (!Number.isInteger(x) || x < 0 || x > 26) {
      throw new HttpError(400, "Jumlah rombel kelas X harus bilangan bulat 0–26");
    }
    return { X: x };
  };

  /** Builds the plan from the database state (no writes). */
  const buildPlan = async ({ fromYearId, toYearId, newClassCounts }, executor = pool) => {
    const { from, to } = await loadYears(fromYearId, toYearId, executor);
    const counts = parseNewClassCounts(newClassCounts);
    const warnings = [];

    const [fromClasses] = await executor.query(
      "SELECT id, name, grade_level FROM classes WHERE academic_year_id = ? ORDER BY grade_level, name",
      [from.id],
    );
    const [toClasses] = await executor.query(
      "SELECT id, name, grade_level FROM classes WHERE academic_year_id = ?",
      [to.id],
    );
    const toByName = new Map(toClasses.map((c) => [c.name, c]));

    const [openCounts] = await executor.query(
      `SELECT e.class_id, COUNT(*) AS n
         FROM student_enrollments e
         JOIN students s ON s.id = e.student_id AND s.is_deleted = 0 AND s.is_active = 1
        WHERE e.end_date IS NULL
        GROUP BY e.class_id`,
    );
    const studentsIn = new Map(openCounts.map((r) => [r.class_id, Number(r.n)]));

    const classesToCreate = [];
    const promotions = [];
    const graduations = [];

    const planClass = (name, gradeLevel) => {
      const existing = toByName.get(name);
      if (!existing && !classesToCreate.some((c) => c.name === name)) {
        classesToCreate.push({ name, grade_level: gradeLevel });
      }
      return existing ? existing.id : null;
    };

    for (const cls of fromClasses) {
      const n = studentsIn.get(cls.id) || 0;
      if (cls.grade_level === 12) {
        graduations.push({ from_class_id: cls.id, from_class: cls.name, students: n });
      } else if (cls.grade_level === 10 || cls.grade_level === 11) {
        const target = `${ROMAN[cls.grade_level + 1]}-${rombelOf(cls.name)}`;
        const toId = planClass(target, cls.grade_level + 1);
        promotions.push({
          from_class_id: cls.id,
          from_class: cls.name,
          to_class_id: toId,
          to_class: target,
          students: n,
        });
      } else {
        warnings.push(`Kelas ${cls.name} tidak punya tingkat yang dikenal dan dilewati`);
      }
    }

    for (let i = 0; i < counts.X; i++) planClass(`X-${letterName(i)}`, 10);
    if (counts.X === 0) {
      warnings.push("Jumlah rombel kelas X baru = 0: tidak ada kelas X yang dibuat");
    }

    const [orphans] = await executor.query(
      `SELECT COUNT(*) AS n FROM students s
        WHERE s.is_active = 1 AND s.is_deleted = 0
          AND NOT EXISTS (SELECT 1 FROM student_enrollments e
                           WHERE e.student_id = s.id AND e.end_date IS NULL)`,
    );
    if (Number(orphans[0].n) > 0) {
      warnings.push(`${orphans[0].n} siswa aktif belum punya kelas dan tidak ikut diproses`);
    }
    const [staleOpen] = await executor.query(
      `SELECT COUNT(*) AS n FROM student_enrollments e
         JOIN classes c ON c.id = e.class_id
        WHERE e.end_date IS NULL AND c.academic_year_id NOT IN (?, ?)`,
      [from.id, to.id],
    );
    if (Number(staleOpen[0].n) > 0) {
      warnings.push(
        `${staleOpen[0].n} enrollment terbuka berada di tahun ajaran selain asal/tujuan dan tidak diproses`,
      );
    }
    if (promotions.every((p) => p.students === 0) && graduations.every((g) => g.students === 0)) {
      warnings.push("Tidak ada siswa untuk dinaikkan atau diluluskan (mungkin transisi ini sudah dijalankan)");
    }

    return {
      from_year: from,
      to_year: to,
      classes_to_create: classesToCreate,
      promotions,
      graduations,
      totals: {
        promote: promotions.reduce((a, p) => a + p.students, 0),
        graduate: graduations.reduce((a, g) => a + g.students, 0),
      },
      warnings,
    };
  };

  const preview = (input) => buildPlan(input);

  const execute = async (input) => {
    if (input.confirm !== true) {
      throw new HttpError(400, "Konfirmasi diperlukan (confirm: true)");
    }
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const plan = await buildPlan(input, conn);
      const { from_year: from, to_year: to } = plan;

      // 1. classes (idempotent through UNIQUE(academic_year, name))
      for (const c of plan.classes_to_create) {
        await conn.query(
          `INSERT IGNORE INTO classes (name, academic_year, semester, academic_year_id, grade_level)
           VALUES (?, ?, 'ganjil', ?, ?)`,
          [c.name, to.label, to.id, c.grade_level],
        );
      }
      const [toClasses] = await conn.query(
        "SELECT id, name FROM classes WHERE academic_year_id = ?",
        [to.id],
      );
      const toByName = new Map(toClasses.map((c) => [c.name, c.id]));

      const summary = { classes_created: plan.classes_to_create.length, promoted: 0, graduated: 0, skipped: 0 };

      const openEnrollments = async (classId) => {
        const [rows] = await conn.query(
          `SELECT e.id, e.student_id, DATE_FORMAT(e.start_date, '%Y-%m-%d') AS start_date,
                  s.nisn, s.name, s.angkatan
             FROM student_enrollments e
             JOIN students s ON s.id = e.student_id AND s.is_deleted = 0 AND s.is_active = 1
            WHERE e.class_id = ? AND e.end_date IS NULL
            FOR UPDATE`,
          [classId],
        );
        return rows;
      };

      // 2. promotion: close old enrollment at the source year's end, open a new one at the target's start
      for (const p of plan.promotions) {
        const toClassId = toByName.get(p.to_class);
        const [toRow] = await conn.query("SELECT grade_level FROM classes WHERE id = ?", [toClassId]);
        for (const e of await openEnrollments(p.from_class_id)) {
          if (e.start_date >= from.end_date) {
            summary.skipped++;
            continue;
          }
          await conn.query(
            "UPDATE student_enrollments SET end_date = ?, end_reason = 'promoted' WHERE id = ?",
            [from.end_date, e.id],
          );
          await conn.query(
            "INSERT INTO student_enrollments (student_id, class_id, start_date) VALUES (?, ?, ?)",
            [e.student_id, toClassId, to.start_date],
          );
          await syncLegacyHistory(conn, {
            studentId: e.student_id,
            classId: toClassId,
            yearLabel: to.label,
            angkatan: e.angkatan || computeAngkatan(to.label, toRow[0].grade_level),
          });
          summary.promoted++;
        }
      }

      // 3. graduation (reuses the alumni record shape of the old /graduate route)
      for (const g of plan.graduations) {
        const [clsRows] = await conn.query("SELECT name FROM classes WHERE id = ?", [g.from_class_id]);
        for (const e of await openEnrollments(g.from_class_id)) {
          if (e.start_date >= from.end_date) {
            summary.skipped++;
            continue;
          }
          await conn.query(
            "UPDATE student_enrollments SET end_date = ?, end_reason = 'graduated' WHERE id = ?",
            [from.end_date, e.id],
          );
          await conn.query("UPDATE students SET is_active = 0 WHERE id = ?", [e.student_id]);
          await closeLegacyHistory(conn, e.student_id);

          const [existingAlumni] = await conn.query("SELECT id FROM alumni WHERE student_id = ?", [
            e.student_id,
          ]);
          if (existingAlumni.length === 0) {
            await conn.query(
              `INSERT INTO alumni
                 (student_id, nisn, name, graduation_year, last_class_id, last_class_name, last_academic_year)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                e.student_id,
                e.nisn,
                e.name,
                from.label.split("/")[1],
                g.from_class_id,
                clsRows[0].name,
                from.label,
              ],
            );
          }
          summary.graduated++;
        }
      }

      await conn.commit();
      return { success: true, summary };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  };

  return { preview, execute };
};

export default yearTransitionServiceFactory;
