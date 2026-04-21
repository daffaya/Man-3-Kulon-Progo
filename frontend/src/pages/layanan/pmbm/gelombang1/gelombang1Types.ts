import type {
  PmbmFormData,
  JalurPendaftaran,
  PilihanKeterampilan,
} from "../pmbmTypes";
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
export const G1_INITIAL_FORM: PmbmFormData = {
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
  form: PmbmFormData;
  setForm: React.Dispatch<React.SetStateAction<PmbmFormData>>;
  errors: Partial<Record<keyof PmbmFormData, string>>;
}
