/**
 * @fileoverview Main component for Gelombang 2 (G2) PMBM registration form.
 * Handles step navigation, validation, submission, and state management.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import PmbmStepIndicator from "../components/PmbmStepIndicator";
import PmbmNavButtons from "../components/PmbmNavButtons";
import G2Step1DataSiswa from "./steps/G2Step1DataSiswa";
import G2Step2DataOrtu from "./steps/G2Step2DataOrtu";
import G2Step3Dokumen from "./steps/G2Step3Dokumen";
import G2Step4Review from "./steps/G2Step4Review";
import { G2_STEPS, G2_INITIAL_FORM } from "./gelombang2Types";
import { validateG2Step } from "./g2Validation";
import type { G2FormData } from "./gelombang2Types";
import pmbmApi from "../../../../api/pmbmApi";

/**
 * G2 multi-step registration form.
 */
const G2Form: React.FC = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<G2FormData>(G2_INITIAL_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof G2FormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleNext = () => {
    const stepErrors = validateG2Step(currentStep, form);

    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      scrollTop();
      return;
    }

    setErrors({});
    setCurrentStep((s) => Math.min(s + 1, G2_STEPS.length - 1));
    scrollTop();
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((s) => Math.max(s - 1, 0));
    scrollTop();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        ...form,
        jalur: "tes",
        gelombang: 2,
        nilai_tka_literasi: form.nilai_tka_literasi || null,
        nilai_tka_numerasi: form.nilai_tka_numerasi || null,
        // Field G1 fallback
        jumlah_hafalan_juz: null,
        cabang_olahraga: null,
        rata_rata_rapor: null,
        jenis_kejuaraan: null,
        tingkat_kejuaraan: null,
        nama_kejuaraan: null,
        tahun_kejuaraan: null,
      };

      const result = await pmbmApi.register(payload as any);

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
      scrollTop();
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepContent = [
    <G2Step1DataSiswa key={0} form={form} setForm={setForm} errors={errors} />,
    <G2Step2DataOrtu key={1} form={form} setForm={setForm} errors={errors} />,
    <G2Step3Dokumen key={2} form={form} setForm={setForm} errors={errors} />,
    <G2Step4Review key={3} form={form} />,
  ];

  const CurrentIcon = G2_STEPS[currentStep].icon;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Pendaftaran PMBM
        </h1>
        <p className="text-secondary mt-1 text-sm">
          MAN 3 Kulon Progo — TA 2026/2027 · Gelombang II
        </p>
      </div>

      <PmbmStepIndicator steps={G2_STEPS} currentStep={currentStep} />

      <div className="card p-6 md:p-8 shadow-lg">
        {/* Step Title */}
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <CurrentIcon size={20} className="text-accent" />
          {G2_STEPS[currentStep].label}
        </h2>

        {/* Submit Error */}
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

        {/* Step Content */}
        {stepContent[currentStep]}

        {/* Navigation */}
        <PmbmNavButtons
          currentStep={currentStep}
          totalSteps={G2_STEPS.length}
          isSubmitting={isSubmitting}
          onBack={handleBack}
          onNext={handleNext}
          onSubmit={handleSubmit}
        />
      </div>

      <p className="text-center text-xs text-secondary mt-4">
        Langkah {currentStep + 1} dari {G2_STEPS.length}
      </p>
    </div>
  );
};

export default G2Form;
