/**
 * Defines the available registration tracks for PMBM.
 */
export type JalurPendaftaran =
  | "tahfidz"
  | "kko"
  | "keterampilan"
  | "akademik"
  | "non_akademik"
  | "afirmasi";

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
  /** Registration track chosen by the student. */
  jalur: JalurPendaftaran | "";
  /** Skills program choice — only required when jalur is 'keterampilan'. */
  pilihan_keterampilan: PilihanKeterampilan | "";

  /** Student's full name as per birth certificate. */
  nama_lengkap: string;
  /** Student's 10-digit NISN number. */
  nisn: string;
  /** Student's 16-digit NIK number. */
  nik: string;
  /** City or regency of birth. */
  tempat_lahir: string;
  /** Date of birth in YYYY-MM-DD format. */
  tanggal_lahir: string;
  /** Student's gender (L = male, P = female). */
  jenis_kelamin: "L" | "P" | "";
  /** Name of origin school (SMP/MTs). */
  asal_sekolah: string;
  /** 16-digit family card number. */
  no_kk: string;
  /** Student's full address as per KK. */
  alamat_lengkap: string;
  /** Student's current domicile address. */
  alamat_domisili: string;
  /** Student's WhatsApp number. */
  no_hp_siswa: string;

  /** Father's full name. */
  nama_ayah: string;
  /** Mother's full name. */
  nama_ibu: string;
  /** Father's occupation. */
  pekerjaan_ayah: string;
  /** Mother's occupation. */
  pekerjaan_ibu: string;
  /** Father's monthly income range. */
  penghasilan_ayah: string;
  /** Mother's monthly income range. */
  penghasilan_ibu: string;
  /** Parent's full address. */
  alamat_ortu: string;
  /** Parent's current domicile address. */
  alamat_domisili_ortu: string;
  /** Father's WhatsApp number. */
  no_hp_ayah: string;
  /** Mother's WhatsApp number. */
  no_hp_ibu: string;

  /** Number of memorized juz — only for tahfidz track. */
  jumlah_hafalan_juz: number | "";
  /** Sports or martial arts branch — only for KKO track. */
  cabang_olahraga: string;
  /** Average report card score (semester 1–5) — only for akademik track. */
  rata_rata_rapor: number | "";
  /** Type of competition (academic, sports, arts, tahfidz, etc.). */
  jenis_kejuaraan: string;
  /** Level of the competition. */
  tingkat_kejuaraan: TingkatKejuaraan | "";
  /** Official name or title of the competition. */
  nama_kejuaraan: string;
  /** Year the competition took place. */
  tahun_kejuaraan: number | "";
  /** Optional Google Drive link containing scanned supporting documents. */
  link_dokumen: string;
  /** Student's commitment to enroll at MAN 3 Kulon Progo if accepted. */
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
  pilihan_keterampilan: PilihanKeterampilan | null;
  nama_lengkap: string;
  nisn: string;
  asal_sekolah: string;
  no_hp_siswa: string;
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
