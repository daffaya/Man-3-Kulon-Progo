/**
 * @fileoverview Service module for handling API requests related to alumni data.
 * This module provides functions to fetch a list of alumni with filtering and pagination,
 * and to update the information of a specific alumni record. It handles communication
 * with the backend API, including setting up query parameters and authentication headers.
 */

const API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export const alumniService = {
  /**
   * Fetches a list of alumni from the API with optional filtering and pagination.
   * @param {object} params - The query parameters for the request.
   * @param {string} [params.search] - A search term to filter alumni by name or other relevant fields.
   * @param {string} [params.graduationYear] - The graduation year to filter alumni by.
   * @param {number} [params.page] - The page number for pagination.
   * @param {number} [params.limit] - The number of results to return per page.
   * @param {string | null} [token] - The authorization token for authenticated requests.
   * @returns {Promise<any>} A promise that resolves to the JSON response containing the alumni data.
   * @throws {Error} Throws an error if the network request fails or the server returns an error.
   */
  getAlumni: async (
    params: {
      search?: string;
      graduationYear?: string;
      page?: number;
      limit?: number;
    },
    token?: string | null
  ) => {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.graduationYear)
      query.append("graduationYear", params.graduationYear);
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());

    const response = await fetch(`${API_URL}/api/alumni?${query.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Gagal memuat data alumni");
    }

    return response.json();
  },

  /**
   * Updates the information of a specific alumni record by their ID.
   * @param {number} id - The unique identifier of the alumni to update.
   * @param {object} data - The data to update for the alumni.
   * @param {string} [data.status] - The new status of the alumni.
   * @param {string} [data.workplace] - The new workplace of the alumni.
   * @param {string} [data.business] - The new business of the alumni.
   * @param {string} [data.university] - The new university of the alumni.
   * @param {string} token - The authorization token for the request.
   * @returns {Promise<any>} A promise that resolves to the JSON response of the updated alumni data.
   * @throws {Error} Throws an error if the token is missing, the network request fails, or the server returns an error.
   */
  updateAlumni: async (
    id: number,
    data: {
      status?: string;
      workplace?: string;
      business?: string;
      university?: string;
    },
    token: string
  ) => {
    if (!token) throw new Error("Token is required");

    const response = await fetch(`${API_URL}/api/alumni/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Gagal memperbarui data alumni");
    }

    return response.json();
  },
};
