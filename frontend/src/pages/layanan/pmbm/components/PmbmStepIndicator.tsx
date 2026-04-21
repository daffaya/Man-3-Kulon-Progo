import React from "react";
import { CheckCircle, LucideIcon } from "lucide-react";

interface Step {
  label: string;
  icon: LucideIcon;
}

interface PmbmStepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

const PmbmStepIndicator: React.FC<PmbmStepIndicatorProps> = ({
  steps,
  currentStep,
}) => (
  <div className="flex items-center justify-between mb-8 relative">
    <div className="absolute top-5 left-0 right-0 h-0.5 bg-secondary/20 z-0" />
    {steps.map((step, i) => {
      const Icon = step.icon;
      const isDone = i < currentStep;
      const isActive = i === currentStep;
      return (
        <div key={i} className="flex flex-col items-center gap-1 z-10 flex-1">
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
);

export default PmbmStepIndicator;
