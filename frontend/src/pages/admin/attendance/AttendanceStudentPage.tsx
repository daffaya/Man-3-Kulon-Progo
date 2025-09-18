import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clipboard, BarChart, Calendar } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import AppCard from "../../../components/ui/AppCard";
import AdminLayout from "../../../components/layout/AdminLayout";
import Toast from "../../../components/ui/Toast";

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

const StatCard: React.FC<{
  title: string;
  value: number;
  color: string;
}> = ({ title, value, color }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col ${color}`}
  >
    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
      {title}
    </h4>
    <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
      {value}
    </p>
  </div>
);

const AttendanceStudentPage: React.FC = () => {
  const { user, isLoggedIn, isLoadingAuth, token, logout } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [todayStats, setTodayStats] = useState<TodayStats>({
    totalHadir: 0,
    totalIzin: 0,
    totalSakit: 0,
    totalAlpa: 0,
    totalLibur: 0,
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ isVisible: false, message: "" });

  const handleAuthError = () => {
    setToast({
      isVisible: true,
      message: "Sesi telah berakhir. Silakan login kembali.",
    });
    logout();
    navigate("/login");
  };

  const fetchDashboardData = async () => {
    const controller = new AbortController();

    try {
      // Fetch classes
      const classesResponse = await fetch("/api/attendance/classes", {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });

      // Handle non-JSON responses
      const contentType = classesResponse.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error(
          `Invalid response format. Expected JSON, got ${contentType}`
        );
      }

      if (!classesResponse.ok) {
        if (classesResponse.status === 401) {
          handleAuthError();
          return;
        }
        const errorData = await classesResponse.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${classesResponse.status}`
        );
      }

      const classesData = await classesResponse.json();
      setClasses(classesData);

      // Fetch stats
      const today = new Date().toISOString().split("T")[0];
      const statsResponse = await fetch(
        `/api/attendance/today-stats?date=${today}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        }
      );

      const statsContentType = statsResponse.headers.get("content-type");
      if (!statsContentType?.includes("application/json")) {
        throw new Error(
          `Invalid response format. Expected JSON, got ${statsContentType}`
        );
      }

      if (!statsResponse.ok) {
        if (statsResponse.status === 401) {
          handleAuthError();
          return;
        }
        const errorData = await statsResponse.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${statsResponse.status}`
        );
      }

      const statsData = await statsResponse.json();
      setTodayStats(statsData);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Fetch error:", error);
        setToast({
          isVisible: true,
          message:
            error.message ||
            "Gagal memuat data. Periksa koneksi internet Anda.",
        });
      }
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  };

  useEffect(() => {
    let isMounted = true;

    if (isLoggedIn && token) {
      fetchDashboardData().finally(() => {
        if (isMounted) setLoading(false);
      });
    }

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, token]);

  useEffect(() => {
    if (toast.isVisible) {
      const timer = setTimeout(() => {
        setToast({ ...toast, isVisible: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const renderLoadingState = () => (
    <div className="pt-24 min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Skeleton for Header */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
        {/* Skeleton for Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        {/* Skeleton for Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
        {/* Skeleton for Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-12 bg-gray-300 dark:bg-gray-700 rounded mb-1"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoadingAuth || loading) {
    return renderLoadingState();
  }

  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }

  const getUsername = () => {
    if (!user || !user.username) return "Guru BK";
    return typeof user.username === "string" ? user.username : "Guru BK";
  };

  const username = getUsername();

  const features = [
    {
      id: "input",
      title: "Input Presensi",
      description: "Catat presensi harian siswa per kelas",
      icon: <Clipboard className="w-6 h-6" />,
      to: "/attendance/input",
    },
    {
      id: "recap",
      title: "Rekap Presensi",
      description: "Lihat ringkasan presensi harian, bulanan, dan semesteran",
      icon: <BarChart className="w-6 h-6" />,
      to: "/attendance/recap",
    },
    {
      id: "holidays",
      title: "Hari Libur",
      description: "Kelola hari libur sekolah",
      icon: <Calendar className="w-6 h-6" />,
      to: "/attendance/holidays",
    },
  ];

  return (
    <AdminLayout>
      <div className="pt-24 min-h-screen bg-background dark:bg-background py-12 px-4 sm:px-6 lg:px-8">
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
                                `/attendance/input?classId=${classItem.id}`
                              )
                            }
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                            aria-label={`Input presensi untuk kelas ${classItem.name}`}
                          >
                            Input
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                `/attendance/recap?classId=${classItem.id}`
                              )
                            }
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            aria-label={`Lihat rekap presensi untuk kelas ${classItem.name}`}
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
      <Toast message={toast.message} isVisible={toast.isVisible} />
    </AdminLayout>
  );
};

export default AttendanceStudentPage;
