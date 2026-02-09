/**
 * @fileoverview Component for managing holidays in the attendance system.
 * This component provides functionality to view, add, and delete holidays.
 * It displays a form for adding new holidays and a table showing all existing holidays.
 */

import { useState, useEffect } from "react";
import {
  fetchHolidays,
  addHoliday,
  deleteHoliday,
} from "../../api/attendanceApi";
import { useAuth } from "../../contexts/AuthContext";
import { useToastMessage } from "../../hooks/useToastMessage";
import { Trash2, CalendarPlus } from "lucide-react";

/**
 * Interface representing a holiday object
 * @interface Holiday
 * @property {number} id - The unique identifier for the holiday
 * @property {string} date - The date of the holiday in YYYY-MM-DD format
 * @property {string} description - Description or name of the holiday
 * @property {string} academic_year - The academic year the holiday belongs to
 */

interface Holiday {
  id: number;
  date: string;
  description: string;
  academic_year: string;
}

/**
 * Component for managing holidays in the attendance system.
 * Provides functionality to view, add, and delete holidays.
 *
 * @returns {JSX.Element} The rendered HolidayManagement component
 */
const HolidayManagement = () => {
  const { token } = useAuth();
  const { showSuccessToast, showErrorToast, showWarningToast } =
    useToastMessage();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [newHoliday, setNewHoliday] = useState({
    date: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  /**
   * Generates the current academic year in the format YYYY/YYYY+1
   * @returns {string} The academic year string (e.g., "2024/2025")
   */
  const getCurrentAcademicYear = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // If month is June or earlier, academic year is previous year/current year
    // If month is July or later, academic year is current year/next year
    if (currentMonth < 6) {
      return `${currentYear - 1}/${currentYear}`;
    } else {
      return `${currentYear}/${currentYear + 1}`;
    }
  };

  useEffect(() => {
    const loadHolidays = async () => {
      try {
        const data = await fetchHolidays(token || "");
        // Sort holidays by date in descending order (newest first)
        const sortedHolidays = data.sort(
          (a: Holiday, b: Holiday) =>
            new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setHolidays(sortedHolidays);
      } catch (error) {
        showErrorToast("Gagal memuat data hari libur");
      }
    };

    if (token) loadHolidays();
  }, [token, showErrorToast]);

  /**
   * Handles the addition of a new holiday
   * Validates input, sends API request, and refreshes the holiday list
   */
  const handleAddHoliday = async () => {
    if (!newHoliday.date || !newHoliday.description) {
      showWarningToast("Tanggal dan keterangan harus diisi");
      return;
    }

    setLoading(true);
    try {
      await addHoliday(
        {
          ...newHoliday,
          academicYear: getCurrentAcademicYear(), // Fixed: Use proper academic year format
        },
        token || "",
      );
      setNewHoliday({ date: "", description: "" });
      showSuccessToast("Hari libur berhasil ditambahkan");
      const updatedHolidays = await fetchHolidays(token || "");
      // Sort holidays by date in descending order (newest first)
      const sortedHolidays = updatedHolidays.sort(
        (a: Holiday, b: Holiday) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setHolidays(sortedHolidays);
    } catch (error) {
      showErrorToast("Gagal menambah hari libur");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the deletion of a holiday
   * Shows confirmation dialog, sends API request, and refreshes the holiday list
   *
   * @param {number} id - The ID of the holiday to delete
   */
  const handleDeleteHoliday = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus hari libur ini?")) return;

    setDeleteLoading(id);
    try {
      await deleteHoliday(id, token || "");
      showSuccessToast("Hari libur berhasil dihapus");
      const updatedHolidays = await fetchHolidays(token || "");
      // Sort holidays by date in descending order (newest first)
      const sortedHolidays = updatedHolidays.sort(
        (a: Holiday, b: Holiday) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setHolidays(sortedHolidays);
    } catch (error) {
      showErrorToast("Gagal menghapus hari libur");
    } finally {
      setDeleteLoading(null);
    }
  };

  /**
   * Formats a date string into Indonesian locale format
   *
   * @param {string} dateString - The date string in YYYY-MM-DD format
   * @returns {string} The formatted date string
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 fade-in">
      <h1 className="text-3xl font-serif font-bold mb-6 text-foreground">
        Manajemen Hari Libur
      </h1>

      {/* Add Holiday Form */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center">
          <CalendarPlus className="mr-2 h-5 w-5" />
          Tambah Hari Libur
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Tanggal
            </label>
            <input
              type="date"
              value={newHoliday.date}
              onChange={(e) =>
                setNewHoliday({ ...newHoliday, date: e.target.value })
              }
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Keterangan
            </label>
            <input
              type="text"
              value={newHoliday.description}
              onChange={(e) =>
                setNewHoliday({ ...newHoliday, description: e.target.value })
              }
              className="form-input w-full"
              placeholder="Contoh: Hari Raya Idul Fitri"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAddHoliday}
              disabled={loading}
              className="btn btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Menyimpan...
                </>
              ) : (
                "Tambah"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Holidays List */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">
          Daftar Hari Libur
        </h2>
        {holidays.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-secondary">
              Belum ada hari libur yang terdaftar
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-800">
              <thead className="bg-semibackground">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Keterangan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Tahun Ajaran
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {holidays.map((holiday) => (
                  <tr
                    key={holiday.id}
                    className="hover:bg-semibackground transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {formatDate(holiday.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {holiday.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {holiday.academic_year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteHoliday(holiday.id)}
                        disabled={deleteLoading === holiday.id}
                        className="text-error hover:text-error/80 transition-colors"
                      >
                        {deleteLoading === holiday.id ? (
                          <svg
                            className="animate-spin h-4 w-4"
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
                        ) : (
                          <Trash2 size={18} />
                        )}
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
  );
};

export default HolidayManagement;
