import type { PmbmFormData } from "../pmbmTypes";

export const validateG1Step = (
  step: number,
  form: PmbmFormData,
): Partial<Record<keyof PmbmFormData, string>> => {
  const errors: Partial<Record<keyof PmbmFormData, string>> = {};

  if (step === 0) {
    if (!form.jalur) errors.jalur = "Pilih jalur pendaftaran terlebih dahulu";
    if (form.jalur === "keterampilan" && !form.pilihan_keterampilan)
      errors.pilihan_keterampilan = "Pilih program keterampilan";
  }

  if (step === 1) {
    if (!form.nama_lengkap) errors.nama_lengkap = "Nama lengkap wajib diisi";
    if (!form.nisn) errors.nisn = "NISN wajib diisi";
    else if (!/^\d{10}$/.test(form.nisn))
      errors.nisn = "NISN harus 10 digit angka";
    if (!form.nik) errors.nik = "NIK wajib diisi";
    else if (!/^\d{16}$/.test(form.nik))
      errors.nik = "NIK harus 16 digit angka";
    if (!form.tempat_lahir) errors.tempat_lahir = "Tempat lahir wajib diisi";
    if (!form.tanggal_lahir) errors.tanggal_lahir = "Tanggal lahir wajib diisi";
    if (!form.jenis_kelamin)
      errors.jenis_kelamin = "Jenis kelamin wajib dipilih";
    if (!form.asal_sekolah) errors.asal_sekolah = "Asal sekolah wajib diisi";
    if (!form.no_kk) errors.no_kk = "No. KK wajib diisi";
    if (!form.alamat_lengkap)
      errors.alamat_lengkap = "Alamat lengkap wajib diisi";
    if (!form.alamat_domisili)
      errors.alamat_domisili = "Alamat domisili wajib diisi";
    if (!form.no_hp_siswa) errors.no_hp_siswa = "No. HP wajib diisi";
  }

  if (step === 2) {
    if (!form.nama_ayah) errors.nama_ayah = "Nama ayah wajib diisi";
    if (!form.nama_ibu) errors.nama_ibu = "Nama ibu wajib diisi";
  }

  if (step === 3) {
    if (form.jalur === "tahfidz" && !form.jumlah_hafalan_juz)
      errors.jumlah_hafalan_juz = "Jumlah hafalan wajib diisi";
    if (form.jalur === "kko" && !form.cabang_olahraga)
      errors.cabang_olahraga = "Cabang olahraga wajib diisi";
    if (form.jalur === "akademik" && !form.rata_rata_rapor)
      errors.rata_rata_rapor = "Rata-rata rapor wajib diisi";
    if (!form.komitmen)
      errors.komitmen = "Centang pernyataan komitmen untuk melanjutkan";
  }

  return errors;
};
