import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import PmbmStepIndicator from "../components/PmbmStepIndicator";
import PmbmNavButtons from "../components/PmbmNavButtons";
import G1Step1Jalur from "./steps/G1Step1Jalur";
import G1Step2DataSiswa from "./steps/G1Step2DataSiswa";
import G1Step3DataOrtu from "./steps/G1Step3DataOrtu";
import G1Step4Dokumen from "./steps/G1Step4Dokumen";
import G1Step5Review from "./steps/G1Step5Review";
import { G1_STEPS, G1_INITIAL_FORM } from "./gelombang1Types";
import { validateG1Step } from "./gelombang1Validation";
import pmbmApi from "../../../../api/pmbmApi";
import type { PmbmFormData } from "../../../../types/pmbmTypes";

const G1Form: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<PmbmFormData>(G1_INITIAL_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof PmbmFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleNext = () => {
    const stepErrors = validateG1Step(currentStep, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors({});
    setCurrentStep((s) => Math.min(s + 1, G1_STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
    <G1Step1Jalur key={0} form={form} setForm={setForm} errors={errors} />,
    <G1Step2DataSiswa key={1} form={form} setForm={setForm} errors={errors} />,
    <G1Step3DataOrtu key={2} form={form} setForm={setForm} errors={errors} />,
    <G1Step4Dokumen key={3} form={form} setForm={setForm} errors={errors} />,
    <G1Step5Review key={4} form={form} />,
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Pendaftaran PMBM
        </h1>
        <p className="text-secondary mt-1 text-sm">
          MAN 3 Kulon Progo — TA 2026/2027 · Gelombang I
        </p>
      </div>

      <PmbmStepIndicator steps={G1_STEPS} currentStep={currentStep} />

      <div className="card p-6 md:p-8 shadow-lg">
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          {React.createElement(G1_STEPS[currentStep].icon, {
            size: 20,
            className: "text-accent",
          })}
          {G1_STEPS[currentStep].label}
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

        <PmbmNavButtons
          currentStep={currentStep}
          totalSteps={G1_STEPS.length}
          isSubmitting={isSubmitting}
          onBack={handleBack}
          onNext={handleNext}
          onSubmit={handleSubmit}
        />
      </div>

      <p className="text-center text-xs text-secondary mt-4">
        Langkah {currentStep + 1} dari {G1_STEPS.length}
      </p>
    </div>
  );
};

export default G1Form;
