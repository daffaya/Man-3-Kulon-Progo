// In frontend/src/pages/admin/attendance/AttendanceRecapPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import AdminLayout from "../../../components/layout/AdminLayout";
import Layout from "../../../components/layout/Layout";
import { useToast } from "../../../contexts/ToastContext";
import { format, parseISO } from "date-fns";
import ThemeToggle from "../../../components/ui/ThemeToggle";
import { id } from "date-fns/locale";
import { ChevronLeft, Eye, EyeOff, Lock, GraduationCap } from "lucide-react";
import AbsenceAnalysisTabs from "../../../components/attendance/AbsenceAnalysisTabs";
import {
  fetchClasses,
  fetchAttendanceRecap,
  exportAttendanceData,
  fetchPublicClasses,
  fetchPublicAttendanceRecap,
  verifyPublicPassword,
} from "../../../api/attendanceApi";
import AttendanceCalendarTab from "../../../components/attendance/AttendanceCalendarTab";

// Placeholder untuk gambar ilustrasi (bisa diganti dengan import file lokal seperti di LoginPage)
const illustrationUrl = "/student_illustration.png";

interface RecapData {
  id: number;
  nisn: string;
  name: string;
  total_hari?: number;
  hadir?: number;
  izin?: number;
  sakit?: number;
  alpa?: number;
  persentase_kehadiran?: number;
  date?: string;
  status?: string;
  notes?: string;
}

interface ClassData {
  id: number;
  name: string;
  academic_year: string;
  semester: string;
  total_siswa: number;
}

const backendUrl =
  import.meta.env.VITE_BACKEND_URL || "https://backend.man3kulonprogo.sch.id";
const ALLOWED_ROLES = ["guru_bk", "super_admin"] as const;

/**
 * Checks if a user has permission to access attendance recap based on their role.
 * @param {boolean} isLoggedIn - The user's login status.
 * @param {string | undefined} role - The user's role.
 * @returns {boolean} True if the user has access, otherwise false.
 */
const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

/**
 * Component for viewing and exporting attendance recapitulation data.
 * Provides filtering options by class, period, and date range, and displays attendance
 * statistics in a tabular format with options to export to Excel or PDF.
 * Can be accessed both by authenticated users and unauthenticated users with a password.
 */
const AttendanceRecapPage: React.FC = () => {
  const { isLoggedIn, user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  // Check if this is the public route (not under /atmin)
  const isPublicRoute = !location.pathname.startsWith("/atmin");

  const [activeView, setActiveView] = useState<"recap" | "analysis">("recap");
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<number>(0);
  const [recapData, setRecapData] = useState<RecapData[]>([]);
  const [loading, setLoading] = useState(false);
  const [recapPeriod, setRecapPeriod] = useState<
    "daily" | "monthly" | "semester"
  >("daily");
  const [recapStartDate, setRecapStartDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [recapEndDate, setRecapEndDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );

  // Password state for public access
  const [isAuthenticated, setIsAuthenticated] = useState(
    isPublicRoute ? false : true,
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);

  const isAdminOrGuruBK = hasEditAccess(isLoggedIn, user?.role);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const classId = params.get("classId");
    if (classId) {
      setSelectedClass(Number(classId));
    }
  }, [location.search]);

  useEffect(() => {
    const fetchClassesData = async () => {
      try {
        let data;
        if (isPublicRoute || !token) {
          // Use public endpoint
          data = await fetchPublicClasses();
        } else {
          // Use authenticated endpoint
          data = await fetchClasses(token);
        }
        setClasses(data);
      } catch (err) {
        showToast("Gagal mengambil data kelas", "error");
      }
    };

    if (isAuthenticated) {
      fetchClassesData();
    }
  }, [isAuthenticated, token, showToast, isPublicRoute]);

  useEffect(() => {
    if (recapPeriod === "daily") {
      setRecapEndDate(recapStartDate);
    } else if (recapPeriod === "monthly") {
      const startDate = parseISO(recapStartDate);
      const endDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        0,
      );
      setRecapEndDate(format(endDate, "yyyy-MM-dd"));
    } else if (recapPeriod === "semester") {
      const startDate = parseISO(recapStartDate);
      const endDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 6,
        0,
      );
      setRecapEndDate(format(endDate, "yyyy-MM-dd"));
    }
  }, [recapPeriod, recapStartDate]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthenticating(true);

    try {
      await verifyPublicPassword(password);
      setIsAuthenticated(true);
      showToast("Autentikasi berhasil", "success");
    } catch (err: any) {
      showToast(err.message || "Password salah", "error");
    } finally {
      setAuthenticating(false);
    }
  };

  const fetchRecapData = async () => {
    if (!selectedClass || !recapPeriod || !recapStartDate) return;

    setLoading(true);

    try {
      let data;
      if (isPublicRoute || !token) {
        // Use public endpoint
        data = await fetchPublicAttendanceRecap({
          classId: selectedClass,
          period: recapPeriod,
          startDate: recapStartDate,
          endDate: recapEndDate,
          password: password,
        });
      } else {
        // Use authenticated endpoint
        data = await fetchAttendanceRecap(
          {
            classId: selectedClass,
            period: recapPeriod,
            startDate: recapStartDate,
            endDate: recapEndDate,
          },
          token,
        );
      }
      setRecapData(data.data);
    } catch (err: any) {
      showToast(err.message || "Gagal mengambil data rekap presensi", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Exports attendance data to the specified format (Excel or PDF).
   * Creates a download link for the exported file and initiates the download.
   * @param {"excel" | "pdf"} format - The export format.
   */
  const exportData = async (format: "excel" | "pdf") => {
    if (!token) return;

    if (!selectedClass || !recapPeriod || !recapStartDate) {
      showToast("Pilih kelas, periode, dan tanggal terlebih dahulu", "error");
      return;
    }

    setLoading(true);

    try {
      const blob = await exportAttendanceData(
        {
          classId: selectedClass,
          period: recapPeriod,
          startDate: recapStartDate,
          endDate: recapEndDate,
          format: format,
        },
        token,
      );

      const contentDisposition = blob.type.includes("application")
        ? `attachment; filename="rekap_presensi_${recapPeriod}_${selectedClass}.${format === "excel" ? "xlsx" : "pdf"}"`
        : "";

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `rekap_presensi_${recapPeriod}_${selectedClass}.${format === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      showToast(`Data berhasil diekspor ke ${format.toUpperCase()}`, "success");
    } catch (err: any) {
      showToast(
        err.message || `Gagal mengekspor data ke ${format.toUpperCase()}`,
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  // If not authenticated and this is a public route, show password form
  if (!isAuthenticated && isPublicRoute) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground">
        {/* Left: Illustration */}
        <div className="hidden lg:flex lg:w-1/2 bg-accent items-center justify-center p-12 relative overflow-hidden">
          {/* Background decoration pattern (optional) */}
          <div className="absolute inset-0 opacity-10 pattern-dots"></div>

          <div className="max-w-lg text-center space-y-8 relative z-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 inline-block">
              <GraduationCap className="w-24 h-24 text-white mx-auto" />
            </div>
            <div className="text-white space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                Portal Informasi Kehadiran Siswa
              </h1>
              <p className="text-lg text-white/90">
                Akses rekapitulasi kehadiran siswa secara transparan dan akurat.
                Masukkan kode akses yang telah diberikan oleh pihak sekolah.
              </p>
            </div>
            <img
              src={illustrationUrl}
              alt="Education Illustration"
              className="w-full max-w-md mx-auto rounded-2xl  transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background relative">
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-semibackground rounded-2xl shadow-xl p-8 space-y-8 border border-gray-100 dark:border-gray-800">
              {/* Header Section */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                  <Lock className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Verifikasi Akses
                </h2>
                <p className="text-secondary text-sm">
                  Halaman ini dilindungi. Silakan masukkan password untuk
                  melihat data.
                </p>
              </div>

              {/* Form Section */}
              <form className="space-y-6" onSubmit={handlePasswordSubmit}>
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-foreground"
                  >
                    Password Akses
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-accent transition-colors" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent bg-gray-50 dark:bg-gray-800/50 text-foreground placeholder-gray-400 transition-all duration-200 ease-in-out"
                      placeholder="Masukkan password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-accent transition-colors focus:outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={authenticating || !password}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-accent hover:bg-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {authenticating ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Memverifikasi...
                      </span>
                    ) : (
                      "Buka Data Rekap"
                    )}
                  </button>
                </div>
              </form>

              {/* Footer / Info */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-center text-xs text-secondary">
                  Butuh bantuan? Hubungi Guru BK atau Administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Theme toggle */}
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      </div>
    );
  }

  // Determine which layout to use based on route
  const LayoutComponent = isPublicRoute ? Layout : AdminLayout;

  return (
    <LayoutComponent>
      <div className="container mx-auto px-4 sm:px-6 py-12 fade-in">
        <div className="mb-8">
          {!isPublicRoute && (
            <Link
              to="/atmin/presensi"
              className="text-sm text-secondary hover:text-accent flex items-center mb-4 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Kembali
            </Link>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-serif font-bold text-foreground mb-4 sm:mb-0">
              Rekap Presensi Siswa
            </h1>
            {isPublicRoute && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsAuthenticated(false)}
              >
                Keluar
              </button>
            )}
          </div>
        </div>

        {/* View Toggle - only show for authenticated admin users */}
        {!isPublicRoute && (
          <div className="card p-6 mb-6">
            <div className="flex space-x-1 border-b border-zinc-800">
              <button
                className={`py-2 px-4 text-sm font-medium ${
                  activeView === "recap"
                    ? "border-b-2 border-accent text-accent"
                    : "text-secondary hover:text-foreground"
                }`}
                onClick={() => setActiveView("recap")}
              >
                Rekap Presensi
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium ${
                  activeView === "analysis"
                    ? "border-b-2 border-accent text-accent"
                    : "text-secondary hover:text-foreground"
                }`}
                onClick={() => setActiveView("analysis")}
              >
                Analisis Alpa
              </button>
            </div>
          </div>
        )}

        {/* Content based on active view */}
        {activeView === "recap" ? (
          <div className="card p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label
                  htmlFor="class"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Kelas
                </label>
                <select
                  id="class"
                  className="form-input w-full"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(Number(e.target.value))}
                  disabled={loading}
                >
                  <option value={0}>Pilih Kelas</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.academic_year} - {cls.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="period"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Periode
                </label>
                <select
                  id="period"
                  className="form-input w-full"
                  value={recapPeriod}
                  onChange={(e) =>
                    setRecapPeriod(
                      e.target.value as "daily" | "monthly" | "semester",
                    )
                  }
                  disabled={loading}
                >
                  <option value="daily">Harian</option>
                  <option value="monthly">Bulanan</option>
                  <option value="semester">Semesteran</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="form-input w-full"
                  value={recapStartDate}
                  onChange={(e) => setRecapStartDate(e.target.value)}
                  disabled={loading}
                />
              </div>

              {recapPeriod !== "daily" && (
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    className="form-input w-full"
                    value={recapEndDate}
                    onChange={(e) => setRecapEndDate(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end mb-6">
              <button
                type="button"
                className="btn btn-primary"
                onClick={fetchRecapData}
                disabled={loading || selectedClass === 0}
              >
                {loading ? "Memuat..." : "Tampilkan Data"}
              </button>

              {/* Export buttons only for authenticated admin users */}
              {isAdminOrGuruBK && !isPublicRoute && (
                <div className="flex space-x-2 ml-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => exportData("excel")}
                    disabled={loading || selectedClass === 0}
                  >
                    Export Excel
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => exportData("pdf")}
                    disabled={loading || selectedClass === 0}
                  >
                    Export PDF
                  </button>
                </div>
              )}
            </div>

            {selectedClass > 0 ? (
              recapData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[rgb(var(--color-secondary)/0.2)]">
                    <thead className="bg-[rgb(var(--color-semi-background))]">
                      <tr>
                        <th
                          scope="col"
                          className="px-2 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                        >
                          No
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                        >
                          NISN
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                        >
                          Nama
                        </th>
                        {recapPeriod !== "daily" && (
                          <>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                            >
                              Total Hari
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                            >
                              Hadir
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                            >
                              Izin
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                            >
                              Sakit
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                            >
                              Alpa
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                            >
                              %
                            </th>
                          </>
                        )}
                        {recapPeriod === "daily" && (
                          <>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                            >
                              Status
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                            >
                              Keterangan
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgb(var(--color-secondary)/0.1)]">
                      {recapData.map((student, index) => (
                        <tr key={student.id}>
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-secondary">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                            {student.nisn}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                            {student.name}
                          </td>
                          {recapPeriod !== "daily" && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                                {student.total_hari}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                                {student.hadir}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                                {student.izin}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                                {student.sakit}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                                {student.alpa}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                                {student.persentase_kehadiran}%
                              </td>
                            </>
                          )}
                          {recapPeriod === "daily" && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    student.status === "hadir"
                                      ? "bg-success/10 text-success"
                                      : student.status === "izin"
                                        ? "bg-warning/10 text-warning"
                                        : student.status === "sakit"
                                          ? "bg-info/10 text-info"
                                          : "bg-error/10 text-error"
                                  }`}
                                >
                                  {student.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                                {student.notes || "-"}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-secondary">
                    Tidak ada data presensi untuk periode yang dipilih
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <p className="text-secondary">
                  Silakan pilih kelas terlebih dahulu
                </p>
              </div>
            )}
          </div>
        ) : (
          // Properly wrapped in a card container
          <div className="card p-6">
            <AbsenceAnalysisTabs />
          </div>
        )}
      </div>
    </LayoutComponent>
  );
};

export default AttendanceRecapPage;
