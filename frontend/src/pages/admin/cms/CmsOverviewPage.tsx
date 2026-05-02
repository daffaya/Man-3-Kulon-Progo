/**
 * @fileoverview CmsOverviewPage — entry point for the CMS admin panel.
 *
 * Displays a grid of all CMS-editable pages grouped by category.
 * Each card links to the corresponding CMS editor page.
 * Accessible only to super_admin role.
 *
 * Route: /atmin/cms
 */

import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Phone,
  BookOpen,
  Eye,
  Users,
  Building,
  Handshake,
  Briefcase,
  GraduationCap,
  UserCheck,
  Shield,
  MessageSquare,
  ClipboardList,
  FileText,
  Settings,
  LayoutGrid,
  ChevronRight,
  Image,
} from "lucide-react";
import CmsLayout from "../../../components/layout/CmsLayout";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

/** Represents a single CMS-editable page card. */
interface CmsPageCard {
  label: string;
  description: string;
  to: string;
  icon: React.ReactNode;
  group: string;
  /** Badge shown on card — e.g. "Sering berubah" */
  badge?: string;
  badgeColor?: "green" | "yellow" | "gray";
}

// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────

const CMS_PAGES: CmsPageCard[] = [
  // Halaman Utama
  {
    label: "Homepage",
    description: "Stats, about, zona integritas, SEDUM, survey, quick actions",
    to: "/atmin/cms/home",
    icon: <Home size={20} />,
    group: "Halaman Utama",
    badge: "Sering berubah",
    badgeColor: "green",
  },
  {
    label: "Kontak",
    description: "Alamat, telepon, email, WhatsApp, embed peta",
    to: "/atmin/cms/kontak",
    icon: <Phone size={20} />,
    group: "Halaman Utama",
  },

  // Profil
  {
    label: "Sejarah",
    description: "Paragraf sejarah pendirian dan perkembangan madrasah",
    to: "/atmin/cms/sejarah",
    icon: <BookOpen size={20} />,
    group: "Profil",
  },
  {
    label: "Visi & Misi",
    description: "Visi, misi, tujuan jangka panjang/pendek, strategi",
    to: "/atmin/cms/visi-misi",
    icon: <Eye size={20} />,
    group: "Profil",
  },
  {
    label: "Kepala Madrasah",
    description: "Periodisasi pimpinan dan kepala tata usaha",
    to: "/atmin/cms/kepala-madrasah",
    icon: <UserCheck size={20} />,
    group: "Profil",
    badge: "Perlu update",
    badgeColor: "yellow",
  },
  {
    label: "Struktur Organisasi",
    description: "Posisi jabatan, nama pejabat, dan gambar bagan",
    to: "/atmin/cms/struktur-organisasi",
    icon: <Users size={20} />,
    group: "Profil",
    badge: "Perlu update",
    badgeColor: "yellow",
  },
  {
    label: "Sarana & Prasarana",
    description: "Daftar fasilitas, ketersediaan, dan kondisi",
    to: "/atmin/cms/sarana-prasarana",
    icon: <Building size={20} />,
    group: "Profil",
  },
  {
    label: "Mitra",
    description: "Daftar institusi dan lembaga mitra sekolah",
    to: "/atmin/cms/mitra",
    icon: <Handshake size={20} />,
    group: "Profil",
  },
  {
    label: "Siswa",
    description: "Rekapitulasi peserta didik per kelas dan tahun ajaran",
    to: "/atmin/cms/siswa",
    icon: <GraduationCap size={20} />,
    group: "Profil",
    badge: "Tiap tahun ajaran",
    badgeColor: "yellow",
  },
  {
    label: "Program Kerja",
    description: "Kegiatan dan program kerja per periode",
    to: "/atmin/cms/program-kerja",
    icon: <Briefcase size={20} />,
    group: "Profil",
  },

  // Layanan
  {
    label: "PMBM",
    description: "Config gelombang, jadwal, jalur, syarat, alur, FAQ, kontak",
    to: "/atmin/cms/pmbm",
    icon: <ClipboardList size={20} />,
    group: "Layanan",
    badge: "Sering berubah",
    badgeColor: "green",
  },
  {
    label: "Zona Integritas",
    description: "Header, 6 area, laporan kinerja, SOP, pengaduan, banner",
    to: "/atmin/cms/zona-integritas",
    icon: <Shield size={20} />,
    group: "Layanan",
  },
  {
    label: "SEDUM",
    description: "Header, deskripsi, saluran pengaduan, SOP, FAQ",
    to: "/atmin/cms/sedum",
    icon: <MessageSquare size={20} />,
    group: "Layanan",
  },
  {
    label: "PTSP",
    description: "Header dan daftar layanan PTSP online",
    to: "/atmin/cms/ptsp",
    icon: <FileText size={20} />,
    group: "Layanan",
  },
  {
    label: "Maklumat Pelayanan",
    description: "Judul, deskripsi, dan gambar maklumat",
    to: "/atmin/cms/maklumat-pelayanan",
    icon: <Settings size={20} />,
    group: "Layanan",
  },

  // Lainnya
  {
    label: "Web App",
    description: "Judul dan deskripsi halaman aplikasi sekolah",
    to: "/atmin/cms/web-app",
    icon: <LayoutGrid size={20} />,
    group: "Lainnya",
  },
  {
    label: "Slider Homepage",
    description: "Kelola slide carousel di halaman utama",
    to: "/atmin/cms/collections/slider",
    icon: <Image size={20} />,
    group: "Lainnya",
    badge: "Sering berubah",
    badgeColor: "green",
  },
];

const GROUPS = ["Halaman Utama", "Profil", "Layanan", "Lainnya"];

const BADGE_STYLES: Record<string, string> = {
  green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  yellow:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  gray: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/**
 * Individual CMS page card.
 * @param {object} props
 * @param {CmsPageCard} props.card - Card data to display
 */
const PageCard: React.FC<{ card: CmsPageCard }> = ({ card }) => (
  <Link
    to={card.to}
    className="group flex flex-col gap-3 p-5 card hover:shadow-md hover:border-accent/30 transition-all duration-200"
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0 group-hover:bg-accent/20 transition-colors">
          {card.icon}
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm group-hover:text-accent transition-colors">
            {card.label}
          </h3>
          {card.badge && (
            <span
              className={`inline-block text-xs px-2 py-0.5 rounded-full mt-0.5 ${BADGE_STYLES[card.badgeColor ?? "gray"]}`}
            >
              {card.badge}
            </span>
          )}
        </div>
      </div>
      <ChevronRight
        size={16}
        className="text-secondary group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1"
      />
    </div>
    <p className="text-xs text-secondary leading-relaxed">{card.description}</p>
  </Link>
);

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

/**
 * CmsOverviewPage — shows all CMS-editable pages as a navigable grid.
 * Only accessible to super_admin.
 */
const CmsOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();
  const { showErrorToast } = useToastMessage();

  // Auth guard
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isLoggedIn) {
      navigate("/login", { state: { redirectTo: "/atmin/cms" } });
      return;
    }
    if (user?.role !== "super_admin") {
      showErrorToast("Hanya Super Admin yang dapat mengakses halaman ini.");
      navigate("/atmin");
    }
  }, [isLoadingAuth, isLoggedIn, user, navigate, showErrorToast]);

  if (isLoadingAuth) {
    return (
      <CmsLayout title="Kelola Konten">
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
        </div>
      </CmsLayout>
    );
  }

  return (
    <CmsLayout title="Kelola Konten Website">
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-1">
            Kelola Konten Website
          </h2>
          <p className="text-secondary text-sm">
            Pilih halaman yang ingin diedit. Perubahan akan langsung tampil di
            website publik.
          </p>
        </div>

        {/* Info banner */}
        <div className="mb-8 p-4 bg-accent/5 border border-accent/20 rounded-xl flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-accent text-xs font-bold">i</span>
          </div>
          <p className="text-sm text-secondary">
            Setiap perubahan yang disimpan akan langsung terlihat di website.
            Pastikan data yang dimasukkan sudah benar sebelum menyimpan. Cache
            akan diperbarui otomatis setelah perubahan disimpan.
          </p>
        </div>

        {/* Page groups */}
        {GROUPS.map((group) => {
          const cards = CMS_PAGES.filter((p) => p.group === group);
          return (
            <section key={group} className="mb-10">
              <h3 className="text-xs font-semibold text-secondary/60 uppercase tracking-wider mb-3">
                {group}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card) => (
                  <PageCard key={card.to} card={card} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </CmsLayout>
  );
};

export default CmsOverviewPage;
