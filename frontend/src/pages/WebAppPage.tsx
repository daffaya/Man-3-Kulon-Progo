// AppsPage.tsx
import React, { useState } from "react";
import Layout from "../components/layout/Layout";
import AppCard from "../components/ui/AppCard";
import { useNavigate } from "react-router-dom";
import {
  Archive,
  Clipboard,
  Users,
  BookOpen,
  Settings,
  BarChart2,
  User,
  Book,
} from "lucide-react";

const WebAppPage: React.FC = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null); // Ganti dengan autentikasi real

  // Contoh data aplikasi
  const apps = [
    {
      id: "archive",
      title: "Manajemen Arsip",
      description: "Kelola dokumen dan arsip sekolah dengan mudah",
      icon: <Archive className="w-6 h-6" />,
      requiredRole: "archive_manager",
    },
    {
      id: "inventory",
      title: "Inventaris",
      description: "Pantau dan kelola barang inventaris sekolah",
      icon: <Clipboard className="w-6 h-6" />,
      requiredRole: "inventory_manager",
    },
    {
      id: "attendance",
      title: "Presensi Siswa",
      description: "Rekap presensi dan kehadiran siswa",
      icon: <Users className="w-6 h-6" />,
      requiredRole: "teacher",
    },
    {
      id: "articles",
      title: "Artikel Sekolah",
      description: "Buat dan kelola artikel untuk website sekolah",
      icon: <BookOpen className="w-6 h-6" />,
      requiredRole: "content_manager",
    },
    {
      id: "settings",
      title: "Pengaturan",
      description: "Konfigurasi sistem dan pengguna",
      icon: <Settings className="w-6 h-6" />,
      requiredRole: "admin",
    },
    {
      id: "reports",
      title: "Laporan",
      description: "Buat laporan dan analitik data sekolah",
      icon: <BarChart2 className="w-6 h-6" />,
      requiredRole: "admin",
    },
  ];

  const handleAppClick = (appId: string, requiredRole: string) => {
    // Logika autentikasi dan autorisasi
    if (!userRole) {
      // Redirect ke login jika belum login
      navigate("/login", { state: { redirectTo: `/apps/${appId}` } });
      return;
    }

    // Cek role user
    if (userRole !== requiredRole) {
      alert("Anda tidak memiliki akses ke aplikasi ini");
      return;
    }

    // Arahkan ke aplikasi
    navigate(`/apps/${appId}`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background dark:bg-semibackground py-12 px-4 sm:px-6 lg:px-8">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <AppCard
                key={app.id}
                title={app.title}
                description={app.description}
                icon={app.icon}
                onClick={() => handleAppClick(app.id, app.requiredRole)}
                disabled={userRole !== null && userRole !== app.requiredRole}
              />
            ))}
          </div>

          {!userRole && (
            <div className="mt-12 p-6 rounded-xl border border-accent/20 bg-accent/5 text-center">
              <p className="text-muted mb-4">
                Silakan login untuk mengakses aplikasi
              </p>
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2 bg-accent text-background rounded-lg font-medium hover:bg-accent/90 transition-colors"
              >
                Login Sekarang
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default WebAppPage;
