import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import AdminLayout from "../../../components/layout/AdminLayout";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Student {
  id: number;
  nisn: string;
  name: string;
}

interface Attendance {
  student_id: number;
  status: "hadir" | "izin" | "sakit" | "alpa";
  notes?: string;
}

interface ClassData {
  id: number;
  name: string;
  academic_year: string;
  semester: string;
  total_siswa: number;
}

const API_URL = import.meta.env.VITE_BACKEND_API_URL;
const ALLOWED_ROLES = ["guru_bk", "super_admin"] as const;

const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

const AttendanceInputPage: React.FC = () => {
  const { isLoggedIn, user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);

  const isAdminOrGuruBK = hasEditAccess(isLoggedIn, user?.role);

  // Get classId from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const classId = params.get("classId");
    if (classId) {
      setSelectedClass(Number(classId));
    }
  }, [location.search]);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(`${API_URL}/api/attendance/classes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setClasses(data);
        } else {
          showErrorToast("Gagal mengambil data kelas");
        }
      } catch (err) {
        showErrorToast("Terjadi kesalahan saat mengambil data kelas");
      }
    };

    if (isLoggedIn) {
      fetchClasses();
    }
  }, [isLoggedIn, token, showErrorToast]);

  // Fetch students when class is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) return;

      try {
        const response = await fetch(
          `${API_URL}/api/attendance/students?classId=${selectedClass}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStudents(data);

          // Initialize attendances with default status "hadir"
          const initialAttendances: Attendance[] = data.map(
            (student: Student) => ({
              student_id: student.id,
              status: "hadir",
            })
          );
          setAttendances(initialAttendances);
        } else {
          showErrorToast("Gagal mengambil data siswa");
        }
      } catch (err) {
        showErrorToast("Terjadi kesalahan saat mengambil data siswa");
      }
    };

    if (isLoggedIn && selectedClass) {
      fetchStudents();
    }
  }, [isLoggedIn, selectedClass, token, showErrorToast]);

  // Fetch attendance for selected date
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedClass || !selectedDate) return;

      try {
        const response = await fetch(
          `${API_URL}/api/attendance?classId=${selectedClass}&date=${selectedDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          if (data.length > 0) {
            // Update attendances with fetched data
            const updatedAttendances = attendances.map((att) => {
              const fetchedAtt = data.find(
                (d: Attendance) => d.student_id === att.student_id
              );
              if (fetchedAtt) {
                return {
                  ...att,
                  status: fetchedAtt.status,
                  notes: fetchedAtt.notes || "",
                };
              }
              return att;
            });
            setAttendances(updatedAttendances);
          }
        }
      } catch (err) {
        console.error("Error fetching attendance:", err);
      }
    };

    if (isLoggedIn && selectedClass && selectedDate) {
      fetchAttendance();
    }
  }, [isLoggedIn, selectedClass, selectedDate, token, attendances]);

  // Handle attendance status change
  const handleStatusChange = (
    studentId: number,
    status: "hadir" | "izin" | "sakit" | "alpa"
  ) => {
    setAttendances((prev) =>
      prev.map((att) =>
        att.student_id === studentId ? { ...att, status } : att
      )
    );
  };

  // Handle notes change
  const handleNotesChange = (studentId: number, notes: string) => {
    setAttendances((prev) =>
      prev.map((att) =>
        att.student_id === studentId ? { ...att, notes } : att
      )
    );
  };

  // Save attendance
  const saveAttendance = async () => {
    if (!selectedClass || !selectedDate) {
      showErrorToast("Pilih kelas dan tanggal terlebih dahulu");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          classId: selectedClass,
          date: selectedDate,
          attendances: attendances.map((att) => ({
            studentId: att.student_id,
            status: att.status,
            notes: att.notes || "",
          })),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showSuccessToast("Data presensi berhasil disimpan");
      } else {
        showErrorToast(data.error || "Gagal menyimpan data presensi");
      }
    } catch (err) {
      showErrorToast("Terjadi kesalahan saat menyimpan data presensi");
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
            Input Presensi Siswa
          </h1>
        </div>

        <div className="bg-white dark:bg-semibackground rounded-xl shadow-md p-6">
          {/* Class and Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label
                htmlFor="class"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Kelas
              </label>
              <select
                id="class"
                className="form-input w-full"
                value={selectedClass}
                onChange={(e) => setSelectedClass(Number(e.target.value))}
                disabled={loading}
              >
                <option value={0}>Pilih Kelas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.academic_year} - {cls.semester})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Tanggal
              </label>
              <input
                type="date"
                id="date"
                className="form-input w-full"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Attendance Form */}
          {selectedClass > 0 ? (
            <>
              {isAdminOrGuruBK ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            NISN
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Nama
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Keterangan
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {students.map((student) => {
                          const attendance = attendances.find(
                            (a) => a.student_id === student.id
                          ) || { status: "hadir", notes: "" };
                          return (
                            <tr key={student.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {student.nisn}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {student.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <select
                                  className="form-input text-sm"
                                  value={attendance.status}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      student.id,
                                      e.target.value as
                                        | "hadir"
                                        | "izin"
                                        | "sakit"
                                        | "alpa"
                                    )
                                  }
                                  disabled={loading}
                                >
                                  <option value="hadir">Hadir</option>
                                  <option value="izin">Izin</option>
                                  <option value="sakit">Sakit</option>
                                  <option value="alpa">Alpa</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <input
                                  type="text"
                                  className="form-input text-sm"
                                  value={attendance.notes || ""}
                                  onChange={(e) =>
                                    handleNotesChange(
                                      student.id,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Keterangan"
                                  disabled={loading}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={saveAttendance}
                      disabled={loading}
                    >
                      {loading ? "Menyimpan..." : "Simpan Presensi"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    Anda tidak memiliki akses untuk input presensi. Silakan
                    hubungi Guru BK atau Super Admin.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Silakan pilih kelas terlebih dahulu
              </p>
            </div>
          )}
        </div>
      </div>
    </SelectedLayout>
  );
};

export default AttendanceInputPage;
