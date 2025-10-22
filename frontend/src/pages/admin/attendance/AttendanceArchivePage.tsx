import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import AdminLayout from "../../../components/layout/AdminLayout";
import Toast from "../../../components/ui/Toast";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

interface ArchiveData {
  id: number;
  student_id: number;
  nisn: string;
  name: string;
  class_id: number;
  class_name: string;
  academic_year: string;
  semester: string;
  total_hadir: number;
  total_izin: number;
  total_sakit: number;
  total_alpa: number;
  total_libur: number;
  percentage_kehadiran: number;
  archived_at: string;
}

interface ClassData {
  id: number;
  name: string;
  academic_year: string;
  semester: string;
}

const API_URL = import.meta.env.VITE_BACKEND_API_URL;
const ALLOWED_ROLES = ["guru_bk", "super_admin"] as const;

const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

const AttendanceArchivePage: React.FC = () => {
  const { isLoggedIn, user, token } = useAuth();
  const navigate = useNavigate();

  const [classes, setClasses] = useState<ClassData[]>([]);
  const [archiveRecords, setArchiveRecords] = useState<ArchiveData[]>([]); // Diubah nama variabel
  const [toasts, setToasts] = useState<
    { id: string; message: string; type: "success" | "error" }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>(
    format(new Date(), "yyyy")
  );
  const [selectedSemester, setSelectedSemester] = useState<string>("ganjil");
  const [selectedClass, setSelectedClass] = useState<number>(0);

  const isAdminOrGuruBK = hasEditAccess(isLoggedIn, user?.role);

  const addToast = (message: string, type: "success" | "error") => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

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

  // Fetch archive data
  useEffect(() => {
    const fetchArchiveData = async () => {
      try {
        let url = `${API_URL}/api/attendance/archive?academicYear=${selectedYear}&semester=${selectedSemester}`;

        if (selectedClass > 0) {
          url += `&classId=${selectedClass}`;
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setArchiveRecords(data); // Diubah nama variabel
        } else {
          addToast("Gagal mengambil data arsip presensi", "error");
        }
      } catch (err) {
        addToast(
          "Terjadi kesalahan saat mengambil data arsip presensi",
          "error"
        );
      }
    };

    if (isLoggedIn) {
      fetchArchiveData();
    }
  }, [isLoggedIn, selectedYear, selectedSemester, selectedClass, token]);

  // Archive data - fungsi ini yang menyebabkan error
  const handleArchiveData = async () => {
    // Diubah nama fungsi
    if (!selectedYear || !selectedSemester) {
      addToast("Pilih tahun ajaran dan semester terlebih dahulu", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/attendance/archive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          academicYear: selectedYear,
          semester: selectedSemester,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        addToast(
          data.message || "Data presensi berhasil diarsipkan",
          "success"
        );

        // Refresh archive data
        const archiveResponse = await fetch(
          `${API_URL}/api/attendance/archive?academicYear=${selectedYear}&semester=${selectedSemester}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (archiveResponse.ok) {
          const archiveData = await archiveResponse.json();
          setArchiveRecords(archiveData); // Diubah nama variabel
        }
      } else {
        addToast(data.error || "Gagal mengarsipkan data presensi", "error");
      }
    } catch (err) {
      addToast("Terjadi kesalahan saat mengarsipkan data presensi", "error");
    } finally {
      setLoading(false);
    }
  };

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
            Arsip Presensi Siswa
          </h1>
        </div>

        <div className="bg-white dark:bg-semibackground rounded-xl shadow-md p-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label
                htmlFor="year"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Tahun Ajaran
              </label>
              <input
                type="text"
                id="year"
                className="form-input w-full"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                placeholder="Contoh: 2025/2026"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="semester"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Semester
              </label>
              <select
                id="semester"
                className="form-input w-full"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                disabled={loading}
              >
                <option value="ganjil">Ganjil</option>
                <option value="genap">Genap</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="class"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Kelas (Opsional)
              </label>
              <select
                id="class"
                className="form-input w-full"
                value={selectedClass}
                onChange={(e) => setSelectedClass(Number(e.target.value))}
                disabled={loading}
              >
                <option value={0}>Semua Kelas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {isAdminOrGuruBK && (
              <div className="flex items-end">
                <button
                  type="button"
                  className="btn btn-primary w-full"
                  onClick={handleArchiveData} // Diubah nama fungsi
                  disabled={loading}
                >
                  {loading ? "Mengarsipkan..." : "Arsipkan Data"}
                </button>
              </div>
            )}
          </div>

          {/* Archive Table */}
          {archiveRecords.length > 0 ? ( // Diubah nama variabel
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
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Kelas
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
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {archiveRecords.map(
                    (
                      student // Diubah nama variabel
                    ) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {student.nisn}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {student.class_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {student.total_hadir}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {student.total_izin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {student.total_sakit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {student.total_alpa}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {student.percentage_kehadiran}%
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Tidak ada data arsip untuk filter yang dipilih
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

export default AttendanceArchivePage;
