/**
 * @fileoverview API service for staff management.
 * Provides functions to interact with the backend staff endpoints.
 * Includes both administrative (with auth token) and public operations.
 */

import {
  Staff,
  StaffFormData,
  StaffRecap,
  Tendik,
  StaffFilters,
  StaffPaginationData,
} from "../types/staffTypes";
import { apiFetch } from "../lib/api";

/**
 * Retrieves the JWT authorization token from localStorage.
 * @returns {string | null} The JWT token if present, otherwise null.
 */
const getAuthToken = (): string | null => localStorage.getItem("token");

/**
 * Object containing all API functions related to staff management.
 */
export const staffApi = {
  /**
   * Creates a new staff member.
   * Sends a POST request to `/atmin/staff` with the provided data.
   * Requires authentication token.
   *
   * @param {StaffFormData} data - The data for the new staff.
   * @returns {Promise<Staff>} The newly created staff object.
   * @throws {Error} If the request fails.
   */
  createStaff: async (data: StaffFormData): Promise<Staff> => {
    const token = getAuthToken();
    return apiFetch<Staff>("/atmin/staff", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(data),
    });
  },

  /**
   * Updates an existing staff member.
   * Sends a PUT request to `/atmin/staff/:id` with updated data.
   * Requires authentication token.
   *
   * @param {number} id - The ID of the staff to update.
   * @param {StaffFormData} data - The updated staff data.
   * @returns {Promise<Staff>} The updated staff object.
   * @throws {Error} If the request fails.
   */
  updateStaff: async (id: number, data: StaffFormData): Promise<Staff> => {
    const token = getAuthToken();
    return apiFetch<Staff>(`/atmin/staff/${id}`, {
      method: "PUT",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(data),
    });
  },

  /**
   * Deletes a staff member by ID.
   * Sends a DELETE request to `/atmin/staff/:id`.
   * Requires authentication token.
   *
   * @param {number} id - The ID of the staff to delete.
   * @returns {Promise<void>} Resolves when deletion is successful.
   * @throws {Error} If the request fails.
   */
  deleteStaff: async (id: number): Promise<void> => {
    const token = getAuthToken();
    await apiFetch<void>(`/atmin/staff/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Fetches a single staff member by ID.
   * Sends a GET request to `/atmin/staff/:id`.
   * Requires authentication token.
   *
   * @param {number} id - The ID of the staff to fetch.
   * @returns {Promise<Staff>} The staff object.
   * @throws {Error} If the request fails.
   */
  getStaffById: async (id: number): Promise<Staff> => {
    const token = getAuthToken();
    const data = await apiFetch<Staff>(`/atmin/staff/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return data;
  },

  /**
   * Fetches a list of staff members with optional filters.
   * Supports keyword, type, gender, status, pagination.
   * Sends a GET request to `/atmin/staff`.
   * Requires authentication token.
   *
   * @param {StaffFilters} [filters={}] - Filters to apply.
   * @returns {Promise<StaffPaginationData>} Paginated list of staff.
   * @throws {Error} If the request fails.
   */
  getStaffList: async (
    filters: StaffFilters = {}
  ): Promise<StaffPaginationData> => {
    const params = new URLSearchParams();
    if (filters.keyword) params.append("keyword", filters.keyword);
    if (filters.type) params.append("type", filters.type);
    if (filters.gender) params.append("gender", filters.gender);
    if (filters.status) params.append("status", filters.status);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/atmin/staff?${queryString}`
      : "/atmin/staff";

    const token = getAuthToken();
    return apiFetch<StaffPaginationData>(endpoint, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Fetches teacher recap data (public endpoint).
   *
   * @returns {Promise<{ data: StaffRecap[] }>} List of teacher recap data.
   * @throws {Error} If the request fails.
   */
  getTeacherRecap: async (): Promise<{ data: StaffRecap[] }> => {
    return apiFetch<{ data: StaffRecap[] }>("/staff/teachers/recap");
  },

  /**
   * Fetches staff recap data (public endpoint).
   *
   * @returns {Promise<{ data: StaffRecap[] }>} List of staff recap data.
   * @throws {Error} If the request fails.
   */
  getStaffRecap: async (): Promise<{ data: StaffRecap[] }> => {
    return apiFetch<{ data: StaffRecap[] }>("/staff/staff/recap");
  },

  /**
   * Fetches all tendik data (public endpoint).
   *
   * @returns {Promise<{ data: Tendik[] }>} List of tendik data.
   * @throws {Error} If the request fails.
   */
  getAllTendik: async (): Promise<{ data: Tendik[] }> => {
    return apiFetch<{ data: Tendik[] }>("/staff/tendik");
  },
};
