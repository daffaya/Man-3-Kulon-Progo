// Buat file components/AttendanceRecap.tsx
import { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";

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
  const { apiRequest } = useApi();
  const [classId, setClassId] = useState("");
  const [period, setPeriod] = useState("daily");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [recapData, setRecapData] = useState<RecapData[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (classId) {
      fetchRecapData();
    }
  }, [classId, period, startDate, endDate]);

  const fetchClasses = async () => {
    try {
      const response = await apiRequest("/api/attendance/classes");
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchRecapData = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(
        `/api/attendance/recap?classId=${classId}&period=${period}&startDate=${startDate}&endDate=${endDate}`
      );
      const data = await response.json();
      setRecapData(data.data);
    } catch (error) {
      console.error("Error fetching recap data:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format: "excel" | "pdf") => {
    try {
      const response = await apiRequest(
        `/api/attendance/export?classId=${classId}&period=${period}&startDate=${startDate}&endDate=${endDate}&format=${format}`
      );

      // Handle download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rekap-presensi-${period}-${classId}.${
        format === "excel" ? "xlsx" : "pdf"
      }`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting data:", error);
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
            onChange={(e) => setPeriod(e.target.value)}
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
      </div>

      {/* Export Buttons */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => exportData("excel")}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Export Excel
        </button>
        <button
          onClick={() => exportData("pdf")}
          className="bg-red-500 text-white px-4 py-2 rounded"
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
