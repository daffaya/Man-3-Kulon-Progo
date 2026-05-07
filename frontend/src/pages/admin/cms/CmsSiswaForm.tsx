/**
 * @fileoverview CmsSiswaForm — CMS editor for student recap page.
 *
 * Section editable:
 * - content: tahun_ajaran, data[] (status, male, female)
 *
 * Route: /atmin/cms/siswa
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import CmsLayout from "../../../components/layout/CmsLayout";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import { apiFetch } from "../../../lib/api";
import {
  SectionCard,
  Field,
  saveSection,
  PageLoadingSpinner,
  CmsPageHeader,
} from "../../../components/cms/CmsFormComponents";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface StudentRow {
  status: string;
  male: number;
  female: number;
}

interface SiswaContent {
  tahun_ajaran: string;
  data: StudentRow[];
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

/**
 * CmsSiswaForm — CMS editor for student data page.
 * Accessible only to super_admin.
 */
const CmsSiswaForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  const [tahunAjaran, setTahunAjaran] = useState("2025/2026");
  const [rows, setRows] = useState<StudentRow[]>([
    { status: "Kelas X", male: 0, female: 0 },
    { status: "Kelas XI", male: 0, female: 0 },
    { status: "Kelas XII", male: 0, female: 0 },
  ]);

  // ── Computed totals ──
  const totalMale = rows.reduce((sum, r) => sum + Number(r.male), 0);
  const totalFemale = rows.reduce((sum, r) => sum + Number(r.female), 0);
  const total = totalMale + totalFemale;

  // ── Auth guard ──
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isLoggedIn) {
      navigate("/login", { state: { redirectTo: "/atmin/cms/siswa" } });
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
        const data: SiswaContent = await apiFetch("/cms/siswa/content");
        if (data.tahun_ajaran) setTahunAjaran(data.tahun_ajaran);
        if (data.data?.length) setRows(data.data);
      } catch {
        showErrorToast("Gagal memuat data siswa.");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (!isLoadingAuth && isLoggedIn && user?.role === "super_admin") {
      fetchData();
    }
  }, [isLoadingAuth, isLoggedIn, user, showErrorToast]);

  // ── Save handler ──
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await saveSection("siswa", "content", {
        tahun_ajaran: tahunAjaran,
        data: rows,
      });
      showSuccessToast("Data siswa berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan data siswa.");
      throw new Error("failed");
    } finally {
      setSaving(false);
    }
  }, [tahunAjaran, rows, showSuccessToast, showErrorToast]);

  // ── Row helpers ──
  const updateRow = (index: number, field: keyof StudentRow, value: string) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              [field]: field === "status" ? value : parseInt(value) || 0,
            }
          : row,
      ),
    );
  };

  const addRow = () =>
    setRows((prev) => [...prev, { status: "", male: 0, female: 0 }]);

  const removeRow = (index: number) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  // ── Loading ──
  if (isLoadingAuth || isLoadingData) {
    return (
      <CmsLayout title="CMS — Siswa">
        <PageLoadingSpinner />
      </CmsLayout>
    );
  }

  return (
    <CmsLayout title="CMS — Siswa">
      <div className="max-w-3xl mx-auto">
        <CmsPageHeader
          title="Kelola Data Peserta Didik"
          description="Rekapitulasi jumlah siswa per kelas. Update setiap awal tahun ajaran baru."
        />

        <SectionCard
          title="Rekapitulasi Peserta Didik"
          icon={<GraduationCap size={18} />}
          description="Data ini ditampilkan di halaman Profil → Siswa."
          onSave={handleSave}
          isSaving={saving}
        >
          <div className="space-y-4">
            {/* Tahun ajaran */}
            <Field
              label="Tahun Pelajaran"
              value={tahunAjaran}
              onChange={setTahunAjaran}
              placeholder="2025/2026"
              hint="Format: YYYY/YYYY. Contoh: 2025/2026"
            />

            {/* Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">
                  Data per Kelas
                </label>
                <button
                  onClick={addRow}
                  className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors"
                  type="button"
                >
                  <Plus size={13} />
                  Tambah Kelas
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-semibackground text-secondary text-xs">
                      <th className="px-4 py-2.5 text-left font-medium">
                        Kelas
                      </th>
                      <th className="px-4 py-2.5 text-center font-medium">L</th>
                      <th className="px-4 py-2.5 text-center font-medium">P</th>
                      <th className="px-4 py-2.5 text-center font-medium w-12">
                        <span className="sr-only">Aksi</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={index} className="border-t border-border">
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={row.status}
                            onChange={(e) =>
                              updateRow(index, "status", e.target.value)
                            }
                            className="form-input w-full"
                            placeholder="Kelas X"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={row.male}
                            onChange={(e) =>
                              updateRow(index, "male", e.target.value)
                            }
                            className="form-input w-full text-center"
                            min={0}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={row.female}
                            onChange={(e) =>
                              updateRow(index, "female", e.target.value)
                            }
                            className="form-input w-full text-center"
                            min={0}
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          {rows.length > 1 && (
                            <button
                              onClick={() => removeRow(index)}
                              className="p-1.5 text-secondary hover:text-red-500 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-950/30"
                              aria-label="Hapus baris"
                              type="button"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}

                    {/* Total row */}
                    <tr className="border-t-2 border-border bg-accent/5 font-semibold">
                      <td className="px-4 py-2.5 text-foreground text-sm">
                        Total Peserta Didik
                      </td>
                      <td className="px-4 py-2.5 text-center text-foreground">
                        {totalMale}
                      </td>
                      <td className="px-4 py-2.5 text-center text-foreground">
                        {totalFemale}
                      </td>
                      <td className="px-4 py-2.5 text-center text-accent font-bold">
                        {total}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-secondary mt-2">
                Total dihitung otomatis. L = Laki-laki, P = Perempuan.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </CmsLayout>
  );
};

export default CmsSiswaForm;
