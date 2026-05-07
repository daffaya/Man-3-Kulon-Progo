/**
 * @fileoverview CmsProgramKerjaForm — CMS editor for Program Kerja page.
 *
 * Sections:
 * - content: {
 *     tahun_ajaran: string,
 *     sections: [{ title: string, items: string[] }]
 *   }
 *
 * Route: /atmin/cms/program-kerja
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
  ArrayStringField,
} from "../../../components/cms/CmsFormComponents";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface ProgramSection {
  title: string;
  items: string[];
}

interface ProgramKerjaContent {
  tahun_ajaran: string;
  sections: ProgramSection[];
}

const FALLBACK: ProgramKerjaContent = {
  tahun_ajaran: "",
  sections: [{ title: "", items: [""] }],
};

// ─────────────────────────────────────────────
// ProgramSectionEditor
// ─────────────────────────────────────────────

const ProgramSectionEditor: React.FC<{
  sections: ProgramSection[];
  onChange: (sections: ProgramSection[]) => void;
}> = ({ sections, onChange }) => {
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  const toggleCollapse = (index: number) => {
    setCollapsed((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const updateTitle = (index: number, title: string) => {
    onChange(sections.map((s, i) => (i === index ? { ...s, title } : s)));
  };

  const updateItems = (index: number, items: string[]) => {
    onChange(sections.map((s, i) => (i === index ? { ...s, items } : s)));
  };

  const addSection = () => {
    onChange([...sections, { title: "", items: [""] }]);
  };

  const removeSection = (index: number) => {
    if (sections.length <= 1) return;
    onChange(sections.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {sections.map((section, index) => (
        <div
          key={index}
          className="border border-border rounded-lg overflow-hidden"
        >
          {/* Section header */}
          <div className="flex items-center gap-2 p-3 bg-semibackground">
            <button
              onClick={() => toggleCollapse(index)}
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
              <span className="text-sm font-medium text-foreground truncate">
                {section.title || `Bidang ${index + 1}`}
              </span>
              <span className="text-xs text-secondary ml-auto mr-2 flex-shrink-0">
                {section.items.length} program
              </span>
            </button>
            <button
              onClick={() => removeSection(index)}
              disabled={sections.length <= 1}
              className="p-1.5 text-secondary hover:text-red-500 transition-colors rounded disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              type="button"
            >
              <Trash2 size={13} />
            </button>
          </div>

          {/* Section body */}
          {!collapsed[index] && (
            <div className="p-4 space-y-4">
              <Field
                label="Nama Bidang / Judul Section"
                value={section.title}
                onChange={(val) => updateTitle(index, val)}
                placeholder="Bidang Kurikulum"
              />
              <ArrayStringField
                label="Daftar Program Kerja"
                items={section.items}
                onChange={(items) => updateItems(index, items)}
                placeholder="Nama program kerja..."
                showOrder
              />
            </div>
          )}
        </div>
      ))}

      <button
        onClick={addSection}
        className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors pt-1"
        type="button"
      >
        <Plus size={14} />
        Tambah Bidang
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const CmsProgramKerjaForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [saving, setSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [content, setContent] = useState<ProgramKerjaContent>(FALLBACK);

  // ── Auth guard ──
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isLoggedIn) {
      navigate("/login", { state: { redirectTo: "/atmin/cms/program-kerja" } });
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
    apiFetch("/cms/program-kerja")
      .then((data: any) => {
        if (data?.content) setContent({ ...FALLBACK, ...data.content });
      })
      .catch(() => showErrorToast("Gagal memuat data CMS Program Kerja."))
      .finally(() => setIsLoadingData(false));
  }, [isLoadingAuth, isLoggedIn, user, showErrorToast]);

  // ── Save ──
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await saveSection("program-kerja", "content", content);
      showSuccessToast("Program kerja berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan program kerja.");
      throw new Error("Save failed");
    } finally {
      setSaving(false);
    }
  }, [content, showSuccessToast, showErrorToast]);

  if (isLoadingAuth || isLoadingData) {
    return (
      <CmsLayout title="CMS — Program Kerja">
        <PageLoadingSpinner />
      </CmsLayout>
    );
  }

  return (
    <CmsLayout title="CMS — Program Kerja">
      <div className="max-w-3xl mx-auto">
        <CmsPageHeader
          title="Kelola Program Kerja"
          description="Program kerja per bidang untuk tahun ajaran aktif."
        />

        <SectionCard
          title="Program Kerja"
          icon={<ClipboardList size={18} />}
          description="Atur tahun ajaran dan daftar program kerja per bidang."
          onSave={handleSave}
          isSaving={saving}
        >
          <div className="space-y-6">
            <Field
              label="Tahun Ajaran"
              value={content.tahun_ajaran}
              onChange={(val) =>
                setContent((prev) => ({ ...prev, tahun_ajaran: val }))
              }
              placeholder="2024/2025"
              hint="Ditampilkan sebagai heading periode program kerja."
            />

            <div className="border-t border-border pt-5">
              <p className="text-sm font-medium text-foreground mb-3">
                Bidang & Program Kerja
              </p>
              <ProgramSectionEditor
                sections={content.sections}
                onChange={(sections) =>
                  setContent((prev) => ({ ...prev, sections }))
                }
              />
            </div>
          </div>
        </SectionCard>
      </div>
    </CmsLayout>
  );
};

export default CmsProgramKerjaForm;
