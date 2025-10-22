// src/pages/admin/attendance/AttendanceRecapPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import AdminLayout from "../../../components/layout/AdminLayout";
import Toast from "../../../components/ui/Toast";
import { v4 as uuidv4 } from "uuid";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

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

const API_URL = import.meta.env.VITE_BACKEND_API_URL;
const ALLOWED_ROLES = ["guru_bk", "super_admin"] as const;

const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

const AttendanceRecapPage: React.FC = () => {
  const { isLoggedIn, user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<number>(0);
  const [recapData, setRecapData] = useState<RecapData[]>([]);
  const [toasts, setToasts] = useState<
    { id: string; message: string; type: "success" | "error" }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [recapPeriod, setRecapPeriod] = useState<
    "daily" | "monthly" | "semester"
  >("daily");
  const [recapStartDate, setRecapStartDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [recapEndDate, setRecapEndDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );

  const isAdminOrGuruBK = hasEditAccess(isLoggedIn, user?.role);

  const addToast = (message: string, type: "success" | "error") => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Get classId from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const classId = params.get("classId");
    if (classId) {
      setSelectedClass(Number(classId));
    }
  }, [location.search]);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(`${API_URL}/api/attendance/classes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setClasses(data);
        } else {
          addToast("Gagal mengambil data kelas", "error");
        }
      } catch (err) {
        addToast("Terjadi kesalahan saat mengambil data kelas", "error");
      }
    };

    if (isLoggedIn) {
      fetchClasses();
    }
  }, [isLoggedIn, token]);

  // Fetch recap data
  useEffect(() => {
    const fetchRecapData = async () => {
      if (!selectedClass || !recapPeriod || !recapStartDate) return;

      let url = `${API_URL}/api/attendance/recap?classId=${selectedClass}&period=${recapPeriod}&startDate=${recapStartDate}`;

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
          addToast("Gagal mengambil data rekap presensi", "error");
        }
      } catch (err) {
        addToast(
          "Terjadi kesalahan saat mengambil data rekap presensi",
          "error"
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
  ]);

  // Export data
  const exportData = async (format: "excel" | "pdf") => {
    if (!selectedClass || !recapPeriod || !recapStartDate) {
      addToast("Pilih kelas, periode, dan tanggal terlebih dahulu", "error");
      return;
    }

    setLoading(true);

    try {
      let url = `${API_URL}/api/attendance/export?classId=${selectedClass}&period=${recapPeriod}&startDate=${recapStartDate}&format=${format}`;

      if (recapPeriod !== "daily" && recapEndDate) {
        url += `&endDate=${recapEndDate}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Get filename from response headers
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

        // Create blob and download
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);

        addToast(
          `Data berhasil diekspor ke ${format.toUpperCase()}`,
          "success"
        );
      } else {
        const data = await response.json();
        addToast(
          data.error || `Gagal mengekspor data ke ${format.toUpperCase()}`,
          "error"
        );
      }
    } catch (err) {
      addToast(
        `Terjadi kesalahan saat mengekspor data ke ${format.toUpperCase()}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Update recap end date when period changes
  useEffect(() => {
    if (recapPeriod === "daily") {
      setRecapEndDate(recapStartDate);
    } else if (recapPeriod === "monthly") {
      const startDate = parseISO(recapStartDate);
      const endDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        0
      );
      setRecapEndDate(format(endDate, "yyyy-MM-dd"));
    } else if (recapPeriod === "semester") {
      const startDate = parseISO(recapStartDate);
      const endDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 6,
        0
      );
      setRecapEndDate(format(endDate, "yyyy-MM-dd"));
    }
  }, [recapPeriod, recapStartDate]);

  const SelectedLayout = isAdminOrGuruBK ? AdminLayout : AdminLayout;

  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }

  return (
    <SelectedLayout>
      <div className="container mx-auto px-4 sm:px-6 py-12 fade-in">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/atmin/presensi")}
            className="mr-4 text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent transition-colors"
          >
            ← Kembali
          </button>
          <h1 className="text-3xl font-serif font-bold">
            Rekap Presensi Siswa
          </h1>
        </div>

        <div className="bg-white dark:bg-semibackground rounded-xl shadow-md p-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label
                htmlFor="class"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
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
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Periode
              </label>
              <select
                id="period"
                className="form-input w-full"
                value={recapPeriod}
                onChange={(e) =>
                  setRecapPeriod(
                    e.target.value as "daily" | "monthly" | "semester"
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
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
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
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
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

          {/* Export buttons */}
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

          {/* Recap Table */}
          {selectedClass > 0 ? (
            recapData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        NISN
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Nama
                      </th>
                      {recapPeriod !== "daily" && (
                        <>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Total Hari
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Hadir
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Izin
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Sakit
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Alpa
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            %
                          </th>
                        </>
                      )}
                      {recapPeriod === "daily" && (
                        <>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Keterangan
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {recapData.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {student.nisn}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {student.name}
                        </td>
                        {recapPeriod !== "daily" && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {student.total_hari}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {student.hadir}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {student.izin}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {student.sakit}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {student.alpa}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
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
                                    ? "bg-green-100 text-green-800"
                                    : student.status === "izin"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : student.status === "sakit"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {student.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
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
                <p className="text-gray-500 dark:text-gray-400">
                  Tidak ada data presensi untuk periode yang dipilih
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Silakan pilih kelas terlebih dahulu
              </p>
            </div>
          )}
        </div>

        {toasts.map((toast, index) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            isVisible={true}
            onClose={() => removeToast(toast.id)}
            index={index}
          />
        ))}
      </div>
    </SelectedLayout>
  );
};

export default AttendanceRecapPage;
