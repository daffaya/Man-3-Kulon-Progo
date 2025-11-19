/**
 * @fileoverview Dashboard page for attendance management in the admin panel.
 * This component displays attendance statistics, provides access to attendance features,
 * shows quick actions for student management, and lists all available classes with
 * options to input or recap attendance for each class.
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import { fetchClasses, fetchTodayStats } from "../../../api/attendanceApi";
import AppCard from "../../../components/ui/AppCard";
import AdminLayout from "../../../components/layout/AdminLayout";
import AddStudentModal from "../../../components/modals/AddStudentModal";
import QuickActionCard from "../../../components/ui/QuickActionCard";
import StatCard from "../../../components/ui/StatCard";
import {
  Clipboard,
  BarChart,
  Calendar,
  Archive,
  Upload,
  Users,
  UserPlus,
  ChevronLeft,
} from "lucide-react";
import ImportStudentPage from "../../../components/modals/ImportStudentPage";

/**
 * Interface defining the structure of class data.
 */
interface ClassData {
  id: string;
  name: string;
  academic_year: string;
  semester: string;
  total_siswa: number;
}

/**
 * Interface defining the structure of today's attendance statistics.
 */
interface TodayStats {
  totalHadir: number;
  totalIzin: number;
  totalSakit: number;
  totalAlpa: number;
  totalLibur: number;
}

/**
 * Dashboard page component for attendance management.
 * Displays attendance statistics, provides access to attendance features,
 * shows quick actions for student management, and lists all available classes.
 */
const AttendanceStudentPage: React.FC = () => {
  const { user, isLoggedIn, token } = useAuth();
  const navigate = useNavigate();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [classes, setClasses] = useState<ClassData[]>([]);
  const [todayStats, setTodayStats] = useState<TodayStats>({
    totalHadir: 0,
    totalIzin: 0,
    totalSakit: 0,
    totalAlpa: 0,
    totalLibur: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [refreshData, setRefreshData] = useState(false);

  const hasEditAccess =
    isLoggedIn && ["guru_bk", "super_admin"].includes(user?.role || "");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    /**
     * Fetches initial data for classes and today's attendance statistics.
     * Updates component state with fetched data or shows error toast.
     */
    const fetchData = async () => {
      if (!token) return;
      try {
        const [classesData, statsData] = await Promise.all([
          fetchClasses(token),
          fetchTodayStats(new Date().toISOString().split("T")[0], token),
        ]);
        setClasses(classesData);
        setTodayStats(statsData);
      } catch (error) {
        showErrorToast("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn && token) fetchData();
  }, [isLoggedIn, token, showErrorToast]);

  useEffect(() => {
    /**
     * Refreshes class data when refreshData flag is set to true.
     * Used after adding or importing new students.
     */
    if (refreshData && token) {
      const refreshClasses = async () => {
        try {
          const classesData = await fetchClasses(token);
          setClasses(classesData);
        } catch {
          showErrorToast("Gagal memuat data kelas");
        } finally {
          setRefreshData(false);
        }
      };
      refreshClasses();
    }
  }, [refreshData, token, showErrorToast]);

  const quickActions = [
    {
      id: "view-students",
      title: "Lihat Daftar Siswa",
      description: "Kelola data siswa per kelas",
      icon: <Users className="w-6 h-6" />,
      to: "/atmin/manajemen-siswa",
      color: "blue" as const,
    },
    {
      id: "add-student",
      title: "Tambah Siswa",
      description: "Tambah siswa baru secara individual",
      icon: <UserPlus className="w-6 h-6" />,
      action: () => setShowAddStudentModal(true),
      color: "green" as const,
    },
    {
      id: "import-students",
      title: "Import Siswa",
      description: "Import data siswa dari Excel/CSV",
      icon: <Upload className="w-6 h-6" />,
      action: () => setShowImportModal(true),
      color: "purple" as const,
    },
  ];

  const features = [
    {
      id: "input",
      title: "Input Presensi",
      description: "Catat presensi harian siswa per kelas",
      icon: <Clipboard className="w-6 h-6" />,
      to: "/atmin/presensi/input",
    },
    {
      id: "recap",
      title: "Rekap Presensi",
      description: "Lihat ringkasan presensi harian, bulanan, dan semesteran",
      icon: <BarChart className="w-6 h-6" />,
      to: "/atmin/presensi/recap",
    },
    {
      id: "holidays",
      title: "Hari Libur",
      description: "Kelola hari libur sekolah",
      icon: <Calendar className="w-6 h-6" />,
      to: "/atmin/presensi/holidays",
    },
    {
      id: "archive",
      title: "Arsip Presensi",
      description: "Lihat dan kelola arsip presensi per semester",
      icon: <Archive className="w-6 h-6" />,
      to: "/atmin/presensi/archive",
    },
  ];

  const username =
    typeof user?.username === "string" && user.username
      ? user.username
      : "Guru BK";

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen text-secondary">
          Memuat data...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-in">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link
              to="/atmin"
              className="text-sm text-secondary hover:text-accent flex items-center mb-8 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Kembali ke Admin Dashboard
            </Link>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Dashboard Guru BK
            </h1>
            <p className="mt-2 text-secondary">Selamat datang, {username}!</p>
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Statistik Presensi Hari Ini
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatCard
                title="Hadir"
                value={todayStats.totalHadir}
                color="border-l-4 border-success"
              />
              <StatCard
                title="Izin"
                value={todayStats.totalIzin}
                color="border-l-4 border-warning"
              />
              <StatCard
                title="Sakit"
                value={todayStats.totalSakit}
                color="border-l-4 border-info"
              />
              <StatCard
                title="Alpa"
                value={todayStats.totalAlpa}
                color="border-l-4 border-error"
              />
              <StatCard
                title="Libur"
                value={todayStats.totalLibur}
                color="border-l-4 border-accent"
              />
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Fitur Presensi
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <AppCard
                  key={feature.id}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  onClick={() => navigate(feature.to)}
                />
              ))}
            </div>
          </section>

          {hasEditAccess && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Quick Actions - Manajemen Siswa
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickActions.map((action) => (
                  <QuickActionCard
                    key={action.id}
                    title={action.title}
                    description={action.description}
                    icon={action.icon}
                    onClick={action.action}
                    to={action.to}
                    color={action.color}
                  />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Daftar Kelas
            </h2>
            {classes.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-secondary">Tidak ada kelas yang tersedia</p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <table className="min-w-full divide-y divide-[rgb(var(--color-secondary)/0.2)]">
                  <thead className="bg-[rgb(var(--color-semi-background))]">
                    <tr>
                      <th className="px-2 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                        No
                      </th>
                      {[
                        "Kelas",
                        "Tahun Ajaran",
                        "Semester",
                        "Total Siswa",
                        "Aksi",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgb(var(--color-secondary)/0.1)]">
                    {classes.map((classItem, index) => (
                      <tr
                        key={classItem.id}
                        className="hover:bg-[rgb(var(--color-semi-background))]"
                      >
                        <td className="px-2 py-4 text-sm text-secondary">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          {classItem.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-secondary">
                          {classItem.academic_year}
                        </td>
                        <td className="px-6 py-4 text-sm text-secondary">
                          {classItem.semester}
                        </td>
                        <td className="px-6 py-4 text-sm text-secondary">
                          {classItem.total_siswa} siswa
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <button
                            onClick={() =>
                              navigate(
                                `/atmin/presensi/input?classId=${classItem.id}`
                              )
                            }
                            className="text-info hover:text-info/80 mr-3 transition-colors"
                          >
                            Input
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                `/atmin/presensi/recap?classId=${classItem.id}`
                              )
                            }
                            className="text-success hover:text-success/80 transition-colors"
                          >
                            Rekap
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>

      <AddStudentModal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        onSuccess={() => setRefreshData(true)}
      />

      <ImportStudentPage
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          setShowImportModal(false);
          setRefreshData(true);
        }}
      />
    </AdminLayout>
  );
};

export default AttendanceStudentPage;
