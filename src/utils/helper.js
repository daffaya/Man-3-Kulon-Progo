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
