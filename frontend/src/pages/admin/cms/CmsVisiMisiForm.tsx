/**
 * @fileoverview CmsVisiMisiForm — CMS editor for Visi & Misi page.
 *
 * Sections:
 * - visi: { text }
 * - misi: { items: [{ title, points: string[] }] }
 * - tujuan: { jangka_panjang, jangka_menengah?, jangka_pendek? }
 * - strategi: { items: string[] }
 *
 * Route: /atmin/cms/visi-misi
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Target, Lightbulb, TrendingUp, Plus, Trash2 } from "lucide-react";
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
  TextareaField,
  ArrayStringField,
} from "../../../components/cms/CmsFormComponents";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface MisiItem {
  title: string;
  points: string[];
}

interface VisiData {
  text: string;
}

interface MisiData {
  items: MisiItem[];
}

interface TujuanData {
  jangka_panjang: string;
  jangka_menengah?: string;
  jangka_pendek?: string;
}

interface StrategiData {
  items: string[];
}

// ─────────────────────────────────────────────
// MisiItemEditor
// ─────────────────────────────────────────────

const MisiItemEditor: React.FC<{
  items: MisiItem[];
  onChange: (items: MisiItem[]) => void;
}> = ({ items, onChange }) => {
  const updateTitle = (index: number, title: string) => {
    onChange(items.map((item, i) => (i === index ? { ...item, title } : item)));
  };

  const updatePoints = (index: number, points: string[]) => {
    onChange(
      items.map((item, i) => (i === index ? { ...item, points } : item)),
    );
  };

  const addItem = () => {
    onChange([...items, { title: "", points: [""] }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="p-4 bg-semibackground rounded-lg border border-border"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wide">
              Misi {index + 1}
            </span>
            {items.length > 1 && (
              <button
                onClick={() => removeItem(index)}
                className="text-secondary hover:text-red-500 transition-colors"
                type="button"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <div className="space-y-3">
            <Field
              label="Kategori / Judul Misi"
              value={item.title}
              onChange={(val) => updateTitle(index, val)}
              placeholder="Agamis:"
            />
            <ArrayStringField
              label="Poin-poin Misi"
              items={item.points}
              onChange={(points) => updatePoints(index, points)}
              placeholder="Meningkatkan..."
            />
          </div>
        </div>
      ))}

      <button
        onClick={addItem}
        className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
        type="button"
      >
        <Plus size={14} />
        Tambah Kategori Misi
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const CmsVisiMisiForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [savingVisi, setSavingVisi] = useState(false);
  const [savingMisi, setSavingMisi] = useState(false);
  const [savingTujuan, setSavingTujuan] = useState(false);
  const [savingStrategi, setSavingStrategi] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [visi, setVisi] = useState<VisiData>({ text: "" });
  const [misi, setMisi] = useState<MisiData>({
    items: [{ title: "", points: [""] }],
  });
  const [tujuan, setTujuan] = useState<TujuanData>({
    jangka_panjang: "",
    jangka_menengah: "",
    jangka_pendek: "",
  });
  const [strategi, setStrategi] = useState<StrategiData>({ items: [""] });

  // ── Auth guard ──
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isLoggedIn) {
      navigate("/login", { state: { redirectTo: "/atmin/cms/visi-misi" } });
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
    apiFetch("/cms/visi-misi")
      .then((data: any) => {
        if (data?.visi) setVisi(data.visi);
        if (data?.misi) setMisi(data.misi);
        if (data?.tujuan) setTujuan(data.tujuan);
        if (data?.strategi) setStrategi(data.strategi);
      })
      .catch(() => showErrorToast("Gagal memuat data CMS Visi Misi."))
      .finally(() => setIsLoadingData(false));
  }, [isLoadingAuth, isLoggedIn, user, showErrorToast]);

  // ── Save handlers ──

  const handleSaveVisi = useCallback(async () => {
    setSavingVisi(true);
    try {
      await saveSection("visi-misi", "visi", visi);
      showSuccessToast("Visi berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan visi.");
      throw new Error("Save failed");
    } finally {
      setSavingVisi(false);
    }
  }, [visi, showSuccessToast, showErrorToast]);

  const handleSaveMisi = useCallback(async () => {
    setSavingMisi(true);
    try {
      await saveSection("visi-misi", "misi", misi);
      showSuccessToast("Misi berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan misi.");
      throw new Error("Save failed");
    } finally {
      setSavingMisi(false);
    }
  }, [misi, showSuccessToast, showErrorToast]);

  const handleSaveTujuan = useCallback(async () => {
    setSavingTujuan(true);
    try {
      await saveSection("visi-misi", "tujuan", tujuan);
      showSuccessToast("Tujuan berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan tujuan.");
      throw new Error("Save failed");
    } finally {
      setSavingTujuan(false);
    }
  }, [tujuan, showSuccessToast, showErrorToast]);

  const handleSaveStrategi = useCallback(async () => {
    setSavingStrategi(true);
    try {
      await saveSection("visi-misi", "strategi", strategi);
      showSuccessToast("Strategi berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan strategi.");
      throw new Error("Save failed");
    } finally {
      setSavingStrategi(false);
    }
  }, [strategi, showSuccessToast, showErrorToast]);

  if (isLoadingAuth || isLoadingData) {
    return (
      <CmsLayout title="CMS — Visi & Misi">
        <PageLoadingSpinner />
      </CmsLayout>
    );
  }

  return (
    <CmsLayout title="CMS — Visi & Misi">
      <div className="max-w-3xl mx-auto">
        <CmsPageHeader
          title="Kelola Visi & Misi"
          description="Visi, misi, tujuan, dan strategi madrasah. Setiap bagian disimpan terpisah."
        />

        {/* Visi */}
        <SectionCard
          title="Visi"
          icon={<Eye size={18} />}
          description="Teks visi utama madrasah (biasanya singkat dan bold)."
          onSave={handleSaveVisi}
          isSaving={savingVisi}
        >
          <TextareaField
            label="Teks Visi"
            value={visi.text}
            onChange={(val) => setVisi({ text: val })}
            rows={3}
            placeholder="ADILUHUNG (Agamis, Dinamis, Ilmiah, Terampil, Unggul, Humanis, dan berakhlak mulia)"
          />
        </SectionCard>

        {/* Misi */}
        <SectionCard
          title="Misi"
          icon={<Target size={18} />}
          description="Daftar kategori misi, masing-masing punya judul dan poin-poin turunan."
          onSave={handleSaveMisi}
          isSaving={savingMisi}
        >
          <MisiItemEditor
            items={misi.items}
            onChange={(items) => setMisi({ items })}
          />
        </SectionCard>

        {/* Tujuan */}
        <SectionCard
          title="Tujuan"
          icon={<Lightbulb size={18} />}
          description="Tujuan madrasah berdasarkan jangka waktu."
          onSave={handleSaveTujuan}
          isSaving={savingTujuan}
        >
          <div className="space-y-4">
            <TextareaField
              label="Tujuan Jangka Panjang"
              value={tujuan.jangka_panjang}
              onChange={(val) =>
                setTujuan((prev) => ({ ...prev, jangka_panjang: val }))
              }
              rows={3}
              placeholder="Menjadi madrasah yang berkualitas..."
            />
            <TextareaField
              label="Tujuan Jangka Menengah (opsional)"
              value={tujuan.jangka_menengah ?? ""}
              onChange={(val) =>
                setTujuan((prev) => ({ ...prev, jangka_menengah: val }))
              }
              rows={3}
              placeholder="Opsional — kosongkan jika tidak ada."
            />
            <TextareaField
              label="Tujuan Jangka Pendek (opsional)"
              value={tujuan.jangka_pendek ?? ""}
              onChange={(val) =>
                setTujuan((prev) => ({ ...prev, jangka_pendek: val }))
              }
              rows={3}
              placeholder="Opsional — kosongkan jika tidak ada."
            />
          </div>
        </SectionCard>

        {/* Strategi */}
        <SectionCard
          title="Strategi"
          icon={<TrendingUp size={18} />}
          description="Daftar strategi pencapaian visi misi."
          onSave={handleSaveStrategi}
          isSaving={savingStrategi}
        >
          <ArrayStringField
            label="Strategi"
            items={strategi.items}
            onChange={(items) => setStrategi({ items })}
            placeholder="Sosialisasi visi misi ke seluruh civitas..."
            showOrder
          />
        </SectionCard>
      </div>
    </CmsLayout>
  );
};

export default CmsVisiMisiForm;
