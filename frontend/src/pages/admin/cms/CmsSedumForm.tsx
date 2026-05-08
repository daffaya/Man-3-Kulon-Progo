/**
 * @fileoverview CmsSedumForm — CMS editor for SEDUM page.
 *
 * Sections:
 * - header: { title, description }
 * - about: { description }
 * - channels: { email, hotline, ... }
 * - sop: { image_url }
 * - faq: { items: [{ question, answer }] }
 *
 * Route: /atmin/cms/sedum
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Info,
  Radio,
  FileQuestion,
  BookOpen,
  Plus,
  Trash2,
  Upload,
  X,
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
} from "../../../components/cms/CmsFormComponents";
import ImageUploader from "../../../components/ui/ImageUploader";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface SedumHeader {
  title: string;
  description: string;
}

interface SedumAbout {
  description: string;
}

interface SedumChannels {
  email: string;
  hotline: string;
  [key: string]: string; // extra channel fields
}

interface SedumSop {
  image_url: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface SedumFaq {
  items: FaqItem[];
}

// ─────────────────────────────────────────────
// FaqEditor
// ─────────────────────────────────────────────

const FaqEditor: React.FC<{
  items: FaqItem[];
  onChange: (items: FaqItem[]) => void;
}> = ({ items, onChange }) => {
  const updateItem = (index: number, field: keyof FaqItem, value: string) => {
    onChange(
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addItem = () => onChange([...items, { question: "", answer: "" }]);

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="p-4 bg-semibackground rounded-lg border border-border space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wide">
              FAQ {index + 1}
            </span>
            <button
              onClick={() => removeItem(index)}
              disabled={items.length <= 1}
              className="p-1.5 text-secondary hover:text-red-500 transition-colors rounded disabled:opacity-30 disabled:cursor-not-allowed"
              type="button"
            >
              <Trash2 size={13} />
            </button>
          </div>
          <Field
            label="Pertanyaan"
            value={item.question}
            onChange={(val) => updateItem(index, "question", val)}
            placeholder="Apakah identitas saya aman?"
          />
          <TextareaField
            label="Jawaban"
            value={item.answer}
            onChange={(val) => updateItem(index, "answer", val)}
            rows={2}
            placeholder="Ya, identitas pelapor dijaga kerahasiaannya..."
          />
        </div>
      ))}

      <button
        onClick={addItem}
        className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
        type="button"
      >
        <Plus size={14} />
        Tambah FAQ
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const CmsSedumForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [savingHeader, setSavingHeader] = useState(false);
  const [savingAbout, setSavingAbout] = useState(false);
  const [savingChannels, setSavingChannels] = useState(false);
  const [savingSop, setSavingSop] = useState(false);
  const [savingFaq, setSavingFaq] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [header, setHeader] = useState<SedumHeader>({
    title: "Serapan Aduan Masyarakat",
    description: "",
  });
  const [about, setAbout] = useState<SedumAbout>({ description: "" });
  const [channels, setChannels] = useState<SedumChannels>({
    email: "",
    hotline: "",
  });
  const [sop, setSop] = useState<SedumSop>({ image_url: "" });
  const [faq, setFaq] = useState<SedumFaq>({
    items: [{ question: "", answer: "" }],
  });

  // ── Auth guard ──
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isLoggedIn) {
      navigate("/login", { state: { redirectTo: "/atmin/cms/sedum" } });
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
    apiFetch("/cms/sedum")
      .then((data: any) => {
        if (data?.header) setHeader(data.header);
        if (data?.about) setAbout(data.about);
        if (data?.channels) setChannels(data.channels);
        if (data?.sop) setSop(data.sop);
        if (data?.faq) setFaq(data.faq);
      })
      .catch(() => showErrorToast("Gagal memuat data CMS SEDUM."))
      .finally(() => setIsLoadingData(false));
  }, [isLoadingAuth, isLoggedIn, user, showErrorToast]);

  // ── Save handlers ──
  const makeSaveHandler = <T,>(
    setState: React.Dispatch<React.SetStateAction<T>>,
    setSaving: React.Dispatch<React.SetStateAction<boolean>>,
    sectionKey: string,
    data: T,
    label: string,
  ) =>
    useCallback(async () => {
      setSaving(true);
      try {
        await saveSection("sedum", sectionKey, data);
        showSuccessToast(`${label} berhasil disimpan.`);
      } catch {
        showErrorToast(`Gagal menyimpan ${label}.`);
        throw new Error("Save failed");
      } finally {
        setSaving(false);
      }
    }, [data]);

  const handleSaveHeader = useCallback(async () => {
    setSavingHeader(true);
    try {
      await saveSection("sedum", "header", header);
      showSuccessToast("Header SEDUM berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan header.");
      throw new Error("Save failed");
    } finally {
      setSavingHeader(false);
    }
  }, [header, showSuccessToast, showErrorToast]);

  const handleSaveAbout = useCallback(async () => {
    setSavingAbout(true);
    try {
      await saveSection("sedum", "about", about);
      showSuccessToast("Tentang SEDUM berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan tentang.");
      throw new Error("Save failed");
    } finally {
      setSavingAbout(false);
    }
  }, [about, showSuccessToast, showErrorToast]);

  const handleSaveChannels = useCallback(async () => {
    setSavingChannels(true);
    try {
      await saveSection("sedum", "channels", channels);
      showSuccessToast("Saluran aduan berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan saluran.");
      throw new Error("Save failed");
    } finally {
      setSavingChannels(false);
    }
  }, [channels, showSuccessToast, showErrorToast]);

  const handleSaveSop = useCallback(async () => {
    setSavingSop(true);
    try {
      await saveSection("sedum", "sop", sop);
      showSuccessToast("SOP berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan SOP.");
      throw new Error("Save failed");
    } finally {
      setSavingSop(false);
    }
  }, [sop, showSuccessToast, showErrorToast]);

  const handleSaveFaq = useCallback(async () => {
    setSavingFaq(true);
    try {
      await saveSection("sedum", "faq", faq);
      showSuccessToast("FAQ berhasil disimpan.");
    } catch {
      showErrorToast("Gagal menyimpan FAQ.");
      throw new Error("Save failed");
    } finally {
      setSavingFaq(false);
    }
  }, [faq, showSuccessToast, showErrorToast]);

  if (isLoadingAuth || isLoadingData) {
    return (
      <CmsLayout title="CMS — SEDUM">
        <PageLoadingSpinner />
      </CmsLayout>
    );
  }

  return (
    <CmsLayout title="CMS — SEDUM">
      <div className="max-w-3xl mx-auto">
        <CmsPageHeader
          title="Kelola Halaman SEDUM"
          description="Serapan Aduan Masyarakat — header, deskripsi, saluran, SOP, dan FAQ."
        />

        {/* Header */}
        <SectionCard
          title="Header Halaman"
          icon={<MessageSquare size={18} />}
          onSave={handleSaveHeader}
          isSaving={savingHeader}
        >
          <div className="space-y-4">
            <Field
              label="Judul"
              value={header.title}
              onChange={(val) => setHeader((p) => ({ ...p, title: val }))}
              placeholder="Serapan Aduan Masyarakat"
            />
            <TextareaField
              label="Deskripsi"
              value={header.description}
              onChange={(val) => setHeader((p) => ({ ...p, description: val }))}
              rows={3}
              placeholder="MAN 3 Kulon Progo membuka ruang..."
            />
          </div>
        </SectionCard>

        {/* About */}
        <SectionCard
          title="Tentang SEDUM"
          icon={<Info size={18} />}
          onSave={handleSaveAbout}
          isSaving={savingAbout}
        >
          <TextareaField
            label="Deskripsi"
            value={about.description}
            onChange={(val) => setAbout({ description: val })}
            rows={4}
            placeholder="MAN 3 Kulon Progo membuka ruang serapan aduan..."
          />
        </SectionCard>

        {/* Channels */}
        <SectionCard
          title="Saluran Pengaduan"
          icon={<Radio size={18} />}
          description="Email, hotline, dan saluran lainnya."
          onSave={handleSaveChannels}
          isSaving={savingChannels}
        >
          <div className="space-y-4">
            <Field
              label="Email"
              value={channels.email}
              onChange={(val) => setChannels((p) => ({ ...p, email: val }))}
              type="email"
              placeholder="man3kulonprogo@gmail.com"
            />
            <Field
              label="Hotline / Nomor WA"
              value={channels.hotline}
              onChange={(val) => setChannels((p) => ({ ...p, hotline: val }))}
              placeholder="+62 8xx-xxxx-xxxx"
            />
          </div>
        </SectionCard>

        {/* SOP */}
        <SectionCard
          title="Gambar SOP Pengaduan"
          icon={<BookOpen size={18} />}
          onSave={handleSaveSop}
          isSaving={savingSop}
        >
          <ImageUploader
            currentImage={sop.image_url}
            onImageChange={async (file, url) => {
              try {
                // remove image
                if (!file && !url) {
                  setSop({
                    image_url: "",
                  });

                  return;
                }

                // upload file
                if (file) {
                  const formData = new FormData();

                  formData.append("file", file);

                  const res = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/atmin/upload`,
                    {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${
                          localStorage.getItem("token") ?? ""
                        }`,
                      },
                      body: formData,
                    },
                  );

                  if (!res.ok) {
                    throw new Error("Upload gagal");
                  }

                  const data = await res.json();

                  setSop({
                    image_url: data.url ?? data.path ?? "",
                  });

                  showSuccessToast("Gambar SOP berhasil diupload.");

                  return;
                }

                // URL eksternal atau local path
                if (url) {
                  setSop({
                    image_url: url,
                  });

                  showSuccessToast("Gambar SOP berhasil diperbarui.");
                }
              } catch {
                showErrorToast("Gagal memproses gambar SOP.");
              }
            }}
            label=""
          />
        </SectionCard>

        {/* FAQ */}
        <SectionCard
          title="FAQ"
          icon={<FileQuestion size={18} />}
          description="Pertanyaan dan jawaban yang sering ditanyakan."
          onSave={handleSaveFaq}
          isSaving={savingFaq}
        >
          <FaqEditor
            items={faq.items}
            onChange={(items) => setFaq({ items })}
          />
        </SectionCard>
      </div>
    </CmsLayout>
  );
};

export default CmsSedumForm;
