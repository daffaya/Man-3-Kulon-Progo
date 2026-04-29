export const GELOMBANG_AKTIF: 1 | 2 | null = 2;

/**
 * Gelombang yang boleh ditampilkan ke publik
 */
export const GELOMBANG_TAMPIL: 1 | 2 = 1;

/**
 * Batas akhir pendaftaran per gelombang (inclusive — tutup di akhir hari itu).
 * Format: YYYY-MM-DD
 */
export const BATAS_PENDAFTARAN: Record<number, string> = {
  1: "2026-04-27",
  2: "", //TODO Isi dengan batas pendaftaran gelombang 2 jika ada, atau biarkan kosong jika tidak ada gelombang 2
};

/**
 * Cek apakah pendaftaran gelombang aktif sudah melewati batas tanggal.
 */
const isMelewatiBatas = (): boolean => {
  if (!GELOMBANG_AKTIF) return true;
  const batas = BATAS_PENDAFTARAN[GELOMBANG_AKTIF];
  if (!batas) return false;

  const now = new Date();
  const batasDate = new Date(batas);

  // Inclusive — tutup setelah akhir hari (23:59:59) tanggal batas
  batasDate.setHours(23, 59, 59, 999);

  return now > batasDate;
};

export const PENDAFTARAN_DITUTUP =
  GELOMBANG_AKTIF === null || isMelewatiBatas();
