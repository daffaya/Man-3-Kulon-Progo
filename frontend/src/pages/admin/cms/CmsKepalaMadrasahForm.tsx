/**
 * @fileoverview CmsKepalaMadrasahForm — CMS editor for Kepala Madrasah page.
 *
 * Sections:
 * - content: { periodisasi: [{ tahun, nama_lengkap, keterangan? }] }
 *
 * Route: /atmin/cms/kepala-madrasah
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { User, Plus, Trash2 } from "lucide-react";
import CmsLayout from "../../../components/layout/CmsLayout";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import { apiFetch } from "../../../lib/api";
import {
  SectionCard,
  saveSection,
  PageLoadingSpinner,
  CmsPageHeader,
  Field,
} from "../../../components/cms/CmsFormComponents";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface PeriodisasiItem {
  tahun: string;
  nama_lengkap: string;
  keterangan?: string;
}

interface KepalaMadrasahContent {
  periodisasi: PeriodisasiItem[];
}

const FALLBACK: KepalaMadrasahContent = {
  periodisasi: [{ tahun: "", nama_lengkap: "", keterangan: "" }],
};

// ─────────────────────────────────────────────
// PeriodisasiEditor
// ─────────────────────────────────────────────

const PeriodisasiEditor: React.FC<{
  items: PeriodisasiItem[];
  onChange: (items: PeriodisasiItem[]) => void;
}> = ({ items, onChange }) => {
  const updateItem = (
    index: number,
    field: keyof PeriodisasiItem,
    value: string,
  ) => {
    onChange(
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addItem = () => {
    onChange([...items, { tahun: "", nama_lengkap: "", keterangan: "" }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Header tabel */}
      <div className="hidden sm:grid sm:grid-cols-[2fr_3fr_3fr_auto] gap-3 px-3 text-xs font-semibold text-secondary uppercase tracking-wide">
        <span>Periode</span>
        <span>Nama Lengkap</span>
        <span>Keterangan</span>
        <span />
      </div>

      {items.map((item, index) => (
        <div
          key={index}
          className="grid grid-cols-1 sm:grid-cols-[2fr_3fr_3fr_auto] gap-3 p-3 bg-semibackground rounded-lg border border-border items-start"
        >
          <Field
            label=""
            value={item.tahun}
            onChange={(val) => updateItem(index, "tahun", val)}
            placeholder="1985 s.d 1987"
          />
          <Field
            label=""
            value={item.nama_lengkap}
            onChange={(val) => updateItem(index, "nama_lengkap", val)}
            placeholder="Nama lengkap kepala madrasah"
          />
          <Field
            label=""
            value={item.keterangan ?? ""}
            onChange={(val) => updateItem(index, "keterangan", val)}
            placeholder="Opsional (jabatan, gelar, dll.)"
          />
          <button
            onClick={() => removeItem(index)}
            disabled={items.length <= 1}
            className="mt-1 p-2 text-secondary hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-30 disabled:cursor-not-allowed self-start"
            type="button"
            title="Hapus baris"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <button
        onClick={addItem}
        className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors pt-1"
        type="button"
      >
        <Plus size={14} />
        Tambah Periode
      </button>

      <p className="text-xs text-secondary mt-1">
        Urutan dari atas ke bawah = urutan tampil di tabel. Letakkan yang
        terlama di atas.
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const CmsKepalaMadrasahForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [saving, setSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [content, setContent] = useState<KepalaMadrasahContent>(FALLBACK);

  // ── Auth guard ──
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isLoggedIn) {
      navigate("/login", {
        state: { redirectTo: "/atmin/cms/kepala-madrasah" },
      });
      return;
    }
    if (user?.role !== "super_admin") {
      showErrorToast("Hanya Super Admin yang dapat mengakses halaman ini.");
      navigate("/atmin");
    }
  }, [isLoadingAuth, isLoggedIn, user, navigate, showErrorToast]);

  // ── Fetch data ──
  useEffect(() => {
    if (isLoadingAuth || !isLoggedIn || user?.role !== "super_admin") return;
    apiFetch("/cms/kepala-madrasah")
      .then((data: any) => {
        if (data?.content?.periodisasi) {
          setContent({ periodisasi: data.content.periodisasi });
        }
      })
      .catch(() => showErrorToast("Gagal memuat data CMS Kepala Madrasah."))
      .finally(() => setIsLoadingData(false));
  }, [isLoadingAuth, isLoggedIn, user, showErrorToast]);

  // ── Save ──
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await saveSection("kepala-madrasah", "content", content);
      showSuccessToast("Data kepala madrasah berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan data kepala madrasah.");
      throw new Error("Save failed");
    } finally {
      setSaving(false);
    }
  }, [content, showSuccessToast, showErrorToast]);

  if (isLoadingAuth || isLoadingData) {
    return (
      <CmsLayout title="CMS — Kepala Madrasah">
        <PageLoadingSpinner />
      </CmsLayout>
    );
  }

  return (
    <CmsLayout title="CMS — Kepala Madrasah">
      <div className="max-w-3xl mx-auto">
        <CmsPageHeader
          title="Kelola Periodisasi Kepala Madrasah"
          description="Tabel daftar kepala madrasah dari masa ke masa."
        />

        <SectionCard
          title="Tabel Periodisasi"
          icon={<User size={18} />}
          description="Setiap baris mewakili satu periode kepemimpinan kepala madrasah."
          onSave={handleSave}
          isSaving={saving}
        >
          <PeriodisasiEditor
            items={content.periodisasi}
            onChange={(periodisasi) => setContent({ periodisasi })}
          />
        </SectionCard>
      </div>
    </CmsLayout>
  );
};

export default CmsKepalaMadrasahForm;
