// src/pages/admin/attendance/AttendanceHolidaysPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import AdminLayout from "../../../components/layout/AdminLayout";
import Toast from "../../../components/ui/Toast";
import { v4 as uuidv4 } from "uuid";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

interface Holiday {
  id: number;
  date: string;
  description: string;
  academic_year: string;
}

const API_URL = import.meta.env.VITE_BACKEND_API_URL;
const ALLOWED_ROLES = ["guru_bk", "super_admin"] as const;

const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

const AttendanceHolidaysPage: React.FC = () => {
  const { isLoggedIn, user, token } = useAuth();
  const navigate = useNavigate();

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [toasts, setToasts] = useState<
    { id: string; message: string; type: "success" | "error" }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [newHoliday, setNewHoliday] = useState<{
    date: string;
    description: string;
  }>({ date: "", description: "" });

  const isAdminOrGuruBK = hasEditAccess(isLoggedIn, user?.role);

  const addToast = (message: string, type: "success" | "error") => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Fetch holidays
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
          addToast("Gagal mengambil data hari libur", "error");
        }
      } catch (err) {
        addToast("Terjadi kesalahan saat mengambil data hari libur", "error");
      }
    };

    if (isLoggedIn) {
      fetchHolidays();
    }
  }, [isLoggedIn, token]);

  // Add holiday
  const addHoliday = async () => {
    if (!newHoliday.date || !newHoliday.description) {
      addToast("Tanggal dan keterangan harus diisi", "error");
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
        addToast(data.message || "Hari libur berhasil ditambahkan", "success");
        setNewHoliday({ date: "", description: "" });

        // Refresh holidays list
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
        addToast(data.error || "Gagal menambahkan hari libur", "error");
      }
    } catch (err) {
      addToast("Terjadi kesalahan saat menambahkan hari libur", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete holiday
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
        addToast(data.message || "Hari libur berhasil dihapus", "success");

        // Refresh holidays list
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
        addToast(data.error || "Gagal menghapus hari libur", "error");
      }
    } catch (err) {
      addToast("Terjadi kesalahan saat menghapus hari libur", "error");
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
            Manajemen Hari Libur
          </h1>
        </div>

        <div className="bg-white dark:bg-semibackground rounded-xl shadow-md p-6">
          {isAdminOrGuruBK ? (
            <>
              {/* Add Holiday Form */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  Tambah Hari Libur
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label
                      htmlFor="holidayDate"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
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
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
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

              {/* Holidays List */}
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Daftar Hari Libur
                </h2>

                {holidays.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Tanggal
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Keterangan
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Tahun Ajaran
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {holidays.map((holiday) => (
                          <tr key={holiday.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {format(parseISO(holiday.date), "dd MMMM yyyy", {
                                locale: id,
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {holiday.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {holiday.academic_year}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                type="button"
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
                    <p className="text-gray-500 dark:text-gray-400">
                      Belum ada data hari libur
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Anda tidak memiliki akses untuk mengelola hari libur. Silakan
                hubungi Guru BK atau Super Admin.
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

export default AttendanceHolidaysPage;
