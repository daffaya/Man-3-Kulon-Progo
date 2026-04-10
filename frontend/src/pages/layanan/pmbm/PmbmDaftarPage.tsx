/**
 * @fileoverview PmbmDaftarPage - Multi-step registration wizard for PMBM MAN 3 Kulon Progo.
 * This page guides prospective students through a 5-step form covering registration track,
 * personal data, parent data, supporting documents, and a final review before submission.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Shield,
  Wrench,
  Star,
  Heart,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Users,
  FileText,
  ClipboardList,
} from "lucide-react";
import Layout from "../../../components/layout/Layout";
import pmbmApi from "../../../api/pmbmApi";
import type {
  PmbmFormData,
  JalurPendaftaran,
  PilihanKeterampilan,
} from "../../../types/pmbmTypes";
import { JALUR_LABEL, KETERAMPILAN_LABEL } from "../../../types/pmbmTypes";

/* ════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════ */

const INITIAL_FORM: PmbmFormData = {
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

const STEPS = [
  { label: "Jalur", icon: ClipboardList },
  { label: "Data Siswa", icon: User },
  { label: "Data Orang Tua", icon: Users },
  { label: "Dokumen", icon: FileText },
  { label: "Review", icon: CheckCircle },
];

const JALUR_OPTIONS = [
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

const KETERAMPILAN_OPTIONS: { value: PilihanKeterampilan; label: string }[] = [
  { value: "titl", label: "TITL (Teknik Instalasi Tenaga Listrik)" },
  { value: "tata_busana", label: "Tata Busana" },
  { value: "multimedia", label: "Multimedia" },
];

const PENGHASILAN_OPTIONS = [
  "< Rp 500.000",
  "Rp 500.000 – Rp 1.000.000",
  "Rp 1.000.000 – Rp 2.000.000",
  "Rp 2.000.000 – Rp 3.500.000",
  "Rp 3.500.000 – Rp 5.000.000",
  "> Rp 5.000.000",
];

/* ════════════════════════════════════════════
   VALIDATION
════════════════════════════════════════════ */

/**
 * Validates the form data for the given step index.
 * @param {number} step - The current step index (0-based).
 * @param {PmbmFormData} form - The current form data.
 * @returns {Partial<Record<keyof PmbmFormData, string>>} An object containing validation error messages.
 */
const validateStep = (
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

/* ════════════════════════════════════════════
   SHARED HELPER COMPONENTS
════════════════════════════════════════════ */

/**
 * Props for the FormField wrapper component.
 */
interface FormFieldProps {
  /** Field label text. */
  label: string;
  /** Whether the field is required. */
  required?: boolean;
  /** Validation error message to display. */
  error?: string;
  /** Optional hint text shown below the field when no error is present. */
  hint?: string;
  children: React.ReactNode;
}

/**
 * A wrapper component that renders a label, field content, hint, and error message.
 * @param {FormFieldProps} props - The component props.
 * @returns {JSX.Element} The rendered form field wrapper.
 */
const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  hint,
  children,
}) => (
  <div className="flex flex-col gap-1">
    <label className="block text-sm font-medium mb-1 text-foreground">
      {label}
      {required && (
        <span className="text-[rgb(var(--color-error))] ml-0.5">*</span>
      )}
    </label>
    {children}
    {hint && !error && <p className="text-xs text-secondary mt-1">{hint}</p>}
    {error && (
      <p className="text-[rgb(var(--color-error))] text-sm mt-1 flex items-center gap-1">
        <AlertCircle size={12} />
        {error}
      </p>
    )}
  </div>
);

/* ════════════════════════════════════════════
   STEP 1: PILIH JALUR
════════════════════════════════════════════ */

/**
 * Props for the Step1Jalur component.
 */
interface StepProps {
  form: PmbmFormData;
  setForm: React.Dispatch<React.SetStateAction<PmbmFormData>>;
  errors: Partial<Record<keyof PmbmFormData, string>>;
}

/**
 * Renders the jalur (registration track) selection step.
 * Shows a conditional dropdown for keterampilan program choice when applicable.
 * @param {StepProps} props - The component props.
 * @returns {JSX.Element} The rendered step component.
 */
const Step1Jalur: React.FC<StepProps> = ({ form, setForm, errors }) => (
  <div className="space-y-6">
    <p className="text-sm text-secondary">
      Pilih jalur yang sesuai dengan prestasi dan minatmu.
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {JALUR_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const isActive = form.jalur === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() =>
              setForm((f) => ({
                ...f,
                jalur: opt.value,
                pilihan_keterampilan: "",
              }))
            }
            className={`text-left p-4 rounded-xl border-2 transition-all duration-200
              hover:-translate-y-0.5 hover:shadow-md
              ${
                isActive
                  ? "border-accent bg-accent/10 shadow-md"
                  : "border-[rgb(var(--color-secondary))]/20 hover:border-accent/40"
              }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-full ${
                  isActive ? "bg-accent/20" : "bg-secondary/10"
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-accent" : "text-secondary"}
                />
              </div>
              <div>
                <p
                  className={`font-semibold text-sm ${
                    isActive ? "text-accent" : "text-foreground"
                  }`}
                >
                  {opt.label}
                </p>
                <p className="text-xs text-secondary mt-0.5">{opt.desc}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>

    {errors.jalur && (
      <p className="text-[rgb(var(--color-error))] text-sm flex items-center gap-1">
        <AlertCircle size={12} />
        {errors.jalur}
      </p>
    )}

    {form.jalur === "keterampilan" && (
      <FormField
        label="Pilihan Program Keterampilan"
        required
        error={errors.pilihan_keterampilan}
      >
        <select
          className={`form-input ${
            errors.pilihan_keterampilan
              ? "border-[rgb(var(--color-error))]"
              : ""
          }`}
          value={form.pilihan_keterampilan}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              pilihan_keterampilan: e.target.value as PilihanKeterampilan,
            }))
          }
        >
          <option value="">-- Pilih program --</option>
          {KETERAMPILAN_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </FormField>
    )}
  </div>
);

/* ════════════════════════════════════════════
   STEP 2: DATA SISWA
════════════════════════════════════════════ */

/**
 * Renders the student personal data form step.
 * @param {StepProps} props - The component props.
 * @returns {JSX.Element} The rendered step component.
 */
const Step2DataSiswa: React.FC<StepProps> = ({ form, setForm, errors }) => {
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  return (
    <div className="space-y-4">
      <FormField label="Nama Lengkap" required error={errors.nama_lengkap}>
        <input
          type="text"
          name="nama_lengkap"
          value={form.nama_lengkap}
          onChange={handleChange}
          placeholder="Sesuai akta kelahiran"
          className={`form-input ${
            errors.nama_lengkap ? "border-[rgb(var(--color-error))]" : ""
          }`}
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="NISN" required error={errors.nisn}>
          <input
            type="text"
            name="nisn"
            value={form.nisn}
            onChange={handleChange}
            placeholder="10 digit"
            maxLength={10}
            className={`form-input ${
              errors.nisn ? "border-[rgb(var(--color-error))]" : ""
            }`}
          />
        </FormField>

        <FormField
          label="NIK"
          required
          error={errors.nik}
          hint="16 digit sesuai KTP/KK"
        >
          <input
            type="text"
            name="nik"
            value={form.nik}
            onChange={handleChange}
            placeholder="16 digit"
            maxLength={16}
            className={`form-input ${
              errors.nik ? "border-[rgb(var(--color-error))]" : ""
            }`}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Tempat Lahir" required error={errors.tempat_lahir}>
          <input
            type="text"
            name="tempat_lahir"
            value={form.tempat_lahir}
            onChange={handleChange}
            placeholder="Kota/Kabupaten"
            className={`form-input ${
              errors.tempat_lahir ? "border-[rgb(var(--color-error))]" : ""
            }`}
          />
        </FormField>

        <FormField label="Tanggal Lahir" required error={errors.tanggal_lahir}>
          <input
            type="date"
            name="tanggal_lahir"
            value={form.tanggal_lahir}
            onChange={handleChange}
            className={`form-input ${
              errors.tanggal_lahir ? "border-[rgb(var(--color-error))]" : ""
            }`}
          />
        </FormField>
      </div>

      <FormField label="Jenis Kelamin" required error={errors.jenis_kelamin}>
        <select
          name="jenis_kelamin"
          value={form.jenis_kelamin}
          onChange={handleChange}
          className={`form-input ${
            errors.jenis_kelamin ? "border-[rgb(var(--color-error))]" : ""
          }`}
        >
          <option value="">Pilih Jenis Kelamin</option>
          <option value="L">Laki-laki</option>
          <option value="P">Perempuan</option>
        </select>
      </FormField>

      <FormField
        label="Asal Sekolah (SMP/MTs)"
        required
        error={errors.asal_sekolah}
      >
        <input
          type="text"
          name="asal_sekolah"
          value={form.asal_sekolah}
          onChange={handleChange}
          placeholder="Nama sekolah asal"
          className={`form-input ${
            errors.asal_sekolah ? "border-[rgb(var(--color-error))]" : ""
          }`}
        />
      </FormField>

      <FormField label="No. Kartu Keluarga (KK)" required error={errors.no_kk}>
        <input
          type="text"
          name="no_kk"
          value={form.no_kk}
          onChange={handleChange}
          placeholder="16 digit"
          maxLength={16}
          className={`form-input ${
            errors.no_kk ? "border-[rgb(var(--color-error))]" : ""
          }`}
        />
      </FormField>

      <FormField
        label="Alamat Lengkap"
        required
        error={errors.alamat_lengkap}
        hint="Sesuai Kartu Keluarga"
      >
        <textarea
          name="alamat_lengkap"
          value={form.alamat_lengkap}
          onChange={handleChange}
          rows={3}
          placeholder="Jalan, RT/RW, Desa, Kecamatan, Kabupaten"
          className={`form-input ${
            errors.alamat_lengkap ? "border-[rgb(var(--color-error))]" : ""
          }`}
        />
      </FormField>

      <FormField
        label="Alamat Domisili"
        required
        error={errors.alamat_domisili}
        hint="Isi sama dengan alamat di atas jika tidak berbeda"
      >
        <textarea
          name="alamat_domisili"
          value={form.alamat_domisili}
          onChange={handleChange}
          rows={3}
          placeholder="Alamat tinggal saat ini"
          className={`form-input ${
            errors.alamat_domisili ? "border-[rgb(var(--color-error))]" : ""
          }`}
        />
      </FormField>

      <FormField
        label="No. HP Siswa / WhatsApp"
        required
        error={errors.no_hp_siswa}
      >
        <input
          type="tel"
          name="no_hp_siswa"
          value={form.no_hp_siswa}
          onChange={handleChange}
          placeholder="08xxxxxxxxxx"
          className={`form-input ${
            errors.no_hp_siswa ? "border-[rgb(var(--color-error))]" : ""
          }`}
        />
      </FormField>
    </div>
  );
};

/* ════════════════════════════════════════════
   STEP 3: DATA ORANG TUA
════════════════════════════════════════════ */

/**
 * Renders the parent data form step.
 * @param {StepProps} props - The component props.
 * @returns {JSX.Element} The rendered step component.
 */
const Step3DataOrtu: React.FC<StepProps> = ({ form, setForm, errors }) => {
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Nama Ayah" required error={errors.nama_ayah}>
          <input
            type="text"
            name="nama_ayah"
            value={form.nama_ayah}
            onChange={handleChange}
            placeholder="Nama lengkap ayah"
            className={`form-input ${
              errors.nama_ayah ? "border-[rgb(var(--color-error))]" : ""
            }`}
          />
        </FormField>

        <FormField label="Nama Ibu" required error={errors.nama_ibu}>
          <input
            type="text"
            name="nama_ibu"
            value={form.nama_ibu}
            onChange={handleChange}
            placeholder="Nama lengkap ibu"
            className={`form-input ${
              errors.nama_ibu ? "border-[rgb(var(--color-error))]" : ""
            }`}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Pekerjaan Ayah">
          <input
            type="text"
            name="pekerjaan_ayah"
            value={form.pekerjaan_ayah}
            onChange={handleChange}
            placeholder="Contoh: Petani"
            className="form-input"
          />
        </FormField>

        <FormField label="Pekerjaan Ibu">
          <input
            type="text"
            name="pekerjaan_ibu"
            value={form.pekerjaan_ibu}
            onChange={handleChange}
            placeholder="Contoh: Ibu Rumah Tangga"
            className="form-input"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Penghasilan Ayah / Bulan">
          <select
            name="penghasilan_ayah"
            value={form.penghasilan_ayah}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Pilih Rentang Penghasilan</option>
            {PENGHASILAN_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Penghasilan Ibu / Bulan">
          <select
            name="penghasilan_ibu"
            value={form.penghasilan_ibu}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Pilih Rentang Penghasilan</option>
            {PENGHASILAN_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField
        label="Alamat Orang Tua"
        hint="Sesuai Kartu Keluarga orang tua"
      >
        <textarea
          name="alamat_ortu"
          value={form.alamat_ortu}
          onChange={handleChange}
          rows={3}
          placeholder="Jalan, RT/RW, Desa, Kecamatan, Kabupaten"
          className="form-input"
        />
      </FormField>

      <FormField
        label="Alamat Domisili Orang Tua"
        hint="Isi sama dengan alamat di atas jika tidak berbeda"
      >
        <textarea
          name="alamat_domisili_ortu"
          value={form.alamat_domisili_ortu}
          onChange={handleChange}
          rows={3}
          placeholder="Alamat tinggal saat ini"
          className="form-input"
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="No. HP Ayah / WhatsApp">
          <input
            type="tel"
            name="no_hp_ayah"
            value={form.no_hp_ayah}
            onChange={handleChange}
            placeholder="08xxxxxxxxxx"
            className="form-input"
          />
        </FormField>

        <FormField label="No. HP Ibu / WhatsApp">
          <input
            type="tel"
            name="no_hp_ibu"
            value={form.no_hp_ibu}
            onChange={handleChange}
            placeholder="08xxxxxxxxxx"
            className="form-input"
          />
        </FormField>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════
   STEP 4: DOKUMEN & KONDISIONAL
════════════════════════════════════════════ */

/**
 * Renders the conditional fields and document link step.
 * Fields shown depend on the registration track chosen in step 1.
 * @param {StepProps} props - The component props.
 * @returns {JSX.Element} The rendered step component.
 */
const Step4Dokumen: React.FC<StepProps> = ({ form, setForm, errors }) => {
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const showKejuaraan = ["kko", "non_akademik", "tahfidz"].includes(form.jalur);

  return (
    <div className="space-y-6">
      {/* Tahfidz */}
      {form.jalur === "tahfidz" && (
        <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
          <h4 className="text-sm font-medium mb-3 text-foreground flex items-center gap-2">
            <BookOpen size={16} className="text-accent" />
            Data Tahfidz
          </h4>
          <FormField
            label="Jumlah Hafalan (Juz)"
            required
            error={errors.jumlah_hafalan_juz}
          >
            <input
              type="number"
              name="jumlah_hafalan_juz"
              value={form.jumlah_hafalan_juz}
              onChange={handleChange}
              min={1}
              max={30}
              placeholder="Contoh: 5"
              className={`form-input ${
                errors.jumlah_hafalan_juz
                  ? "border-[rgb(var(--color-error))]"
                  : ""
              }`}
            />
          </FormField>
        </div>
      )}

      {/* KKO */}
      {form.jalur === "kko" && (
        <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
          <h4 className="text-sm font-medium mb-3 text-foreground flex items-center gap-2">
            <Shield size={16} className="text-accent" />
            Data KKO
          </h4>
          <FormField
            label="Cabang Olahraga / Bela Diri"
            required
            error={errors.cabang_olahraga}
          >
            <input
              type="text"
              name="cabang_olahraga"
              value={form.cabang_olahraga}
              onChange={handleChange}
              placeholder="Contoh: Pencak Silat, Taekwondo, Sepak Bola"
              className={`form-input ${
                errors.cabang_olahraga ? "border-[rgb(var(--color-error))]" : ""
              }`}
            />
          </FormField>
        </div>
      )}

      {/* Akademik */}
      {form.jalur === "akademik" && (
        <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
          <h4 className="text-sm font-medium mb-3 text-foreground flex items-center gap-2">
            <Star size={16} className="text-accent" />
            Data Akademik
          </h4>
          <FormField
            label="Rata-rata Nilai Rapor (semester 1–5)"
            required
            error={errors.rata_rata_rapor}
            hint="Nilai rata-rata semua mata pelajaran, skala 0–100"
          >
            <input
              type="number"
              name="rata_rata_rapor"
              value={form.rata_rata_rapor}
              onChange={handleChange}
              min={0}
              max={100}
              step={0.01}
              placeholder="Contoh: 87.50"
              className={`form-input ${
                errors.rata_rata_rapor ? "border-[rgb(var(--color-error))]" : ""
              }`}
            />
          </FormField>
        </div>
      )}

      {/* Kejuaraan */}
      {showKejuaraan && (
        <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
          <h4 className="text-sm font-medium mb-3 text-foreground">
            Data Sertifikat / Kejuaraan{" "}
            <span className="text-secondary font-normal">(jika ada)</span>
          </h4>
          <div className="space-y-4">
            <FormField label="Jenis Kejuaraan" error={errors.jenis_kejuaraan}>
              <input
                type="text"
                name="jenis_kejuaraan"
                value={form.jenis_kejuaraan}
                onChange={handleChange}
                placeholder="Contoh: Olahraga, Akademik, Kesenian, Tahfidz"
                className="form-input"
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Tingkat Kejuaraan"
                error={errors.tingkat_kejuaraan}
              >
                <select
                  name="tingkat_kejuaraan"
                  value={form.tingkat_kejuaraan}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Pilih Tingkat</option>
                  <option value="kecamatan">Kecamatan</option>
                  <option value="kabupaten">Kabupaten / Kota</option>
                  <option value="provinsi">Provinsi</option>
                  <option value="nasional">Nasional</option>
                </select>
              </FormField>

              <FormField label="Tahun Kejuaraan" error={errors.tahun_kejuaraan}>
                <input
                  type="number"
                  name="tahun_kejuaraan"
                  value={form.tahun_kejuaraan}
                  onChange={handleChange}
                  min={2020}
                  max={2026}
                  placeholder="Contoh: 2025"
                  className="form-input"
                />
              </FormField>
            </div>

            <FormField
              label="Nama / Judul Kejuaraan"
              error={errors.nama_kejuaraan}
            >
              <input
                type="text"
                name="nama_kejuaraan"
                value={form.nama_kejuaraan}
                onChange={handleChange}
                placeholder="Contoh: Olimpiade Sains Kabupaten Kulon Progo"
                className="form-input"
              />
            </FormField>
          </div>
        </div>
      )}

      {/* Link Dokumen */}
      <div className="p-4 border border-dashed border-secondary/30 rounded-xl">
        <h4 className="text-sm font-medium text-foreground mb-1">
          Link Dokumen Google Drive
        </h4>
        <p className="text-xs text-secondary mb-3">
          Opsional — upload KK, akta, ijazah, dan sertifikat ke Google Drive
          lalu tempelkan link-nya di sini. Dokumen fisik tetap wajib dibawa saat
          verifikasi berkas.
        </p>
        <FormField label="Link Google Drive" error={errors.link_dokumen}>
          <input
            type="url"
            name="link_dokumen"
            value={form.link_dokumen}
            onChange={handleChange}
            placeholder="https://drive.google.com/..."
            className="form-input"
          />
        </FormField>
      </div>

      {/* Komitmen */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300/50 rounded-xl">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 w-4 h-4 accent-accent"
            checked={form.komitmen}
            onChange={(e) =>
              setForm((f) => ({ ...f, komitmen: e.target.checked }))
            }
          />
          <span className="text-sm text-foreground">
            Apabila saya diterima di <strong>MAN 3 Kulon Progo</strong> dan juga
            diterima di sekolah lain, saya{" "}
            <strong>bersedia dan berkomitmen</strong> untuk tetap melanjutkan
            pendidikan di MAN 3 Kulon Progo.
          </span>
        </label>
        {errors.komitmen && (
          <p className="text-[rgb(var(--color-error))] text-sm mt-2 flex items-center gap-1">
            <AlertCircle size={12} />
            {errors.komitmen}
          </p>
        )}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════
   STEP 5: REVIEW
════════════════════════════════════════════ */

/**
 * Props for the ReviewRow helper component.
 */
interface ReviewRowProps {
  label: string;
  value: React.ReactNode;
}

/**
 * Renders a single label-value row for the review step.
 * @param {ReviewRowProps} props - The component props.
 * @returns {JSX.Element} The rendered review row.
 */
const ReviewRow: React.FC<ReviewRowProps> = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2 border-b border-secondary/10 last:border-0">
    <span className="text-xs text-secondary sm:w-48 flex-shrink-0">
      {label}
    </span>
    <span className="text-sm text-foreground font-medium">
      {value || <span className="text-secondary italic">—</span>}
    </span>
  </div>
);

/**
 * Renders a complete summary of all filled form data for final review.
 * @param {{ form: PmbmFormData }} props - The component props.
 * @returns {JSX.Element} The rendered review step.
 */
const Step5Review: React.FC<{ form: PmbmFormData }> = ({ form }) => (
  <div className="space-y-6">
    <p className="text-sm text-secondary">
      Periksa kembali data yang kamu isi. Pastikan semua informasi sudah benar
      sebelum submit.
    </p>

    <div className="card p-5">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-accent mb-3">
        Jalur
      </h4>
      <ReviewRow
        label="Jalur Pendaftaran"
        value={JALUR_LABEL[form.jalur as keyof typeof JALUR_LABEL]}
      />
      {form.jalur === "keterampilan" && (
        <ReviewRow
          label="Program Keterampilan"
          value={
            KETERAMPILAN_LABEL[
              form.pilihan_keterampilan as keyof typeof KETERAMPILAN_LABEL
            ]
          }
        />
      )}
    </div>

    <div className="card p-5">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-accent mb-3">
        Data Siswa
      </h4>
      <ReviewRow label="Nama Lengkap" value={form.nama_lengkap} />
      <ReviewRow label="NISN" value={form.nisn} />
      <ReviewRow label="NIK" value={form.nik} />
      <ReviewRow label="Tempat Lahir" value={form.tempat_lahir} />
      <ReviewRow label="Tanggal Lahir" value={form.tanggal_lahir} />
      <ReviewRow
        label="Jenis Kelamin"
        value={form.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
      />
      <ReviewRow label="Asal Sekolah" value={form.asal_sekolah} />
      <ReviewRow label="No. KK" value={form.no_kk} />
      <ReviewRow label="Alamat Lengkap" value={form.alamat_lengkap} />
      <ReviewRow label="Alamat Domisili" value={form.alamat_domisili} />
      <ReviewRow label="No. HP Siswa" value={form.no_hp_siswa} />
    </div>

    <div className="card p-5">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-accent mb-3">
        Data Orang Tua
      </h4>
      <ReviewRow label="Nama Ayah" value={form.nama_ayah} />
      <ReviewRow label="Nama Ibu" value={form.nama_ibu} />
      <ReviewRow label="Pekerjaan Ayah" value={form.pekerjaan_ayah} />
      <ReviewRow label="Pekerjaan Ibu" value={form.pekerjaan_ibu} />
      <ReviewRow label="Penghasilan Ayah" value={form.penghasilan_ayah} />
      <ReviewRow label="Penghasilan Ibu" value={form.penghasilan_ibu} />
      <ReviewRow label="Alamat Orang Tua" value={form.alamat_ortu} />
      <ReviewRow label="Domisili Orang Tua" value={form.alamat_domisili_ortu} />
      <ReviewRow label="No. HP Ayah" value={form.no_hp_ayah} />
      <ReviewRow label="No. HP Ibu" value={form.no_hp_ibu} />
    </div>

    <div className="card p-5">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-accent mb-3">
        Dokumen & Tambahan
      </h4>
      {form.jalur === "tahfidz" && (
        <ReviewRow
          label="Hafalan"
          value={
            form.jumlah_hafalan_juz ? `${form.jumlah_hafalan_juz} Juz` : ""
          }
        />
      )}
      {form.jalur === "kko" && (
        <ReviewRow label="Cabang Olahraga" value={form.cabang_olahraga} />
      )}
      {form.jalur === "akademik" && (
        <ReviewRow
          label="Rata-rata Rapor"
          value={form.rata_rata_rapor ? String(form.rata_rata_rapor) : ""}
        />
      )}
      {form.nama_kejuaraan && (
        <ReviewRow
          label="Kejuaraan"
          value={`${form.nama_kejuaraan} (${form.tingkat_kejuaraan}, ${form.tahun_kejuaraan})`}
        />
      )}
      <ReviewRow
        label="Link Dokumen"
        value={form.link_dokumen || "Tidak dilampirkan"}
      />
      <ReviewRow
        label="Komitmen"
        value={form.komitmen ? "✅ Bersedia" : "❌ Belum dicentang"}
      />
    </div>
  </div>
);

/* ════════════════════════════════════════════
   MAIN PAGE COMPONENT
════════════════════════════════════════════ */

/**
 * The main PMBM registration wizard page.
 * Manages step navigation, form state, validation, and submission.
 * On successful submission, navigates to the success page with registration data.
 * @returns {JSX.Element} The rendered PMBM registration page.
 */
const PmbmDaftarPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<PmbmFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof PmbmFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  /**
   * Validates the current step and advances to the next step if valid.
   */
  const handleNext = () => {
    const stepErrors = validateStep(currentStep, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors({});
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Clears errors and returns to the previous step.
   */
  const handleBack = () => {
    setErrors({});
    setCurrentStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Submits the completed form data to the backend.
   * On success, navigates to the success page with registration details.
   */
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const result = await pmbmApi.register(form);
      navigate("/layanan/pmbm/sukses", {
        state: {
          nomor_pendaftaran: result.data.nomor_pendaftaran,
          nama_lengkap: result.data.nama_lengkap,
          jalur: result.data.jalur,
        },
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.error ?? "Terjadi kesalahan, silakan coba lagi.";
      setSubmitError(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepContent = [
    <Step1Jalur key={0} form={form} setForm={setForm} errors={errors} />,
    <Step2DataSiswa key={1} form={form} setForm={setForm} errors={errors} />,
    <Step3DataOrtu key={2} form={form} setForm={setForm} errors={errors} />,
    <Step4Dokumen key={3} form={form} setForm={setForm} errors={errors} />,
    <Step5Review key={4} form={form} />,
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-semibackground py-10 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Pendaftaran PMBM
            </h1>
            <p className="text-secondary mt-1 text-sm">
              MAN 3 Kulon Progo — TA 2026/2027 · Gelombang I
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-secondary/20 z-0" />
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isDone = i < currentStep;
              const isActive = i === currentStep;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 z-10 flex-1"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                      ${
                        isDone
                          ? "bg-accent border-accent text-white"
                          : isActive
                            ? "bg-background border-accent text-accent shadow-md"
                            : "bg-background border-secondary/30 text-secondary"
                      }`}
                  >
                    {isDone ? <CheckCircle size={18} /> : <Icon size={16} />}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block transition-colors
                      ${isActive ? "text-accent" : isDone ? "text-accent/70" : "text-secondary"}`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Form Card */}
          <div className="card p-6 md:p-8 shadow-lg">
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              {React.createElement(STEPS[currentStep].icon, {
                size: 20,
                className: "text-accent",
              })}
              {STEPS[currentStep].label}
            </h2>

            {submitError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-[rgb(var(--color-error))]/30 rounded-lg flex items-start gap-2">
                <AlertCircle
                  size={16}
                  className="text-[rgb(var(--color-error))] flex-shrink-0 mt-0.5"
                />
                <p className="text-sm text-[rgb(var(--color-error))]">
                  {submitError}
                </p>
              </div>
            )}

            {stepContent[currentStep]}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="btn btn-secondary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} /> Kembali
              </button>

              {currentStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-primary flex items-center gap-2"
                >
                  Lanjut <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Submit Pendaftaran
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-secondary mt-4">
            Langkah {currentStep + 1} dari {STEPS.length}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default PmbmDaftarPage;
