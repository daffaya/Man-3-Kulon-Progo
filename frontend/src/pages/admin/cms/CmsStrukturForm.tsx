/**
 * @fileoverview CmsStrukturForm — CMS editor for Struktur Organisasi page.
 *
 * Sections:
 * - content: { image_url, positions: [{ jabatan, nama }] }
 *
 * Route: /atmin/cms/struktur-organisasi
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Network, Upload, X, Plus, Trash2 } from "lucide-react";
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
import ImageUploader from "../../../components/ui/ImageUploader";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface Position {
  jabatan: string;
  nama: string;
}

interface StrukturContent {
  image_url: string;
  positions: Position[];
}

const FALLBACK: StrukturContent = {
  image_url: "",
  positions: [{ jabatan: "", nama: "" }],
};

// ─────────────────────────────────────────────
// PositionsEditor
// ─────────────────────────────────────────────

const PositionsEditor: React.FC<{
  positions: Position[];
  onChange: (positions: Position[]) => void;
}> = ({ positions, onChange }) => {
  const updatePosition = (
    index: number,
    field: keyof Position,
    value: string,
  ) => {
    onChange(
      positions.map((pos, i) =>
        i === index ? { ...pos, [field]: value } : pos,
      ),
    );
  };

  const addPosition = () => {
    onChange([...positions, { jabatan: "", nama: "" }]);
  };

  const removePosition = (index: number) => {
    if (positions.length <= 1) return;
    onChange(positions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_auto] gap-3 px-3 text-xs font-semibold text-secondary uppercase tracking-wide">
        <span>Jabatan</span>
        <span>Nama</span>
        <span />
      </div>

      {positions.map((pos, index) => (
        <div
          key={index}
          className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 p-3 bg-semibackground rounded-lg border border-border items-start"
        >
          <Field
            label=""
            value={pos.jabatan}
            onChange={(val) => updatePosition(index, "jabatan", val)}
            placeholder="Kepala Madrasah"
          />
          <Field
            label=""
            value={pos.nama}
            onChange={(val) => updatePosition(index, "nama", val)}
            placeholder="Nama lengkap"
          />
          <button
            onClick={() => removePosition(index)}
            disabled={positions.length <= 1}
            className="mt-1 p-2 text-secondary hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-30 disabled:cursor-not-allowed self-start"
            type="button"
          >
            <Trash2 size={14} />
          </button>
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
        if (data?.content) setContent({ ...FALLBACK, ...data.content });
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
          description="Gambar bagan dan daftar nama-jabatan struktural madrasah."
        />

        <SectionCard
          title="Bagan & Daftar Jabatan"
          icon={<Network size={18} />}
          description="Upload gambar bagan organisasi dan kelola daftar jabatan-nama."
          onSave={handleSave}
          isSaving={saving}
        >
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-foreground mb-3">
                Gambar Bagan Organisasi
              </p>
              <ImageUploader
                currentImage={content.image_url}
                onImageChange={async (file, url) => {
                  try {
                    // remove image
                    if (!file && !url) {
                      setContent((prev) => ({
                        ...prev,
                        image_url: "",
                      }));
                      return;
                    }

                    // upload file
                    if (file) {
                      const formData = new FormData();
                      formData.append("file", file);

                      const res = await fetch(
                        `${import.meta.env.VITE_BACKEND_URL}/api/atmin/upload`,
                        {
                          method: "POST",
                          headers: {
                            Authorization: `Bearer ${
                              localStorage.getItem("token") ?? ""
                            }`,
                          },
                          body: formData,
                        },
                      );

                      if (!res.ok) {
                        throw new Error("Upload gagal");
                      }

                      const data = await res.json();

                      setContent((prev) => ({
                        ...prev,
                        image_url: data.url ?? data.path ?? "",
                      }));

                      return;
                    }

                    // URL atau local path
                    if (url) {
                      setContent((prev) => ({
                        ...prev,
                        image_url: url,
                      }));
                    }
                  } catch {
                    showErrorToast("Gagal memproses gambar.");
                  }
                }}
                label=""
              />
            </div>

            <div className="border-t border-border pt-5">
              <p className="text-sm font-medium text-foreground mb-3">
                Daftar Jabatan & Nama
              </p>
              <PositionsEditor
                positions={content.positions}
                onChange={(positions) =>
                  setContent((prev) => ({ ...prev, positions }))
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
