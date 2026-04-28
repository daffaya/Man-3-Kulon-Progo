import React from "react";
import PmbmFormField from "../../components/PmbmFormField";
import type { G2StepProps } from "../gelombang2Types";
import { G2_PENGHASILAN_OPTIONS } from "../gelombang2Types";

const G2Step2DataOrtu: React.FC<G2StepProps> = ({ form, setForm, errors }) => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PmbmFormField label="Nama Ayah" required error={errors.nama_ayah}>
          <input
            type="text"
            name="nama_ayah"
            value={form.nama_ayah}
            onChange={handleChange}
            placeholder="Nama lengkap ayah"
            className={`form-input ${errors.nama_ayah ? "border-[rgb(var(--color-error))]" : ""}`}
          />
        </PmbmFormField>

        <PmbmFormField label="Nama Ibu" required error={errors.nama_ibu}>
          <input
            type="text"
            name="nama_ibu"
            value={form.nama_ibu}
            onChange={handleChange}
            placeholder="Nama lengkap ibu"
            className={`form-input ${errors.nama_ibu ? "border-[rgb(var(--color-error))]" : ""}`}
          />
        </PmbmFormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PmbmFormField label="Pekerjaan Ayah">
          <input
            type="text"
            name="pekerjaan_ayah"
            value={form.pekerjaan_ayah}
            onChange={handleChange}
            placeholder="Contoh: Petani"
            className="form-input"
          />
        </PmbmFormField>

        <PmbmFormField label="Pekerjaan Ibu">
          <input
            type="text"
            name="pekerjaan_ibu"
            value={form.pekerjaan_ibu}
            onChange={handleChange}
            placeholder="Contoh: Ibu Rumah Tangga"
            className="form-input"
          />
        </PmbmFormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PmbmFormField label="Penghasilan Ayah / Bulan">
          <select
            name="penghasilan_ayah"
            value={form.penghasilan_ayah}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Pilih Rentang Penghasilan</option>
            {G2_PENGHASILAN_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </PmbmFormField>

        <PmbmFormField label="Penghasilan Ibu / Bulan">
          <select
            name="penghasilan_ibu"
            value={form.penghasilan_ibu}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Pilih Rentang Penghasilan</option>
            {G2_PENGHASILAN_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </PmbmFormField>
      </div>

      <PmbmFormField
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
      </PmbmFormField>

      <PmbmFormField
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
      </PmbmFormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PmbmFormField label="No. HP Ayah / WhatsApp">
          <input
            type="tel"
            name="no_hp_ayah"
            value={form.no_hp_ayah}
            onChange={handleChange}
            placeholder="08xxxxxxxxxx"
            className="form-input"
          />
        </PmbmFormField>

        <PmbmFormField label="No. HP Ibu / WhatsApp">
          <input
            type="tel"
            name="no_hp_ibu"
            value={form.no_hp_ibu}
            onChange={handleChange}
            placeholder="08xxxxxxxxxx"
            className="form-input"
          />
        </PmbmFormField>
      </div>
    </div>
  );
};

export default G2Step2DataOrtu;
