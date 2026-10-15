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

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
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
import { CmsBackLink, CmsSaveBar, useCmsSave, useMarkHeaderMounted } from "./CmsSave";

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

/** Sidik isi kartu: jumlah elemen, nilai field, dan sumber gambar. Dipakai untuk mendeteksi perubahan nyata. */
const fingerprint = (root: HTMLElement | null): string => {
  if (!root) return "";
  const fields = Array.from(root.querySelectorAll("input,textarea,select"))
    .map((el) => {
      const f = el as HTMLInputElement;
      return f.type === "checkbox" || f.type === "radio" ? String(f.checked) : f.value;
    })
    .join("\u0001");
  const imgs = Array.from(root.querySelectorAll("img"))
    .map((i) => i.getAttribute("src") ?? "")
    .join("\u0001");
  return `${root.querySelectorAll("*").length}|${root.textContent?.length ?? 0}|${fields}|${imgs}`;
};

interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  description?: string;
  onSave: () => Promise<void>;
  isSaving?: boolean;
  children: React.ReactNode;
}

/**
 * Kartu bagian editor CMS (mockup v3). Mendaftarkan fungsi simpan ke CmsSaveProvider dan menandai
 * dirty saat ada input/klik tombol di dalamnya; penyimpanan dilakukan lewat tombol "Simpan Perubahan".
 * Di luar provider, kartu menampilkan tombol Simpan sendiri.
 */
export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  onSave,
  isSaving = false,
  children,
}) => {
  const ctx = useCmsSave();
  const id = useId();
  const saveRef = useRef(onSave);
  saveRef.current = onSave;
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const register = ctx?.register;
  const unregister = ctx?.unregister;
  const report = ctx?.setDirty;

  useEffect(() => {
    if (!register || !unregister) return;
    register(id, async () => {
      await saveRef.current();
      setDirty(false);
    });
    return () => unregister(id);
  }, [id, register, unregister]);

  useEffect(() => {
    report?.(id, dirty);
  }, [id, dirty, report]);

  const mark = () => setDirty(true);

  const localSave = async () => {
    setBusy(true);
    try {
      await saveRef.current();
      setDirty(false);
    } catch {
      /* error toast ditampilkan oleh form */
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="a-cd a-cms-card">
      <div className="a-ch" style={{ alignItems: "flex-start", gap: 12 }}>
        <div>
          <h2 className="a-h2">{title}</h2>
          {description && <p className="a-sub" style={{ fontSize: 12.5 }}>{description}</p>}
        </div>
        {!ctx && (
          <button type="button" className="a-btn a-sm a-p" onClick={localSave} disabled={busy || isSaving || !dirty}>
            {busy || isSaving ? "Menyimpan…" : "Simpan"}
          </button>
        )}
      </div>
      <div
        ref={bodyRef}
        onInput={mark}
        onChange={mark}
        onClick={(e) => {
          // Klik tombol dianggap perubahan hanya jika isi kartu benar-benar berubah
          // (baris ditambah/dihapus/diurutkan, gambar diunggah, dst).
          if (!(e.target as HTMLElement).closest("button")) return;
          const before = fingerprint(bodyRef.current);
          [60, 400, 1500].forEach((ms) =>
            window.setTimeout(() => {
              if (fingerprint(bodyRef.current) !== before) mark();
            }, ms),
          );
        }}
      >
        {children}
      </div>
    </section>
  );
};

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

export const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  disabled,
  required,
}) => {
  const id = useId();
  return (
    <div>
      <label className="a-lb" htmlFor={id}>
        {label}
        {required && <span style={{ color: "var(--dg)", marginLeft: 4 }}>*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="a-ip"
      />
      {hint && <p className="a-tg" style={{ marginTop: 6 }}>{hint}</p>}
    </div>
  );
};

interface TextareaFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: string;
  required?: boolean;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  hint,
  required,
}) => {
  const id = useId();
  return (
    <div>
      <label className="a-lb" htmlFor={id}>
        {label}
        {required && <span style={{ color: "var(--dg)", marginLeft: 4 }}>*</span>}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        required={required}
        className="a-ip"
      />
      {hint && <p className="a-tg" style={{ marginTop: 6 }}>{hint}</p>}
    </div>
  );
};

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

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  hint,
  disabled,
}) => {
  const id = useId();
  return (
    <div>
      <label className="a-lb" htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="a-ip"
        style={{ height: 42 }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && <p className="a-tg" style={{ marginTop: 6 }}>{hint}</p>}
    </div>
  );
};

interface ArrayStringFieldProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  hint?: string;
  showOrder?: boolean;
}

export const ArrayStringField: React.FC<ArrayStringFieldProps> = ({
  label,
  items,
  onChange,
  placeholder = "Isi item...",
  hint,
}) => {
  const updateItem = useCallback(
    (index: number, value: string) => onChange(items.map((item, i) => (i === index ? value : item))),
    [items, onChange],
  );
  const removeItem = useCallback(
    (index: number) => onChange(items.filter((_, i) => i !== index)),
    [items, onChange],
  );
  const addItem = useCallback(() => onChange([...items, ""]), [items, onChange]);

  return (
    <div>
      <div className="a-ch" style={{ marginBottom: 8, marginTop: 18 }}>
        <span className="a-lb" style={{ margin: 0 }}>{label}</span>
        <button type="button" className="a-btn a-sm" onClick={addItem}>
          <Plus size={14} />
          Tambah baris
        </button>
      </div>
      {hint && <p className="a-tg" style={{ marginBottom: 8 }}>{hint}</p>}
      <div>
        {items.map((item, index) => (
          <div key={index} className="a-rp" style={{ gridTemplateColumns: "1fr auto" }}>
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={placeholder}
              aria-label={`${label} ${index + 1}`}
              className="a-ip"
            />
            <button
              type="button"
              className="a-ic a-x"
              onClick={() => removeItem(index)}
              aria-label={`Hapus item ${index + 1}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="a-tg" style={{ textAlign: "center", padding: 12, border: "1px dashed var(--bd)", borderRadius: 10 }}>
            Belum ada item. Klik "Tambah baris" untuk menambahkan.
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
  <div className="a-em" aria-busy="true">
    <RefreshCw className="animate-spin" />
    <b>Memuat…</b>
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
 * Header konsisten untuk semua editor CMS (mockup v3): tombol kembali, judul, deskripsi,
 * serta status + "Simpan Perubahan" di kanan.
 */
export const CmsPageHeader: React.FC<CmsPageHeaderProps> = ({ title, description }) => {
  useMarkHeaderMounted();
  return (
    <div className="a-hd">
      <div>
        <CmsBackLink />
        <h1 className="a-h1">{title.replace(/^Kelola (Halaman )?/i, "") || title}</h1>
        {description && <p className="a-sub">{description}</p>}
      </div>
      <CmsSaveBar />
    </div>
  );
};
