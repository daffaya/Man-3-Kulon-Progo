/**
 * @fileoverview CmsMaklumatForm — CMS editor for Maklumat Pelayanan page.
 *
 * Features:
 * - Edit judul dan deskripsi maklumat
 * - Upload gambar melalui file
 * - Gunakan URL eksternal
 * - Gunakan path lokal dari folder public
 * - Preview gambar
 * - Upload otomatis ke backend
 *
 * Sections:
 * - content: title, description, image_url
 *
 * Route:
 * - /atmin/cms/maklumat-pelayanan
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";

import CmsLayout from "../../../components/layout/CmsLayout";
import ImageUploader from "../../../components/ui/ImageUploader";

import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";

import { apiFetch } from "../../../lib/api";

import {
  SectionCard,
  Field,
  TextareaField,
  PageLoadingSpinner,
  CmsPageHeader,
  saveSection,
} from "../../../components/cms/CmsFormComponents";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

/**
 * CMS content structure for Maklumat Pelayanan page.
 */
interface MaklumatContent {
  title: string;
  description: string;
  image_url: string;
}

/**
 * Default fallback content.
 */
const FALLBACK: MaklumatContent = {
  title: "Maklumat Pelayanan",
  description: "",
  image_url: "",
};

// ─────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────

/**
 * CMS page for managing Maklumat Pelayanan content.
 *
 * Supports:
 * - text editing
 * - image upload
 * - external image URL
 * - local public folder image path
 */
const CmsMaklumatForm: React.FC = () => {
  const navigate = useNavigate();

  const { user, isLoggedIn, isLoadingAuth } = useAuth();

  const { showSuccessToast, showErrorToast, showInfoToast } = useToastMessage();

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [isLoadingData, setIsLoadingData] = useState(true);

  const [content, setContent] = useState<MaklumatContent>(FALLBACK);

  // ─────────────────────────────────────────────
  // Auth Guard
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (isLoadingAuth) return;

    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          redirectTo: "/atmin/cms/maklumat-pelayanan",
        },
      });
      return;
    }

    if (user?.role !== "super_admin") {
      showErrorToast("Hanya Super Admin yang dapat mengakses halaman ini.");

      navigate("/atmin");
    }
  }, [isLoadingAuth, isLoggedIn, user, navigate, showErrorToast]);

  // ─────────────────────────────────────────────
  // Fetch Existing CMS Data
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (isLoadingAuth || !isLoggedIn || user?.role !== "super_admin") {
      return;
    }

    apiFetch("/cms/maklumat-pelayanan")
      .then((data: any) => {
        if (data?.content) {
          setContent({
            ...FALLBACK,
            ...data.content,
          });
        }
      })
      .catch(() => {
        showErrorToast("Gagal memuat data CMS Maklumat.");
      })
      .finally(() => {
        setIsLoadingData(false);
      });
  }, [isLoadingAuth, isLoggedIn, user, showErrorToast]);

  // ─────────────────────────────────────────────
  // Upload Image To Backend
  // ─────────────────────────────────────────────

  /**
   * Uploads image file to backend API.
   *
   * @param file Image file to upload
   * @returns Uploaded image URL
   */
  const uploadImage = useCallback(async (file: File): Promise<string> => {
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

      if (!res.ok) {
        throw new Error("Upload gagal");
      }

      const data = await res.json();

      return data.url ?? data.path ?? "";
    } finally {
      setUploading(false);
    }
  }, []);

  // ─────────────────────────────────────────────
  // Handle Image Change
  // ─────────────────────────────────────────────

  /**
   * Handles image changes from ImageUploader.
   *
   * Cases:
   * - file upload
   * - external URL
   * - local public path
   * - remove image
   */
  const handleImageChange = useCallback(
    async (file?: File, url?: string) => {
      try {
        // Remove image
        if (!file && !url) {
          setContent((prev) => ({
            ...prev,
            image_url: "",
          }));

          showInfoToast("Gambar dihapus");
          return;
        }

        // File upload
        if (file) {
          const uploadedUrl = await uploadImage(file);

          setContent((prev) => ({
            ...prev,
            image_url: uploadedUrl,
          }));

          showSuccessToast("Gambar berhasil diupload.");

          return;
        }

        // URL / local path
        if (url) {
          /**
           * Accept:
           * - https://...
           * - http://...
           * - /local-image.jpg
           */

          const isExternal =
            url.startsWith("http://") || url.startsWith("https://");

          const isLocalPath = url.startsWith("/");

          if (!isExternal && !isLocalPath) {
            showErrorToast(
              "URL tidak valid. Gunakan URL penuh atau path lokal dimulai dengan /",
            );

            return;
          }

          setContent((prev) => ({
            ...prev,
            image_url: url,
          }));

          showSuccessToast("Gambar berhasil diperbarui.");
        }
      } catch (error) {
        console.error(error);

        showErrorToast("Gagal memproses gambar.");
      }
    },
    [uploadImage, showSuccessToast, showErrorToast, showInfoToast],
  );

  // ─────────────────────────────────────────────
  // Save CMS Content
  // ─────────────────────────────────────────────

  /**
   * Saves CMS content to backend.
   */
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

  // ─────────────────────────────────────────────
  // Loading State
  // ─────────────────────────────────────────────

  if (isLoadingAuth || isLoadingData) {
    return (
      <CmsLayout title="CMS — Maklumat Pelayanan">
        <PageLoadingSpinner />
      </CmsLayout>
    );
  }

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

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
            {/* Title */}
            <Field
              label="Judul"
              value={content.title}
              onChange={(val) =>
                setContent((prev) => ({
                  ...prev,
                  title: val,
                }))
              }
              placeholder="Maklumat Pelayanan"
            />

            {/* Description */}
            <TextareaField
              label="Deskripsi / Teks Maklumat"
              value={content.description}
              onChange={(val) =>
                setContent((prev) => ({
                  ...prev,
                  description: val,
                }))
              }
              rows={5}
              placeholder="Kami penyelenggara pelayanan publik MAN 3 Kulon Progo..."
              hint="Teks utama yang muncul di halaman maklumat."
            />

            {/* Image */}
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                Gambar Maklumat
              </p>

              <p className="text-xs text-secondary mb-3">
                Upload gambar scan/foto maklumat resmi atau gunakan:
                <br />• URL eksternal:
                <code className="ml-1 bg-semibackground px-1 rounded">
                  https://example.com/image.jpg
                </code>
                <br />• Path lokal folder public:
                <code className="ml-1 bg-semibackground px-1 rounded">
                  /maklumat_pelayanan.jpeg
                </code>
              </p>

              <ImageUploader
                currentImage={content.image_url}
                onImageChange={handleImageChange}
                disabled={uploading || saving}
                label=""
              />

              {uploading && (
                <p className="text-xs text-accent mt-2">Mengupload gambar...</p>
              )}
            </div>
          </div>
        </SectionCard>
      </div>
    </CmsLayout>
  );
};

export default CmsMaklumatForm;
