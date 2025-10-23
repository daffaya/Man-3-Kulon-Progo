import { useState, useEffect } from "react";
import {
  fetchClasses,
  fetchAttendanceRecap,
  exportAttendanceData,
} from "../../api/attendanceApi";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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
      // Skip jika token null
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
      // Skip jika token null atau classId kosong
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
    // Skip jika token null
    if (!token) {
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Rekap Presensi</h1>

      {/* Filter Controls */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Kelas</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full border rounded p-2"
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
          <label className="block text-sm font-medium mb-1">Periode</label>
          <select
            value={period}
            onChange={(e) =>
              setPeriod(e.target.value as "daily" | "monthly" | "semester")
            }
            className="w-full border rounded p-2"
          >
            <option value="daily">Harian</option>
            <option value="monthly">Bulanan</option>
            <option value="semester">Semester</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Tanggal Mulai
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        {period !== "daily" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Tanggal Selesai
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
        )}
      </div>

      {/* Export Buttons */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => exportData("excel")}
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={!classId}
        >
          Export Excel
        </button>
        <button
          onClick={() => exportData("pdf")}
          className="bg-red-500 text-white px-4 py-2 rounded"
          disabled={!classId}
        >
          Export PDF
        </button>
      </div>

      {/* Recap Table */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">NISN</th>
              <th className="border p-2">Nama</th>
              {period === "daily" ? (
                <>
                  <th className="border p-2">Tanggal</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Keterangan</th>
                </>
              ) : (
                <>
                  <th className="border p-2">Total Hari</th>
                  <th className="border p-2">Hadir</th>
                  <th className="border p-2">Izin</th>
                  <th className="border p-2">Sakit</th>
                  <th className="border p-2">Alpa</th>
                  <th className="border p-2">Persentase</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {recapData.map((student) => (
              <tr key={student.id}>
                <td className="border p-2">{student.nisn}</td>
                <td className="border p-2">{student.name}</td>
                {period === "daily" ? (
                  <>
                    <td className="border p-2">{student.date}</td>
                    <td className="border p-2">{student.status}</td>
                    <td className="border p-2">{student.notes}</td>
                  </>
                ) : (
                  <>
                    <td className="border p-2">{student.total_hari}</td>
                    <td className="border p-2">{student.hadir}</td>
                    <td className="border p-2">{student.izin}</td>
                    <td className="border p-2">{student.sakit}</td>
                    <td className="border p-2">{student.alpa}</td>
                    <td className="border p-2">
                      {student.persentase_kehadiran}%
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AttendanceRecap;
