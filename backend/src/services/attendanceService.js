// services/attendanceService.js
import { useAuth } from "../contexts/AuthContext";

// Fungsi untuk input presensi
export const saveAttendance = async (attendanceData, token) => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_API_URL}/api/attendance`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(attendanceData),
    }
  );

  const data = await response.json();
  if (response.ok && data.success) {
    return data;
  }
  throw new Error(data.error || "Gagal menyimpan presensi");
};

// Fungsi untuk get rekap presensi
export const getAttendanceRecap = async (
  classId,
  period,
  startDate,
  endDate
) => {
  const query = new URLSearchParams({
    classId,
    period,
    startDate,
    endDate,
  });

  const response = await fetch(
    `${
      import.meta.env.VITE_BACKEND_API_URL
    }/api/attendance/recap?${query.toString()}`
  );

  const data = await response.json();
  if (response.ok) {
    return data;
  }
  throw new Error(data.error || "Gagal memuat rekap presensi");
};

// Fungsi untuk export data
export const exportAttendance = async (
  classId,
  period,
  startDate,
  endDate,
  format,
  token
) => {
  const query = new URLSearchParams({
    classId,
    period,
    startDate,
    endDate,
    format,
  });

  const response = await fetch(
    `${
      import.meta.env.VITE_BACKEND_API_URL
    }/api/attendance/export?${query.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Gagal mengekspor data");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `rekap-presensi-${period}-${classId}.${format === "excel" ? "xlsx" : "pdf"}`
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
