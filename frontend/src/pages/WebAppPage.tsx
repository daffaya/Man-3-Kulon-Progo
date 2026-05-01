// src/pages/WebAppPage.tsx

/**
 * @fileoverview WebAppPage — migrated to CMS.
 * Header (title, description) now dynamic from CMS.
 * Apps list remains partially static because requiredRole uses TypeScript types
 * and icons are React components — not suitable for DB storage.
 * Only header content is CMS-driven.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import AppCard from "../components/ui/AppCard";
import {
  Archive,
  Clipboard,
  Users,
  BookOpen,
  Image,
  Book,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToastMessage } from "../hooks/useToastMessage";
import { useCmsSection } from "../hooks/useCmsPage";
import type { UserRole } from "../types/userTypes";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface AppItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  requiredRole: string | string[];
  to: string;
}

interface WebAppHeader {
  title: string;
  description: string;
}

// ─────────────────────────────────────────────
// Fallback
// ─────────────────────────────────────────────

const FALLBACK_HEADER: WebAppHeader = {
  title: "Aplikasi Sekolah",
  description:
    "Kelola berbagai aspek sekolah dengan aplikasi digital terintegrasi kami",
};

// ─────────────────────────────────────────────
// Apps list — stays static (icons & roles are not CMS-able)
// ─────────────────────────────────────────────

const APPS: AppItem[] = [
  {
    id: "presensi",
    title: "Presensi Siswa",
    description: "Rekap presensi dan kehadiran siswa",
    icon: <Users className="w-6 h-6" />,
    requiredRole: "guru_bk",
    to: "/atmin/presensi",
  },
  {
    id: "archive",
    title: "Manajemen Arsip",
    description: "Kelola dokumen dan arsip sekolah dengan mudah",
    icon: <Archive className="w-6 h-6" />,
    requiredRole: "arsiparis",
    to: "/archives",
  },
  {
    id: "berkah",
    title: "Layanan BK",
    description: "Wadah aman untuk curhat, dan mendapatkan bimbingan pribadi",
    icon: <MessageCircle className="w-6 h-6" />,
    requiredRole: [],
    to: "https://sites.google.com/view/bkman3kpberkah/",
  },
  {
    id: "digital-library",
    title: "Perpus Digital",
    description: "Akses perpustakaan digital sekolah secara online",
    icon: <Book className="w-6 h-6" />,
    requiredRole: [],
    to: "https://perpustakaan.man3kulonprogo.sch.id/",
  },
  {
    id: "rapor",
    title: "Rapor Siswa",
    description: "Akses informasi rapor dan nilai siswa",
    icon: <BookOpen className="w-6 h-6" />,
    requiredRole: [],
    to: "http://raport.man3kulonprogo.sch.id/",
  },
  {
    id: "articles",
    title: "Artikel Sekolah",
    description: "Buat dan kelola artikel untuk website sekolah",
    icon: <BookOpen className="w-6 h-6" />,
    requiredRole: "jurnalis",
    to: "/atmin/articles",
  },
  {
    id: "galeri",
    title: "Galeri Sekolah",
    description: "Kelola foto dan video kegiatan sekolah",
    icon: <Image className="w-6 h-6" />,
    requiredRole: [
      "super_admin",
      "jurnalis",
      "arsiparis",
      "guru_bk",
      "pengelola_bmn",
    ] as UserRole[],
    to: "/atmin/gallery",
  },
];

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const WebAppPage: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const { showInfoToast } = useToastMessage();
  const navigate = useNavigate();

  const { data, loading } = useCmsSection<WebAppHeader>("web-app", "header");

  const header: WebAppHeader = {
    title: data?.title ?? FALLBACK_HEADER.title,
    description: data?.description ?? FALLBACK_HEADER.description,
  };

  const handleAppClick = (app: AppItem) => {
    if (app.to.startsWith("http")) {
      window.open(app.to, "_blank");
    } else {
      if (isLoggedIn) {
        navigate(app.to);
      } else {
        showInfoToast(
          "Silakan login terlebih dahulu untuk mengakses aplikasi ini.",
        );
        navigate("/login");
      }
    }
  };

  return (
    <Layout>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            {loading ? (
              <div className="space-y-3 max-w-lg mx-auto">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  {header.title}
                </h1>
                <p className="text-secondary max-w-2xl mx-auto">
                  {header.description}
                </p>
              </>
            )}
          </div>

          {/* Apps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {APPS.map((app) => (
              <AppCard
                key={app.id}
                title={app.title}
                description={app.description}
                icon={app.icon}
                onClick={() => handleAppClick(app)}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WebAppPage;
