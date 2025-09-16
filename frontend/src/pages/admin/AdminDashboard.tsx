import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Archive, Clipboard, Users, BookOpen } from "lucide-react";
import AppCard from "../../components/ui/AppCard";
import AdminHeader from "../../components/layout/AdminHeader";
import { useAuth } from "../../contexts/AuthContext";
import Toast from "../../components/ui/Toast";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();

  const [toast, setToast] = useState({ isVisible: false, message: "" });

  const renderLoadingState = () => (
    <div className="pt min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Skeleton for Header */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
        {/* Skeleton for App Cards */}
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

  if (isLoadingAuth) {
    return renderLoadingState();
  }

  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }

  const getUsername = () => {
    if (!user || !user.username) return "Administrator";
    return typeof user.username === "string" ? user.username : "Administrator";
  };

  const getRole = () => {
    if (!user || !user.role) return "User";
    return typeof user.role === "string" ? user.role : "User";
  };

  const userRole = getRole();
  const username = getUsername();

  const apps = [
    {
      id: "archive",
      title: "Manajemen Arsip",
      description: "Kelola dokumen dan arsip sekolah dengan mudah",
      icon: <Archive className="w-6 h-6" />,
      requiredRole: "arsiparis",
    },
    {
      id: "inventory",
      title: "Inventaris",
      description: "Pantau dan kelola barang inventaris sekolah",
      icon: <Clipboard className="w-6 h-6" />,
      requiredRole: "pengelola_bmn",
    },
    {
      id: "attendance",
      title: "Presensi Siswa",
      description: "Rekap presensi dan kehadiran siswa",
      icon: <Users className="w-6 h-6" />,
      requiredRole: "guru_bk",
    },
    {
      id: "articles",
      title: "Artikel Sekolah",
      description: "Buat dan kelola artikel untuk website sekolah",
      icon: <BookOpen className="w-6 h-6" />,
      requiredRole: "jurnalis",
      to: "/atmin/article-management",
    },
  ];

  const hasAccess = (requiredRole: string) => {
    if (!userRole) return false;
    if (userRole === "super_admin") return true;
    if (userRole === requiredRole) return true;
    return false;
  };

  const handleAppClick = (appId: string, requiredRole: string) => {
    if (!userRole) {
      navigate("/login", { state: { redirectTo: `/atmin/${appId}` } });
      return;
    }

    if (!hasAccess(requiredRole)) {
      setToast({
        isVisible: true,
        message: "Anda tidak memiliki akses ke aplikasi ini",
      });
      return;
    }
    navigate(`/atmin/${appId}`);
  };

  useEffect(() => {
    if (toast.isVisible) {
      const timer = setTimeout(() => {
        setToast({ ...toast, isVisible: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const getVisibleApps = () => {
    return apps.filter((app) => hasAccess(app.requiredRole));
  };

  const visibleApps = getVisibleApps();

  return (
    <>
      <AdminHeader />
      <div className="pt-24 min-h-screen bg-background dark:bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
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
                  onClick={() => handleAppClick(app.id, app.requiredRole)}
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
      <Toast message={toast.message} isVisible={toast.isVisible} />
    </>
  );
};

export default AdminDashboard;
