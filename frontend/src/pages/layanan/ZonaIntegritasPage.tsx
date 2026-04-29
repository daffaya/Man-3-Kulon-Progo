/**
 * @fileoverview ZonaIntegritasPage — migrated to CMS.
 * Fetches content from site_contents (page: zona-integritas).
 * UI logic (modal, banner, keyboard nav) tidak diubah — hanya data source.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import Layout from "../../components/layout/Layout";
import {
  Shield,
  MessageSquare,
  Mail,
  Phone,
  RotateCw,
  Settings,
  Users,
  BarChart3,
  Search,
  HeartHandshake,
  ZoomIn,
  FileText,
  ExternalLink,
  X,
} from "lucide-react";
import IntegrityAreaCard from "../../components/integrity/IntegrityAreaCard";
import ImageZoomModal from "../../components/modals/ImageZoomModal";
import { useCmsPage } from "../../hooks/useCmsPage";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface AreaItem {
  id: number;
  title: string;
  description: string;
  drive_pemenuhan: string;
  drive_reform: string;
}

interface ZonaIntegritasData {
  header: {
    title: string;
    description: string;
    banner_image: string;
    banner_enabled: boolean;
  };
  areas: { items: AreaItem[] };
  lkj: {
    title: string;
    description: string;
    drive_url: string;
    cover_image: string;
  };
  sop: { image_url: string };
  pengaduan: { email: string; whatsapp: string; wa_raw: string };
}

// ─────────────────────────────────────────────
// Fallback
// ─────────────────────────────────────────────

const FALLBACK: ZonaIntegritasData = {
  header: {
    title: "Zona Integritas",
    description:
      "Zona Integritas merupakan predikat yang diberikan kepada instansi pemerintah yang berkomitmen mewujudkan WBK/WBBM.",
    banner_image: "/banner_zi.png",
    banner_enabled: true,
  },
  areas: {
    items: [
      {
        id: 1,
        title: "Manajemen Perubahan",
        description:
          "Pengelolaan perubahan untuk mencapai tujuan pembangunan Zona Integritas",
        drive_pemenuhan:
          "https://drive.google.com/drive/folders/1gzW8nrfkdCQhmxYWkO6o-bokN8oJQQZ_",
        drive_reform:
          "https://drive.google.com/drive/folders/1iFczCP3b5kx4yHbmcGjIWKv6hiS97WLM",
      },
      {
        id: 2,
        title: "Penataan Tatalaksana",
        description:
          "Penyederhanaan dan penguatan prosedur kerja yang efektif dan efisien",
        drive_pemenuhan:
          "https://drive.google.com/drive/folders/1r21LgoyN6kuR7kYBh9TPx8jR7v7X9iIe",
        drive_reform:
          "https://drive.google.com/drive/folders/18sMFIYYiNzRjFK6uxyeuKSVeVYIa0fzp",
      },
      {
        id: 3,
        title: "Penataan Sistem Manajemen SDM",
        description:
          "Pengelolaan sumber daya manusia yang berbasis kinerja dan kompetensi",
        drive_pemenuhan:
          "https://drive.google.com/drive/folders/1jCZ7lUNxGKWIB9JMqOpQGn0RPPlzuoKg",
        drive_reform:
          "https://drive.google.com/drive/folders/1B4fF_5NqPok0dN2zUNRyu-LxWKtRk0c_",
      },
      {
        id: 4,
        title: "Penguatan Akuntabilitas",
        description:
          "Peningkatan pertanggungjawaban kinerja instansi pemerintah",
        drive_pemenuhan:
          "https://drive.google.com/drive/folders/1jK6mSN0xv-oFj57uvqE650SYbT1Uj4aZ",
        drive_reform:
          "https://drive.google.com/drive/folders/1bWQ80v8Fphbo10KMF3trS5V6BcVYs4_C",
      },
      {
        id: 5,
        title: "Penguatan Pengawasan",
        description:
          "Peningkatan efektivitas sistem pengawasan intern dan ekstern",
        drive_pemenuhan:
          "https://drive.google.com/drive/folders/1aLbJuntZTaret6YRAAtRHO_EMZrS3LMF",
        drive_reform:
          "https://drive.google.com/drive/folders/1RUxo3RYGdIRh80m8GJbkA9R_20hEPXVu",
      },
      {
        id: 6,
        title: "Peningkatan Kualitas Pelayanan Publik",
        description:
          "Optimalisasi pelayanan publik yang berkualitas dan berorientasi pada kepuasan",
        drive_pemenuhan:
          "https://drive.google.com/drive/folders/1uNbpKnXavWZmawXUZv_a5fWS-LlheVJV",
        drive_reform:
          "https://drive.google.com/drive/folders/1CH2QBUzm9XVJ6_HKWw8AvO_RMLlVlfWG",
      },
    ],
  },
  lkj: {
    title: "Laporan Kinerja MAN 3 Kulon Progo Tahun 2025",
    description:
      "Laporan Kinerja ini disusun sebagai bentuk pertanggungjawaban akuntabilitas kinerja sesuai dengan Peraturan Menteri Agama Nomor 19 Tahun 2019.",
    drive_url:
      "https://drive.google.com/file/d/19BbbTEvYiKXJTsYTMO2EWsT2pC6sP6rK/view?usp=drive_link",
    cover_image: "/cover-laporan-kinerja-zi-2025.jpg",
  },
  sop: { image_url: "/SOP_ZI.png" },
  pengaduan: {
    email: "man3kulonprogo@gmail.com",
    whatsapp: "+62-878-5810-2393",
    wa_raw: "6287858102393",
  },
};

// ─────────────────────────────────────────────
// Icon map — area id → icon component
// ─────────────────────────────────────────────

const AREA_ICONS: Record<number, React.ReactNode> = {
  1: <RotateCw size={24} />,
  2: <Settings size={24} />,
  3: <Users size={24} />,
  4: <BarChart3 size={24} />,
  5: <Search size={24} />,
  6: <HeartHandshake size={24} />,
};

// ─────────────────────────────────────────────
// Modal
// ─────────────────────────────────────────────

interface ModalProps {
  area: AreaItem | null;
  allAreas: AreaItem[];
  onClose: () => void;
  onNavigate: (area: AreaItem) => void;
}

const IntegrityModal: React.FC<ModalProps> = ({
  area,
  allAreas,
  onClose,
  onNavigate,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [internalArea, setInternalArea] = useState<AreaItem | null>(null);
  const prevAreaId = useRef<number | null>(null);

  useEffect(() => {
    if (area) {
      setInternalArea(area);
      const isFirstOpen = prevAreaId.current === null;
      prevAreaId.current = area.id;

      if (isFirstOpen) {
        setIsVisible(false);
        setIsContentVisible(false);
        requestAnimationFrame(() => setIsVisible(true));
        const t = setTimeout(() => setIsContentVisible(true), 100);
        document.body.style.overflow = "hidden";
        return () => clearTimeout(t);
      } else {
        setIsContentVisible(false);
        const t = setTimeout(() => setIsContentVisible(true), 150);
        return () => clearTimeout(t);
      }
    } else {
      prevAreaId.current = null;
      document.body.style.overflow = "";
    }
  }, [area]);

  useEffect(
    () => () => {
      document.body.style.overflow = "";
    },
    [],
  );

  const handleClose = useCallback(() => {
    setIsContentVisible(false);
    setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = "";
      prevAreaId.current = null;
      onClose();
    }, 200);
  }, [onClose]);

  const goToArea = useCallback(
    (direction: "prev" | "next") => {
      if (!internalArea) return;
      const currentIndex = allAreas.findIndex((a) => a.id === internalArea.id);
      const newIndex =
        direction === "prev"
          ? currentIndex <= 0
            ? allAreas.length - 1
            : currentIndex - 1
          : currentIndex >= allAreas.length - 1
            ? 0
            : currentIndex + 1;
      onNavigate(allAreas[newIndex]);
    },
    [internalArea, allAreas, onNavigate],
  );

  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") goToArea("prev");
      if (e.key === "ArrowRight") goToArea("next");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, handleClose, goToArea]);

  if (!isVisible && !internalArea) return null;

  const currentIndex = internalArea
    ? allAreas.findIndex((a) => a.id === internalArea.id)
    : 0;
  const totalAreas = allAreas.length;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible
          ? "bg-black/60 backdrop-blur-sm opacity-100"
          : "bg-black/0 opacity-0 pointer-events-none"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className={`relative w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden rounded-2xl bg-background shadow-2xl border border-border transition-all duration-300 ease-out ${
          isContentVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-[0.97] translate-y-3"
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border bg-background px-6 py-6 md:px-8 md:py-7">
          <div className="flex items-start gap-4 md:gap-5">
            <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 bg-accent/10 rounded-xl flex items-center justify-center text-accent border border-accent/20">
              {AREA_ICONS[internalArea?.id ?? 1]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 bg-accent/10 text-accent rounded-full px-3 py-1 text-xs font-semibold mb-2">
                Area {currentIndex + 1} dari {totalAreas}
              </div>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-foreground">
                {internalArea?.title}
              </h3>
              <p className="text-sm text-secondary mt-1 line-clamp-1">
                {internalArea?.description}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-secondary hover:text-foreground hover:bg-muted rounded-xl transition-all border border-border"
              aria-label="Tutup"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
          <div className="mt-5 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentIndex + 1) / totalAreas) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {internalArea &&
              [
                {
                  label: "Pemenuhan",
                  url: internalArea.drive_pemenuhan,
                  isPemenuhan: true,
                },
                {
                  label: "Reform",
                  url: internalArea.drive_reform,
                  isPemenuhan: false,
                },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-semibold shadow-sm transition-all border ${
                    link.isPemenuhan
                      ? "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300"
                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      link.isPemenuhan
                        ? "bg-blue-200/60 dark:bg-blue-800/40"
                        : "bg-emerald-200/60 dark:bg-emerald-800/40"
                    }`}
                  >
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold">{link.label}</div>
                    <div className="text-[0.7rem] opacity-70 font-normal mt-0.5">
                      Google Drive Folder
                    </div>
                  </div>
                  <ExternalLink size={14} className="flex-shrink-0" />
                </a>
              ))}
          </div>

          <div className="hidden md:flex items-center justify-center gap-6 pt-2">
            {[
              ["←", "→", "Navigasi area"],
              ["Esc", "", "Tutup"],
            ].map(([k1, k2, label], i) => (
              <span
                key={i}
                className="text-xs text-secondary/50 flex items-center gap-1.5"
              >
                {[k1, k2].filter(Boolean).map((k) => (
                  <kbd
                    key={k}
                    className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono"
                  >
                    {k}
                  </kbd>
                ))}
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="flex-shrink-0 border-t border-border bg-muted/30 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => goToArea("prev")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-secondary hover:text-foreground hover:bg-muted transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 3L5 8L10 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>
          <div className="flex items-center gap-1.5">
            {allAreas.map((a, idx) => (
              <button
                key={a.id}
                onClick={() => {
                  if (idx !== currentIndex) onNavigate(allAreas[idx]);
                }}
                className={`rounded-full transition-all duration-300 ${idx === currentIndex ? "w-6 h-2 bg-accent" : "w-2 h-2 bg-border hover:bg-secondary/40"}`}
                aria-label={`Area ${idx + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => goToArea("next")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-secondary hover:text-foreground hover:bg-muted transition-all"
          >
            <span className="hidden sm:inline">Selanjutnya</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 3L11 8L6 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const ZonaIntegritasPage: React.FC = () => {
  const [selectedArea, setSelectedArea] = useState<AreaItem | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  const { data, loading } = useCmsPage<ZonaIntegritasData>("zona-integritas");

  const header = data?.header ?? FALLBACK.header;
  const areas = data?.areas?.items ?? FALLBACK.areas.items;
  const lkj = data?.lkj ?? FALLBACK.lkj;
  const sop = data?.sop ?? FALLBACK.sop;
  const pengaduan = data?.pengaduan ?? FALLBACK.pengaduan;

  useEffect(() => {
    if (showBanner) {
      const timer = setTimeout(() => setShowBanner(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showBanner]);

  return (
    <Layout>
      {/* Banner Popup */}
      {showBanner && !loading && header.banner_enabled && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 cursor-pointer"
          onClick={() => setShowBanner(false)}
        >
          <div className="relative max-w-3xl w-full cursor-default">
            <button
              onClick={() => setShowBanner(false)}
              className="absolute -top-2 -right-2 md:top-2 md:right-2 bg-white text-gray-800 rounded-full p-1 shadow-lg hover:bg-gray-100 transition-colors z-[101]"
              aria-label="Tutup Banner"
            >
              <X size={24} />
            </button>
            <img
              src={header.banner_image}
              alt="Banner Zona Integritas"
              className="w-full h-auto rounded-lg shadow-2xl object-contain max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <div className="min-h-screen bg-semibackground py-12">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
              <Shield className="text-accent" size={32} />
            </div>
            {loading ? (
              <div className="space-y-3 max-w-xl mx-auto">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground">
                  {header.title}
                </h1>
                <p className="text-lg text-secondary max-w-3xl mx-auto">
                  {header.description}
                </p>
              </>
            )}
          </div>

          {/* Areas */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8 text-foreground">
              6 Area Pembangunan Zona Integritas
            </h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card p-6">
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {areas.map((area) => (
                  <IntegrityAreaCard
                    key={area.id}
                    id={area.id}
                    title={area.title}
                    description={area.description}
                    icon={AREA_ICONS[area.id]}
                    onClick={() => setSelectedArea(area)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* LKJ */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8 text-foreground flex items-center">
              <BarChart3 className="mr-2 text-accent" />
              Laporan Kinerja
            </h2>
            {loading ? (
              <div className="card p-6">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ) : (
              <div className="bg-background border border-border rounded-lg p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {lkj.title}
                  </h3>
                  <p className="text-secondary text-sm leading-relaxed mb-4">
                    {lkj.description}
                  </p>
                  <a
                    href={lkj.drive_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded btn-primary text-sm font-medium"
                  >
                    <ExternalLink size={18} /> Buka Laporan (PDF)
                  </a>
                </div>
                <div className="w-full md:w-1/3 flex-shrink-0">
                  <a
                    href={lkj.drive_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-border rounded overflow-hidden shadow-sm hover:opacity-90 transition"
                  >
                    <img
                      src={lkj.cover_image}
                      alt="Cover Laporan Kinerja"
                      className="w-full h-auto"
                    />
                  </a>
                </div>
              </div>
            )}
          </section>

          {/* SOP */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8 text-foreground flex items-center">
              <FileText className="mr-2 text-accent" /> Dokumen Prosedur (SOP)
            </h2>
            <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
              <p className="text-secondary mb-4 text-sm">
                Berikut adalah dokumen SOP Penyusunan Tim Zona Integritas.
              </p>
              {loading ? (
                <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : (
                <div
                  className="relative w-full overflow-hidden rounded-md border border-gray-200 cursor-zoom-in group"
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <img
                    src={sop.image_url}
                    alt="SOP Zona Integritas"
                    className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn size={20} />
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2 text-center">
                *Klik gambar untuk memperbesar
              </p>
            </div>
          </section>

          {/* Pengaduan */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8 text-foreground flex items-center">
              <MessageSquare className="mr-2 text-accent" /> Layanan Pengaduan
            </h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="card p-4">
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-background border border-border rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a
                    href={`mailto:${pengaduan.email}`}
                    className="flex items-center p-4 bg-accent/5 hover:bg-accent/10 rounded-lg"
                  >
                    <Mail className="text-accent mr-3" size={20} />
                    <div>
                      <div className="font-medium text-foreground">Email</div>
                      <div className="text-sm text-secondary">
                        {pengaduan.email}
                      </div>
                    </div>
                  </a>
                  <a
                    href={`https://wa.me/${pengaduan.wa_raw}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 bg-accent/5 hover:bg-accent/10 rounded-lg"
                  >
                    <Phone className="text-accent mr-3" size={20} />
                    <div>
                      <div className="font-medium text-foreground">
                        WhatsApp
                      </div>
                      <div className="text-sm text-secondary">
                        {pengaduan.whatsapp}
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <IntegrityModal
        area={selectedArea}
        allAreas={areas}
        onClose={() => setSelectedArea(null)}
        onNavigate={(area) => setSelectedArea(area)}
      />

      <ImageZoomModal
        src={sop.image_url}
        alt="SOP Penyusunan Tim Zona Integritas"
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      />
    </Layout>
  );
};

export default ZonaIntegritasPage;
