import { useState, useEffect } from "react";
import {
  fetchClasses,
  fetchAttendanceRecap,
  exportAttendanceData,
} from "../../api/attendanceApi";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { RefreshCw, Download, FileText } from "lucide-react";

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

const AttendanceRecap = () => {
  const { token, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [classId, setClassId] = useState("");
  const [period, setPeriod] = useState<"daily" | "monthly" | "semester">(
    "daily"
  );
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [recapData, setRecapData] = useState<RecapData[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Redirect jika belum login
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const loadClasses = async () => {
      if (!token) return;

      try {
        const data = await fetchClasses(token);
        setClasses(data);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    if (isLoggedIn) loadClasses();
  }, [isLoggedIn, token]);

  useEffect(() => {
    const fetchRecapData = async () => {
      if (!token || !classId) return;

      setLoading(true);
      try {
        const data = await fetchAttendanceRecap(
          {
            classId: Number(classId),
            period,
            startDate,
            endDate,
          },
          token
        );
        setRecapData(data.data);
      } catch (error) {
        console.error("Error fetching recap data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecapData();
  }, [classId, period, startDate, endDate, token]);

  const exportData = async (format: "excel" | "pdf") => {
    if (!token) {
      // Using a toast would be better, but alert is simpler for this example
      alert("Sesi telah berakhir. Silakan login kembali.");
      navigate("/login");
      return;
    }

    try {
      await exportAttendanceData(
        {
          classId: Number(classId),
          period,
          startDate,
          endDate,
          format,
        },
        token
      );
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Gagal mengekspor data");
    }
  };

  return (
    <AdminLayout>
      <div className="container-narrow py-12 fade-in">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-6">
          Rekap Presensi
        </h1>

        {/* Filter Controls */}
        <div className="card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Kelas
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="form-input"
              >
                <option value="">Pilih Kelas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Periode
              </label>
              <select
                value={period}
                onChange={(e) =>
                  setPeriod(e.target.value as "daily" | "monthly" | "semester")
                }
                className="form-input"
              >
                <option value="daily">Harian</option>
                <option value="monthly">Bulanan</option>
                <option value="semester">Semester</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input"
              />
            </div>

            {period !== "daily" && (
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-input"
                />
              </div>
            )}
          </div>
        </div>

        {/* Export Buttons */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => exportData("excel")}
            className="bg-[rgb(var(--color-success))] text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 hover:bg-[rgb(var(--color-success)),0.9] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-success)),0.5] disabled:opacity-50 flex items-center"
            disabled={!classId}
          >
            <Download size={16} className="mr-2" />
            Export Excel
          </button>
          <button
            onClick={() => exportData("pdf")}
            className="bg-[rgb(var(--color-error))] text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 hover:bg-[rgb(var(--color-error)),0.9] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-error)),0.5] disabled:opacity-50 flex items-center"
            disabled={!classId}
          >
            <FileText size={16} className="mr-2" />
            Export PDF
          </button>
        </div>

        {/* Recap Table */}
        {loading ? (
          <div className="card p-12 text-center">
            <RefreshCw
              size={32}
              className="mx-auto animate-spin text-[rgb(var(--color-accent))]"
            />
            <p className="mt-4 text-secondary">Memuat data...</p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-800">
              <thead className="bg-[rgb(var(--color-semi-background))]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    NISN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                    Nama
                  </th>
                  {period === "daily" ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                        Keterangan
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                        Total Hari
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                        Hadir
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                        Izin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                        Sakit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                        Alpa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                        Persentase
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {recapData.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-[rgb(var(--color-secondary-hover))]"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {student.nisn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {student.name}
                    </td>
                    {period === "daily" ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                          {student.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                          {student.status}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                          {student.notes}
                        </td>
                      </>
                    ) : (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AttendanceRecap;
