/**
 * @fileoverview ZonaIntegritasPage component for displaying integrity zone information.
 * Modified: Fixed modal close blank screen, neutral header theme, removed SVG bug.
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

type Area = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  fullDescription: string;
  driveLinks: {
    label: string;
    url: string;
  }[];
};

/**
 * Integrity areas data
 */
const integrityAreas: Area[] = [
  {
    id: 1,
    title: "Manajemen Perubahan",
    description:
      "Pengelolaan perubahan untuk mencapai tujuan pembangunan Zona Integritas",
    icon: <RotateCw size={24} />,
    fullDescription: `
    <p>Manajemen Perubahan merupakan area yang bertujuan untuk mengubah secara sistematis dan konsisten mekanisme kerja, pola pikir (mindset), serta budaya kerja (culture set) dalam organisasi agar menjadi lebih baik dan selaras dengan tujuan pembangunan Zona Integritas.</p>
    <p>Perubahan ini dilakukan melalui penguatan komitmen pimpinan dan seluruh pegawai, pembentukan tim kerja, penetapan agen perubahan, serta pembangunan budaya kerja yang berintegritas. Seluruh unsur organisasi didorong untuk memiliki pola pikir yang adaptif, profesional, dan berorientasi pada pelayanan.</p>
    <p>Melalui manajemen perubahan, diharapkan terjadi transformasi nyata dalam cara kerja organisasi, meningkatnya komitmen terhadap pembangunan Zona Integritas, serta menurunnya resistensi terhadap perubahan sehingga program reformasi birokrasi dapat berjalan secara efektif dan berkelanjutan.</p>
    `,
    driveLinks: [
      {
        label: "Pemenuhan",
        url: "https://drive.google.com/drive/folders/1gzW8nrfkdCQhmxYWkO6o-bokN8oJQQZ_?usp=drive_link",
      },
      {
        label: "Reform",
        url: "https://drive.google.com/drive/folders/1iFczCP3b5kx4yHbmcGjIWKv6hiS97WLM?usp=drive_link",
      },
    ],
  },
  {
    id: 2,
    title: "Penataan Tatalaksana",
    description:
      "Penyederhanaan dan penguatan prosedur kerja yang efektif dan efisien",
    icon: <Settings size={24} />,
    fullDescription: `
    <p>Penataan Tatalaksana bertujuan untuk meningkatkan efisiensi dan efektivitas sistem, proses, dan prosedur kerja dalam organisasi. Hal ini dilakukan dengan menyusun dan menerapkan standar operasional prosedur (SOP) yang jelas, terukur, serta berbasis pada peta proses bisnis.</p>
    <p>Area ini juga menekankan pemanfaatan teknologi informasi melalui penerapan sistem pemerintahan berbasis elektronik (SPBE), sehingga proses kerja menjadi lebih transparan, cepat, dan akuntabel. Digitalisasi proses kerja menjadi salah satu kunci dalam meningkatkan kualitas tata kelola organisasi.</p>
    <p>Dengan penataan tatalaksana yang baik, diharapkan tercipta sistem kerja yang sederhana, efektif, efisien, dan mampu meningkatkan kinerja organisasi secara keseluruhan.</p>
    `,
    driveLinks: [
      {
        label: "Pemenuhan",
        url: "https://drive.google.com/drive/folders/1r21LgoyN6kuR7kYBh9TPx8jR7v7X9iIe?usp=drive_link",
      },
      {
        label: "Reform",
        url: "https://drive.google.com/drive/folders/18sMFIYYiNzRjFK6uxyeuKSVeVYIa0fzp?usp=drive_link",
      },
    ],
  },
  {
    id: 3,
    title: "Penataan Sistem Manajemen SDM",
    description:
      "Pengelolaan sumber daya manusia yang berbasis kinerja dan kompetensi",
    icon: <Users size={24} />,
    fullDescription: `
    <p>Penataan Sistem Manajemen SDM bertujuan untuk meningkatkan profesionalisme aparatur melalui pengelolaan sumber daya manusia yang transparan, akuntabel, dan berbasis kinerja.</p>
    <p>Pengelolaan SDM mencakup proses perencanaan kebutuhan pegawai, rekrutmen, pengembangan kompetensi, promosi, mutasi, serta penilaian kinerja yang dilakukan secara objektif dan adil. Selain itu, peningkatan disiplin dan integritas pegawai juga menjadi fokus utama dalam area ini.</p>
    <p>Dengan sistem manajemen SDM yang baik, diharapkan tercipta aparatur yang kompeten, profesional, dan mampu memberikan pelayanan terbaik kepada masyarakat.</p>
    `,
    driveLinks: [
      {
        label: "Pemenuhan",
        url: "https://drive.google.com/drive/folders/1jCZ7lUNxGKWIB9JMqOpQGn0RPPlzuoKg?usp=drive_link",
      },
      {
        label: "Reform",
        url: "https://drive.google.com/drive/folders/1B4fF_5NqPok0dN2zUNRyu-LxWKtRk0c_?usp=drive_link",
      },
    ],
  },
  {
    id: 4,
    title: "Penguatan Akuntabilitas",
    description: "Peningkatan pertanggungjawaban kinerja instansi pemerintah",
    icon: <BarChart3 size={24} />,
    fullDescription: `
    <p>Penguatan Akuntabilitas merupakan upaya untuk meningkatkan kemampuan organisasi dalam mempertanggungjawabkan kinerja dan hasil pelaksanaan program kepada publik.</p>
    <p>Akuntabilitas kinerja diwujudkan melalui penyusunan perencanaan kinerja yang jelas, pengukuran kinerja yang terstruktur, pelaporan yang transparan, serta evaluasi yang berkelanjutan. Setiap kegiatan harus memiliki indikator kinerja yang terukur dan dapat dipertanggungjawabkan.</p>
    <p>Dengan penguatan akuntabilitas, diharapkan kinerja instansi pemerintah menjadi lebih efektif, transparan, dan dapat dipercaya oleh masyarakat.</p>
    `,
    driveLinks: [
      {
        label: "Pemenuhan",
        url: "https://drive.google.com/drive/folders/1jK6mSN0xv-oFj57uvqE650SYbT1Uj4aZ?usp=drive_link",
      },
      {
        label: "Reform",
        url: "https://drive.google.com/drive/folders/1bWQ80v8Fphbo10KMF3trS5V6BcVYs4_C?usp=drive_link",
      },
    ],
  },
  {
    id: 5,
    title: "Penguatan Pengawasan",
    description: "Peningkatan efektivitas sistem pengawasan intern dan ekstern",
    icon: <Search size={24} />,
    fullDescription: `
    <p>Penguatan Pengawasan bertujuan untuk meningkatkan penyelenggaraan pemerintahan yang bersih dan bebas dari praktik korupsi, kolusi, dan nepotisme (KKN).</p>
    <p>Area ini mencakup penguatan sistem pengawasan internal, pengendalian gratifikasi, penerapan manajemen risiko, penanganan benturan kepentingan, serta pengelolaan pengaduan masyarakat. Selain itu, transparansi dalam pengelolaan keuangan dan peningkatan kepatuhan terhadap peraturan juga menjadi fokus utama.</p>
    <p>Dengan pengawasan yang kuat, diharapkan dapat meminimalisir penyalahgunaan wewenang dan meningkatkan integritas dalam penyelenggaraan pemerintahan.</p>
    `,
    driveLinks: [
      {
        label: "Pemenuhan",
        url: "https://drive.google.com/drive/folders/1aLbJuntZTaret6YRAAtRHO_EMZrS3LMF?usp=drive_link",
      },
      {
        label: "Reform",
        url: "https://drive.google.com/drive/folders/1RUxo3RYGdIRh80m8GJbkA9R_20hEPXVu?usp=drive_link",
      },
    ],
  },
  {
    id: 6,
    title: "Peningkatan Kualitas Pelayanan Publik",
    description:
      "Optimalisasi pelayanan publik yang berkualitas dan berorientasi pada kepuasan",
    icon: <HeartHandshake size={24} />,
    fullDescription: `
    <p>Peningkatan Kualitas Pelayanan Publik bertujuan untuk meningkatkan kualitas layanan kepada masyarakat agar lebih cepat, mudah, transparan, dan sesuai dengan kebutuhan serta harapan pengguna layanan.</p>
    <p>Upaya ini dilakukan melalui pemenuhan standar pelayanan, inovasi layanan, pemanfaatan teknologi informasi, serta pengelolaan pengaduan masyarakat secara efektif. Kepuasan masyarakat menjadi indikator utama dalam menilai keberhasilan pelayanan publik.</p>
    <p>Dengan peningkatan kualitas pelayanan publik, diharapkan terbangun kepercayaan masyarakat terhadap instansi pemerintah serta terciptanya pelayanan yang prima dan berkelanjutan.</p>
    `,
    driveLinks: [
      {
        label: "Pemenuhan",
        url: "https://drive.google.com/drive/folders/1uNbpKnXavWZmawXUZv_a5fWS-LlheVJV?usp=drive_link",
      },
      {
        label: "Reform",
        url: "https://drive.google.com/drive/folders/1CH2QBUzm9XVJ6_HKWw8AvO_RMLlVlfWG?usp=drive_link",
      },
    ],
  },
];

interface ModalProps {
  area: Area | null;
  onClose: () => void;
  onNavigate: (area: Area) => void;
}

/**
 * Modal for Integrity Area
 */
const IntegrityModal: React.FC<ModalProps> = ({
  area,
  onClose,
  onNavigate,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [internalArea, setInternalArea] = useState<Area | null>(null);

  // Ref untuk membedakan apakah modal baru pertama kali dibuka atau sedang navigasi
  const prevAreaId = useRef<number | null>(null);

  // Animasi masuk dan navigasi
  useEffect(() => {
    if (area) {
      setInternalArea(area);

      const isFirstOpen = prevAreaId.current === null;
      prevAreaId.current = area.id;

      if (isFirstOpen) {
        // Animasi buka dari nol
        setIsVisible(false);
        setIsContentVisible(false);
        requestAnimationFrame(() => setIsVisible(true));
        const contentTimer = setTimeout(() => setIsContentVisible(true), 100);
        document.body.style.overflow = "hidden";
        return () => clearTimeout(contentTimer);
      } else {
        // Animasi ganti konten (navigasi)
        setIsContentVisible(false);
        const contentTimer = setTimeout(() => setIsContentVisible(true), 150);
        return () => clearTimeout(contentTimer);
      }
    } else {
      // Jika area di luar komponen di-set null (force close)
      prevAreaId.current = null;
      document.body.style.overflow = "";
    }
  }, [area]);

  // Cleanup saat komponen unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Fungsi khusus untuk menutup modal (memastikan animasi selesai dulu sebelum kasih sinyal ke parent)
  const handleClose = useCallback(() => {
    setIsContentVisible(false);
    setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = "";
      prevAreaId.current = null; // Reset agar next open dianggap buka baru
      onClose(); // Sinyal ke parent untuk set selectedArea = null
    }, 200);
  }, [onClose]);

  // Navigasi antar area
  const goToArea = useCallback(
    (direction: "prev" | "next") => {
      if (!internalArea) return;
      const currentIndex = integrityAreas.findIndex(
        (a) => a.id === internalArea.id,
      );
      let newIndex: number;

      if (direction === "prev") {
        newIndex =
          currentIndex <= 0 ? integrityAreas.length - 1 : currentIndex - 1;
      } else {
        newIndex =
          currentIndex >= integrityAreas.length - 1 ? 0 : currentIndex + 1;
      }

      const newArea = integrityAreas[newIndex];
      onNavigate(newArea); // Trigger perubahan state di parent
    },
    [internalArea, onNavigate],
  );

  // Keyboard navigation
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
    ? integrityAreas.findIndex((a) => a.id === internalArea.id)
    : 0;
  const totalAreas = integrityAreas.length;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible
          ? "bg-black/60 backdrop-blur-sm opacity-100"
          : "bg-black/0 backdrop-blur-none opacity-0 pointer-events-none"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`relative w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden rounded-2xl bg-background shadow-2xl border border-border transition-all duration-300 ease-out ${
          isContentVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-[0.97] translate-y-3"
        }`}
      >
        {/* ── HEADER (Neutral Theme) ── */}
        <div className="flex-shrink-0 border-b border-border bg-background px-6 py-6 md:px-8 md:py-7">
          <div className="flex items-start gap-4 md:gap-5">
            {/* Ikon Area */}
            <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 bg-accent/10 rounded-xl flex items-center justify-center text-accent border border-accent/20">
              {React.cloneElement(internalArea!.icon as React.ReactElement, {
                size: 28,
                className: "md:w-8 md:h-8",
              })}
            </div>

            <div className="flex-1 min-w-0">
              {/* Badge area number */}
              <div className="inline-flex items-center gap-1.5 bg-accent/10 text-accent rounded-full px-3 py-1 text-xs font-semibold mb-2">
                Area {currentIndex + 1} dari {totalAreas}
              </div>

              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-foreground">
                {internalArea!.title}
              </h3>
              <p className="text-sm text-secondary mt-1 line-clamp-1">
                {internalArea!.description}
              </p>
            </div>

            {/* Tombol Close */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-secondary hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 border border-border"
              aria-label="Tutup"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-5 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentIndex + 1) / totalAreas) * 100}%` }}
            />
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 lg:p-10 space-y-8">
            {/* Deskripsi */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-accent rounded-full" />
                <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary">
                  Penjelasan
                </h4>
              </div>
              <div
                className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground/90 leading-relaxed
                  [&_p]:mb-4 [&_p:last-child]:mb-0
                  [&_p]:text-[0.94rem] md:[&_p]:text-base"
                dangerouslySetInnerHTML={{
                  __html: internalArea!.fullDescription,
                }}
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs font-medium text-secondary uppercase tracking-wider">
                Dokumen Pendukung
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {internalArea!.driveLinks.map((link, index) => {
                const isPemenuhan = link.label
                  .toLowerCase()
                  .includes("pemenuhan");
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 border
                      ${
                        isPemenuhan
                          ? "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300 hover:shadow-md dark:bg-blue-950/30 dark:border-blue-800 dark:hover:bg-blue-950/50 dark:text-blue-300"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 hover:border-emerald-300 hover:shadow-md dark:bg-emerald-950/30 dark:border-emerald-800 dark:hover:bg-emerald-950/50 dark:text-emerald-300"
                      }`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        isPemenuhan
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

                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5 ${
                        isPemenuhan
                          ? "bg-blue-200/40 dark:bg-blue-800/30"
                          : "bg-emerald-200/40 dark:bg-emerald-800/30"
                      }`}
                    >
                      <ExternalLink size={14} />
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Keyboard hint */}
            <div className="hidden md:flex items-center justify-center gap-6 pt-2 pb-1">
              <span className="text-xs text-secondary/50 flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">
                  ←
                </kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">
                  →
                </kbd>
                Navigasi area
              </span>
              <span className="text-xs text-secondary/50 flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">
                  Esc
                </kbd>
                Tutup
              </span>
            </div>
          </div>
        </div>

        {/* ── BOTTOM NAV BAR ── */}
        <div className="flex-shrink-0 border-t border-border bg-muted/30 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => goToArea("prev")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-secondary hover:text-foreground hover:bg-muted transition-all duration-200"
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

          {/* Dot indicators */}
          <div className="flex items-center gap-1.5">
            {integrityAreas.map((a, idx) => (
              <button
                key={a.id}
                onClick={() => {
                  if (idx === currentIndex) return;
                  onNavigate(integrityAreas[idx]);
                }}
                className={`rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-6 h-2 bg-accent"
                    : "w-2 h-2 bg-border hover:bg-secondary/40"
                }`}
                aria-label={`Area ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => goToArea("next")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-secondary hover:text-foreground hover:bg-muted transition-all duration-200"
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

/**
 * Main Page
 */
const ZonaIntegritasPage: React.FC = () => {
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    if (showBanner) {
      const timer = setTimeout(() => setShowBanner(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showBanner]);

  const handleAreaClick = (id: number) => {
    const area = integrityAreas.find((a) => a.id === id);
    if (area) setSelectedArea(area);
  };

  const closeModal = () => setSelectedArea(null);
  const closeBanner = () => setShowBanner(false);

  const handleBannerBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) closeBanner();
  };

  return (
    <Layout>
      {/* --- BANNER POPUP SECTION --- */}
      {showBanner && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 cursor-pointer"
          onClick={handleBannerBackdropClick}
        >
          <div className="relative max-w-3xl w-full cursor-default">
            <button
              onClick={closeBanner}
              className="absolute -top-2 -right-2 md:top-2 md:right-2 bg-white text-gray-800 rounded-full p-1 shadow-lg hover:bg-gray-100 transition-colors z-[101]"
              aria-label="Tutup Banner"
            >
              <X size={24} />
            </button>
            <img
              src="/banner_zi.png"
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
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground">
              Zona Integritas
            </h1>
            <p className="text-lg text-secondary max-w-3xl mx-auto">
              Zona Integritas merupakan predikat yang diberikan kepada instansi
              pemerintah yang berkomitmen mewujudkan WBK/WBBM.
            </p>
          </div>

          {/* Integrity Areas */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8 text-foreground">
              6 Area Pembangunan Zona Integritas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {integrityAreas.map((area) => (
                <IntegrityAreaCard
                  key={area.id}
                  id={area.id}
                  title={area.title}
                  description={area.description}
                  icon={area.icon}
                  onClick={() => handleAreaClick(area.id)}
                />
              ))}
            </div>
          </section>

          {/* Section LKJ */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8 text-foreground flex items-center">
              <BarChart3 className="mr-2 text-accent" />
              Laporan Kinerja
            </h2>
            <div className="bg-background border border-border rounded-lg p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Laporan Kinerja MAN 3 Kulon Progo Tahun 2025
                </h3>
                <p className="text-secondary text-sm leading-relaxed mb-4">
                  Laporan Kinerja ini disusun sebagai bentuk pertanggungjawaban
                  akuntabilitas kinerja sesuai dengan{" "}
                  <em>Peraturan Menteri Agama Nomor 19 Tahun 2019</em>. Dokumen
                  ini menyoroti pencapaian 5 sasaran program strategis, meliputi
                  peningkatan profesionalisme ASN, kematangan intern, kualitas
                  pendidikan, pemberian bantuan pendidikan, serta pengelolaan
                  sarana prasarana. Pencapaian diukur melalui 22 indikator
                  kinerja yang telah ditetapkan dalam Perjanjian Kinerja.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://drive.google.com/file/d/19BbbTEvYiKXJTsYTMO2EWsT2pC6sP6rK/view?usp=drive_link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded btn-primary text-sm font-medium"
                  >
                    <ExternalLink size={18} />
                    Buka Laporan (PDF)
                  </a>
                </div>
              </div>
              <div className="w-full md:w-1/3 flex-shrink-0">
                <a
                  href="https://drive.google.com/file/d/19BbbTEvYiKXJTsYTMO2EWsT2pC6sP6rK/view?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-border rounded overflow-hidden shadow-sm hover:opacity-90 transition"
                >
                  <img
                    src="/cover-laporan-kinerja-zi-2025.jpg"
                    alt="Cover Laporan Kinerja ZI 2025"
                    className="w-full h-auto"
                  />
                </a>
              </div>
            </div>
          </section>

          {/* SOP Section */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8 text-foreground flex items-center">
              <FileText className="mr-2 text-accent" />
              Dokumen Prosedur (SOP)
            </h2>
            <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
              <p className="text-secondary mb-4 text-sm">
                Berikut adalah dokumen SOP Penyusunan Tim Zona Integritas.
              </p>
              <div
                className="relative w-full overflow-hidden rounded-md border border-gray-200 cursor-zoom-in group"
                onClick={() => setIsImageModalOpen(true)}
              >
                <img
                  src="/SOP_ZI.png"
                  alt="SOP Penyusunan Tim Zona Integritas"
                  className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn size={20} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                *Klik gambar untuk memperbesar
              </p>
            </div>
          </section>

          {/* Complaint Section */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8 text-foreground flex items-center">
              <MessageSquare className="mr-2 text-accent" />
              Layanan Pengaduan
            </h2>
            <div className="bg-background border border-border rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="mailto:man3kulonprogo@gmail.com"
                  className="flex items-center p-4 bg-accent/5 hover:bg-accent/10 rounded-lg"
                >
                  <Mail className="text-accent mr-3" size={20} />
                  <div>
                    <div className="font-medium text-foreground">Email</div>
                    <div className="text-sm text-secondary">
                      man3kulonprogo@gmail.com
                    </div>
                  </div>
                </a>
                <a
                  href="https://wa.me/6287858102393"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-4 bg-accent/5 hover:bg-accent/10 rounded-lg"
                >
                  <Phone className="text-accent mr-3" size={20} />
                  <div>
                    <div className="font-medium text-foreground">WhatsApp</div>
                    <div className="text-sm text-secondary">
                      +62-878-5810-2393
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>

      <IntegrityModal
        area={selectedArea}
        onClose={closeModal}
        onNavigate={(area) => setSelectedArea(area)}
      />

      <ImageZoomModal
        src="/SOP_ZI.png"
        alt="SOP Penyusunan Tim Zona Integritas"
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      />
    </Layout>
  );
};

export default ZonaIntegritasPage;
