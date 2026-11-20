/**
 * @fileoverview Date helpers. All dates in this module are plain
 * "YYYY-MM-DD" strings (no time zone, no JS Date objects crossing the DB
 * boundary) so a server running in UTC cannot shift a school day.
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SCHOOL_TIME_ZONE = "Asia/Jakarta";

/** @param {*} value @returns {boolean} true for a real calendar date "YYYY-MM-DD". */
export const isValidDateStr = (value) => {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
  );
};

/** Today's date in the school's time zone (WIB), "YYYY-MM-DD". */
export const todayStr = (now = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: SCHOOL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

/** Adds (or subtracts) whole days to a "YYYY-MM-DD" string. */
export const addDays = (dateStr, days) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
};

/** ISO weekday of a "YYYY-MM-DD" string: 1 = Monday ... 7 = Sunday. */
export const isoWeekday = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const js = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = Sunday
  return js === 0 ? 7 : js;
};

/** Whole days from a to b (b - a). */
export const diffDays = (a, b) => {
  const [y1, m1, d1] = a.split("-").map(Number);
  const [y2, m2, d2] = b.split("-").map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
};

/** Normalises a value coming from mysql2 (Date or string) to "YYYY-MM-DD". */
export const toDateStr = (value) => {
  if (value == null) return null;
  if (typeof value === "string") return value.slice(0, 10);
  // mysql2 returns DATE as a local-midnight JS Date: use local getters.
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
