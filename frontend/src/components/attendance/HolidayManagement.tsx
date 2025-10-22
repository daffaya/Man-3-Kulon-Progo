// Buat file components/HolidayManagement.tsx
import { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";

interface Holiday {
  id: number;
  date: string;
  description: string;
  academic_year: string;
}

const HolidayManagement = () => {
  const { apiRequest } = useApi();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [newHoliday, setNewHoliday] = useState({
    date: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await apiRequest("/api/attendance/holidays");
      const data = await response.json();
      setHolidays(data);
    } catch (error) {
      console.error("Error fetching holidays:", error);
    }
  };

  const addHoliday = async () => {
    if (!newHoliday.date || !newHoliday.description) {
      alert("Tanggal dan keterangan harus diisi");
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("/api/attendance/holidays", {
        method: "POST",
        body: JSON.stringify(newHoliday),
      });

      if (response.ok) {
        setNewHoliday({ date: "", description: "" });
        fetchHolidays();
      }
    } catch (error) {
      console.error("Error adding holiday:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteHoliday = async (id: number) => {
    try {
      const response = await apiRequest(`/api/attendance/holidays/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchHolidays();
      }
    } catch (error) {
      console.error("Error deleting holiday:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manajemen Hari Libur</h1>

      {/* Add Holiday Form */}
      <div className="mb-6 bg-gray-50 p-4 rounded">
        <h2 className="text-lg font-semibold mb-4">Tambah Hari Libur</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal</label>
            <input
              type="date"
              value={newHoliday.date}
              onChange={(e) =>
                setNewHoliday({ ...newHoliday, date: e.target.value })
              }
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Keterangan</label>
            <input
              type="text"
              value={newHoliday.description}
              onChange={(e) =>
                setNewHoliday({ ...newHoliday, description: e.target.value })
              }
              className="w-full border rounded p-2"
              placeholder="Contoh: Hari Raya Idul Fitri"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addHoliday}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded w-full"
            >
              {loading ? "Menyimpan..." : "Tambah"}
            </button>
          </div>
        </div>
      </div>

      {/* Holidays List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Daftar Hari Libur</h2>
        {holidays.length === 0 ? (
          <p>Belum ada hari libur yang terdaftar</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2">Tanggal</th>
                <th className="border p-2">Keterangan</th>
                <th className="border p-2">Tahun Ajaran</th>
                <th className="border p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((holiday) => (
                <tr key={holiday.id}>
                  <td className="border p-2">{holiday.date}</td>
                  <td className="border p-2">{holiday.description}</td>
                  <td className="border p-2">{holiday.academic_year}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => deleteHoliday(holiday.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HolidayManagement;
