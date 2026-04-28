/**
 * @fileoverview Step 3 (Dokumen & Minat) component for G2 registration form.
 * Handles input for TKA scores, program selection, optional KKO interest,
 * supporting documents, and commitment agreement.
 */

import React from "react";
import { AlertCircle, Shield } from "lucide-react";
import PmbmFormField from "../../components/PmbmFormField";
import type { G2StepProps } from "../gelombang2Types";
import { G2_KETERAMPILAN_OPTIONS } from "../gelombang2Types";
import type { PilihanKeterampilan } from "../../../../../types/pmbmTypes";

/**
 * Step 3 form section: Dokumen & Minat.
 */
const G2Step3Dokumen: React.FC<G2StepProps> = ({ form, setForm, errors }) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  return (
    <div className="space-y-6">
      {/* ====== PILIHAN PROGRAM ====== */}
      <div className="space-y-3">
        {/* Nilai TKA */}
        <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
          <h4 className="text-sm font-medium mb-1 text-foreground">
            Nilai TKA (Tes Kemampuan Akademik)
          </h4>
          <p className="text-xs text-secondary mb-4">
            Masukkan nilai TKA kamu. Nilai ini akan digunakan untuk seleksi
            tahap selanjutnya.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PmbmFormField
              label="Nilai Literasi"
              required
              error={errors.nilai_tka_literasi}
              hint="Skala 0–100"
            >
              <input
                type="number"
                name="nilai_tka_literasi"
                value={form.nilai_tka_literasi}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    nilai_tka_literasi:
                      e.target.value === "" ? "" : Number(e.target.value),
                  }))
                }
                min={0}
                max={100}
                step={0.01}
                placeholder="Contoh: 78.50"
                className={`form-input ${
                  errors.nilai_tka_literasi
                    ? "border-[rgb(var(--color-error))]"
                    : ""
                }`}
              />
            </PmbmFormField>

            <PmbmFormField
              label="Nilai Numerasi"
              required
              error={errors.nilai_tka_numerasi}
              hint="Skala 0–100"
            >
              <input
                type="number"
                name="nilai_tka_numerasi"
                value={form.nilai_tka_numerasi}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    nilai_tka_numerasi:
                      e.target.value === "" ? "" : Number(e.target.value),
                  }))
                }
                min={0}
                max={100}
                step={0.01}
                placeholder="Contoh: 82.00"
                className={`form-input ${
                  errors.nilai_tka_numerasi
                    ? "border-[rgb(var(--color-error))]"
                    : ""
                }`}
              />
            </PmbmFormField>
          </div>
        </div>

        {/* Pilihan Program */}
        <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary">
          Pilihan Program
        </h3>

        <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
          <h4 className="text-sm font-medium mb-1 text-foreground">
            Minat Program Keterampilan
            <span className="text-red-500 ml-1">*</span>
          </h4>
          <p className="text-xs text-secondary mb-3">
            Pilih program keterampilan yang kamu minati.
          </p>

          <PmbmFormField
            label="Pilihan Keterampilan"
            error={errors.pilihan_keterampilan}
          >
            <select
              name="pilihan_keterampilan"
              value={form.pilihan_keterampilan ?? ""}
              onChange={(e) => {
                const value = e.target.value as PilihanKeterampilan | "";
                setForm((f) => ({
                  ...f,
                  pilihan_keterampilan: value,
                }));
              }}
              className={`form-input ${
                errors.pilihan_keterampilan ? "border-red-500" : ""
              }`}
              required
            >
              <option value="">-- Pilih Keterampilan --</option>
              {G2_KETERAMPILAN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </PmbmFormField>
        </div>

        {/* Minat KKO */}
        <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-foreground">
              Kelas Khusus Olahraga (KKO)
            </h4>
            <span className="text-[10px] font-medium uppercase tracking-wider text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
              Opsional
            </span>
          </div>

          <p className="text-xs text-secondary mb-3">
            Untuk siswa yang memiliki minat di bidang olahraga (terutama bela
            diri).
          </p>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 accent-accent"
              checked={form.minat_kko || false}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  minat_kko: e.target.checked,
                }))
              }
            />
            <span className="text-sm text-foreground">
              Saya ingin ikut kelas KKO
            </span>
          </label>

          <p className="text-xs text-secondary mt-2 leading-relaxed pl-7">
            Peserta akan mengikuti <strong>tes tambahan</strong> untuk seleksi
            KKO.
          </p>

          {/* Data KKO (muncul jika checkbox dicentang) */}
          {form.minat_kko && (
            <div className="mt-4 p-4 bg-background border border-accent/20 rounded-xl">
              <h4 className="text-sm font-medium mb-3 text-foreground flex items-center gap-2">
                <Shield size={16} className="text-accent" />
                Data KKO
              </h4>

              <PmbmFormField
                label="Cabang Bela Diri / Olahraga"
                required
                error={errors.cabang_olahraga}
                hint="Tuliskan cabang bela diri atau olahraga yang kamu tekuni"
              >
                <input
                  type="text"
                  name="cabang_olahraga"
                  value={form.cabang_olahraga}
                  onChange={handleChange}
                  placeholder="Contoh: Kempo, Pencak Silat, Karate, Taekwondo"
                  className={`form-input ${
                    errors.cabang_olahraga
                      ? "border-[rgb(var(--color-error))]"
                      : ""
                  }`}
                />
              </PmbmFormField>
            </div>
          )}
        </div>
      </div>

      {/* ====== DOKUMEN ====== */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary">
          Dokumen Pendukung
        </h3>

        <div className="p-4 border border-dashed border-secondary/30 rounded-xl">
          <h4 className="text-sm font-medium text-foreground mb-1">
            Link Dokumen Google Drive
          </h4>
          <p className="text-xs text-secondary mb-3">
            Opsional — upload dokumen ke Google Drive lalu tempelkan link di
            sini. Pastikan untuk share link dengan akses "Siapa saja yang
            memiliki link dapat melihat".
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
      </div>

      {/* ====== KOMITMEN ====== */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300/50 rounded-xl">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 w-4 h-4 accent-accent"
            checked={form.komitmen}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                komitmen: e.target.checked,
              }))
            }
          />
          <span className="text-sm text-foreground">
            Saya bersedia dan berkomitmen untuk melanjutkan pendidikan di
            <strong> MAN 3 Kulon Progo</strong> apabila diterima.
          </span>
        </label>

        {errors.komitmen && (
          <p className="text-[rgb(var(--color-error))] text-sm mt-2 flex items-center gap-1 pl-7">
            <AlertCircle size={12} />
            {errors.komitmen}
          </p>
        )}
      </div>
    </div>
  );
};

export default G2Step3Dokumen;
