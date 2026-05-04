/**
 * @fileoverview Validation logic for Gelombang 2 (G2) registration form.
 * Provides step-based validation and returns field-level error messages.
 */

import type { G2FormData } from "./gelombang2Types";

/**
 * Validate form data based on current step.
 */
export const validateG2Step = (
  step: number,
  form: G2FormData,
): Partial<Record<keyof G2FormData, string>> => {
  const errors: Partial<Record<keyof G2FormData, string>> = {};

  switch (step) {
    case 0: {
      if (!form.nama_lengkap) errors.nama_lengkap = "Nama lengkap wajib diisi";

      if (!form.nisn) errors.nisn = "NISN wajib diisi";
      else if (!/^\d{10}$/.test(form.nisn)) {
        errors.nisn = "NISN harus 10 digit angka";
      }

      if (!form.nik) errors.nik = "NIK wajib diisi";
      else if (!/^\d{16}$/.test(form.nik)) {
        errors.nik = "NIK harus 16 digit angka";
      }

      if (!form.tempat_lahir) errors.tempat_lahir = "Tempat lahir wajib diisi";

      if (!form.tanggal_lahir)
        errors.tanggal_lahir = "Tanggal lahir wajib diisi";

      if (!form.jenis_kelamin)
        errors.jenis_kelamin = "Jenis kelamin wajib dipilih";

      if (!form.asal_sekolah) errors.asal_sekolah = "Asal sekolah wajib diisi";

      if (!form.no_kk) errors.no_kk = "No. KK wajib diisi";

      if (!form.alamat_lengkap)
        errors.alamat_lengkap = "Alamat lengkap wajib diisi";

      if (!form.alamat_domisili)
        errors.alamat_domisili = "Alamat domisili wajib diisi";

      if (!form.no_hp_siswa) errors.no_hp_siswa = "No. HP wajib diisi";

      break;
    }

    case 1: {
      if (!form.nama_ayah) errors.nama_ayah = "Nama ayah wajib diisi";
      if (!form.nama_ibu) errors.nama_ibu = "Nama ibu wajib diisi";
      break;
    }

    case 2: {
      const literasi =
        form.nilai_tka_literasi !== "" ? Number(form.nilai_tka_literasi) : null;

      const numerasi =
        form.nilai_tka_numerasi !== "" ? Number(form.nilai_tka_numerasi) : null;

      // Optional: hanya validasi jika field diisi
      if (literasi !== null && (literasi < 0 || literasi > 100)) {
        errors.nilai_tka_literasi = "Nilai harus antara 0–100";
      }

      if (numerasi !== null && (numerasi < 0 || numerasi > 100)) {
        errors.nilai_tka_numerasi = "Nilai harus antara 0–100";
      }

      if (!form.pilihan_keterampilan) {
        errors.pilihan_keterampilan = "Pilihan keterampilan wajib dipilih";
      }

      if (!form.komitmen) {
        errors.komitmen = "Centang pernyataan komitmen untuk melanjutkan";
      }

      break;
    }
  }

  return errors;
};
