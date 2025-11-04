import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Archive, Clipboard, Users, BookOpen } from "lucide-react";
import AppCard from "../../components/ui/AppCard";
import { useAuth } from "../../contexts/AuthContext";
import { useToastMessage } from "../../hooks/useToastMessage";
import AdminLayout from "../../components/layout/AdminLayout";

/**
 * AdminDashboard component renders the admin dashboard with available apps
 * based on the user's role and permissions.
 */
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();
  const { showErrorToast } = useToastMessage();

  /**
   * Render the loading skeleton UI while authentication is in progress.
   */
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

  if (isLoadingAuth) {
    return renderLoadingState();
  }

  // Redirect to login if not logged in
  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }

  /**
   * Retrieves the username of the logged-in user.
   * @returns {string} - The username or "Administrator" if not available.
   */
  const getUsername = (): string => user?.username || "Administrator";

  /**
   * Retrieves the role of the logged-in user.
   * @returns {string} - The role of the user or "User" if not available.
   */
  const getRole = (): string => user?.role || "User";

  const userRole = getRole();
  const username = getUsername();

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
  ];

  /**
   * Check if the current user has the required role to access an app.
   * @param {string} requiredRole - The role required to access the app.
   * @returns {boolean} - True if the user has access, false otherwise.
   */
  const hasAccess = (requiredRole: string): boolean => {
    if (userRole === "super_admin") return true;
    return userRole === requiredRole;
  };

  /**
   * Handle click event for app access and navigation.
   * If the user does not have access, show a toast notification.
   * @param {string} appId - The app identifier.
   * @param {string} requiredRole - The required role for the app.
   * @param {string} [to] - Optional route to navigate to.
   */
  const handleAppClick = (appId: string, requiredRole: string, to?: string) => {
    if (!userRole) {
      navigate("/login", { state: { redirectTo: to || `/atmin/${appId}` } });
      return;
    }

    if (!hasAccess(requiredRole)) {
      showErrorToast("Anda tidak memiliki akses ke aplikasi ini");
      return;
    }

    // Use the specified 'to' route if provided, otherwise default to /atmin/[appId]
    navigate(to || `/atmin/${appId}`);
  };

  /**
   * Get the list of apps that the user has access to.
   * @returns {Array} - Filtered list of apps the user can access.
   */
  const getVisibleApps = () => {
    return apps.filter((app) => hasAccess(app.requiredRole));
  };

  const visibleApps = getVisibleApps();

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
