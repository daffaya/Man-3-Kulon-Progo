/**
 * @fileoverview CmsMaklumatForm — CMS editor for Maklumat Pelayanan page.
 *
 * Sections:
 * - content: title, description, image_url (upload)
 *
 * Route: /atmin/cms/maklumat-pelayanan
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Upload, X, ImageIcon } from "lucide-react";
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

interface MaklumatContent {
  title: string;
  description: string;
  image_url: string;
}

const FALLBACK: MaklumatContent = {
  title: "Maklumat Pelayanan",
  description: "",
  image_url: "",
};

// ─────────────────────────────────────────────
// ImageUploadField
// ─────────────────────────────────────────────

/**
 * Image upload field with preview.
 * Uploads to /api/atmin/upload and returns URL.
 */
const ImageUploadField: React.FC<{
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}> = ({ label, value, onChange, hint }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { showErrorToast } = useToastMessage();

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/atmin/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
          },
          body: formData,
        },
      );
      if (!res.ok) throw new Error("Upload gagal");
      const data = await res.json();
      onChange(data.url ?? data.path ?? "");
    } catch {
      showErrorToast("Gagal mengupload gambar.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">
        {label}
      </label>
      {hint && <p className="text-xs text-secondary mb-2">{hint}</p>}

      {/* Preview */}
      {value && (
        <div className="relative mb-3 rounded-lg overflow-hidden border border-border bg-semibackground">
          <img
            src={value}
            alt="Preview"
            className="max-h-64 w-full object-contain"
          />
          <button
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
            title="Hapus gambar"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* URL manual */}
      <Field
        label="URL Gambar"
        value={value}
        onChange={onChange}
        placeholder="/maklumat-pelayanan.jpg atau https://..."
        hint="Isi manual atau upload file di bawah."
      />

      {/* Upload button */}
      <div className="mt-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-semibackground transition-colors text-foreground"
          type="button"
        >
          {uploading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-accent border-t-transparent rounded-full" />
              Mengupload...
            </>
          ) : (
            <>
              <Upload size={14} />
              Upload File Gambar
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const CmsMaklumatForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [saving, setSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [content, setContent] = useState<MaklumatContent>(FALLBACK);

  // ── Auth guard ──
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isLoggedIn) {
      navigate("/login", {
        state: { redirectTo: "/atmin/cms/maklumat-pelayanan" },
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
    apiFetch("/cms/maklumat-pelayanan")
      .then((data: any) => {
        if (data?.content) setContent({ ...FALLBACK, ...data.content });
      })
      .catch(() => showErrorToast("Gagal memuat data CMS Maklumat."))
      .finally(() => setIsLoadingData(false));
  }, [isLoadingAuth, isLoggedIn, user, showErrorToast]);

  // ── Save ──
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await saveSection("maklumat-pelayanan", "content", content);
      showSuccessToast("Maklumat Pelayanan berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan maklumat.");
      throw new Error("Save failed");
    } finally {
      setSaving(false);
    }
  }, [content, showSuccessToast, showErrorToast]);

  const set = (field: keyof MaklumatContent) => (val: string) =>
    setContent((prev) => ({ ...prev, [field]: val }));

  if (isLoadingAuth || isLoadingData) {
    return (
      <CmsLayout title="CMS — Maklumat Pelayanan">
        <PageLoadingSpinner />
      </CmsLayout>
    );
  }

  return (
    <CmsLayout title="CMS — Maklumat Pelayanan">
      <div className="max-w-3xl mx-auto">
        <CmsPageHeader
          title="Kelola Maklumat Pelayanan"
          description="Teks dan gambar maklumat yang ditampilkan di halaman Maklumat Pelayanan."
        />

        <SectionCard
          title="Konten Maklumat"
          icon={<FileText size={18} />}
          onSave={handleSave}
          isSaving={saving}
        >
          <div className="space-y-4">
            <Field
              label="Judul"
              value={content.title}
              onChange={set("title")}
              placeholder="Maklumat Pelayanan"
            />
            <TextareaField
              label="Deskripsi / Teks Maklumat"
              value={content.description}
              onChange={set("description")}
              rows={5}
              placeholder="Kami penyelenggara pelayanan publik MAN 3 Kulon Progo..."
              hint="Teks utama yang muncul di halaman maklumat."
            />
            <ImageUploadField
              label="Gambar / Dokumen Visual Maklumat"
              value={content.image_url}
              onChange={set("image_url")}
              hint="Gambar scan/foto maklumat resmi yang ditandatangani kepala madrasah."
            />
          </div>
        </SectionCard>
      </div>
    </CmsLayout>
  );
};

export default CmsMaklumatForm;
