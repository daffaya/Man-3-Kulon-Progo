/**
 * @fileoverview CmsStrukturForm — CMS editor for Struktur Organisasi page.
 *
 * Sections:
 * - content: {
 *     image_url: string,
 *     positions: [{ title: string, details: [{ label: string, value: string }] }]
 *   }
 *
 * Route: /atmin/cms/struktur-organisasi
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Network, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import CmsLayout from "../../../components/layout/CmsLayout";
import ImageUploader from "../../../components/ui/ImageUploader";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import { apiFetch } from "../../../lib/api";
import {
  SectionCard,
  Field,
  PageLoadingSpinner,
  CmsPageHeader,
  saveSection,
} from "../../../components/cms/CmsFormComponents";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface PositionDetail {
  label: string;
  value: string;
}

interface OrganizationPosition {
  title: string;
  details: PositionDetail[];
}

interface StrukturContent {
  image_url: string;
  positions: OrganizationPosition[];
}

const FALLBACK: StrukturContent = {
  image_url: "/strukturorganisasi.jpg",
  positions: [
    {
      title: "Kepala Madrasah",
      details: [
        { label: "Nama", value: "" },
        { label: "Pangkat Golongan", value: "" },
        { label: "Pendidikan Terakhir", value: "" },
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// DetailsEditor — edit label/value pairs per position
// ─────────────────────────────────────────────

const DetailsEditor: React.FC<{
  details: PositionDetail[];
  onChange: (details: PositionDetail[]) => void;
}> = ({ details, onChange }) => {
  const updateDetail = (
    index: number,
    field: keyof PositionDetail,
    value: string,
  ) => {
    onChange(
      details.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
    );
  };

  const addDetail = () => onChange([...details, { label: "", value: "" }]);

  const removeDetail = (index: number) => {
    if (details.length <= 1) return;
    onChange(details.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_auto] gap-2 px-1 text-xs font-semibold text-secondary uppercase tracking-wide">
        <span>Label</span>
        <span>Nilai</span>
        <span />
      </div>
      {details.map((detail, index) => (
        <div
          key={index}
          className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-start"
        >
          <Field
            label=""
            value={detail.label}
            onChange={(val) => updateDetail(index, "label", val)}
            placeholder="Nama"
          />
          <Field
            label=""
            value={detail.value}
            onChange={(val) => updateDetail(index, "value", val)}
            placeholder="Syaefulani, S.Ag., M.Pd"
          />
          <button
            onClick={() => removeDetail(index)}
            disabled={details.length <= 1}
            className="mt-1 p-2 text-secondary hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-30 disabled:cursor-not-allowed"
            type="button"
            title="Hapus baris"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button
        onClick={addDetail}
        className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors pt-1"
        type="button"
      >
        <Plus size={12} />
        Tambah Baris
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────
// PositionsEditor — list of positions (Kepala Madrasah, Kepala TU, dst)
// ─────────────────────────────────────────────

const PositionsEditor: React.FC<{
  positions: OrganizationPosition[];
  onChange: (positions: OrganizationPosition[]) => void;
}> = ({ positions, onChange }) => {
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  const toggle = (index: number) =>
    setCollapsed((prev) => ({ ...prev, [index]: !prev[index] }));

  const updateTitle = (index: number, title: string) => {
    onChange(positions.map((p, i) => (i === index ? { ...p, title } : p)));
  };

  const updateDetails = (index: number, details: PositionDetail[]) => {
    onChange(positions.map((p, i) => (i === index ? { ...p, details } : p)));
  };

  const addPosition = () => {
    onChange([
      ...positions,
      {
        title: "",
        details: [
          { label: "Nama", value: "" },
          { label: "Pangkat Golongan", value: "" },
          { label: "Pendidikan Terakhir", value: "" },
        ],
      },
    ]);
    // expand yang baru ditambah
    setCollapsed((prev) => ({ ...prev, [positions.length]: false }));
  };

  const removePosition = (index: number) => {
    if (positions.length <= 1) return;
    onChange(positions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {positions.map((pos, index) => (
        <div
          key={index}
          className="border border-border rounded-lg overflow-hidden"
        >
          {/* Header */}
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
              <span className="text-sm font-medium text-foreground">
                {pos.title || `Jabatan ${index + 1}`}
              </span>
              <span className="text-xs text-secondary ml-auto mr-2 flex-shrink-0">
                {pos.details.length} detail
              </span>
            </button>
            <button
              onClick={() => removePosition(index)}
              disabled={positions.length <= 1}
              className="p-1.5 text-secondary hover:text-red-500 transition-colors rounded disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              type="button"
            >
              <Trash2 size={13} />
            </button>
          </div>

          {/* Body */}
          {!collapsed[index] && (
            <div className="p-4 space-y-4">
              <Field
                label="Nama Jabatan"
                value={pos.title}
                onChange={(val) => updateTitle(index, val)}
                placeholder="Kepala Madrasah"
                hint="Ditampilkan sebagai heading di halaman publik."
              />
              <div>
                <p className="text-sm font-medium text-foreground mb-2">
                  Detail
                </p>
                <DetailsEditor
                  details={pos.details}
                  onChange={(details) => updateDetails(index, details)}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={addPosition}
        className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors pt-1"
        type="button"
      >
        <Plus size={14} />
        Tambah Jabatan
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const CmsStrukturForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [saving, setSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [content, setContent] = useState<StrukturContent>(FALLBACK);

  // ── Auth guard ──
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isLoggedIn) {
      navigate("/login", {
        state: { redirectTo: "/atmin/cms/struktur-organisasi" },
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
    apiFetch("/cms/struktur-organisasi")
      .then((data: any) => {
        if (data?.content) {
          setContent({
            image_url: data.content.image_url ?? FALLBACK.image_url,
            positions: data.content.positions ?? FALLBACK.positions,
          });
        }
      })
      .catch(() => showErrorToast("Gagal memuat data CMS Struktur Organisasi."))
      .finally(() => setIsLoadingData(false));
  }, [isLoadingAuth, isLoggedIn, user, showErrorToast]);

  // ── Save ──
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await saveSection("struktur-organisasi", "content", content);
      showSuccessToast("Struktur organisasi berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan struktur organisasi.");
      throw new Error("Save failed");
    } finally {
      setSaving(false);
    }
  }, [content, showSuccessToast, showErrorToast]);

  if (isLoadingAuth || isLoadingData) {
    return (
      <CmsLayout title="CMS — Struktur Organisasi">
        <PageLoadingSpinner />
      </CmsLayout>
    );
  }

  return (
    <CmsLayout title="CMS — Struktur Organisasi">
      <div className="max-w-3xl mx-auto">
        <CmsPageHeader
          title="Kelola Struktur Organisasi"
          description="Gambar bagan dan daftar jabatan struktural madrasah."
        />

        <SectionCard
          title="Bagan & Daftar Jabatan"
          icon={<Network size={18} />}
          description="Perubahan disimpan sekaligus — gambar dan semua jabatan."
          onSave={handleSave}
          isSaving={saving}
        >
          <div className="space-y-6">
            {/* Gambar */}
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                Gambar Bagan Organisasi
              </p>
              <p className="text-xs text-secondary mb-2">
                Gunakan tab <strong>URL</strong> dan masukkan path seperti{" "}
                <code className="bg-semibackground px-1 rounded">
                  /strukturorganisasi.jpg
                </code>{" "}
                untuk file yang sudah ada di folder public.
              </p>
              <ImageUploader
                currentImage={content.image_url}
                onImageChange={(_, url) => {
                  if (url) setContent((p) => ({ ...p, image_url: url }));
                }}
                label=""
              />
            </div>

            {/* Jabatan */}
            <div className="border-t border-border pt-5">
              <p className="text-sm font-medium text-foreground mb-3">
                Daftar Jabatan
              </p>
              <PositionsEditor
                positions={content.positions}
                onChange={(positions) =>
                  setContent((p) => ({ ...p, positions }))
                }
              />
            </div>
          </div>
        </SectionCard>
      </div>
    </CmsLayout>
  );
};

export default CmsStrukturForm;
