import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToastMessage } from "../../hooks/useToastMessage";

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
  const { showErrorToast, showSuccessToast, showWarningToast } =
    useToastMessage();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Tambahkan tipe data untuk state
  const [students, setStudents] = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => setClasses(data))
      .catch((error) => {
        showErrorToast("Gagal memuat data kelas");
      });
  }, []);

  useEffect(() => {
    if (selectedClass) {
      setIsLoading(true);
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
        })
        .catch((error) => {
          showErrorToast("Gagal memuat data siswa");
        })
        .finally(() => setIsLoading(false));
    }
  }, [selectedClass]);

  const handleSubmit = async () => {
    // Validasi sebelum API call
    if (!selectedClass || !selectedDate) {
      showWarningToast("Pilih kelas dan tanggal");
      return;
    }

    setIsLoading(true);
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

      if (!response.ok) {
        throw new Error("Gagal menyimpan presensi");
      }

      showSuccessToast("Presensi berhasil disimpan");

      // Reset form setelah berhasil
      setSelectedClass("");
      setStudents([]);
      setAttendances([]);
    } catch (error) {
      showErrorToast(
        "Terjadi kesalahan: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsLoading(false);
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
          disabled={isLoading}
        >
          <option value="">Pilih Kelas</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded p-2"
          disabled={isLoading}
        />
      </div>

      {isLoading && !students.length ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
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
                      disabled={isLoading}
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
                      disabled={
                        isLoading || attendances[index]?.status === "hadir"
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={handleSubmit}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
            disabled={isLoading || !students.length}
          >
            {isLoading ? "Menyimpan..." : "Simpan Presensi"}
          </button>
        </>
      )}
    </div>
  );
};

export default AttendanceForm;
