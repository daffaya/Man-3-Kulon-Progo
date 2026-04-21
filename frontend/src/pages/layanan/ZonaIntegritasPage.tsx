/**
 * @fileoverview ZonaIntegritasPage component for displaying integrity zone information.
 * Modified: Added initial popup banner for Zona Integritas.
 */

import React, { useState, useEffect } from "react";
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
  X, // Import ikon X untuk tombol tutup
} from "lucide-react";
import IntegrityAreaCard from "../../components/integrity/IntegrityAreaCard";
import ImageZoomModal from "../../components/modals/ImageZoomModal";

type Area = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  fullDescription: string;
  driveUrl: string;
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
    fullDescription: `<p>Konten deskripsi lengkap...</p>`,
    driveUrl: "https://drive.google.com/drive/folders/your-folder-id-1",
  },
  {
    id: 2,
    title: "Penataan Tatalaksana",
    description:
      "Penyederhanaan dan penguatan prosedur kerja yang efektif dan efisien",
    icon: <Settings size={24} />,
    fullDescription: `<p>Konten deskripsi lengkap...</p>`,
    driveUrl: "https://drive.google.com/drive/folders/your-folder-id-2",
  },
  {
    id: 3,
    title: "Penataan Sistem Manajemen SDM",
    description:
      "Pengelolaan sumber daya manusia yang berbasis kinerja dan kompetensi",
    icon: <Users size={24} />,
    fullDescription: `<p>Konten deskripsi lengkap...</p>`,
    driveUrl: "https://drive.google.com/drive/folders/your-folder-id-3",
  },
  {
    id: 4,
    title: "Penguatan Akuntabilitas",
    description: "Peningkatan pertanggungjawaban kinerja instansi pemerintah",
    icon: <BarChart3 size={24} />,
    fullDescription: `<p>Konten deskripsi lengkap...</p>`,
    driveUrl: "https://drive.google.com/drive/folders/your-folder-id-4",
  },
  {
    id: 5,
    title: "Penguatan Pengawasan",
    description: "Peningkatan efektivitas sistem pengawasan intern dan ekstern",
    icon: <Search size={24} />,
    fullDescription: `<p>Konten deskripsi lengkap...</p>`,
    driveUrl: "https://drive.google.com/drive/folders/your-folder-id-5",
  },
  {
    id: 6,
    title: "Peningkatan Kualitas Pelayanan Publik",
    description:
      "Optimalisasi pelayanan publik yang berkualitas dan berorientasi pada kepuasan",
    icon: <HeartHandshake size={24} />,
    fullDescription: `<p>Konten deskripsi lengkap...</p>`,
    driveUrl: "https://drive.google.com/drive/folders/your-folder-id-6",
  },
];

interface ModalProps {
  area: Area | null;
  onClose: () => void;
}

/**
 * Modal for Integrity Area
 */
const IntegrityModal: React.FC<ModalProps> = ({ area, onClose }) => {
  if (!area) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-background p-12 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-foreground">{area.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div
          className="prose prose-sm dark:prose-invert max-w-none text-foreground"
          dangerouslySetInnerHTML={{ __html: area.fullDescription }}
        />

        <div className="mt-6 flex justify-center">
          <a
            href={area.driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded btn-primary"
          >
            Bukti Eviden
          </a>
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

  // State untuk Banner Popup
  const [showBanner, setShowBanner] = useState(true);

  // Effect untuk auto-close banner setelah 5 detik
  useEffect(() => {
    if (showBanner) {
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 5000);

      // Cleanup timer jika komponen unmount atau banner ditutup manual sebelum 5 detik
      return () => clearTimeout(timer);
    }
  }, [showBanner]);

  const handleAreaClick = (id: number) => {
    const area = integrityAreas.find((a) => a.id === id);
    if (area) setSelectedArea(area);
  };

  const closeModal = () => setSelectedArea(null);

  // Handler untuk menutup banner
  const closeBanner = () => setShowBanner(false);

  // Handler klik backdrop banner
  const handleBannerBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Hanya tutup jika yang diklik adalah backdrop-nya (area gelap), bukan gambar
    if (e.target === e.currentTarget) {
      closeBanner();
    }
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
            {/* Tombol X di ujung gambar */}
            <button
              onClick={closeBanner}
              className="absolute -top-2 -right-2 md:top-2 md:right-2 bg-white text-gray-800 rounded-full p-1 shadow-lg hover:bg-gray-100 transition-colors z-[101]"
              aria-label="Tutup Banner"
            >
              <X size={24} />
            </button>

            {/* Gambar Banner */}
            <img
              src="/banner_zi.png"
              alt="Banner Zona Integritas"
              className="w-full h-auto rounded-lg shadow-2xl object-contain max-h-[85vh]"
              // Mencegah klik pada gambar menutup banner (karena klik gambar bukan klik backdrop)
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
      {/* --- END BANNER POPUP SECTION --- */}

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

      <IntegrityModal area={selectedArea} onClose={closeModal} />

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
