/**
 * @fileoverview API client functions for managing student attendance, classes, and holidays.
 * This module provides a set of asynchronous functions to communicate with the backend API
 * for operations like fetching student lists, recording attendance, managing holidays, and exporting data.
 * All functions require an authentication token.
 */

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

/**
 * Fetches a list of students belonging to a specific class.
 * @param {number} classId - The ID of the class to fetch students for.
 * @param {string} token - The authentication bearer token.
 * @returns {Promise<any>} A promise that resolves to the JSON response containing the list of students.
 * @throws {Error} If the fetch request fails.
 */
export const fetchStudentsByClass = async (classId: number, token: string) => {
  const response = await fetch(
    `${API_URL}/api/attendance/students?classId=${classId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch students");
  }

  return response.json();
};

/**
 * Fetches attendance records for a specific class and date.
 * @param {number} classId - The ID of the class.
 * @param {string} date - The date to fetch attendance for (YYYY-MM-DD format).
 * @param {string} token - The authentication bearer token.
 * @returns {Promise<any>} A promise that resolves to the JSON response containing attendance data.
 * @throws {Error} If the fetch request fails.
 */
export const fetchAttendanceByDateAndClass = async (
  classId: number,
  date: string,
  token: string
) => {
  const response = await fetch(
    `${API_URL}/api/attendance?classId=${classId}&date=${date}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch attendance");
  }

  return response.json();
};

/**
 * Saves new attendance records for a class on a specific date.
 * @param {{classId: number, date: string, attendances: {studentId: number, status: "hadir" | "izin" | "sakit" | "alpa", notes?: string}[]}} data - The attendance data to save.
 * @param {string} token - The authentication bearer token.
 * @returns {Promise<any>} A promise that resolves to the JSON response from the server.
 * @throws {Error} If the save operation fails.
 */
export const saveAttendance = async (
  data: {
    classId: number;
    date: string;
    attendances: {
      studentId: number;
      status: "hadir" | "izin" | "sakit" | "alpa";
      notes?: string;
    }[];
  },
  token: string
) => {
  const response = await fetch(`${API_URL}/api/attendance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to save attendance");
  }

  return response.json();
};

/**
 * Fetches a recap of attendance data based on specified parameters.
 * @param {{classId: number, period: "daily" | "monthly" | "semester", startDate: string, endDate?: string}} params - The parameters for the recap request.
 * @param {string} token - The authentication bearer token.
 * @returns {Promise<any>} A promise that resolves to the JSON response containing the attendance recap.
 * @throws {Error} If the fetch request fails.
 */
export const fetchAttendanceRecap = async (
  params: {
    classId: number;
    period: "daily" | "monthly" | "semester";
    startDate: string;
    endDate?: string;
  },
  token: string
) => {
  let url = `${API_URL}/api/attendance/recap?classId=${params.classId}&period=${params.period}&startDate=${params.startDate}`;

  if (params.endDate) {
    url += `&endDate=${params.endDate}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch attendance recap");
  }

  return response.json();
};

/**
 * Fetches a list of all available classes.
 * @param {string} token - The authentication bearer token.
 * @returns {Promise<any>} A promise that resolves to the JSON response containing the list of classes.
 * @throws {Error} If the fetch request fails.
 */
export const fetchClasses = async (token: string) => {
  const response = await fetch(`${API_URL}/api/attendance/classes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch classes");
  }

  return response.json();
};

/**
 * Fetches attendance statistics for a specific date.
 * @param {string} date - The date to fetch statistics for (YYYY-MM-DD format).
 * @param {string} token - The authentication bearer token.
 * @returns {Promise<any>} A promise that resolves to the JSON response containing the day's statistics.
 * @throws {Error} If the fetch request fails.
 */
export const fetchTodayStats = async (date: string, token: string) => {
  const response = await fetch(
    `${API_URL}/api/attendance/today-stats?date=${date}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch today's stats");
  }

  return response.json();
};

/**
 * Fetches a list of all holidays.
 * @param {string} token - The authentication bearer token.
 * @returns {Promise<any>} A promise that resolves to the JSON response containing the list of holidays.
 * @throws {Error} If the fetch request fails.
 */
export const fetchHolidays = async (token: string) => {
  const response = await fetch(`${API_URL}/api/attendance/holidays`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch holidays");
  }

  return response.json();
};

/**
 * Adds a new holiday to the system.
 * @param {{date: string, description: string, academicYear: string}} data - The holiday data to add.
 * @param {string} token - The authentication bearer token.
 * @returns {Promise<any>} A promise that resolves to the JSON response from the server.
 * @throws {Error} If the add operation fails.
 */
export const addHoliday = async (
  data: {
    date: string;
    description: string;
    academicYear: string;
  },
  token: string
) => {
  const response = await fetch(`${API_URL}/api/attendance/holidays`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to add holiday");
  }

  return response.json();
};

/**
 * Deletes a holiday by its ID.
 * @param {number} id - The ID of the holiday to delete.
 * @param {string} token - The authentication bearer token.
 * @returns {Promise<any>} A promise that resolves to the JSON response from the server.
 * @throws {Error} If the delete operation fails.
 */
export const deleteHoliday = async (id: number, token: string) => {
  const response = await fetch(`${API_URL}/api/attendance/holidays/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete holiday");
  }

  return response.json();
};

/**
 * Exports attendance data in a specified format (Excel or PDF).
 * @param {{classId: number, period: "daily" | "monthly" | "semester", startDate: string, endDate?: string, format: "excel" | "pdf"}} params - The parameters for the export request.
 * @param {string} token - The authentication bearer token.
 * @returns {Promise<Blob>} A promise that resolves to a Blob containing the exported file data.
 * @throws {Error} If the export operation fails.
 */
export const exportAttendanceData = async (
  params: {
    classId: number;
    period: "daily" | "monthly" | "semester";
    startDate: string;
    endDate?: string;
    format: "excel" | "pdf";
  },
  token: string
) => {
  let url = `${API_URL}/api/attendance/export?classId=${params.classId}&period=${params.period}&startDate=${params.startDate}&format=${params.format}`;

  if (params.endDate) {
    url += `&endDate=${params.endDate}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to export attendance data");
  }

  return response.blob();
};
