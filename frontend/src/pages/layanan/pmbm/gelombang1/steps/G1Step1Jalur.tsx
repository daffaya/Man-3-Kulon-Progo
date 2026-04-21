import React from "react";
import { AlertCircle } from "lucide-react";
import PmbmFormField from "../../components/PmbmFormField";
import type { G1StepProps } from "../gelombang1Types";
import { G1_JALUR_OPTIONS, G1_KETERAMPILAN_OPTIONS } from "../gelombang1Types";
import type { PilihanKeterampilan } from "../../../../../types/pmbmTypes";

const G1Step1Jalur: React.FC<G1StepProps> = ({ form, setForm, errors }) => (
  <div className="space-y-6">
    <p className="text-sm text-secondary">
      Pilih jalur yang sesuai dengan prestasi dan minatmu.
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {G1_JALUR_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const isActive = form.jalur === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() =>
              setForm((f: any) => ({
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
      <PmbmFormField
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
            setForm((f: any) => ({
              ...f,
              pilihan_keterampilan: e.target.value as PilihanKeterampilan,
            }))
          }
        >
          <option value="">-- Pilih program --</option>
          {G1_KETERAMPILAN_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </PmbmFormField>
    )}
  </div>
);

export default G1Step1Jalur;
