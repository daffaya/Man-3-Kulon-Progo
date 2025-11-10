import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Archive,
  Clipboard,
  Users,
  BookOpen,
  Image,
  LogIn,
} from "lucide-react";
import AppCard from "../../components/ui/AppCard";
import { useAuth } from "../../contexts/AuthContext";
import { useToastMessage } from "../../hooks/useToastMessage";
import AdminLayout from "../../components/layout/AdminLayout";
import type { UserRole } from "../../types/userTypes";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoadingAuth } = useAuth();
  const { showErrorToast } = useToastMessage();

  // 👇 perbaikan utama
  useEffect(() => {
    if (!isLoadingAuth && !isLoggedIn) {
      navigate("/login", { state: { redirectTo: "/atmin" } });
    }
  }, [isLoadingAuth, isLoggedIn, navigate]);

  if (isLoadingAuth) {
    return (
      <AdminLayout children={undefined}>{/* skeleton loading */}</AdminLayout>
    );
  }

  if (!isLoggedIn) {
    // jangan render apa pun saat sedang redirect
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
      requiredRole: "jurnalis" as UserRole,
      to: "/atmin/articles",
    },
    {
      id: "archives",
      title: "Manajemen Arsip",
      description: "Kelola dokumen dan arsip sekolah dengan mudah",
      icon: <Archive className="w-6 h-6" />,
      requiredRole: "arsiparis" as UserRole,
      to: "/archives",
    },
    {
      id: "presensi",
      title: "Presensi Siswa",
      description: "Rekap presensi dan kehadiran siswa",
      icon: <Users className="w-6 h-6" />,
      requiredRole: "guru_bk" as UserRole,
      to: "/atmin/presensi",
    },
    {
      id: "users",
      title: "Manajemen User",
      description: "Kelola pengguna sistem",
      icon: <Users className="w-6 h-6" />,
      requiredRole: "super_admin" as UserRole,
      to: "/atmin/users",
    },
    {
      id: "inventory",
      title: "Inventaris",
      description: "Pantau dan kelola barang inventaris sekolah",
      icon: <Clipboard className="w-6 h-6" />,
      requiredRole: "pengelola_bmn" as UserRole,
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

  const hasAccess = (requiredRole: UserRole | UserRole[]): boolean => {
    if (userRole === "super_admin") return true;
    if (Array.isArray(requiredRole)) return requiredRole.includes(userRole);
    return userRole === requiredRole;
  };

  const handleAppClick = (requiredRole: UserRole | UserRole[], to: string) => {
    if (!hasAccess(requiredRole)) {
      showErrorToast("Anda tidak memiliki akses ke aplikasi ini");
      return;
    }
    navigate(to);
  };

  const visibleApps = apps.filter((app) => hasAccess(app.requiredRole));

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-8 fade-in">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
            Dashboard Admin
          </h1>
          <p className="text-lg text-secondary">
            Selamat datang kembali,{" "}
            <span className="font-medium">{username}</span>
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
                onClick={() => handleAppClick(app.requiredRole, app.to)}
              />
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="mx-auto w-20 h-20 bg-semibackground/50 rounded-full flex items-center justify-center mb-5">
              <LogIn className="h-10 w-10 text-secondary/60" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Tidak Ada Akses Aplikasi
            </h3>
            <p className="text-secondary max-w-md mx-auto">
              Role Anda saat ini tidak memiliki akses ke aplikasi admin. Hubungi
              super admin untuk penyesuaian.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
