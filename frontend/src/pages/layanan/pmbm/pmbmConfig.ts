// =====================================================
// KONTROL PENDAFTARAN PMBM
// Cukup edit file ini untuk buka/tutup pendaftaran
// =====================================================

/**
 * Gelombang yang sedang aktif.
 * 1 = Gelombang I, 2 = Gelombang II, null = semua ditutup
 */
export const GELOMBANG_AKTIF: 1 | 2 | null = null;

/**
 * Tanggal penutupan per gelombang — untuk ditampilkan di notice.
 */
export const JADWAL_PENUTUPAN: Record<number, string> = {
  1: "17 April 2026",
  2: "-", // isi nanti kalau G2 dibuka
};

/**
 * Derived — jangan diubah manual.
 */
export const PENDAFTARAN_DITUTUP = GELOMBANG_AKTIF === null;
