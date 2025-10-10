import React from "react";
import Layout from "../components/layout/Layout";
import AppCard from "../components/ui/AppCard";
import { useNavigate } from "react-router-dom";
import { Archive, Clipboard, Users, BookOpen } from "lucide-react";

const WebAppPage: React.FC = () => {
  const navigate = useNavigate();

  const apps = [
    {
      id: "archive",
      title: "Manajemen Arsip",
      description: "Kelola dokumen dan arsip sekolah dengan mudah",
      icon: <Archive className="w-6 h-6" />,
      requiredRole: "arsiparis",
      to: "/archives",
    },
    {
      id: "inventory",
      title: "Inventaris",
      description: "Pantau dan kelola barang inventaris sekolah",
      icon: <Clipboard className="w-6 h-6" />,
      requiredRole: "pengelola_bmn",
      to: "/atmin/inventory",
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
      id: "articles",
      title: "Artikel Sekolah",
      description: "Buat dan kelola artikel untuk website sekolah",
      icon: <BookOpen className="w-6 h-6" />,
      requiredRole: "jurnalis",
      to: "/atmin/articles",
    },
  ];

  const handleAppClick = (to: string) => {
    console.log("Navigating from WebAppPage to:", to);
    console.log("History stack length before navigate:", window.history.length);
    navigate(to, { replace: false }); // Pastikan push
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
                onClick={() => handleAppClick(app.to)}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WebAppPage;
