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
    <div className="container-narrow py-8 fade-in">
      <h1 className="text-3xl font-serif font-bold text-foreground mb-6">
        Input Presensi Harian
      </h1>

      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="classSelect"
              className="block text-sm font-medium mb-1 text-foreground"
            >
              Pilih Kelas
            </label>
            <select
              id="classSelect"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="form-input w-full"
              disabled={isLoading}
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
            <label
              htmlFor="dateSelect"
              className="block text-sm font-medium mb-1 text-foreground"
            >
              Tanggal
            </label>
            <input
              id="dateSelect"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-input w-full"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {isLoading && !students.length ? (
        <div className="card p-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      ) : students.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[rgb(var(--color-semi-background))]">
                  <th className="p-3 text-left text-sm font-medium text-foreground">
                    NISN
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-foreground">
                    Nama
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-foreground">
                    Status
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-foreground">
                    Keterangan
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr
                    key={student.id}
                    className="border-t border-[rgb(var(--color-secondary-button),0.3)]"
                  >
                    <td className="p-3 text-sm text-foreground">
                      {student.nisn}
                    </td>
                    <td className="p-3 text-sm text-foreground">
                      {student.name}
                    </td>
                    <td className="p-3">
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
                        className="form-input w-full"
                        disabled={isLoading}
                      >
                        <option value="hadir">Hadir</option>
                        <option value="izin">Izin</option>
                        <option value="sakit">Sakit</option>
                        <option value="alpa">Alpa</option>
                      </select>
                    </td>
                    <td className="p-3">
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
                        className="form-input w-full"
                        disabled={
                          isLoading || attendances[index]?.status === "hadir"
                        }
                        placeholder="Tambahkan keterangan..."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-[rgb(var(--color-secondary-button),0.3)] flex justify-end">
            <button
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={isLoading || !students.length}
            >
              {isLoading ? "Menyimpan..." : "Simpan Presensi"}
            </button>
          </div>
        </div>
      ) : selectedClass ? (
        <div className="card p-12 text-center">
          <p className="text-secondary">Tidak ada siswa di kelas ini.</p>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-secondary">Silakan pilih kelas terlebih dahulu.</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceForm;
