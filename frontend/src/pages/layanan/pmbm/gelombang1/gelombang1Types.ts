import type {
  JalurPendaftaran,
  PilihanKeterampilan,
  TingkatKejuaraan,
} from "../../../../types/pmbmTypes";
import {
  ClipboardList,
  User,
  Users,
  FileText,
  CheckCircle,
  BookOpen,
  Shield,
  Wrench,
  Star,
  Heart,
} from "lucide-react";

export interface G1FormData {
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

// ─── Steps ───────────────────────────────────────────
export const G1_STEPS = [
  { label: "Jalur", icon: ClipboardList },
  { label: "Data Siswa", icon: User },
  { label: "Data Orang Tua", icon: Users },
  { label: "Dokumen", icon: FileText },
  { label: "Review", icon: CheckCircle },
];

// ─── Jalur Options ───────────────────────────────────
export const G1_JALUR_OPTIONS = [
  {
    value: "tahfidz" as JalurPendaftaran,
    label: "Tahfidz",
    icon: BookOpen,
    desc: "Khusus siswa berprestasi hafalan Al-Qur'an.",
  },
  {
    value: "kko" as JalurPendaftaran,
    label: "KKO",
    icon: Shield,
    desc: "Kelas Khusus Olahraga — bakat dan prestasi olahraga/bela diri.",
  },
  {
    value: "keterampilan" as JalurPendaftaran,
    label: "Keterampilan",
    icon: Wrench,
    desc: "TITL, Tata Busana, atau Multimedia.",
  },
  {
    value: "akademik" as JalurPendaftaran,
    label: "Akademik",
    icon: Star,
    desc: "Seleksi berdasarkan nilai rapor semester 1–5.",
  },
  {
    value: "non_akademik" as JalurPendaftaran,
    label: "Non-Akademik",
    icon: Star,
    desc: "Sertifikat kejuaraan tingkat Kab/Kec jenjang SMP.",
  },
  {
    value: "afirmasi" as JalurPendaftaran,
    label: "Afirmasi",
    icon: Heart,
    desc: "Kuota khusus putra-putri warga Pantog Wetan.",
  },
];

// ─── Keterampilan Options ─────────────────────────────
export const G1_KETERAMPILAN_OPTIONS: {
  value: PilihanKeterampilan;
  label: string;
}[] = [
  { value: "titl", label: "TITL (Teknik Instalasi Tenaga Listrik)" },
  { value: "tata_busana", label: "Tata Busana" },
  { value: "multimedia", label: "Multimedia" },
];

// ─── Penghasilan Options ──────────────────────────────
export const G1_PENGHASILAN_OPTIONS = [
  "< Rp 500.000",
  "Rp 500.000 – Rp 1.000.000",
  "Rp 1.000.000 – Rp 2.000.000",
  "Rp 2.000.000 – Rp 3.500.000",
  "Rp 3.500.000 – Rp 5.000.000",
  "> Rp 5.000.000",
];

// ─── Initial Form ─────────────────────────────────────
export const G1_INITIAL_FORM: G1FormData = {
  jalur: "",
  pilihan_keterampilan: "",
  nama_lengkap: "",
  nisn: "",
  nik: "",
  tempat_lahir: "",
  tanggal_lahir: "",
  jenis_kelamin: "",
  asal_sekolah: "",
  no_kk: "",
  alamat_lengkap: "",
  alamat_domisili: "",
  no_hp_siswa: "",
  nama_ayah: "",
  nama_ibu: "",
  pekerjaan_ayah: "",
  pekerjaan_ibu: "",
  penghasilan_ayah: "",
  penghasilan_ibu: "",
  alamat_ortu: "",
  alamat_domisili_ortu: "",
  no_hp_ayah: "",
  no_hp_ibu: "",
  jumlah_hafalan_juz: "",
  cabang_olahraga: "",
  rata_rata_rapor: "",
  jenis_kejuaraan: "",
  tingkat_kejuaraan: "",
  nama_kejuaraan: "",
  tahun_kejuaraan: "",
  link_dokumen: "",
  komitmen: false,
};

// ─── Shared Step Props ────────────────────────────────
export interface G1StepProps {
  form: G1FormData;
  setForm: React.Dispatch<React.SetStateAction<G1FormData>>;
  errors: Partial<Record<keyof G1FormData, string>>;
}
