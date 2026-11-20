/**
 * @fileoverview Academic year logic (R1). The active academic year is never
 * stored as a flag: it is derived from a date against the `academic_years`
 * table (start_date inclusive, end_date exclusive).
 */
import { HttpError } from "../utils/errorResponse.js";
import { isValidDateStr, toDateStr, todayStr } from "../utils/dateUtils.js";

/**
 * R1: the year containing `dateStr` (start <= date < end); if none, the
 * nearest year by distance to its range. Returns null for an empty list.
 * Pure function — years need `label`, `start_date`, `end_date` as "YYYY-MM-DD".
 * @returns {{year: object|null, exact: boolean}}
 */
export const resolveAcademicYear = (years, dateStr) => {
  if (!years || years.length === 0) return { year: null, exact: false };

  const inside = years.find((y) => y.start_date <= dateStr && dateStr < y.end_date);
  if (inside) return { year: inside, exact: true };

  const dayNum = (s) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d) / 86400000;
  };
  const target = dayNum(dateStr);
  let best = null;
  let bestDist = Infinity;
  for (const y of years) {
    const dist =
      target < dayNum(y.start_date)
        ? dayNum(y.start_date) - target
        : target - (dayNum(y.end_date) - 1);
    if (dist < bestDist) {
      best = y;
      bestDist = dist;
    }
  }
  return { year: best, exact: false };
};

/** Label "YYYY/YYYY+1" from the start date of a year. */
export const labelFromStartDate = (startDate) => {
  const y = Number(startDate.slice(0, 4));
  return `${y}/${y + 1}`;
};

/** R7: angkatan of a new student = start year - (grade - 10). */
export const computeAngkatan = (yearLabel, gradeLevel) => {
  const startYear = Number(String(yearLabel).slice(0, 4));
  return String(startYear - (Number(gradeLevel) - 10));
};

const academicYearServiceFactory = ({ pool, now = () => new Date() }) => {
  const SELECT_YEARS = `SELECT id, label,
      DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
      DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date
    FROM academic_years`;

  const list = async (executor = pool) => {
    const [rows] = await executor.query(`${SELECT_YEARS} ORDER BY start_date`);
    return rows;
  };

  const getById = async (id, executor = pool) => {
    const [rows] = await executor.query(`${SELECT_YEARS} WHERE id = ?`, [id]);
    return rows[0] || null;
  };

  /** All years with `is_current` computed from today's date. */
  const listWithCurrent = async () => {
    const years = await list();
    const today = todayStr(now());
    return years.map((y) => ({
      ...y,
      is_current: y.start_date <= today && today < y.end_date,
    }));
  };

  /** R1 for a date. Defaults to today. */
  const resolveForDate = async (dateStr = todayStr(now()), executor = pool) =>
    resolveAcademicYear(await list(executor), dateStr);

  const validateRange = async (startDate, endDate, ignoreId = null) => {
    if (!isValidDateStr(startDate) || !isValidDateStr(endDate)) {
      throw new HttpError(400, "Tanggal mulai dan akhir wajib berformat YYYY-MM-DD");
    }
    if (startDate >= endDate) {
      throw new HttpError(422, "Tanggal akhir harus setelah tanggal mulai");
    }
    const years = await list();
    const clash = years.find(
      (y) => y.id !== ignoreId && startDate < y.end_date && y.start_date < endDate,
    );
    if (clash) {
      throw new HttpError(422, `Rentang tumpang tindih dengan tahun ajaran ${clash.label}`);
    }
  };

  const create = async ({ start_date, end_date }) => {
    await validateRange(start_date, end_date);
    const label = labelFromStartDate(start_date);
    try {
      const [result] = await pool.query(
        "INSERT INTO academic_years (label, start_date, end_date) VALUES (?, ?, ?)",
        [label, start_date, end_date],
      );
      return getById(result.insertId);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw new HttpError(409, `Tahun ajaran ${label} sudah ada`);
      }
      throw error;
    }
  };

  const update = async (id, { start_date, end_date }) => {
    const existing = await getById(id);
    if (!existing) throw new HttpError(404, "Tahun ajaran tidak ditemukan");
    await validateRange(start_date, end_date, id);
    const label = labelFromStartDate(start_date);
    try {
      await pool.query(
        "UPDATE academic_years SET label = ?, start_date = ?, end_date = ? WHERE id = ?",
        [label, start_date, end_date, id],
      );
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw new HttpError(409, `Tahun ajaran ${label} sudah ada`);
      }
      throw error;
    }
    // Keep the denormalised label on classes consistent.
    if (label !== existing.label) {
      await pool.query("UPDATE classes SET academic_year = ? WHERE academic_year_id = ?", [
        label,
        id,
      ]);
    }
    return getById(id);
  };

  return { list, getById, listWithCurrent, resolveForDate, create, update, toDateStr };
};

export default academicYearServiceFactory;
