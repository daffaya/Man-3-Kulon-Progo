/**
 * @fileoverview WebAppPage component for displaying school applications.
 * This component renders a grid of application cards that users can access.
 * It handles both internal navigation and external links, with role-based access control.
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
  Heart,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToastMessage } from "../hooks/useToastMessage";
import type { UserRole } from "../types/userTypes";

/**
 * Interface defining the structure of an application item.
 * @interface AppItem
 * @property {string} id - Unique identifier for the app
 * @property {string} title - Display title of the app
 * @property {string} description - Brief description of the app's functionality
 * @property {React.ReactNode} icon - Icon component to display for the app
 * @property {string | string[]} requiredRole - Role(s) required to access the app
 * @property {string} to - Navigation path or external URL
 */
interface AppItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  requiredRole: string | string[];
  to: string;
}

/**
 * Component that displays a grid of school applications.
 * Provides access to various school management applications with role-based access control.
 * Handles both internal navigation and external links appropriately.
 */
const WebAppPage: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const { showInfoToast } = useToastMessage();
  const navigate = useNavigate();

  /**
   * Array of available applications with their properties.
   * Each app has specific role requirements and navigation targets.
   */
  const apps: AppItem[] = [
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

  /**
   * Handles click events on application cards.
   * For external links, opens in a new tab. For internal routes, checks login status.
   * @param app - The application item that was clicked
   */
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
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Aplikasi Sekolah
            </h1>
            <p className="text-secondary max-w-2xl mx-auto">
              Kelola berbagai aspek sekolah dengan aplikasi digital terintegrasi
              kami
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
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
