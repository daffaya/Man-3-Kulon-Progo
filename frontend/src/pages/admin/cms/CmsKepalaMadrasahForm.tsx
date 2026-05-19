/**
 * @fileoverview CmsKepalaMadrasahForm — CMS editor for Kepala Madrasah page.
 *
 * Sections:
 * - content: { periodisasi: [{ tahun, nama_madrasah, kepala, kepala_tu? }] }
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
  nama_madrasah: string;
  kepala: string;
  kepala_tu?: string;
}

interface KepalaMadrasahContent {
  periodisasi: PeriodisasiItem[];
}

const FALLBACK: KepalaMadrasahContent = {
  periodisasi: [{ tahun: "", nama_madrasah: "", kepala: "", kepala_tu: "" }],
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
    onChange([
      ...items,
      { tahun: "", nama_madrasah: "", kepala: "", kepala_tu: "" },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* HEADER TABEL (Desktop Only) */}
      <div className="hidden lg:grid lg:grid-cols-[0.8fr_1.5fr_1.5fr_1fr_50px] gap-4 px-1 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Periode
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Nama Madrasah
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Kepala Madrasah
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Kepala TU
        </span>
        <span />
      </div>

      {/* LIST ITEM */}
      {items.map((item, index) => (
        <div
          key={index}
          className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.5fr_1.5fr_1fr_50px] gap-4 p-4 bg-semibackground rounded-xl border border-border transition-all hover:border-accent/30"
        >
          <div className="lg:[&>label]:hidden">
            <Field
              label="Periode"
              value={item.tahun}
              onChange={(val) => updateItem(index, "tahun", val)}
              placeholder="Contoh: 2020 - 2024"
            />
          </div>

          <div className="lg:[&>label]:hidden">
            <Field
              label="Nama Madrasah"
              value={item.nama_madrasah}
              onChange={(val) => updateItem(index, "nama_madrasah", val)}
              placeholder="Nama resmi madrasah"
            />
          </div>

          <div className="lg:[&>label]:hidden">
            <Field
              label="Nama Kepala Madrasah"
              value={item.kepala}
              onChange={(val) => updateItem(index, "kepala", val)}
              placeholder="Nama lengkap"
            />
          </div>

          <div className="lg:[&>label]:hidden">
            <Field
              label="Kepala Tata Usaha"
              value={item.kepala_tu ?? ""}
              onChange={(val) => updateItem(index, "kepala_tu", val)}
              placeholder="Nama Kepala TU"
            />
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-end lg:justify-center mt-2 lg:mt-0">
            <button
              onClick={() => removeItem(index)}
              disabled={items.length <= 1}
              className="p-2 rounded-full text-muted-foreground hover:text-error hover:bg-error/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              type="button"
              title="Hapus baris ini"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}

      {/* Add Button */}
      <button
        onClick={addItem}
        className="flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors mt-2 py-2"
        type="button"
      >
        <Plus size={16} />
        Tambah Baris Periode
      </button>

      <p className="text-xs text-muted-foreground mt-2 border-l-2 border-accent/50 pl-3">
        Petunjuk: Urutan data di atas sesuai dengan urutan tampilan di website.
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
      <div className="max-w-6xl mx-auto">
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
