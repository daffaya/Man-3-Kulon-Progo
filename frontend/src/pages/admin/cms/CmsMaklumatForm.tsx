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

const uploadCmsImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/atmin/cms/upload`,
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
  return data.url;
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
        if (file) {
          const uploaded = await uploadCmsImage(file);

          setContent((prev) => ({
            ...prev,
            image_url: uploaded,
          }));

          return;
        }

        if (url) {
          setContent((prev) => ({
            ...prev,
            image_url: url,
          }));
        }
      } catch {
        showErrorToast("Gagal mengupload gambar.");
      }
    },
    [showErrorToast],
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
                disabled={saving}
                label=""
              />
            </div>
          </div>
        </SectionCard>
      </div>
    </CmsLayout>
  );
};

export default CmsMaklumatForm;
