/**
 * @fileoverview ListKit — komponen kecil bersama untuk halaman daftar admin (mockup v3):
 * header halaman, kotak cari, select filter, kontrol segmen, footer paginasi, dialog konfirmasi,
 * state kosong, dan skeleton baris tabel. Dipakai Guru & Staf, Arsip, PMBM, Kelulusan, User.
 */
import React from "react";
import { Inbox, Search, SearchX } from "lucide-react";

export const initials = (name: string) =>
  name
    .replace(/[^A-Za-z ]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

export const PageHead: React.FC<{
  title: string;
  sub?: string;
  children?: React.ReactNode;
}> = ({ title, sub, children }) => (
  <div className="a-hd">
    <div>
      <h1 className="a-h1">{title}</h1>
      {sub && <p className="a-sub">{sub}</p>}
    </div>
    {children && (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{children}</div>
    )}
  </div>
);

export const SearchBox: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label?: string;
}> = ({ value, onChange, placeholder, label = "Cari" }) => (
  <div className="a-sr">
    <Search size={16} />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={label}
    />
  </div>
);

export const FilterSelect: React.FC<{
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: [string, string][];
}> = ({ value, onChange, label, options }) => (
  <select
    className="a-sel"
    aria-label={label}
    value={value}
    onChange={(e) => onChange(e.target.value)}
  >
    <option value="all">{label}</option>
    {options.map(([v, l]) => (
      <option key={v} value={v}>
        {l}
      </option>
    ))}
  </select>
);

export const Segmented: React.FC<{
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: [string, string][];
}> = ({ value, onChange, label, options }) => (
  <div className="a-sg" role="group" aria-label={label}>
    {options.map(([v, l]) => (
      <button
        key={v}
        type="button"
        className={value === v ? "a-on" : ""}
        aria-pressed={value === v}
        onClick={() => onChange(v)}
      >
        {l}
      </button>
    ))}
  </div>
);

export const TableFooter: React.FC<{
  text: string;
  page: number;
  totalPages: number;
  loading?: boolean;
  onPrev: () => void;
  onNext: () => void;
}> = ({ text, page, totalPages, loading, onPrev, onNext }) => (
  <div className="a-tf">
    <span>{text}</span>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button type="button" className="a-btn a-sm" disabled={loading || page <= 1} onClick={onPrev}>
        Sebelumnya
      </button>
      Halaman {page} dari {Math.max(totalPages, 1)}
      <button type="button" className="a-btn a-sm a-p" disabled={loading || page >= totalPages} onClick={onNext}>
        Berikutnya
      </button>
    </div>
  </div>
);

export const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ open, title, body, confirmLabel = "Hapus", busy, onCancel, onConfirm }) =>
  !open ? null : (
    <div className="a-mo" role="dialog" aria-modal="true" aria-labelledby="cf-t">
      <div className="a-mc">
        <h2 className="a-h2" id="cf-t" style={{ marginBottom: 8 }}>{title}</h2>
        <p style={{ color: "var(--mu)", marginBottom: 20 }}>{body}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button type="button" className="a-btn" onClick={onCancel} disabled={busy}>Batal</button>
          <button type="button" className="a-btn a-d" onClick={onConfirm} disabled={busy}>
            {busy ? "Memproses…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

export const EmptyState: React.FC<{
  filtered: boolean;
  entity: string;
  hint?: string;
  onReset?: () => void;
  children?: React.ReactNode;
}> = ({ filtered, entity, hint, onReset, children }) => (
  <div className="a-em">
    {filtered ? <SearchX /> : <Inbox />}
    <b>{filtered ? `Tidak ada ${entity} yang cocok` : `Belum ada ${entity}`}</b>
    {filtered ? "Ubah kata kunci atau reset filter." : hint}
    <br />
    {filtered ? (
      <button type="button" className="a-btn a-sm" style={{ marginTop: 12 }} onClick={onReset}>
        Reset filter
      </button>
    ) : (
      <div style={{ marginTop: 12 }}>{children}</div>
    )}
  </div>
);

export const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="a-em">
    <SearchX />
    <b>Gagal memuat data</b>
    {message}
    <br />
    <button type="button" className="a-btn a-sm" style={{ marginTop: 12 }} onClick={onRetry}>
      Coba lagi
    </button>
  </div>
);

/** Baris skeleton untuk <tbody> saat memuat. `hidden` = indeks kolom yang disembunyikan di layar kecil. */
export const SkeletonRows: React.FC<{ cols: number; rows?: number; hidden?: number[] }> = ({
  cols,
  rows = 6,
  hidden = [],
}) => (
  <>
    {[...Array(rows)].map((_, r) => (
      <tr key={r} aria-hidden="true">
        {[...Array(cols)].map((__, c) => (
          <td key={c} className={hidden.includes(c) ? "a-hm" : undefined}>
            <div className="a-sk" style={{ width: c === 0 ? "70%" : "55%" }} />
          </td>
        ))}
      </tr>
    ))}
  </>
);

export const rangeText = (page: number, per: number, total: number, noun: string) => {
  if (total === 0) return `0 ${noun}`;
  const from = (page - 1) * per + 1;
  return `Menampilkan ${from}–${Math.min(page * per, total)} dari ${total} ${noun}`;
};
