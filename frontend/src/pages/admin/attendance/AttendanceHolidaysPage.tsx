/**
 * @fileoverview Attendance Holidays Page component for the admin panel.
 * This component provides an interface for managing holidays that affect attendance tracking.
 * It allows authorized users to add and delete holidays, and displays a list of all holidays
 * with their dates, descriptions, and academic years.
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import AdminLayout from "../../../components/layout/AdminLayout";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft } from "lucide-react";

/**
 * Interface representing a holiday record in the system.
 */
interface Holiday {
  id: number;
  date: string;
  description: string;
  academic_year: string;
}

const API_URL = import.meta.env.VITE_BACKEND_API_URL;
const ALLOWED_ROLES = ["guru_bk", "super_admin"] as const;

/**
 * Checks if a user has permission to manage holidays based on their role.
 * @param {boolean} isLoggedIn - The user's login status.
 * @param {string | undefined} role - The user's role.
 * @returns {boolean} True if the user has access, otherwise false.
 */
const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

/**
 * Component for managing holidays that affect attendance tracking.
 * Provides functionality to add, view, and delete holidays with appropriate role-based access control.
 * Displays holidays in a tabular format with formatted dates and descriptions.
 */
const AttendanceHolidaysPage: React.FC = () => {
  const { isLoggedIn, user, token } = useAuth();
  const navigate = useNavigate();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [newHoliday, setNewHoliday] = useState<{
    date: string;
    description: string;
  }>({ date: "", description: "" });

  const isAdminOrGuruBK = hasEditAccess(isLoggedIn, user?.role);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await fetch(`${API_URL}/api/attendance/holidays`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setHolidays(data);
        } else {
          showErrorToast("Gagal mengambil data hari libur");
        }
      } catch (err) {
        showErrorToast("Terjadi kesalahan saat mengambil data hari libur");
      }
    };

    if (isLoggedIn) {
      fetchHolidays();
    }
  }, [isLoggedIn, token, showErrorToast]);

  /**
   * Adds a new holiday to the system.
   * Sends a POST request with the holiday data and refreshes the holidays list on success.
   */
  const addHoliday = async () => {
    if (!newHoliday.date || !newHoliday.description) {
      showErrorToast("Tanggal dan keterangan harus diisi");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/attendance/holidays`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: newHoliday.date,
          description: newHoliday.description,
          academicYear: format(new Date(), "yyyy/yyyy"),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showSuccessToast(data.message || "Hari libur berhasil ditambahkan");
        setNewHoliday({ date: "", description: "" });

        const holidaysResponse = await fetch(
          `${API_URL}/api/attendance/holidays`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (holidaysResponse.ok) {
          const holidaysData = await holidaysResponse.json();
          setHolidays(holidaysData);
        }
      } else {
        showErrorToast(data.error || "Gagal menambahkan hari libur");
      }
    } catch (err) {
      showErrorToast("Terjadi kesalahan saat menambahkan hari libur");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deletes a holiday from the system.
   * Sends a DELETE request with the holiday ID and refreshes the holidays list on success.
   * @param {number} id - The ID of the holiday to delete.
   */
  const deleteHoliday = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus hari libur ini?")) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/attendance/holidays/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showSuccessToast(data.message || "Hari libur berhasil dihapus");

        const holidaysResponse = await fetch(
          `${API_URL}/api/attendance/holidays`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (holidaysResponse.ok) {
          const holidaysData = await holidaysResponse.json();
          setHolidays(holidaysData);
        }
      } else {
        showErrorToast(data.error || "Gagal menghapus hari libur");
      }
    } catch (err) {
      showErrorToast("Terjadi kesalahan saat menghapus hari libur");
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
              Manajemen Hari Libur
            </h1>
          </div>

          <div className="card p-6 mt-8">
            {isAdminOrGuruBK ? (
              <>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Tambah Hari Libur
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label
                        htmlFor="holidayDate"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        Tanggal
                      </label>
                      <input
                        type="date"
                        id="holidayDate"
                        className="form-input w-full"
                        value={newHoliday.date}
                        onChange={(e) =>
                          setNewHoliday({ ...newHoliday, date: e.target.value })
                        }
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="holidayDescription"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        Keterangan
                      </label>
                      <input
                        type="text"
                        id="holidayDescription"
                        className="form-input w-full"
                        value={newHoliday.description}
                        onChange={(e) =>
                          setNewHoliday({
                            ...newHoliday,
                            description: e.target.value,
                          })
                        }
                        placeholder="Contoh: Hari Raya Idul Fitri"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={addHoliday}
                      disabled={loading}
                    >
                      {loading ? "Menyimpan..." : "Tambah Hari Libur"}
                    </button>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Daftar Hari Libur
                  </h2>

                  {holidays.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-[rgb(var(--color-secondary)/0.2)]">
                        <thead className="bg-[rgb(var(--color-semi-background))]">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                            >
                              Tanggal
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                            >
                              Keterangan
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                            >
                              Tahun Ajaran
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                            >
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgb(var(--color-secondary)/0.1)]">
                          {holidays.map((holiday) => (
                            <tr key={holiday.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                                {format(
                                  parseISO(holiday.date),
                                  "dd MMMM yyyy",
                                  {
                                    locale: id,
                                  }
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                {holiday.description}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                                {holiday.academic_year}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                  type="button"
                                  className="text-error hover:text-error/80 transition-colors"
                                  onClick={() => deleteHoliday(holiday.id)}
                                  disabled={loading}
                                >
                                  Hapus
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-secondary">
                        Belum ada data hari libur
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-secondary">
                  Anda tidak memiliki akses untuk mengelola hari libur. Silakan
                  hubungi Guru BK atau Super Admin.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AttendanceHolidaysPage;
