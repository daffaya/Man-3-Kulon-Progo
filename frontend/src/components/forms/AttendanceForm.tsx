import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Toast from "../ui/Toast";

// Tambahkan interface untuk tipe data
interface Student {
  id: number;
  nisn: string;
  name: string;
}

interface Attendance {
  studentId: number;
  status: "hadir" | "izin" | "sakit" | "alpa";
  notes: string;
}

const AttendanceForm = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Tambahkan tipe data untuk state
  const [students, setStudents] = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "error" as "success" | "error" | "warning" | "info",
  });
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => setClasses(data));
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetch(`/api/students?classId=${selectedClass}`)
        .then((res) => res.json())
        .then((data: Student[]) => {
          setStudents(data);
          setAttendances(
            data.map((s: Student) => ({
              studentId: s.id,
              status: "hadir",
              notes: "",
            }))
          );
        });
    }
  }, [selectedClass]);

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass,
          date: selectedDate,
          attendances,
        }),
      });

      if (!selectedClass || !selectedDate) {
        setToast({
          isVisible: true,
          message: "Pilih kelas dan tanggal",
          type: "warning", // Can use warning for missing data
        });
        return;
      }

      if (!response.ok) {
        throw new Error("Gagal menyimpan presensi");
      }

      setToast({
        isVisible: true,
        message: "Presensi berhasil disimpan",
        type: "success", // Success message
      });
    } catch (error) {
      setToast({
        isVisible: true,
        message: "Terjadi kesalahan",
        type: "error", // Error message
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Input Presensi Harian</h1>

      <div className="mb-6 flex gap-4">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">Pilih Kelas</option>
          {/* Options dari API */}
        </select>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded p-2"
        />
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">NISN</th>
            <th className="border p-2">Nama</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.id}>
              <td className="border p-2">{student.nisn}</td>
              <td className="border p-2">{student.name}</td>
              <td className="border p-2">
                <select
                  value={attendances[index]?.status || "hadir"}
                  onChange={(e) => {
                    const newAttendances = [...attendances];
                    newAttendances[index] = {
                      ...newAttendances[index],
                      status: e.target.value as
                        | "hadir"
                        | "izin"
                        | "sakit"
                        | "alpa",
                    };
                    setAttendances(newAttendances);
                  }}
                  className="w-full"
                >
                  <option value="hadir">Hadir</option>
                  <option value="izin">Izin</option>
                  <option value="sakit">Sakit</option>
                  <option value="alpa">Alpa</option>
                </select>
              </td>
              <td className="border p-2">
                <input
                  type="text"
                  value={attendances[index]?.notes || ""}
                  onChange={(e) => {
                    const newAttendances = [...attendances];
                    newAttendances[index] = {
                      ...newAttendances[index],
                      notes: e.target.value,
                    };
                    setAttendances(newAttendances);
                  }}
                  className="w-full"
                  disabled={attendances[index]?.status === "hadir"}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Simpan Presensi
      </button>

      {/* Show Toast here */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
};

export default AttendanceForm;
