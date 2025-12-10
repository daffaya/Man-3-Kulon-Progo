/**
 * @fileoverview Attendance input page component for recording student attendance.
 * This component provides an interface for authorized users (guru_bk, super_admin) to
 * input and manage student attendance data. It allows selecting a class and date,
 * viewing students in that class, marking attendance status with optional notes,
 * and saving the data to the backend API.
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import AdminLayout from "../../../components/layout/AdminLayout";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft } from "lucide-react";

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

const backendUrl =
  import.meta.env.VITE_BACKEND_URL || "https://backend.man3kulonprogo.sch.id";
const ALLOWED_ROLES = ["guru_bk", "super_admin"] as const;

/**
 * Checks if a user has permission to access attendance features based on their login status and role.
 * @param {boolean} isLoggedIn - The user's login status.
 * @param {string | undefined} role - The user's role.
 * @returns {boolean} True if the user has access, otherwise false.
 */
const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

/**
 * Page component for inputting student attendance.
 * Fetches classes and students data, allows marking attendance with notes,
 * and saves the data to the backend API.
 */
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const classId = params.get("classId");
    if (classId) {
      setSelectedClass(Number(classId));
    }
  }, [location.search]);

  useEffect(() => {
    /**
     * Fetches available classes from the API.
     * Updates the classes state with the fetched data.
     */
    const fetchClasses = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/attendance/classes`, {
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

  useEffect(() => {
    /**
     * Fetches students for the selected class.
     * Initializes attendance data with default "hadir" status for all students.
     */
    const fetchStudents = async () => {
      if (!selectedClass) return;

      try {
        const response = await fetch(
          `${backendUrl}/api/attendance/students?classId=${selectedClass}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStudents(data);

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

  useEffect(() => {
    /**
     * Fetches existing attendance data for the selected class and date.
     * Updates the attendance state with the fetched data if available.
     */
    const fetchAttendance = async () => {
      if (!selectedClass || !selectedDate) return;

      try {
        const response = await fetch(
          `${backendUrl}/api/attendance?classId=${selectedClass}&date=${selectedDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          if (data.length > 0) {
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

  /**
   * Handles status change for a student's attendance.
   * @param {number} studentId - The ID of the student.
   * @param {"hadir" | "izin" | "sakit" | "alpa"} status - The new attendance status.
   */
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

  /**
   * Handles notes change for a student's attendance.
   * @param {number} studentId - The ID of the student.
   * @param {string} notes - The new notes text.
   */
  const handleNotesChange = (studentId: number, notes: string) => {
    setAttendances((prev) =>
      prev.map((att) =>
        att.student_id === studentId ? { ...att, notes } : att
      )
    );
  };

  /**
   * Saves the attendance data to the backend API.
   * Validates required fields before sending and shows appropriate feedback.
   */
  const saveAttendance = async () => {
    if (!selectedClass || !selectedDate) {
      showErrorToast("Pilih kelas dan tanggal terlebih dahulu");
      return;
    }

    if (students.length === 0) {
      showErrorToast("Tidak ada siswa di kelas ini. Silakan pilih kelas lain.");
      return;
    }

    if (attendances.length === 0) {
      showErrorToast(
        "Data presensi belum siap. Silakan tunggu hingga data siswa dimuat."
      );
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        classId: selectedClass,
        date: selectedDate,
        attendances: attendances.map((att) => ({
          studentId: att.student_id,
          status: att.status,
          notes: att.notes || "",
        })),
      };

      const response = await fetch(`${backendUrl}/api/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showSuccessToast("Data presensi berhasil disimpan");

        setTimeout(async () => {
          try {
            const verifyResponse = await fetch(
              `${backendUrl}/api/attendance/verify?classId=${selectedClass}&date=${selectedDate}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const verifyData = await verifyResponse.json();
            showSuccessToast(`${verifyData.count} siswa berhasil disimpan`);
          } catch (err) {
            console.error("Error verifying attendance:", err);
          }
        }, 1000);
      } else {
        showErrorToast(data.error || "Gagal menyimpan data presensi");
      }
    } catch (err) {
      console.error("Error saat save attendance:", err);
      showErrorToast("Terjadi kesalahan saat menyimpan data presensi");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Checks if attendance data already exists for the selected class and date.
   * Used for debugging and validation purposes.
   */
  const checkExistingAttendance = async () => {
    if (!selectedClass || !selectedDate) return;

    try {
      const response = await fetch(
        `${backendUrl}/api/attendance/check-existing?classId=${selectedClass}&date=${selectedDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
    } catch (err) {
      console.error("Error checking existing attendance:", err);
    }
  };

  useEffect(() => {
    if (selectedClass && selectedDate) {
      checkExistingAttendance();
    }
  }, [selectedClass, selectedDate]);

  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-8 fade-in">
        <div className="mb-8">
          <Link
            to="/atmin/presensi"
            className="text-sm text-secondary hover:text-accent flex items-center mb-4 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Kembali
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-serif font-bold text-foreground mb-4 sm:mb-0">
              Input Presensi Siswa
            </h1>
          </div>
        </div>

        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label
                htmlFor="class"
                className="block text-sm font-medium text-foreground mb-1"
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
                className="block text-sm font-medium text-foreground mb-1"
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

          {selectedClass > 0 ? (
            <>
              {isAdminOrGuruBK ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[rgb(var(--color-secondary)/0.2)]">
                      <thead className="bg-[rgb(var(--color-semi-background))]">
                        <tr>
                          <th
                            scope="col"
                            className="px-2 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                          >
                            No
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                          >
                            NISN
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                          >
                            Nama
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                          >
                            Keterangan
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgb(var(--color-secondary)/0.1)]">
                        {students.map((student, index) => {
                          const attendance = attendances.find(
                            (a) => a.student_id === student.id
                          ) || { status: "hadir", notes: "" };
                          return (
                            <tr key={student.id}>
                              <td className="px-2 py-4 whitespace-nowrap text-sm text-secondary">
                                {index + 1}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                                {student.nisn}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
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
                  <p className="text-secondary">
                    Anda tidak memiliki akses untuk input presensi. Silakan
                    hubungi Guru BK atau Super Admin.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-secondary">
                Silakan pilih kelas terlebih dahulu
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AttendanceInputPage;
