/**
 * @fileoverview Shared CMS form components.
 *
 * Reusable primitives used across all CMS editor pages:
 * - SectionCard: card wrapper with title, icon, description, and save button
 * - Field: labeled text input
 * - TextareaField: labeled textarea
 * - SelectField: labeled select dropdown
 * - ArrayStringField: editable list of strings (add/remove/reorder)
 * - saveSection: helper to PUT a section to the CMS API
 *
 * Import from this file in all CmsXxxForm components.
 */

import React, { useState, useCallback } from "react";
import {
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import { apiFetch } from "../../lib/api";

// ─────────────────────────────────────────────
// API helper
// ─────────────────────────────────────────────

/**
 * Saves a single CMS section via PUT /api/atmin/cms/:page/:section.
 * Throws on failure so SectionCard can catch and show error state.
 *
 * @param page - CMS page key (e.g. "home", "pmbm")
 * @param section - Section key within the page (e.g. "stats", "config")
 * @param data - Data object to persist
 */
export const saveSection = async (
  page: string,
  section: string,
  data: unknown,
): Promise<void> => {
  await apiFetch(`/atmin/cms/${page}/${section}`, {
    method: "PUT",
    body: JSON.stringify({ data }),
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
    },
  });
};

// ─────────────────────────────────────────────
// SectionCard
// ─────────────────────────────────────────────

interface SectionCardProps {
  /** Section title shown in card header */
  title: string;
  /** Icon element shown beside title */
  icon: React.ReactNode;
  /** Optional subtitle/description */
  description?: string;
  /** Async save handler — should throw on failure */
  onSave: () => Promise<void>;
  /** Whether save is in progress */
  isSaving: boolean;
  children: React.ReactNode;
}

/**
 * Card wrapper for a single CMS section.
 * Handles save button state: idle → saving → success/error → idle.
 * Each section saves independently.
 */
export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon,
  description,
  onSave,
  isSaving,
  children,
}) => {
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  const handleSave = async () => {
    try {
      await onSave();
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const buttonClass =
    saveStatus === "success"
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : saveStatus === "error"
        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        : "btn btn-primary";

  const buttonLabel = isSaving
    ? "Menyimpan..."
    : saveStatus === "success"
      ? "Tersimpan!"
      : saveStatus === "error"
        ? "Gagal"
        : "Simpan";

  const ButtonIcon = isSaving
    ? () => <RefreshCw size={14} className="animate-spin" />
    : saveStatus === "success"
      ? () => <CheckCircle size={14} />
      : saveStatus === "error"
        ? () => <AlertCircle size={14} />
        : () => <Save size={14} />;

  return (
    <div className="card p-6 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-4">
        <div className="flex items-center gap-2">
          <div className="text-accent flex-shrink-0">{icon}</div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-xs text-secondary mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${buttonClass}`}
        >
          <ButtonIcon />
          {buttonLabel}
        </button>
      </div>

      <div className="border-t border-border mb-4" />

      {children}
    </div>
  );
};

// ─────────────────────────────────────────────
// Field
// ─────────────────────────────────────────────

interface FieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Labeled text/date/email/number input field.
 */
export const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  disabled,
  required,
}) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className="form-input w-full"
    />
    {hint && <p className="text-xs text-secondary mt-1">{hint}</p>}
  </div>
);

// ─────────────────────────────────────────────
// TextareaField
// ─────────────────────────────────────────────

interface TextareaFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: string;
  required?: boolean;
}

/**
 * Labeled textarea field.
 */
export const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  hint,
  required,
}) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      required={required}
      className="form-input w-full resize-none"
    />
    {hint && <p className="text-xs text-secondary mt-1">{hint}</p>}
  </div>
);

// ─────────────────────────────────────────────
// SelectField
// ─────────────────────────────────────────────

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  hint?: string;
  disabled?: boolean;
}

/**
 * Labeled select dropdown field.
 */
export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  hint,
  disabled,
}) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="form-input w-full"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {hint && <p className="text-xs text-secondary mt-1">{hint}</p>}
  </div>
);

// ─────────────────────────────────────────────
// ArrayStringField
// ─────────────────────────────────────────────

interface ArrayStringFieldProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  hint?: string;
  /** If true, shows drag handle UI (visual only — full DnD not included) */
  showOrder?: boolean;
}

/**
 * Editable list of strings with add/remove controls.
 * Used for arrays like syarat_umum, strategies, areas, etc.
 */
export const ArrayStringField: React.FC<ArrayStringFieldProps> = ({
  label,
  items,
  onChange,
  placeholder = "Isi item...",
  hint,
  showOrder = false,
}) => {
  const updateItem = useCallback(
    (index: number, value: string) => {
      onChange(items.map((item, i) => (i === index ? value : item)));
    },
    [items, onChange],
  );

  const removeItem = useCallback(
    (index: number) => {
      onChange(items.filter((_, i) => i !== index));
    },
    [items, onChange],
  );

  const addItem = useCallback(() => {
    onChange([...items, ""]);
  }, [items, onChange]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <button
          onClick={addItem}
          className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors"
          type="button"
        >
          <Plus size={13} />
          Tambah
        </button>
      </div>

      {hint && <p className="text-xs text-secondary mb-2">{hint}</p>}

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {showOrder && (
              <GripVertical
                size={14}
                className="text-secondary/40 flex-shrink-0 cursor-grab"
              />
            )}
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={placeholder}
              className="form-input flex-1"
            />
            <button
              onClick={() => removeItem(index)}
              className="flex-shrink-0 p-2 text-secondary hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
              aria-label={`Hapus item ${index + 1}`}
              type="button"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-sm text-secondary/60 italic text-center py-3 border border-dashed border-border rounded-lg">
            Belum ada item. Klik "+ Tambah" untuk menambahkan.
          </p>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// PageLoadingSpinner
// ─────────────────────────────────────────────

/**
 * Full-page centered loading spinner for CMS form pages.
 */
export const PageLoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center py-24">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
  </div>
);

// ─────────────────────────────────────────────
// CmsPageHeader
// ─────────────────────────────────────────────

interface CmsPageHeaderProps {
  title: string;
  description?: string;
}

/**
 * Consistent page header for all CMS editor pages.
 */
export const CmsPageHeader: React.FC<CmsPageHeaderProps> = ({
  title,
  description,
}) => (
  <div className="mb-8">
    <h2 className="text-2xl font-serif font-bold text-foreground mb-1">
      {title}
    </h2>
    {description && <p className="text-secondary text-sm">{description}</p>}
  </div>
);
