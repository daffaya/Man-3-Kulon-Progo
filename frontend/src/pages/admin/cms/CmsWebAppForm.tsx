/**
 * @fileoverview CmsWebAppForm — CMS editor for Web App page.
 *
 * Sections:
 * - header: title, description
 *
 * Route: /atmin/cms/web-app
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppWindow } from "lucide-react";
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

interface WebAppHeader {
  title: string;
  description: string;
}

const FALLBACK: WebAppHeader = {
  title: "Aplikasi Sekolah",
  description: "",
};

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const CmsWebAppForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [saving, setSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [header, setHeader] = useState<WebAppHeader>(FALLBACK);

  // ── Auth guard ──
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isLoggedIn) {
      navigate("/login", { state: { redirectTo: "/atmin/cms/web-app" } });
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
    apiFetch("/cms/web-app")
      .then((data: any) => {
        if (data?.header) setHeader({ ...FALLBACK, ...data.header });
      })
      .catch(() => showErrorToast("Gagal memuat data CMS Web App."))
      .finally(() => setIsLoadingData(false));
  }, [isLoadingAuth, isLoggedIn, user, showErrorToast]);

  // ── Save ──
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await saveSection("web-app", "header", header);
      showSuccessToast("Header Web App berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan header Web App.");
      throw new Error("Save failed");
    } finally {
      setSaving(false);
    }
  }, [header, showSuccessToast, showErrorToast]);

  const set = (field: keyof WebAppHeader) => (val: string) =>
    setHeader((prev) => ({ ...prev, [field]: val }));

  if (isLoadingAuth || isLoadingData) {
    return (
      <CmsLayout title="CMS — Web App">
        <PageLoadingSpinner />
      </CmsLayout>
    );
  }

  return (
    <CmsLayout title="CMS — Web App">
      <div className="max-w-3xl mx-auto">
        <CmsPageHeader
          title="Kelola Halaman Aplikasi Sekolah"
          description="Judul dan deskripsi yang tampil di header halaman Web App."
        />

        <SectionCard
          title="Header Halaman"
          icon={<AppWindow size={18} />}
          description="Teks pengantar halaman aplikasi sekolah."
          onSave={handleSave}
          isSaving={saving}
        >
          <div className="space-y-4">
            <Field
              label="Judul"
              value={header.title}
              onChange={set("title")}
              placeholder="Aplikasi Sekolah"
            />
            <TextareaField
              label="Deskripsi"
              value={header.description}
              onChange={set("description")}
              rows={3}
              placeholder="Kelola dan akses berbagai aplikasi yang tersedia di MAN 3 Kulon Progo..."
            />
          </div>
        </SectionCard>
      </div>
    </CmsLayout>
  );
};

export default CmsWebAppForm;
