/**
 * @fileoverview Attendance Recap Page component for the admin panel.
 * This component provides an interface for viewing and exporting attendance recapitulation data.
 * It allows filtering by class, period (daily, monthly, or semester), and date range, and displays
 * attendance statistics in a tabular format with options to export to Excel or PDF.
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import AdminLayout from "../../../components/layout/AdminLayout";
import { useToast } from "../../../contexts/ToastContext";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft } from "lucide-react";
import AbsenceAnalysisTabs from "../../../components/attendance/AbsenceAnalysisTabs";

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
 */
const AttendanceRecapPage: React.FC = () => {
  const { isLoggedIn, user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

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

  const isAdminOrGuruBK = hasEditAccess(isLoggedIn, user?.role);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const classId = params.get("classId");
    if (classId) {
      setSelectedClass(Number(classId));
    }
  }, [location.search]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/attendance/classes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setClasses(data);
        } else {
          showToast("Gagal mengambil data kelas", "error");
        }
      } catch (err) {
        showToast("Terjadi kesalahan saat mengambil data kelas", "error");
      }
    };

    if (isLoggedIn) {
      fetchClasses();
    }
  }, [isLoggedIn, token, showToast]);

  useEffect(() => {
    const fetchRecapData = async () => {
      if (!selectedClass || !recapPeriod || !recapStartDate) return;

      let url = `${backendUrl}/api/attendance/recap?classId=${selectedClass}&period=${recapPeriod}&startDate=${recapStartDate}`;

      if (recapPeriod !== "daily" && recapEndDate) {
        url += `&endDate=${recapEndDate}`;
      }

      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setRecapData(data.data);
        } else {
          showToast("Gagal mengambil data rekap presensi", "error");
        }
      } catch (err) {
        showToast(
          "Terjadi kesalahan saat mengambil data rekap presensi",
          "error",
        );
      }
    };

    if (isLoggedIn && selectedClass) {
      fetchRecapData();
    }
  }, [
    isLoggedIn,
    selectedClass,
    recapPeriod,
    recapStartDate,
    recapEndDate,
    token,
    showToast,
  ]);

  /**
   * Exports attendance data to the specified format (Excel or PDF).
   * Creates a download link for the exported file and initiates the download.
   * @param {"excel" | "pdf"} format - The export format.
   */
  const exportData = async (format: "excel" | "pdf") => {
    if (!selectedClass || !recapPeriod || !recapStartDate) {
      showToast("Pilih kelas, periode, dan tanggal terlebih dahulu", "error");
      return;
    }

    setLoading(true);

    try {
      let url = `${backendUrl}/api/attendance/export?classId=${selectedClass}&period=${recapPeriod}&startDate=${recapStartDate}&format=${format}`;

      if (recapPeriod !== "daily" && recapEndDate) {
        url += `&endDate=${recapEndDate}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const contentDisposition = response.headers.get("Content-Disposition");
        let filename = `rekap_presensi_${recapPeriod}_${selectedClass}.${
          format === "excel" ? "xlsx" : "pdf"
        }`;

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }

        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);

        showToast(
          `Data berhasil diekspor ke ${format.toUpperCase()}`,
          "success",
        );
      } else {
        const data = await response.json();
        showToast(
          data.error || `Gagal mengekspor data ke ${format.toUpperCase()}`,
          "error",
        );
      }
    } catch (err) {
      showToast(
        `Terjadi kesalahan saat mengekspor data ke ${format.toUpperCase()}`,
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

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

  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-12 fade-in">
        <div className="mb-8">
          <Link
            to="/atmin/presensi"
            className="text-sm text-secondary hover:text-accent flex items-center mb-4 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Kembali
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-serif font-bold text-foreground mb-4 sm:mb-0">
              Rekap Presensi Siswa
            </h1>
          </div>
        </div>

        {/* View Toggle */}
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

            {isAdminOrGuruBK && (
              <div className="flex justify-end mb-6">
                <div className="flex space-x-2">
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
              </div>
            )}

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
    </AdminLayout>
  );
};

export default AttendanceRecapPage;
