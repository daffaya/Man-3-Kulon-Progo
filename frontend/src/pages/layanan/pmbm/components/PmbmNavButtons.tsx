import React from "react";
import { ChevronLeft, ChevronRight, CheckCircle, Loader2 } from "lucide-react";

interface PmbmNavButtonsProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

const PmbmNavButtons: React.FC<PmbmNavButtonsProps> = ({
  currentStep,
  totalSteps,
  isSubmitting,
  onBack,
  onNext,
  onSubmit,
}) => (
  <div className="flex justify-between mt-8 gap-3">
    <button
      type="button"
      onClick={onBack}
      disabled={currentStep === 0}
      className="btn btn-secondary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <ChevronLeft size={18} />
      Kembali
    </button>

    {currentStep < totalSteps - 1 ? (
      <button
        type="button"
        onClick={onNext}
        className="btn btn-primary flex items-center gap-2"
      >
        Lanjut
        <ChevronRight size={18} />
      </button>
    ) : (
      <button
        type="button"
        onClick={onSubmit}
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
);

export default PmbmNavButtons;
