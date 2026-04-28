/**
 * @fileoverview Type definitions for PMBM registration system.
 * This file defines TypeScript types and interfaces used for registration flow,
 * including form payloads, API responses, and data representations for admin
 * and public views.
 */

/**
 * Available registration tracks.
 */
export type JalurPendaftaran =
  | "tahfidz"
  | "kko"
  | "keterampilan"
  | "akademik"
  | "non_akademik"
  | "afirmasi"
  | "tes";

/**
 * Available skill program options (keterampilan track).
 */
export type PilihanKeterampilan = "titl" | "tata_busana" | "multimedia";

/**
 * Competition levels for achievements.
 */
export type TingkatKejuaraan =
  | "kecamatan"
  | "kabupaten"
  | "provinsi"
  | "nasional";

/**
 * Registration status values.
 */
export type StatusPendaftaran =
  | "pending"
  | "verified"
  | "accepted"
  | "rejected"
  | "withdrawn";

/**
 * Form payload for PMBM registration submission.
 */
export interface PmbmFormData {
  jalur: JalurPendaftaran | "";
  pilihan_keterampilan: PilihanKeterampilan | "";

  nilai_tka_literasi: number | "";
  nilai_tka_numerasi: number | "";

  nama_lengkap: string;
  nisn: string;
  nik: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: "L" | "P" | "";
  asal_sekolah: string;
  no_kk: string;
  alamat_lengkap: string;
  alamat_domisili: string;
  no_hp_siswa: string;

  nama_ayah: string;
  nama_ibu: string;
  pekerjaan_ayah: string;
  pekerjaan_ibu: string;
  penghasilan_ayah: string;
  penghasilan_ibu: string;
  alamat_ortu: string;
  alamat_domisili_ortu: string;
  no_hp_ayah: string;
  no_hp_ibu: string;

  jumlah_hafalan_juz: number | "";
  cabang_olahraga: string;
  rata_rata_rapor: number | "";
  jenis_kejuaraan: string;
  tingkat_kejuaraan: TingkatKejuaraan | "";
  nama_kejuaraan: string;
  tahun_kejuaraan: number | "";
  link_dokumen: string;
  komitmen: boolean;
}

/**
 * Response returned after successful registration.
 */
export interface PmbmRegisterResponse {
  success: boolean;
  message: string;
  data: {
    /** Format: PMBM-YYYY-XXXX */
    nomor_pendaftaran: string;
    nama_lengkap: string;
    jalur: JalurPendaftaran;
  };
}

/**
 * Registration data used in admin listing.
 */
export interface PmbmRegistrationSummary {
  id: number;
  nomor_pendaftaran: string;
  jalur: JalurPendaftaran;
  gelombang: number;
  pilihan_keterampilan: PilihanKeterampilan | null;
  nama_lengkap: string;
  nisn: string;
  asal_sekolah: string;
  no_hp_siswa: string;
  status: StatusPendaftaran;
  created_at: string;
}

/**
 * Public-safe registration data (excludes sensitive fields).
 */
export interface PmbmPublicEntry {
  nomor_pendaftaran: string;
  jalur: JalurPendaftaran;
  gelombang: number;
  nama_lengkap: string;
  asal_sekolah: string;
  nilai_tka_literasi: number | null;
  nilai_tka_numerasi: number | null;
  status: StatusPendaftaran;
  created_at: string;
}

/**
 * Human-readable labels for registration tracks.
 */
export const JALUR_LABEL: Record<JalurPendaftaran, string> = {
  tahfidz: "Tahfidz",
  kko: "KKO (Kelas Khusus Olahraga)",
  keterampilan: "Keterampilan",
  akademik: "Akademik",
  non_akademik: "Non-Akademik",
  afirmasi: "Afirmasi",
  tes: "Tes",
};

/**
 * Human-readable labels for skill program options.
 */
export const KETERAMPILAN_LABEL: Record<PilihanKeterampilan, string> = {
  titl: "TITL (Teknik Instalasi Tenaga Listrik)",
  tata_busana: "Tata Busana",
  multimedia: "Multimedia",
};

/**
 * Human-readable labels for registration status.
 */
export const STATUS_LABEL: Record<StatusPendaftaran, string> = {
  pending: "Menunggu Verifikasi",
  verified: "Terverifikasi",
  accepted: "Diterima",
  rejected: "Ditolak",
  withdrawn: "Mengundurkan Diri",
};
