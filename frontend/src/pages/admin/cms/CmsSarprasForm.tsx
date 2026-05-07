/**
 * @fileoverview CmsSarprasForm — CMS editor for facilities page.
 *
 * Section editable:
 * - content: facilities[] (type, availability, condition)
 *
 * Route: /atmin/cms/sarana-prasarana
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Building, Plus, Trash2 } from "lucide-react";
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

interface FacilityItem {
  type: string;
  availability: string;
  condition: string;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const AVAILABILITY_OPTIONS = ["Ada", "Tidak Ada"];
const CONDITION_OPTIONS = ["Baik", "Cukup", "Rusak Ringan", "Rusak Berat"];

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

/**
 * CmsSarprasForm — CMS editor for facilities page.
 * Accessible only to super_admin.
 */
const CmsSarprasForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);

  // ── Auth guard ──
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isLoggedIn) {
      navigate("/login", {
        state: { redirectTo: "/atmin/cms/sarana-prasarana" },
      });
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
        const data = await apiFetch("/cms/sarana-prasarana/content");
        if (data?.facilities?.length) setFacilities(data.facilities);
      } catch {
        showErrorToast("Gagal memuat data sarana prasarana.");
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
      await saveSection("sarana-prasarana", "content", { facilities });
      showSuccessToast("Data sarana prasarana berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan data sarana prasarana.");
      throw new Error("failed");
    } finally {
      setSaving(false);
    }
  }, [facilities, showSuccessToast, showErrorToast]);

  // ── Row helpers ──
  const updateItem = (
    index: number,
    field: keyof FacilityItem,
    value: string,
  ) =>
    setFacilities((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );

  const addItem = () =>
    setFacilities((prev) => [
      ...prev,
      { type: "", availability: "Ada", condition: "Baik" },
    ]);

  const removeItem = (index: number) =>
    setFacilities((prev) => prev.filter((_, i) => i !== index));

  // ── Loading ──
  if (isLoadingAuth || isLoadingData) {
    return (
      <CmsLayout title="CMS — Sarana Prasarana">
        <PageLoadingSpinner />
      </CmsLayout>
    );
  }

  return (
    <CmsLayout title="CMS — Sarana Prasarana">
      <div className="max-w-4xl mx-auto">
        <CmsPageHeader
          title="Kelola Sarana & Prasarana"
          description="Daftar fasilitas sekolah beserta ketersediaan dan kondisinya."
        />

        <SectionCard
          title="Daftar Fasilitas"
          icon={<Building size={18} />}
          description="Setiap baris mewakili satu jenis fasilitas."
          onSave={handleSave}
          isSaving={saving}
        >
          <div className="space-y-3">
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-semibackground text-secondary text-xs">
                    <th className="px-3 py-2.5 text-left font-medium w-8">
                      No
                    </th>
                    <th className="px-3 py-2.5 text-left font-medium">
                      Jenis Prasarana
                    </th>
                    <th className="px-3 py-2.5 text-center font-medium w-36">
                      Ketersediaan
                    </th>
                    <th className="px-3 py-2.5 text-center font-medium w-40">
                      Kondisi
                    </th>
                    <th className="px-4 py-2.5 text-center font-medium w-12">
                      <span className="sr-only">Aksi</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {facilities.map((item, index) => (
                    <tr key={index} className="border-t border-border">
                      <td className="px-3 py-2 text-secondary text-center">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.type}
                          onChange={(e) =>
                            updateItem(index, "type", e.target.value)
                          }
                          className="form-input w-full"
                          placeholder="Nama fasilitas..."
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={item.availability}
                          onChange={(e) =>
                            updateItem(index, "availability", e.target.value)
                          }
                          className="form-input w-full text-center"
                        >
                          {AVAILABILITY_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={item.condition}
                          onChange={(e) =>
                            updateItem(index, "condition", e.target.value)
                          }
                          className="form-input w-full text-center"
                        >
                          {CONDITION_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => removeItem(index)}
                          className="p-1.5 text-secondary hover:text-red-500 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-950/30"
                          aria-label="Hapus fasilitas"
                          type="button"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={addItem}
              className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
              type="button"
            >
              <Plus size={15} />
              Tambah Fasilitas
            </button>

            <p className="text-xs text-secondary">
              Total:{" "}
              <strong className="text-foreground">{facilities.length}</strong>{" "}
              fasilitas
            </p>
          </div>
        </SectionCard>
      </div>
    </CmsLayout>
  );
};

export default CmsSarprasForm;
