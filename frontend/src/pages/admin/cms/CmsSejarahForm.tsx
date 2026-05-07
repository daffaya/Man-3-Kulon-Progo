/**
 * @fileoverview CmsSejarahForm — CMS editor for Sejarah page.
 *
 * Sections:
 * - content: paragraphs (string[])
 *
 * Route: /atmin/cms/sejarah
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import CmsLayout from "../../../components/layout/CmsLayout";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import { apiFetch } from "../../../lib/api";
import {
  SectionCard,
  saveSection,
  PageLoadingSpinner,
  CmsPageHeader,
  ArrayStringField,
} from "../../../components/cms/CmsFormComponents";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface SejarahContent {
  paragraphs: string[];
}

const FALLBACK: SejarahContent = {
  paragraphs: [""],
};

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const CmsSejarahForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [saving, setSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [content, setContent] = useState<SejarahContent>(FALLBACK);

  // ── Auth guard ──
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isLoggedIn) {
      navigate("/login", { state: { redirectTo: "/atmin/cms/sejarah" } });
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
    apiFetch("/cms/sejarah")
      .then((data: any) => {
        if (data?.content?.paragraphs) {
          setContent({ paragraphs: data.content.paragraphs });
        }
      })
      .catch(() => showErrorToast("Gagal memuat data CMS Sejarah."))
      .finally(() => setIsLoadingData(false));
  }, [isLoadingAuth, isLoggedIn, user, showErrorToast]);

  // ── Save ──
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await saveSection("sejarah", "content", content);
      showSuccessToast("Sejarah berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan sejarah.");
      throw new Error("Save failed");
    } finally {
      setSaving(false);
    }
  }, [content, showSuccessToast, showErrorToast]);

  if (isLoadingAuth || isLoadingData) {
    return (
      <CmsLayout title="CMS — Sejarah">
        <PageLoadingSpinner />
      </CmsLayout>
    );
  }

  return (
    <CmsLayout title="CMS — Sejarah">
      <div className="max-w-3xl mx-auto">
        <CmsPageHeader
          title="Kelola Halaman Sejarah"
          description="Paragraf teks yang ditampilkan di halaman Sejarah madrasah."
        />

        <SectionCard
          title="Paragraf Sejarah"
          icon={<BookOpen size={18} />}
          description="Setiap item adalah satu paragraf. Urutan tampil sesuai urutan di sini."
          onSave={handleSave}
          isSaving={saving}
        >
          <ArrayStringField
            label="Paragraf"
            items={content.paragraphs}
            onChange={(paragraphs) => setContent({ paragraphs })}
            placeholder="Sejarah berdirinya MAN 3 Kulon Progo..."
            hint="Klik '+ Tambah' untuk menambah paragraf baru."
          />
        </SectionCard>
      </div>
    </CmsLayout>
  );
};

export default CmsSejarahForm;
