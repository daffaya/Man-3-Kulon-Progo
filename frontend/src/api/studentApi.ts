/**
 * @fileoverview API client for student statistics.
 * This module provides functions to fetch student statistics from the backend API.
 */

import { apiFetch } from "../lib/api";

interface StudentStatsResponse {
  totalStudents: number;
}

/**
 * Retrieves the authentication token from localStorage.
 * @returns {string | null} The JWT token if present, otherwise null.
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

/**
 * API client object for student-related operations.
 */
const studentApi = {
  /**
   * Fetches student statistics from the API.
   * @returns {Promise<StudentStatsResponse>} Promise that resolves to student statistics.
   * @throws {Error} If the API request fails.
   */
  getStudentStats: async (): Promise<StudentStatsResponse> => {
    const token = getAuthToken();
    return apiFetch("/studentStats/students", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
};

export default studentApi;
