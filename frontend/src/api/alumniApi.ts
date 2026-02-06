/**
 * @fileoverview API client module for alumni-related operations.
 * This module provides asynchronous functions to interact with the backend API,
 * including fetching alumni lists, retrieving specific alumni by ID, and updating alumni records.
 */

const backendUrl =
  import.meta.env.VITE_BACKEND_URL || "https://backend.man3kulonprogo.sch.id";

export const alumniApi = {
  /**
   * Fetches a list of alumni from the API with optional filtering and pagination.
   * @param params - Query parameters for filtering and pagination.
   * @param params.search - Search term to filter alumni.
   * @param params.graduationYear - Filter by graduation year.
   * @param params.status - Filter by status.
   * @param params.page - Page number for pagination.
   * @param params.limit - Number of items per page.
   * @param token - Optional authentication token.
   * @returns A promise resolving to the list of alumni.
   */
  getAlumni: async (
    params: {
      search?: string;
      graduationYear?: string;
      status?: string;
      page?: number;
      limit?: number;
    },
    token?: string | null,
  ) => {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.graduationYear)
      query.append("graduationYear", params.graduationYear);
    if (params.status) {
      query.append("status", params.status);
    }
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());

    const url = `${backendUrl}/api/alumni?${query.toString()}`;

    const response = await fetch(url, {
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
   * @param id - The ID of the alumni to update.
   * @param data - The data to update.
   * @param data.status - New status of the alumni.
   * @param data.workplace - New workplace information.
   * @param data.business - New business information.
   * @param data.university - New university information.
   * @param data.keterangan - New keterangan information.
   * @param token - Authentication token.
   * @returns A promise resolving to the updated alumni data.
   */
  updateAlumni: async (
    id: number,
    data: {
      status?: string;
      workplace?: string;
      business?: string;
      university?: string;
      keterangan?: string;
    },
    token: string,
  ) => {
    if (!token) throw new Error("Token is required");

    const response = await fetch(`${backendUrl}/api/alumni/admin/${id}`, {
      method: "PUT",
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

  /**
   * Gets a single alumni record by ID.
   * @param id - The ID of the alumni to retrieve.
   * @param token - Authentication token.
   * @returns A promise resolving to the alumni data.
   */
  getAlumniById: async (id: number, token: string) => {
    if (!token) throw new Error("Token is required");

    const response = await fetch(`${backendUrl}/api/alumni/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Gagal memuat data alumni");
    }

    return response.json();
  },
};
