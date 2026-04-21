import React from "react";
import { BookOpen, Shield, Star, AlertCircle } from "lucide-react";
import PmbmFormField from "../../components/PmbmFormField";
import { G1StepProps } from "../gelombang1Types";

const G1Step4Dokumen: React.FC<G1StepProps> = ({ form, setForm, errors }) => {
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((f: any) => ({ ...f, [name]: value }));
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
          <PmbmFormField
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
              className={`form-input ${errors.jumlah_hafalan_juz ? "border-[rgb(var(--color-error))]" : ""}`}
            />
          </PmbmFormField>
        </div>
      )}

      {/* KKO */}
      {form.jalur === "kko" && (
        <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
          <h4 className="text-sm font-medium mb-3 text-foreground flex items-center gap-2">
            <Shield size={16} className="text-accent" />
            Data KKO
          </h4>
          <PmbmFormField
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
              className={`form-input ${errors.cabang_olahraga ? "border-[rgb(var(--color-error))]" : ""}`}
            />
          </PmbmFormField>
        </div>
      )}

      {/* Akademik */}
      {form.jalur === "akademik" && (
        <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
          <h4 className="text-sm font-medium mb-3 text-foreground flex items-center gap-2">
            <Star size={16} className="text-accent" />
            Data Akademik
          </h4>
          <PmbmFormField
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
              className={`form-input ${errors.rata_rata_rapor ? "border-[rgb(var(--color-error))]" : ""}`}
            />
          </PmbmFormField>
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
            <PmbmFormField
              label="Jenis Kejuaraan"
              error={errors.jenis_kejuaraan}
            >
              <input
                type="text"
                name="jenis_kejuaraan"
                value={form.jenis_kejuaraan}
                onChange={handleChange}
                placeholder="Contoh: Olahraga, Akademik, Kesenian, Tahfidz"
                className="form-input"
              />
            </PmbmFormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PmbmFormField
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
              </PmbmFormField>

              <PmbmFormField
                label="Tahun Kejuaraan"
                error={errors.tahun_kejuaraan}
              >
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
              </PmbmFormField>
            </div>

            <PmbmFormField
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
            </PmbmFormField>
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
        <PmbmFormField label="Link Google Drive" error={errors.link_dokumen}>
          <input
            type="url"
            name="link_dokumen"
            value={form.link_dokumen}
            onChange={handleChange}
            placeholder="https://drive.google.com/..."
            className="form-input"
          />
        </PmbmFormField>
      </div>

      {/* Komitmen */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300/50 rounded-xl">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 w-4 h-4 accent-accent"
            checked={form.komitmen}
            onChange={(e) =>
              setForm((f: any) => ({ ...f, komitmen: e.target.checked }))
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

export default G1Step4Dokumen;
