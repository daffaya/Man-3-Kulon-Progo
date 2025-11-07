import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Archive, Clipboard, Users, BookOpen, Image } from "lucide-react";
import AppCard from "../../components/ui/AppCard";
import { useAuth } from "../../contexts/AuthContext";
import { useToastMessage } from "../../hooks/useToastMessage";
import AdminLayout from "../../components/layout/AdminLayout";
import type { UserRole } from "../../types/userTypes"; // ✅ import UserRole

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();
  const { showErrorToast } = useToastMessage();

  const renderLoadingState = () => (
    <div className="pt min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center animate-pulse"
            >
              <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 mb-4"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoadingAuth) return renderLoadingState();
  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }

  const userRole = (user?.role || "User") as UserRole;
  const username = user?.username || "Administrator";

  const apps = [
    {
      id: "articles",
      title: "Artikel Sekolah",
      description: "Buat dan kelola artikel untuk website sekolah",
      icon: <BookOpen className="w-6 h-6" />,
      requiredRole: "jurnalis",
      to: "/atmin/articles",
    },
    {
      id: "archives",
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
      id: "users",
      title: "Manajemen User",
      description: "Kelola pengguna sistem",
      icon: <Users className="w-6 h-6" />,
      requiredRole: "super_admin",
      to: "/atmin/users",
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
  ];

  const hasAccess = (requiredRole: string | string[]): boolean => {
    if (userRole === "super_admin") return true;
    if (Array.isArray(requiredRole)) return requiredRole.includes(userRole);
    return userRole === requiredRole;
  };

  const handleAppClick = (
    appId: string,
    requiredRole: string | string[],
    to?: string
  ) => {
    if (!userRole) {
      navigate("/login", { state: { redirectTo: to || `/atmin/${appId}` } });
      return;
    }

    if (!hasAccess(requiredRole)) {
      showErrorToast("Anda tidak memiliki akses ke aplikasi ini");
      return;
    }

    navigate(to || `/atmin/${appId}`);
  };

  const visibleApps = apps.filter((app) => hasAccess(app.requiredRole));

  return (
    <AdminLayout>
      <div className="pt-8 min-h-screen bg-background dark:bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Selamat datang, {username}
            </p>
          </div>

          {visibleApps.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleApps.map((app) => (
                <AppCard
                  key={app.id}
                  title={app.title}
                  description={app.description}
                  icon={app.icon}
                  onClick={() =>
                    handleAppClick(app.id, app.requiredRole, app.to)
                  }
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-center text-gray-500 dark:text-gray-400">
              <Clipboard
                size={64}
                className="mb-4 text-gray-400 dark:text-gray-500"
              />
              <h2 className="text-xl font-semibold mb-2">
                Tidak Ada Aplikasi yang Tersedia
              </h2>
              <p>Anda tidak memiliki akses ke aplikasi apa pun.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
