/**
 * @fileoverview CmsPtspForm — CMS editor for PTSP Online page.
 *
 * Sections:
 * - header: { title, description }
 * - services: { items: [{ id, name, description, requirements: string[], duration, fee }] }
 *
 * Route: /atmin/cms/ptsp
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Layers,
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
  TextareaField,
  ArrayStringField,
} from "../../../components/cms/CmsFormComponents";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface PtspService {
  id: string;
  name: string;
  description?: string;
  requirements?: string[];
  duration?: string;
  fee?: string;
}

interface PtspHeader {
  title: string;
  description: string;
}

interface PtspServices {
  items: PtspService[];
}

// ─────────────────────────────────────────────
// ServicesEditor
// ─────────────────────────────────────────────

const ServicesEditor: React.FC<{
  items: PtspService[];
  onChange: (items: PtspService[]) => void;
}> = ({ items, onChange }) => {
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  const toggle = (index: number) =>
    setCollapsed((prev) => ({ ...prev, [index]: !prev[index] }));

  const updateItem = (index: number, field: keyof PtspService, value: any) => {
    onChange(
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addItem = () => {
    const newId = String(
      Math.max(0, ...items.map((i) => parseInt(i.id) || 0)) + 1,
    );
    onChange([
      ...items,
      {
        id: newId,
        name: "",
        description: "",
        requirements: [""],
        duration: "",
        fee: "",
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="border border-border rounded-lg overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-2 p-3 bg-semibackground">
            <button
              onClick={() => toggle(index)}
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
                {item.name || `Layanan ${index + 1}`}
              </span>
            </button>
            <button
              onClick={() => removeItem(index)}
              disabled={items.length <= 1}
              className="p-1.5 text-secondary hover:text-red-500 transition-colors rounded disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              type="button"
            >
              <Trash2 size={13} />
            </button>
          </div>

          {/* Body */}
          {!collapsed[index] && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="ID Layanan"
                  value={item.id}
                  onChange={(val) => updateItem(index, "id", val)}
                  placeholder="1"
                  hint="ID unik, tidak perlu diubah kecuali ada konflik."
                />
                <Field
                  label="Nama Layanan"
                  value={item.name}
                  onChange={(val) => updateItem(index, "name", val)}
                  placeholder="Legalisasi Dokumen"
                />
              </div>
              <TextareaField
                label="Deskripsi (opsional)"
                value={item.description ?? ""}
                onChange={(val) => updateItem(index, "description", val)}
                rows={2}
                placeholder="Layanan legalisasi dokumen resmi madrasah..."
              />
              <ArrayStringField
                label="Persyaratan"
                items={item.requirements ?? [""]}
                onChange={(val) => updateItem(index, "requirements", val)}
                placeholder="Fotokopi dokumen asli..."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Estimasi Waktu"
                  value={item.duration ?? ""}
                  onChange={(val) => updateItem(index, "duration", val)}
                  placeholder="1-3 hari kerja"
                />
                <Field
                  label="Biaya"
                  value={item.fee ?? ""}
                  onChange={(val) => updateItem(index, "fee", val)}
                  placeholder="Gratis"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={addItem}
        className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors pt-1"
        type="button"
      >
        <Plus size={14} />
        Tambah Layanan
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const CmsPtspForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [savingHeader, setSavingHeader] = useState(false);
  const [savingServices, setSavingServices] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [header, setHeader] = useState<PtspHeader>({
    title: "Pelayanan Terpadu Satu Pintu (PTSP) Online",
    description: "",
  });
  const [services, setServices] = useState<PtspServices>({
    items: [
      {
        id: "1",
        name: "",
        description: "",
        requirements: [""],
        duration: "",
        fee: "",
      },
    ],
  });

  // ── Auth guard ──
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isLoggedIn) {
      navigate("/login", { state: { redirectTo: "/atmin/cms/ptsp" } });
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
    apiFetch("/cms/ptsp")
      .then((data: any) => {
        if (data?.header) setHeader(data.header);
        if (data?.services) setServices(data.services);
      })
      .catch(() => showErrorToast("Gagal memuat data CMS PTSP."))
      .finally(() => setIsLoadingData(false));
  }, [isLoadingAuth, isLoggedIn, user, showErrorToast]);

  // ── Save handlers ──
  const handleSaveHeader = useCallback(async () => {
    setSavingHeader(true);
    try {
      await saveSection("ptsp", "header", header);
      showSuccessToast("Header PTSP berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan header.");
      throw new Error("Save failed");
    } finally {
      setSavingHeader(false);
    }
  }, [header, showSuccessToast, showErrorToast]);

  const handleSaveServices = useCallback(async () => {
    setSavingServices(true);
    try {
      await saveSection("ptsp", "services", services);
      showSuccessToast("Daftar layanan PTSP berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan layanan.");
      throw new Error("Save failed");
    } finally {
      setSavingServices(false);
    }
  }, [services, showSuccessToast, showErrorToast]);

  if (isLoadingAuth || isLoadingData) {
    return (
      <CmsLayout title="CMS — PTSP">
        <PageLoadingSpinner />
      </CmsLayout>
    );
  }

  return (
    <CmsLayout title="CMS — PTSP">
      <div className="max-w-3xl mx-auto">
        <CmsPageHeader
          title="Kelola PTSP Online"
          description="Header halaman dan daftar layanan terpadu satu pintu."
        />

        {/* Header */}
        <SectionCard
          title="Header Halaman"
          icon={<Building2 size={18} />}
          onSave={handleSaveHeader}
          isSaving={savingHeader}
        >
          <div className="space-y-4">
            <Field
              label="Judul"
              value={header.title}
              onChange={(val) => setHeader((p) => ({ ...p, title: val }))}
              placeholder="Pelayanan Terpadu Satu Pintu (PTSP) Online"
            />
            <TextareaField
              label="Deskripsi"
              value={header.description}
              onChange={(val) => setHeader((p) => ({ ...p, description: val }))}
              rows={3}
              placeholder="Layanan administrasi MAN 3 Kulon Progo secara online..."
            />
          </div>
        </SectionCard>

        {/* Services */}
        <SectionCard
          title="Daftar Layanan"
          icon={<Layers size={18} />}
          description="Setiap layanan punya nama, deskripsi, persyaratan, estimasi waktu, dan biaya."
          onSave={handleSaveServices}
          isSaving={savingServices}
        >
          <ServicesEditor
            items={services.items}
            onChange={(items) => setServices({ items })}
          />
        </SectionCard>
      </div>
    </CmsLayout>
  );
};

export default CmsPtspForm;
