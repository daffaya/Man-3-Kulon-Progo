/**
 * @fileoverview Service for handling attendance-related API requests.
 * This module provides functions for saving attendance data, retrieving attendance recaps,
 * and exporting attendance data in different formats.
 */

const backendUrl =
  process.env.BACKEND_URL || "https://backend.man3kulonprogo.sch.id";

/**
 * Saves attendance data to the server.
 * @async
 * @param {object} attendanceData - The attendance data to save.
 * @param {string} token - Authentication token for authorization.
 * @returns {Promise<object>} A promise that resolves to the response data.
 * @throws {Error} If the request fails or returns an error.
 */
export const saveAttendance = async (attendanceData, token) => {
  const response = await fetch(`${backendUrl}/api/attendance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(attendanceData),
  });

  const data = await response.json();
  if (response.ok && data.success) {
    return data;
  }
  throw new Error(data.error || "Gagal menyimpan presensi");
};

/**
 * Retrieves attendance recap data from the server.
 * @async
 * @param {string} classId - The ID of the class.
 * @param {string} period - The period type for the recap.
 * @param {string} startDate - The start date for the recap period.
 * @param {string} endDate - The end date for the recap period.
 * @returns {Promise<object>} A promise that resolves to the attendance recap data.
 * @throws {Error} If the request fails or returns an error.
 */
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
    `${backendUrl}/api/attendance/recap?${query.toString()}`
  );

  const data = await response.json();
  if (response.ok) {
    return data;
  }
  throw new Error(data.error || "Gagal memuat rekap presensi");
};

/**
 * Exports attendance data from the server in the specified format.
 * @async
 * @param {string} classId - The ID of the class.
 * @param {string} period - The period type for the export.
 * @param {string} startDate - The start date for the export period.
 * @param {string} endDate - The end date for the export period.
 * @param {string} format - The export format (e.g., 'excel', 'pdf').
 * @param {string} token - Authentication token for authorization.
 * @returns {Promise<void>} A promise that resolves when the file is downloaded.
 * @throws {Error} If the request fails.
 */
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
    `${backendUrl}/api/attendance/export?${query.toString()}`,
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
