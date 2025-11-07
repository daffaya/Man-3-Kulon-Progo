// frontend/src/pages/WebAppPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import AppCard from "../components/ui/AppCard";
import { Archive, Clipboard, Users, BookOpen, Image, Book } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToastMessage } from "../hooks/useToastMessage";
import type { UserRole } from "../types/userTypes";

// Interface tetap kita gunakan untuk konsistensi dan type safety
interface AppItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  // requiredRole tetap kita simpan, karena akan digunakan di halaman tujuan
  requiredRole: string | string[];
  to: string;
}

const WebAppPage: React.FC = () => {
  const { isLoggedIn } = useAuth(); // Kita hanya butuh status login
  const { showInfoToast } = useToastMessage(); // Gunakan info toast untuk memberi tahu user
  const navigate = useNavigate();

  // Daftar SEMUA aplikasi yang tersedia, seperti katalog publik
  const apps: AppItem[] = [
    {
      id: "articles",
      title: "Artikel Sekolah",
      description: "Buat dan kelola artikel untuk website sekolah",
      icon: <BookOpen className="w-6 h-6" />,
      requiredRole: "jurnalis",
      to: "/atmin/articles",
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
      id: "presensi",
      title: "Presensi Siswa",
      description: "Rekap presensi dan kehadiran siswa",
      icon: <Users className="w-6 h-6" />,
      requiredRole: "guru_bk",
      to: "/atmin/presensi",
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
        "operator",
        "kepala_sekolah",
      ] as UserRole[],
      to: "/atmin/gallery",
    },
    {
      id: "digital-library",
      title: "Perpus Digital",
      description: "Akses perpustakaan digital sekolah secara online",
      icon: <Book className="w-6 h-6" />,
      requiredRole: [], // Akses publik
      to: "https://perpustakaan.man3kulonprogo.sch.id/",
    },
    {
      id: "persuratan",
      title: "Persuratan",
      description: "Kelola surat menyurat sekolah secara online",
      icon: <Clipboard className="w-6 h-6" />,
      requiredRole: [], // Akses publik
      to: "http://persuratan.man3kulonprogo.sch.id/",
    },
    {
      id: "rapor",
      title: "Rapor Siswa",
      description: "Akses informasi rapor dan nilai siswa",
      icon: <BookOpen className="w-6 h-6" />,
      requiredRole: [], // Akses publik
      to: "http://raport.man3kulonprogo.sch.id/",
    },
  ];

  const handleAppClick = (app: AppItem) => {
    if (app.to.startsWith("http")) {
      // Link eksternal: buka langsung
      window.open(app.to, "_blank"); // atau window.location.href = app.to
    } else {
      // Link internal: pakai navigate
      if (isLoggedIn) {
        navigate(app.to);
      } else {
        showInfoToast(
          "Silakan login terlebih dahulu untuk mengakses aplikasi ini."
        );
        navigate("/login");
      }
    }
  };

  // Tidak perlu loading state atau empty state di sini karena ini adalah halaman publik
  // yang selalu menampilkan katalog aplikasi.

  return (
    <Layout>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-background dark:bg-semibackground">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Aplikasi Sekolah
            </h1>
            <p className="text-muted max-w-2xl mx-auto">
              Kelola berbagai aspek sekolah dengan aplikasi digital terintegrasi
              kami
            </p>
          </div>

          {/* Tampilkan SEMUA aplikasi, tanpa filter */}
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
