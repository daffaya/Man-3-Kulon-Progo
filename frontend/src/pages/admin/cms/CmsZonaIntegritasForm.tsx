/**
 * @fileoverview CmsZonaIntegritasForm — CMS editor for Zona Integritas page.
 *
 * Sections:
 * - header: { title, description }
 * - areas: { items: [{ id, title, description, icon?, documents?: [{ name, url }] }] }
 * - lkj: { title, year, file_url, description? }
 * - pengaduan: { email, whatsapp, description? }
 *
 * Route: /atmin/cms/zona-integritas
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  LayoutGrid,
  FileBarChart,
  MessageCircle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
} from "../../../components/cms/CmsFormComponents";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface ZonaDocument {
  name: string;
  url: string;
}

interface ZonaArea {
  id: number;
  title: string;
  description?: string;
  icon?: string;
  documents?: ZonaDocument[];
}

interface ZonaHeader {
  title: string;
  description: string;
}

interface ZonaAreas {
  items: ZonaArea[];
}

interface ZonaLkj {
  title: string;
  year: string;
  file_url: string;
  description?: string;
}

interface ZonaPengaduan {
  email: string;
  whatsapp: string;
  description?: string;
}

// ─────────────────────────────────────────────
// DocumentsEditor (per area)
// ─────────────────────────────────────────────

const DocumentsEditor: React.FC<{
  docs: ZonaDocument[];
  onChange: (docs: ZonaDocument[]) => void;
}> = ({ docs, onChange }) => {
  const updateDoc = (
    index: number,
    field: keyof ZonaDocument,
    value: string,
  ) => {
    onChange(docs.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  };

  const addDoc = () => onChange([...docs, { name: "", url: "" }]);

  const removeDoc = (index: number) =>
    onChange(docs.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-secondary">
          Dokumen / Link
        </span>
        <button
          onClick={addDoc}
          className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
          type="button"
        >
          <Plus size={12} />
          Tambah
        </button>
      </div>
      {docs.map((doc, index) => (
        <div
          key={index}
          className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start"
        >
          <Field
            label=""
            value={doc.name}
            onChange={(val) => updateDoc(index, "name", val)}
            placeholder="Nama dokumen"
          />
          <Field
            label=""
            value={doc.url}
            onChange={(val) => updateDoc(index, "url", val)}
            placeholder="/dokumen.pdf"
          />
          <button
            onClick={() => removeDoc(index)}
            className="mt-1 p-2 text-secondary hover:text-red-500 transition-colors rounded"
            type="button"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      {docs.length === 0 && (
        <p className="text-xs text-secondary/60 italic">Belum ada dokumen.</p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// AreasEditor
// ─────────────────────────────────────────────

const AreasEditor: React.FC<{
  items: ZonaArea[];
  onChange: (items: ZonaArea[]) => void;
}> = ({ items, onChange }) => {
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>(
    Object.fromEntries(items.map((_, i) => [i, true])), // all collapsed by default
  );

  const toggle = (index: number) =>
    setCollapsed((prev) => ({ ...prev, [index]: !prev[index] }));

  const updateItem = (index: number, field: keyof ZonaArea, value: any) => {
    onChange(
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addItem = () => {
    const newId = Math.max(0, ...items.map((i) => i.id)) + 1;
    onChange([
      ...items,
      { id: newId, title: "", description: "", icon: "", documents: [] },
    ]);
    setCollapsed((prev) => ({ ...prev, [items.length]: false }));
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={index}
          className="border border-border rounded-lg overflow-hidden"
        >
          <div className="flex items-center gap-2 p-3 bg-semibackground">
            <button
              onClick={() => toggle(index)}
              className="flex-1 flex items-center gap-2 text-left"
              type="button"
            >
              {collapsed[index] ? (
                <ChevronDown
                  size={14}
                  className="text-secondary flex-shrink-0"
                />
              ) : (
                <ChevronUp size={14} className="text-secondary flex-shrink-0" />
              )}
              <span className="text-xs text-secondary mr-2">
                Area {item.id}
              </span>
              <span className="text-sm font-medium text-foreground truncate">
                {item.title || `Area ${index + 1}`}
              </span>
            </button>
            <button
              onClick={() => removeItem(index)}
              disabled={items.length <= 1}
              className="p-1.5 text-secondary hover:text-red-500 transition-colors rounded disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              type="button"
            >
              <Trash2 size={13} />
            </button>
          </div>

          {!collapsed[index] && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="ID Area"
                  value={String(item.id)}
                  onChange={(val) =>
                    updateItem(index, "id", parseInt(val) || item.id)
                  }
                  placeholder="1"
                  hint="ID numerik unik."
                />
                <Field
                  label="Icon (emoji atau nama ikon)"
                  value={item.icon ?? ""}
                  onChange={(val) => updateItem(index, "icon", val)}
                  placeholder="🔄 atau Shield"
                  hint="Opsional."
                />
              </div>
              <Field
                label="Judul Area"
                value={item.title}
                onChange={(val) => updateItem(index, "title", val)}
                placeholder="Manajemen Perubahan"
              />
              <TextareaField
                label="Deskripsi"
                value={item.description ?? ""}
                onChange={(val) => updateItem(index, "description", val)}
                rows={2}
                placeholder="Deskripsi singkat area ini..."
              />
              <DocumentsEditor
                docs={item.documents ?? []}
                onChange={(docs) => updateItem(index, "documents", docs)}
              />
            </div>
          )}
        </div>
      ))}

      <button
        onClick={addItem}
        className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors pt-1"
        type="button"
      >
        <Plus size={14} />
        Tambah Area
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const CmsZonaIntegritasForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [savingHeader, setSavingHeader] = useState(false);
  const [savingAreas, setSavingAreas] = useState(false);
  const [savingLkj, setSavingLkj] = useState(false);
  const [savingPengaduan, setSavingPengaduan] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [header, setHeader] = useState<ZonaHeader>({
    title: "Zona Integritas",
    description: "",
  });
  const [areas, setAreas] = useState<ZonaAreas>({
    items: [{ id: 1, title: "", description: "", icon: "", documents: [] }],
  });
  const [lkj, setLkj] = useState<ZonaLkj>({
    title: "",
    year: "",
    file_url: "",
    description: "",
  });
  const [pengaduan, setPengaduan] = useState<ZonaPengaduan>({
    email: "",
    whatsapp: "",
    description: "",
  });

  // ── Auth guard ──
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isLoggedIn) {
      navigate("/login", {
        state: { redirectTo: "/atmin/cms/zona-integritas" },
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
    apiFetch("/cms/zona-integritas")
      .then((data: any) => {
        if (data?.header) setHeader(data.header);
        if (data?.areas) setAreas(data.areas);
        if (data?.lkj) setLkj(data.lkj);
        if (data?.pengaduan) setPengaduan(data.pengaduan);
      })
      .catch(() => showErrorToast("Gagal memuat data CMS Zona Integritas."))
      .finally(() => setIsLoadingData(false));
  }, [isLoadingAuth, isLoggedIn, user, showErrorToast]);

  // ── Save handlers ──
  const handleSaveHeader = useCallback(async () => {
    setSavingHeader(true);
    try {
      await saveSection("zona-integritas", "header", header);
      showSuccessToast("Header berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan header.");
      throw new Error("Save failed");
    } finally {
      setSavingHeader(false);
    }
  }, [header, showSuccessToast, showErrorToast]);

  const handleSaveAreas = useCallback(async () => {
    setSavingAreas(true);
    try {
      await saveSection("zona-integritas", "areas", areas);
      showSuccessToast("Area Zona Integritas berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan areas.");
      throw new Error("Save failed");
    } finally {
      setSavingAreas(false);
    }
  }, [areas, showSuccessToast, showErrorToast]);

  const handleSaveLkj = useCallback(async () => {
    setSavingLkj(true);
    try {
      await saveSection("zona-integritas", "lkj", lkj);
      showSuccessToast("LKJ berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan LKJ.");
      throw new Error("Save failed");
    } finally {
      setSavingLkj(false);
    }
  }, [lkj, showSuccessToast, showErrorToast]);

  const handleSavePengaduan = useCallback(async () => {
    setSavingPengaduan(true);
    try {
      await saveSection("zona-integritas", "pengaduan", pengaduan);
      showSuccessToast("Kontak pengaduan berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan pengaduan.");
      throw new Error("Save failed");
    } finally {
      setSavingPengaduan(false);
    }
  }, [pengaduan, showSuccessToast, showErrorToast]);

  if (isLoadingAuth || isLoadingData) {
    return (
      <CmsLayout title="CMS — Zona Integritas">
        <PageLoadingSpinner />
      </CmsLayout>
    );
  }

  return (
    <CmsLayout title="CMS — Zona Integritas">
      <div className="max-w-3xl mx-auto">
        <CmsPageHeader
          title="Kelola Zona Integritas"
          description="Header, 6 area zona integritas, LKJ, dan kontak pengaduan."
        />

        {/* Header */}
        <SectionCard
          title="Header Halaman"
          icon={<Shield size={18} />}
          onSave={handleSaveHeader}
          isSaving={savingHeader}
        >
          <div className="space-y-4">
            <Field
              label="Judul"
              value={header.title}
              onChange={(val) => setHeader((p) => ({ ...p, title: val }))}
              placeholder="Zona Integritas"
            />
            <TextareaField
              label="Deskripsi"
              value={header.description}
              onChange={(val) => setHeader((p) => ({ ...p, description: val }))}
              rows={3}
              placeholder="Zona Integritas menuju WBK/WBBM..."
            />
          </div>
        </SectionCard>

        {/* Areas */}
        <SectionCard
          title="Area Zona Integritas"
          icon={<LayoutGrid size={18} />}
          description="6 area standar zona integritas (bisa ditambah/dikurangi sesuai kebutuhan)."
          onSave={handleSaveAreas}
          isSaving={savingAreas}
        >
          <AreasEditor
            items={areas.items}
            onChange={(items) => setAreas({ items })}
          />
        </SectionCard>

        {/* LKJ */}
        <SectionCard
          title="Laporan Kinerja (LKJ)"
          icon={<FileBarChart size={18} />}
          onSave={handleSaveLkj}
          isSaving={savingLkj}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Judul Laporan"
                value={lkj.title}
                onChange={(val) => setLkj((p) => ({ ...p, title: val }))}
                placeholder="Laporan Kinerja MAN 3 Kulon Progo"
              />
              <Field
                label="Tahun"
                value={lkj.year}
                onChange={(val) => setLkj((p) => ({ ...p, year: val }))}
                placeholder="2024"
              />
            </div>
            <Field
              label="URL / Path File LKJ"
              value={lkj.file_url}
              onChange={(val) => setLkj((p) => ({ ...p, file_url: val }))}
              placeholder="/LKJ_2024.pdf"
              hint="Path relatif ke file PDF atau URL absolut."
            />
            <TextareaField
              label="Deskripsi (opsional)"
              value={lkj.description ?? ""}
              onChange={(val) => setLkj((p) => ({ ...p, description: val }))}
              rows={2}
              placeholder="Laporan Kinerja Tahunan..."
            />
          </div>
        </SectionCard>

        {/* Pengaduan */}
        <SectionCard
          title="Kontak Pengaduan"
          icon={<MessageCircle size={18} />}
          onSave={handleSavePengaduan}
          isSaving={savingPengaduan}
        >
          <div className="space-y-4">
            <Field
              label="Email"
              value={pengaduan.email}
              onChange={(val) => setPengaduan((p) => ({ ...p, email: val }))}
              type="email"
              placeholder="man3kulonprogo@gmail.com"
            />
            <Field
              label="WhatsApp"
              value={pengaduan.whatsapp}
              onChange={(val) => setPengaduan((p) => ({ ...p, whatsapp: val }))}
              placeholder="+62 8xx-xxxx-xxxx"
            />
            <TextareaField
              label="Deskripsi (opsional)"
              value={pengaduan.description ?? ""}
              onChange={(val) =>
                setPengaduan((p) => ({ ...p, description: val }))
              }
              rows={2}
              placeholder="Sampaikan pengaduan Anda melalui..."
            />
          </div>
        </SectionCard>
      </div>
    </CmsLayout>
  );
};

export default CmsZonaIntegritasForm;
