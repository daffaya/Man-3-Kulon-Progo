import React from "react";
import { AlertCircle } from "lucide-react";

interface PmbmFormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

const PmbmFormField: React.FC<PmbmFormFieldProps> = ({
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

export default PmbmFormField;
