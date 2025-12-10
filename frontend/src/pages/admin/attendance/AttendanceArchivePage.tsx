/**
 * @fileoverview Attendance Archive Page component for the admin panel.
 * This component provides an interface for viewing and archiving student attendance data.
 * It allows filtering by academic year, semester, and class, and displays attendance statistics
 * including presence, permission, sick leave, and absence counts with attendance percentages.
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import AdminLayout from "../../../components/layout/AdminLayout";
import { format } from "date-fns";
import { ChevronLeft } from "lucide-react";

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

const backendUrl =
  import.meta.env.VITE_BACKEND_URL || "https://backend.man3kulonprogo.sch.id";
const ALLOWED_ROLES = ["guru_bk", "super_admin"] as const;

/**
 * Checks if a user has permission to access attendance archive based on their role.
 * @param {boolean} isLoggedIn - The user's login status.
 * @param {string | undefined} role - The user's role.
 * @returns {boolean} True if the user has access, otherwise false.
 */
const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

/**
 * Component for managing and viewing archived student attendance data.
 * Provides filtering options by academic year, semester, and class, and displays
 * attendance statistics in a tabular format. Allows authorized users to archive
 * current attendance data for historical reference.
 */
const AttendanceArchivePage: React.FC = () => {
  const { isLoggedIn, user, token } = useAuth();
  const navigate = useNavigate();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [classes, setClasses] = useState<ClassData[]>([]);
  const [archiveRecords, setArchiveRecords] = useState<ArchiveData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>(
    format(new Date(), "yyyy")
  );
  const [selectedSemester, setSelectedSemester] = useState<string>("ganjil");
  const [selectedClass, setSelectedClass] = useState<number>(0);

  const isAdminOrGuruBK = hasEditAccess(isLoggedIn, user?.role);

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
          showErrorToast("Gagal mengambil data kelas");
        }
      } catch (err) {
        showErrorToast("Terjadi kesalahan saat mengambil data kelas");
      }
    };

    if (isLoggedIn) {
      fetchClasses();
    }
  }, [isLoggedIn, token, showErrorToast]);

  useEffect(() => {
    const fetchArchiveData = async () => {
      try {
        let url = `${backendUrl}/api/attendance/archive?academicYear=${selectedYear}&semester=${selectedSemester}`;

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
          setArchiveRecords(data);
        } else {
          showErrorToast("Gagal mengambil data arsip presensi");
        }
      } catch (err) {
        showErrorToast("Terjadi kesalahan saat mengambil data arsip presensi");
      }
    };

    if (isLoggedIn) {
      fetchArchiveData();
    }
  }, [
    isLoggedIn,
    selectedYear,
    selectedSemester,
    selectedClass,
    token,
    showErrorToast,
  ]);

  /**
   * Archives attendance data for the selected academic year and semester.
   * Makes a POST request to the server and refreshes the archive records on success.
   */
  const handleArchiveData = async () => {
    if (!selectedYear || !selectedSemester) {
      showErrorToast("Pilih tahun ajaran dan semester terlebih dahulu");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/attendance/archive`, {
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
        showSuccessToast(data.message || "Data presensi berhasil diarsipkan");

        const archiveResponse = await fetch(
          `${backendUrl}/api/attendance/archive?academicYear=${selectedYear}&semester=${selectedSemester}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (archiveResponse.ok) {
          const archiveData = await archiveResponse.json();
          setArchiveRecords(archiveData);
        }
      } else {
        showErrorToast(data.error || "Gagal mengarsipkan data presensi");
      }
    } catch (err) {
      showErrorToast("Terjadi kesalahan saat mengarsipkan data presensi");
    } finally {
      setLoading(false);
    }
  };

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
              Arsip Presensi Siswa
            </h1>
          </div>
        </div>

        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label
                htmlFor="year"
                className="block text-sm font-medium text-foreground mb-1"
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
                className="block text-sm font-medium text-foreground mb-1"
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
                className="block text-sm font-medium text-foreground mb-1"
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
                  onClick={handleArchiveData}
                  disabled={loading}
                >
                  {loading ? "Mengarsipkan..." : "Arsipkan Data"}
                </button>
              </div>
            )}
          </div>

          {archiveRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[rgb(var(--color-secondary)/0.2)]">
                <thead className="bg-[rgb(var(--color-semi-background))]">
                  <tr>
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
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                    >
                      Kelas
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--color-secondary)/0.1)]">
                  {archiveRecords.map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {student.nisn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {student.class_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {student.total_hadir}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {student.total_izin}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {student.total_sakit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {student.total_alpa}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {student.percentage_kehadiran}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-secondary">
                Tidak ada data arsip untuk filter yang dipilih
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AttendanceArchivePage;
