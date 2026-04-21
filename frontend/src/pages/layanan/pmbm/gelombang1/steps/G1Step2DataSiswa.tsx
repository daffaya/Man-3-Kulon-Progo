import React from "react";
import PmbmFormField from "../../components/PmbmFormField";
import { G1StepProps } from "../gelombang1Types";

const G1Step2DataSiswa: React.FC<G1StepProps> = ({ form, setForm, errors }) => {
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((f: any) => ({ ...f, [name]: value }));
  };

  return (
    <div className="space-y-4">
      <PmbmFormField label="Nama Lengkap" required error={errors.nama_lengkap}>
        <input
          type="text"
          name="nama_lengkap"
          value={form.nama_lengkap}
          onChange={handleChange}
          placeholder="Sesuai akta kelahiran"
          className={`form-input ${errors.nama_lengkap ? "border-[rgb(var(--color-error))]" : ""}`}
        />
      </PmbmFormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PmbmFormField label="NISN" required error={errors.nisn}>
          <input
            type="text"
            name="nisn"
            value={form.nisn}
            onChange={handleChange}
            placeholder="10 digit"
            maxLength={10}
            className={`form-input ${errors.nisn ? "border-[rgb(var(--color-error))]" : ""}`}
          />
        </PmbmFormField>

        <PmbmFormField
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
            className={`form-input ${errors.nik ? "border-[rgb(var(--color-error))]" : ""}`}
          />
        </PmbmFormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PmbmFormField
          label="Tempat Lahir"
          required
          error={errors.tempat_lahir}
        >
          <input
            type="text"
            name="tempat_lahir"
            value={form.tempat_lahir}
            onChange={handleChange}
            placeholder="Kota/Kabupaten"
            className={`form-input ${errors.tempat_lahir ? "border-[rgb(var(--color-error))]" : ""}`}
          />
        </PmbmFormField>

        <PmbmFormField
          label="Tanggal Lahir"
          required
          error={errors.tanggal_lahir}
        >
          <input
            type="date"
            name="tanggal_lahir"
            value={form.tanggal_lahir}
            onChange={handleChange}
            className={`form-input ${errors.tanggal_lahir ? "border-[rgb(var(--color-error))]" : ""}`}
          />
        </PmbmFormField>
      </div>

      <PmbmFormField
        label="Jenis Kelamin"
        required
        error={errors.jenis_kelamin}
      >
        <select
          name="jenis_kelamin"
          value={form.jenis_kelamin}
          onChange={handleChange}
          className={`form-input ${errors.jenis_kelamin ? "border-[rgb(var(--color-error))]" : ""}`}
        >
          <option value="">Pilih Jenis Kelamin</option>
          <option value="L">Laki-laki</option>
          <option value="P">Perempuan</option>
        </select>
      </PmbmFormField>

      <PmbmFormField
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
          className={`form-input ${errors.asal_sekolah ? "border-[rgb(var(--color-error))]" : ""}`}
        />
      </PmbmFormField>

      <PmbmFormField
        label="No. Kartu Keluarga (KK)"
        required
        error={errors.no_kk}
      >
        <input
          type="text"
          name="no_kk"
          value={form.no_kk}
          onChange={handleChange}
          placeholder="16 digit"
          maxLength={16}
          className={`form-input ${errors.no_kk ? "border-[rgb(var(--color-error))]" : ""}`}
        />
      </PmbmFormField>

      <PmbmFormField
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
          className={`form-input ${errors.alamat_lengkap ? "border-[rgb(var(--color-error))]" : ""}`}
        />
      </PmbmFormField>

      <PmbmFormField
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
          className={`form-input ${errors.alamat_domisili ? "border-[rgb(var(--color-error))]" : ""}`}
        />
      </PmbmFormField>

      <PmbmFormField
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
          className={`form-input ${errors.no_hp_siswa ? "border-[rgb(var(--color-error))]" : ""}`}
        />
      </PmbmFormField>
    </div>
  );
};

export default G1Step2DataSiswa;
