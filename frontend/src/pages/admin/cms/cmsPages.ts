/**
 * @fileoverview Daftar halaman CMS (Halaman Website) — dipakai oleh CmsOverviewPage,
 * dashboard admin (daftar "perlu dicek") dan notifikasi.
 */
import type { LucideIcon } from "lucide-react";
import {
  AppWindow,
  BookOpen,
  Briefcase,
  Building,
  ClipboardList,
  Eye,
  FileText,
  GraduationCap,
  Handshake,
  Home,
  Image,
  MessageSquare,
  Network,
  Phone,
  Settings,
  Shield,
  UserCheck,
} from "lucide-react";

export type CmsBadge = "Sering berubah" | "Perlu update" | "Tiap tahun ajaran";

export interface CmsPage {
  label: string;
  description: string;
  to: string;
  icon: LucideIcon;
  group: string;
  badge?: CmsBadge;
  badgeColor?: "green" | "yellow" | "gray";
}

export const CMS_GROUPS = ["Halaman Utama", "Profil", "Layanan", "Lainnya"];

export const CMS_PAGES: CmsPage[] = [
  // ── Halaman Utama ──
  {
    label: "Homepage",
    description: "Stats, about, zona integritas, SEDUM, survey, quick actions",
    to: "/atmin/cms/home",
    icon: Home,
    group: "Halaman Utama",
    badge: "Sering berubah",
    badgeColor: "green",
  },
  {
    label: "Kontak",
    description: "Alamat, telepon, email, jam operasional, embed Google Maps",
    to: "/atmin/cms/kontak",
    icon: Phone,
    group: "Halaman Utama",
  },

  // ── Profil ──
  {
    label: "Sejarah",
    description: "Paragraf sejarah pendirian dan perkembangan madrasah",
    to: "/atmin/cms/sejarah",
    icon: BookOpen,
    group: "Profil",
  },
  {
    label: "Visi & Misi",
    description: "Visi, misi (kategori + poin), tujuan, strategi",
    to: "/atmin/cms/visi-misi",
    icon: Eye,
    group: "Profil",
  },
  {
    label: "Kepala Madrasah",
    description: "Tabel periodisasi kepala madrasah dari masa ke masa",
    to: "/atmin/cms/kepala-madrasah",
    icon: UserCheck,
    group: "Profil",
    badge: "Perlu update",
    badgeColor: "yellow",
  },
  {
    label: "Struktur Organisasi",
    description: "Gambar bagan dan daftar jabatan-nama struktural",
    to: "/atmin/cms/struktur-organisasi",
    icon: Network,
    group: "Profil",
    badge: "Perlu update",
    badgeColor: "yellow",
  },
  {
    label: "Sarana & Prasarana",
    description: "Daftar fasilitas, ketersediaan, dan kondisi",
    to: "/atmin/cms/sarana-prasarana",
    icon: Building,
    group: "Profil",
  },
  {
    label: "Mitra",
    description: "Daftar institusi dan lembaga mitra sekolah",
    to: "/atmin/cms/mitra",
    icon: Handshake,
    group: "Profil",
  },
  {
    label: "Siswa",
    description: "Rekapitulasi peserta didik per kelas dan tahun ajaran",
    to: "/atmin/cms/siswa",
    icon: GraduationCap,
    group: "Profil",
    badge: "Tiap tahun ajaran",
    badgeColor: "yellow",
  },
  {
    label: "Program Kerja",
    description: "Program kerja per bidang dan tahun ajaran aktif",
    to: "/atmin/cms/program-kerja",
    icon: Briefcase,
    group: "Profil",
    badge: "Tiap tahun ajaran",
    badgeColor: "yellow",
  },

  // ── Layanan ──
  {
    label: "PMBM",
    description: "Config gelombang, jadwal, jalur, syarat, alur, FAQ, kontak",
    to: "/atmin/cms/pmbm",
    icon: ClipboardList,
    group: "Layanan",
    badge: "Sering berubah",
    badgeColor: "green",
  },
  {
    label: "Zona Integritas",
    description: "Header, 6 area, LKJ, SOP, kontak pengaduan",
    to: "/atmin/cms/zona-integritas",
    icon: Shield,
    group: "Layanan",
  },
  {
    label: "SEDUM",
    description: "Header, tentang, saluran pengaduan, SOP, FAQ",
    to: "/atmin/cms/sedum",
    icon: MessageSquare,
    group: "Layanan",
  },
  {
    label: "PTSP",
    description: "Header dan daftar layanan PTSP online dengan persyaratan",
    to: "/atmin/cms/ptsp",
    icon: FileText,
    group: "Layanan",
  },
  {
    label: "Maklumat Pelayanan",
    description: "Judul, deskripsi, dan gambar maklumat yang ditandatangani",
    to: "/atmin/cms/maklumat-pelayanan",
    icon: Settings,
    group: "Layanan",
  },

  // ── Lainnya ──
  {
    label: "Web App",
    description: "Judul dan deskripsi halaman aplikasi sekolah",
    to: "/atmin/cms/web-app",
    icon: AppWindow,
    group: "Lainnya",
  },
  {
    label: "Slider Homepage",
    description: "Kelola slide carousel di halaman utama",
    to: "/atmin/cms/collections/slider",
    icon: Image,
    group: "Lainnya",
    badge: "Sering berubah",
    badgeColor: "green",
  },
];

/** Halaman yang datanya mungkin sudah tidak akurat (badge kuning). */
export const CMS_NEEDS_CHECK = CMS_PAGES.filter(
  (p) => p.badge === "Perlu update" || p.badge === "Tiap tahun ajaran",
);

/** Halaman publik untuk setiap editor CMS (tombol "Lihat halaman"). */
export const CMS_PUBLIC_PATH: Record<string, string> = {
  "/atmin/cms/home": "/",
  "/atmin/cms/kontak": "/contact",
  "/atmin/cms/sejarah": "/profile/sejarah",
  "/atmin/cms/visi-misi": "/profile/visi-misi",
  "/atmin/cms/kepala-madrasah": "/profile/kepala-madrasah",
  "/atmin/cms/struktur-organisasi": "/profile/struktur-organisasi",
  "/atmin/cms/sarana-prasarana": "/profile/sarana-prasarana",
  "/atmin/cms/mitra": "/profile/mitra",
  "/atmin/cms/siswa": "/profile/siswa",
  "/atmin/cms/program-kerja": "/profile/program-kerja",
  "/atmin/cms/pmbm": "/layanan/pmbm",
  "/atmin/cms/zona-integritas": "/layanan/zona-integritas",
  "/atmin/cms/sedum": "/layanan/sedum",
  "/atmin/cms/ptsp": "/layanan/ptsp",
  "/atmin/cms/maklumat-pelayanan": "/layanan/maklumat-pelayanan",
  "/atmin/cms/web-app": "/webApp",
  "/atmin/cms/collections/slider": "/",
};
