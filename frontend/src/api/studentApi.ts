/**
 * @fileoverview API client for student statistics.
 * This module provides functions to fetch student statistics from the backend API.
 */

interface StudentStatsResponse {
  totalStudents: number;
}

/**
 * The base URL for the backend API.
 * Defaults to localhost:3001 if not specified in environment variables.
 */
const API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001";

/**
 * Creates authentication headers for API requests.
 * @returns {Object} Headers object with authorization token if available.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Handles API responses, throwing errors for non-successful responses.
 * @param {Response} response - The fetch API response object.
 * @returns {Promise<any>} Promise that resolves to the JSON response data.
 * @throws {Error} If the response is not ok.
 */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Something went wrong");
  }
  return response.json();
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
    const url = `${API_URL}/api/studentStats/students`;

    try {
      const response = await fetch(url);

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },
};

export default studentApi;
