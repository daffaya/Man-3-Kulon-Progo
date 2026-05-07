/**
 * @fileoverview CmsMitraForm — CMS editor for partners page.
 *
 * Section editable:
 * - content: partners[] (name, institution, cooperation)
 *
 * Route: /atmin/cms/mitra
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Handshake, Plus, Trash2 } from "lucide-react";
import CmsLayout from "../../../components/layout/CmsLayout";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import { apiFetch } from "../../../lib/api";
import {
  SectionCard,
  saveSection,
  PageLoadingSpinner,
  CmsPageHeader,
} from "../../../components/cms/CmsFormComponents";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface PartnerItem {
  name: string;
  institution: string;
  cooperation: string;
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

/**
 * CmsMitraForm — CMS editor for partners page.
 * Accessible only to super_admin.
 */
const CmsMitraForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [partners, setPartners] = useState<PartnerItem[]>([]);

  // ── Auth guard ──
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isLoggedIn) {
      navigate("/login", { state: { redirectTo: "/atmin/cms/mitra" } });
      return;
    }
    if (user?.role !== "super_admin") {
      showErrorToast("Hanya Super Admin yang dapat mengakses halaman ini.");
      navigate("/atmin");
    }
  }, [isLoadingAuth, isLoggedIn, user, navigate, showErrorToast]);

  // ── Fetch current data ──
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiFetch("/cms/mitra/content");
        if (data?.partners?.length) setPartners(data.partners);
      } catch {
        showErrorToast("Gagal memuat data mitra.");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (!isLoadingAuth && isLoggedIn && user?.role === "super_admin")
      fetchData();
  }, [isLoadingAuth, isLoggedIn, user, showErrorToast]);

  // ── Save handler ──
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await saveSection("mitra", "content", { partners });
      showSuccessToast("Data mitra berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan data mitra.");
      throw new Error("failed");
    } finally {
      setSaving(false);
    }
  }, [partners, showSuccessToast, showErrorToast]);

  // ── Partner helpers ──
  const updatePartner = (
    index: number,
    field: keyof PartnerItem,
    value: string,
  ) =>
    setPartners((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );

  const addPartner = () =>
    setPartners((prev) => [
      ...prev,
      { name: "", institution: "", cooperation: "" },
    ]);

  const removePartner = (index: number) =>
    setPartners((prev) => prev.filter((_, i) => i !== index));

  // ── Loading ──
  if (isLoadingAuth || isLoadingData) {
    return (
      <CmsLayout title="CMS — Mitra">
        <PageLoadingSpinner />
      </CmsLayout>
    );
  }

  return (
    <CmsLayout title="CMS — Mitra">
      <div className="max-w-4xl mx-auto">
        <CmsPageHeader
          title="Kelola Daftar Mitra"
          description="Institusi dan lembaga yang bermitra dengan MAN 3 Kulon Progo."
        />

        <SectionCard
          title="Daftar Mitra"
          icon={<Handshake size={18} />}
          description="Setiap baris mewakili satu mitra sekolah."
          onSave={handleSave}
          isSaving={saving}
        >
          <div className="space-y-3">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="p-4 bg-semibackground rounded-lg border border-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-secondary">
                    Mitra {index + 1}
                  </span>
                  <button
                    onClick={() => removePartner(index)}
                    className="p-1.5 text-secondary hover:text-red-500 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-950/30"
                    aria-label="Hapus mitra"
                    type="button"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-secondary mb-1">
                      Nama Mitra
                    </label>
                    <input
                      type="text"
                      value={partner.name}
                      onChange={(e) =>
                        updatePartner(index, "name", e.target.value)
                      }
                      className="form-input w-full"
                      placeholder="Nama institusi..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-secondary mb-1">
                      Jenis Lembaga
                    </label>
                    <input
                      type="text"
                      value={partner.institution}
                      onChange={(e) =>
                        updatePartner(index, "institution", e.target.value)
                      }
                      className="form-input w-full"
                      placeholder="Instansi Pemerintah / Dunia Usaha..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-secondary mb-1">
                      Bentuk Kerja Sama
                    </label>
                    <input
                      type="text"
                      value={partner.cooperation}
                      onChange={(e) =>
                        updatePartner(index, "cooperation", e.target.value)
                      }
                      className="form-input w-full"
                      placeholder="Pelayanan Kesehatan..."
                    />
                  </div>
                </div>
              </div>
            ))}

            {partners.length === 0 && (
              <p className="text-sm text-secondary/60 italic text-center py-6 border border-dashed border-border rounded-lg">
                Belum ada mitra. Klik "+ Tambah Mitra" untuk menambahkan.
              </p>
            )}

            <button
              onClick={addPartner}
              className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
              type="button"
            >
              <Plus size={15} />
              Tambah Mitra
            </button>

            <p className="text-xs text-secondary">
              Total:{" "}
              <strong className="text-foreground">{partners.length}</strong>{" "}
              mitra
            </p>
          </div>
        </SectionCard>
      </div>
    </CmsLayout>
  );
};

export default CmsMitraForm;
