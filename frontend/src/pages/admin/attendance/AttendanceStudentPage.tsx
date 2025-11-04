import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import { fetchClasses, fetchTodayStats } from "../../../api/attendanceApi";
import AppCard from "../../../components/ui/AppCard";
import AdminLayout from "../../../components/layout/AdminLayout";
import { studentService } from "../../../services/studentService";
import AddStudentModal from "../../../components/modals/AddStudentModal";
import QuickActionCard from "../../../components/ui/QuickActionCard";
import StatCard from "../../../components/ui/StatCard";
// Import icon dengan benar
import {
  Clipboard,
  BarChart,
  Calendar,
  Archive,
  Upload,
  Users,
  UserPlus,
} from "lucide-react";
import ImportStudentPage from "../../../components/modals/ImportStudentPage";

interface ClassData {
  id: string;
  name: string;
  academic_year: string;
  semester: string;
  total_siswa: number;
}

interface TodayStats {
  totalHadir: number;
  totalIzin: number;
  totalSakit: number;
  totalAlpa: number;
  totalLibur: number;
}

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

  const hasEditAccess =
    isLoggedIn && ["guru_bk", "super_admin"].includes(user?.role || "");

  useEffect(() => {
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

    if (isLoggedIn && token) {
      fetchData();
    }
  }, [isLoggedIn, token, showErrorToast]);

  const handleAddStudent = async (studentData: any) => {
    try {
      if (!token) {
        throw new Error("Token tidak tersedia");
      }
      await studentService.createStudent(studentData, token);
      showSuccessToast("Siswa berhasil ditambahkan");
      setShowAddStudentModal(false);
      // Refresh data
      const classesData = await fetchClasses(token);
      setClasses(classesData);
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "Gagal menambah siswa"
      );
    }
  };

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

  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }

  const getUsername = () => {
    if (!user || !user.username) return "Guru BK";
    return typeof user.username === "string" ? user.username : "Guru BK";
  };

  const username = getUsername();

  return (
    <AdminLayout>
      <div className="pt-8 min-h-screen bg-background dark:bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Guru BK
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Selamat datang, {username}!
            </p>
          </div>

          {/* Statistik Hari Ini */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Statistik Presensi Hari Ini
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatCard
                title="Hadir"
                value={todayStats.totalHadir}
                color="border-l-4 border-green-500"
              />
              <StatCard
                title="Izin"
                value={todayStats.totalIzin}
                color="border-l-4 border-yellow-500"
              />
              <StatCard
                title="Sakit"
                value={todayStats.totalSakit}
                color="border-l-4 border-blue-500"
              />
              <StatCard
                title="Alpa"
                value={todayStats.totalAlpa}
                color="border-l-4 border-red-500"
              />
              <StatCard
                title="Libur"
                value={todayStats.totalLibur}
                color="border-l-4 border-purple-500"
              />
            </div>
          </div>

          {/* Fitur-Fitur */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
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
          </div>

          {/* Quick Actions */}
          {hasEditAccess && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
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
            </div>
          )}

          {/* Daftar Kelas */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Daftar Kelas
            </h2>
            {classes.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Tidak ada kelas yang tersedia
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Kelas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tahun Ajaran
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Semester
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Total Siswa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {classes.map((classItem) => (
                      <tr
                        key={classItem.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {classItem.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {classItem.academic_year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {classItem.semester}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {classItem.total_siswa} siswa
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() =>
                              navigate(
                                `/atmin/presensi/input?classId=${classItem.id}`
                              )
                            }
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                          >
                            Input
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                `/atmin/presensi/recap?classId=${classItem.id}`
                              )
                            }
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
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
          </div>
        </div>
      </div>
      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        onSuccess={() => {
          if (token) {
            fetchClasses(token).then(setClasses);
          }
        }}
      />

      <ImportStudentPage
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          setShowImportModal(false);
          if (token) {
            fetchClasses(token).then(setClasses);
          }
        }}
      />
    </AdminLayout>
  );
};

export default AttendanceStudentPage;
