/**
 * @fileoverview API client functions for managing student attendance, classes, and holidays.
 * This module provides a set of asynchronous functions to communicate with the backend API
 * for operations like fetching student lists, recording attendance, managing holidays, and exporting data.
 * All functions require an authentication token.
 */

import { apiFetch } from "../lib/api";

/**
 * Fetches a list of students belonging to a specific class.
 * @param {number} classId - The ID of the class to fetch students for.
 * @param {string} token - The authentication bearer token.
 * @returns {Promise<any>} A promise that resolves to the JSON response containing the list of students.
 * @throws {Error} If the fetch request fails.
 */
export const fetchStudentsByClass = async (classId: number, token: string) => {
  return apiFetch(`/attendance/students?classId=${classId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
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
  token: string,
) => {
  return apiFetch(`/attendance?classId=${classId}&date=${date}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
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
  token: string,
) => {
  return apiFetch(`/attendance`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
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
  token: string,
) => {
  let url = `/attendance/recap?classId=${params.classId}&period=${params.period}&startDate=${params.startDate}`;

  if (params.endDate) {
    url += `&endDate=${params.endDate}`;
  }

  return apiFetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Fetches a list of all available classes.
 * @param {string} token - The authentication bearer token.
 * @returns {Promise<any>} A promise that resolves to the JSON response containing the list of classes.
 * @throws {Error} If the fetch request fails.
 */
export const fetchClasses = async (token: string) => {
  return apiFetch(`/attendance/classes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Fetches attendance statistics for a specific date.
 * @param {string} date - The date to fetch statistics for (YYYY-MM-DD format).
 * @param {string} token - The authentication bearer token.
 * @returns {Promise<any>} A promise that resolves to the JSON response containing the day's statistics.
 * @throws {Error} If the fetch request fails.
 */
export const fetchTodayStats = async (date: string, token: string) => {
  return apiFetch(`/attendance/today-stats?date=${date}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Fetches a list of all holidays.
 * @param {string} token - The authentication bearer token.
 * @returns {Promise<any>} A promise that resolves to the JSON response containing the list of holidays.
 * @throws {Error} If the fetch request fails.
 */
export const fetchHolidays = async (token: string) => {
  return apiFetch(`/attendance/holidays`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
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
  token: string,
) => {
  return apiFetch(`/attendance/holidays`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
};

/**
 * Deletes a holiday by its ID.
 * @param {number} id - The ID of the holiday to delete.
 * @param {string} token - The authentication bearer token.
 * @returns {Promise<any>} A promise that resolves to the JSON response from the server.
 * @throws {Error} If the delete operation fails.
 */
export const deleteHoliday = async (id: number, token: string) => {
  return apiFetch(`/attendance/holidays/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
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
  token: string,
) => {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL ||
    "https://backend.man3kulonprogo.sch.id/api";

  let url = `${backendUrl}/attendance/export?classId=${params.classId}&period=${params.period}&startDate=${params.startDate}&format=${params.format}`;
  if (params.endDate) {
    url += `&endDate=${params.endDate}`;
  }

  // For blob responses, we need to use fetch directly
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

/**
 * Fetches absence data grouped by day of the week.
 * @param {{classId?: number, startDate: string, endDate: string}} params - The parameters for the request.
 * @param {string} token - The authentication bearer token.
 * @returns {Promise<any>} A promise that resolves to the JSON response containing the absence analysis data.
 * @throws {Error} If the fetch request fails.
 */
export const fetchAbsenceByDayOfWeek = async (
  params: {
    classId?: number; // Made optional
    startDate: string;
    endDate: string;
  },
  token: string,
) => {
  let url = `/attendance/absence-analysis/day-of-week?startDate=${params.startDate}&endDate=${params.endDate}`;

  if (params.classId) {
    url += `&classId=${params.classId}`;
  }

  return apiFetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Fetches absence data for each calendar date in a date range.
 * @param {{classId?: number, startDate: string, endDate: string}} params - The parameters for the request.
 * @param {string} token - The authentication bearer token.
 * @returns {Promise<any>} A promise that resolves to the JSON response containing the absence data by date.
 * @throws {Error} If the fetch request fails.
 */
export const fetchAbsenceByDate = async (
  params: {
    classId?: number;
    startDate: string;
    endDate: string;
  },
  token: string,
) => {
  let url = `/attendance/absence-analysis/by-date?startDate=${params.startDate}&endDate=${params.endDate}`;

  if (params.classId) {
    url += `&classId=${params.classId}`;
  }

  return apiFetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Fetches detailed student absence data for a specific date.
 * @param {{classId?: number, date: string}} params - The parameters for the request.
 * @param {string} token - The authentication bearer token.
 * @returns {Promise<any>} A promise that resolves to the JSON response containing the student absence data.
 * @throws {Error} If the fetch request fails.
 */
export const fetchStudentAbsencesByDate = async (
  params: {
    classId?: number;
    date: string;
  },
  token: string,
) => {
  let url = `/attendance/absence-analysis/students-by-date?date=${params.date}`;

  if (params.classId) {
    url += `&classId=${params.classId}`;
  }

  return apiFetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Fetches monthly absence trends for a specific class.
 * @param {{classId?: number}} params - The parameters for the request.
 * @param {string} token - The authentication bearer token.
 * @returns {Promise<any>} A promise that resolves to the JSON response containing the monthly trends data.
 * @throws {Error} If the fetch request fails.
 */
export const fetchMonthlyAbsenceTrends = async (
  params: {
    classId?: number; // Made optional
  },
  token: string,
) => {
  let url = `/attendance/absence-analysis/monthly-trends`;

  if (params.classId) {
    url += `?classId=${params.classId}`;
  }

  return apiFetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Verifies password for public access to attendance data.
 * @param {string} password - The password to verify.
 * @returns {Promise<any>} A promise that resolves to the JSON response.
 * @throws {Error} If the verification fails.
 */
export const verifyPublicPassword = async (password: string) => {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL ||
    "https://backend.man3kulonprogo.sch.id/api";

  const response = await fetch(
    `${backendUrl}/public-attendance/verify-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to verify password");
  }

  return response.json();
};

/**
 * Fetches attendance recap data for public access with password.
 * @param {{classId: number, period: "daily" | "monthly" | "semester", startDate: string, endDate?: string, password: string}} params - The parameters for the request.
 * @returns {Promise<any>} A promise that resolves to the JSON response containing the attendance recap.
 * @throws {Error} If the fetch request fails.
 */
export const fetchPublicAttendanceRecap = async (params: {
  classId: number;
  period: "daily" | "monthly" | "semester";
  startDate: string;
  endDate?: string;
  password: string;
}) => {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL ||
    "https://backend.man3kulonprogo.sch.id/api";

  let url = `${backendUrl}/public-attendance/recap?classId=${params.classId}&period=${params.period}&startDate=${params.startDate}&password=${params.password}`;

  if (params.endDate) {
    url += `&endDate=${params.endDate}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch attendance recap");
  }

  return response.json();
};

/**
 * Fetches a list of all available classes for public access.
 * @returns {Promise<any>} A promise that resolves to the JSON response containing the list of classes.
 * @throws {Error} If the fetch request fails.
 */
export const fetchPublicClasses = async () => {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL ||
    "https://backend.man3kulonprogo.sch.id/api";

  const response = await fetch(`${backendUrl}/public-attendance/classes`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch classes");
  }

  return response.json();
};

/**
 * Fetches dates with missing attendance and the classes that are missing.
 * @param {{startDate: string, endDate: string}} params - The parameters for the request.
 * @param {string} token - The authentication bearer token.
 * @returns {Promise<any>} A promise that resolves to the JSON response containing the missing attendance data.
 * @throws {Error} If the fetch request fails.
 */
export const fetchMissingAttendance = async (
  params: {
    startDate: string;
    endDate: string;
  },
  token: string,
) => {
  const url = `/attendance/missing?startDate=${params.startDate}&endDate=${params.endDate}`;

  return apiFetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Fetches a unique list of students who were absent on a specific day of the week within a date range.
 * @param {{classId?: number, startDate: string, endDate: string, dayOfWeek: number}} params - The parameters for the request.
 * @param {string} token - The authentication bearer token.
 * @returns {Promise<any>} A promise that resolves to the JSON response containing the student data.
 * @throws {Error} If the fetch request fails.
 */
export const fetchStudentAbsencesByDayOfWeek = async (
  params: {
    classId?: number;
    startDate: string;
    endDate: string;
    dayOfWeek: number; // 1-7, where 1 is Sunday
  },
  token: string,
) => {
  let url = `/attendance/absence-analysis/students-by-day-of-week?startDate=${params.startDate}&endDate=${params.endDate}&dayOfWeek=${params.dayOfWeek}`;

  if (params.classId) {
    url += `&classId=${params.classId}`;
  }

  return apiFetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
