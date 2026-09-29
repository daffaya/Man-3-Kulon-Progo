// backend/src/utils/helpers.js

/**
 * Menghitung perkiraan waktu membaca suatu konten dalam menit.
 * @param {string} content Teks konten
 * @returns {number} Waktu membaca dalam menit, dibulatkan ke atas
 */
export const calculateReadingTime = (content) => {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

/**
 * Escapes a value before it's written into an Excel cell, to prevent
 * formula/CSV injection (OWASP "CSV Injection") when the value comes from
 * untrusted input. Prefixes with `'` to force text interpretation if the
 * value starts with a formula-trigger character. (AUDIT-007)
 * @param {*} val Raw cell value
 * @returns {*} Safe cell value (unchanged type if not a formula-trigger string)
 */
export const escapeExcelCell = (val) => {
  if (val == null) return val;
  const s = String(val);
  return /^[=+\-@]/.test(s) ? `'${s}` : s; // prefix with ' to force text interpretation
};
