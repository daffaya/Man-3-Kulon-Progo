/**
 * @fileoverview Constants and type definitions for Gelombang 2 (G2) registration form.
 * Includes step configuration, select options, form state shape, and shared props.
 */

import type { PilihanKeterampilan } from "../../../../types/pmbmTypes";
import { User, Users, FileText, CheckCircle } from "lucide-react";

/**
 * Step configuration for multi-step form.
 */
export const G2_STEPS = [
  { label: "Data Siswa", icon: User },
  { label: "Data Ortu", icon: Users },
  { label: "Dokumen", icon: FileText },
  { label: "Review", icon: CheckCircle },
];

/**
 * Options for keterampilan selection.
 */
export const G2_KETERAMPILAN_OPTIONS: {
  value: PilihanKeterampilan;
  label: string;
}[] = [
  { value: "titl", label: "TITL (Teknik Instalasi Tenaga Listrik)" },
  { value: "tata_busana", label: "Tata Busana" },
  { value: "multimedia", label: "Multimedia" },
];

/**
 * Options for parental income selection.
 */
export const G2_PENGHASILAN_OPTIONS = [
  "< Rp 500.000",
  "Rp 500.000 – Rp 1.000.000",
  "Rp 1.000.000 – Rp 2.000.000",
  "Rp 2.000.000 – Rp 3.500.000",
  "Rp 3.500.000 – Rp 5.000.000",
  "> Rp 5.000.000",
];

/**
 * Form state structure for G2 registration.
 */
export interface G2FormData {
  // Siswa
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

  // Ortu
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

  // Dokumen & Minat
  nilai_tka_literasi: number | "";
  nilai_tka_numerasi: number | "";
  pilihan_keterampilan: PilihanKeterampilan | "";
  minat_kko?: boolean;
  cabang_olahraga: string;
  link_dokumen: string;
  komitmen: boolean;
}

/**
 * Initial state for G2 form.
 */
export const G2_INITIAL_FORM: G2FormData = {
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
  nilai_tka_literasi: "",
  nilai_tka_numerasi: "",
  pilihan_keterampilan: "",
  minat_kko: false,
  cabang_olahraga: "",
  link_dokumen: "",
  komitmen: false,
};

/**
 * Shared props for each form step component.
 */
export interface G2StepProps {
  form: G2FormData;
  setForm: React.Dispatch<React.SetStateAction<G2FormData>>;
  errors: Partial<Record<keyof G2FormData, string>>;
}
