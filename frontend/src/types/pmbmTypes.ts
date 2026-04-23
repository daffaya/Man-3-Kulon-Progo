/**
 * Defines the available registration tracks for PMBM.
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
 * Defines the available skills program options for the keterampilan track.
 */
export type PilihanKeterampilan = "titl" | "tata_busana" | "multimedia";

/**
 * Defines the competition level options for award certificates.
 */
export type TingkatKejuaraan =
  | "kecamatan"
  | "kabupaten"
  | "provinsi"
  | "nasional";

/**
 * Defines the possible statuses of a registration record.
 */
export type StatusPendaftaran =
  | "pending"
  | "verified"
  | "accepted"
  | "rejected";

/**
 * Represents the complete form data payload submitted to the backend.
 */
export interface PmbmFormData {
  jalur: JalurPendaftaran | "";
  pilihan_keterampilan: PilihanKeterampilan | "";

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
 * Represents the response returned by the backend after a successful registration.
 */
export interface PmbmRegisterResponse {
  success: boolean;
  message: string;
  data: {
    /** Auto-generated registration number in format PMBM-YYYY-XXXX. */
    nomor_pendaftaran: string;
    nama_lengkap: string;
    jalur: JalurPendaftaran;
  };
}

/**
 * Represents a single registration record as returned in the admin list view.
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
 * Represents a single registration record exposed in the public listing.
 * This interface only includes non-sensitive fields that are safe to display publicly.
 *
 * Differences from {@link PmbmRegistrationSummary}:
 * - Does NOT include personal identifiers such as NISN or phone number.
 * * - Does NOT include internal ID or selected skill details.
 *
 * Typically used in public-facing endpoints (e.g., registration status lookup or announcement pages).
 */
export interface PmbmPublicEntry {
  nomor_pendaftaran: string;
  jalur: JalurPendaftaran;
  gelombang: number;
  nama_lengkap: string;
  asal_sekolah: string;
  status: StatusPendaftaran;
  created_at: string;
}

/**
 * Human-readable labels for each registration track.
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
 * Human-readable labels for each skills program option.
 */
export const KETERAMPILAN_LABEL: Record<PilihanKeterampilan, string> = {
  titl: "TITL (Teknik Instalasi Tenaga Listrik)",
  tata_busana: "Tata Busana",
  multimedia: "Multimedia",
};

/**
 * Human-readable labels for each registration status.
 */
export const STATUS_LABEL: Record<StatusPendaftaran, string> = {
  pending: "Menunggu Verifikasi",
  verified: "Terverifikasi",
  accepted: "Diterima",
  rejected: "Ditolak",
};
