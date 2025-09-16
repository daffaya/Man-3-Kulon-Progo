import React, { useContext, useEffect, useState, useCallback } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Archive, Clipboard, Users, BookOpen } from "lucide-react";
import AppCard from "../../components/ui/AppCard";

// PERUBAHAN: Update interface AppliedFilters untuk menyertakan category

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>("super_admin"); // Ganti dengan autentikasi real

  // Contoh data aplikasi
  const apps = [
    {
      id: "archive",
      title: "Manajemen Arsip",
      description: "Kelola dokumen dan arsip sekolah dengan mudah",
      icon: <Archive className="w-6 h-6" />,
      requiredRole: "arsiparis", // Diperbaiki agar cocok dengan ENUM 'arsiparis'
    },
    {
      id: "inventory",
      title: "Inventaris",
      description: "Pantau dan kelola barang inventaris sekolah",
      icon: <Clipboard className="w-6 h-6" />,
      requiredRole: "pengelola_bmn", // Diperbaiki agar cocok dengan ENUM 'pengelola_bmn'
    },
    {
      id: "attendance",
      title: "Presensi Siswa",
      description: "Rekap presensi dan kehadiran siswa",
      icon: <Users className="w-6 h-6" />,
      requiredRole: "guru_bk", // Diperbaiki agar cocok dengan ENUM 'guru_bk'
    },
    {
      id: "articles",
      title: "Artikel Sekolah",
      description: "Buat dan kelola artikel untuk website sekolah",
      icon: <BookOpen className="w-6 h-6" />,
      requiredRole: "jurnalis", // Diperbaiki agar cocok dengan ENUM 'jurnalis'
      to: "/admin/article-management",
    },
  ];

  const hasAccess = (requiredRole: string) => {
    // Super admin selalu punya akses, atau jika peran pengguna sesuai
    return userRole === "super_admin" || userRole === requiredRole;
  };

  const handleAppClick = (appId: string, requiredRole: string) => {
    if (!userRole) {
      navigate("/login", { state: { redirectTo: `/atmin/${appId}` } });
      return;
    }

    if (!hasAccess(requiredRole)) {
      alert("Anda tidak memiliki akses ke aplikasi ini");
      return;
    }

    // Arahkan ke aplikasi
    navigate(`/atmin/${appId}`);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-semibackground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <AppCard
              key={app.id}
              title={app.title}
              description={app.description}
              icon={app.icon}
              onClick={() => handleAppClick(app.id, app.requiredRole)}
              disabled={!hasAccess(app.requiredRole)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
