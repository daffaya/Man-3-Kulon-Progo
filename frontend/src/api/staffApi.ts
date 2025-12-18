/**
 * @fileoverview API service for staff management.
 * Provides functions to interact with backend staff endpoints for administrative
 * and public operations. All admin endpoints require JWT authentication.
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
 * @returns {string | null} The token if present, otherwise null.
 */
const getAuthToken = (): string | null => localStorage.getItem("token");

/**
 * Collection of API methods for staff management.
 */
export const staffApi = {
  /**
   * Creates a new staff member.
   * @param {StaffFormData} data - Form data for the new staff member.
   * @returns {Promise<Staff>} The created staff object.
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
   * @param {number} id - The ID of the staff member to update.
   * @param {StaffFormData} data - Updated form data.
   * @returns {Promise<Staff>} The updated staff object.
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
   * @param {number} id - The ID of the staff member to delete.
   * @returns {Promise<void>}
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
   * @param {number} id - The staff member ID.
   * @returns {Promise<Staff>} The staff object.
   */
  getStaffById: async (id: number): Promise<Staff> => {
    const token = getAuthToken();
    const response = await apiFetch<{ data: Staff }>(`/atmin/staff/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  /**
   * Fetches a paginated list of staff members with optional filters.
   * @param {StaffFilters} [filters={}] - Filters (keyword, type, gender, status, pagination).
   * @returns {Promise<StaffPaginationData>} Paginated staff list with metadata.
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
   * Fetches public teacher recap data.
   * @returns {Promise<{ data: StaffRecap[] }>} Array of teacher recap records.
   */
  getTeacherRecap: async (): Promise<{ data: StaffRecap[] }> => {
    return apiFetch<{ data: StaffRecap[] }>("/staff/teachers/recap");
  },

  /**
   * Fetches public staff recap data.
   * @returns {Promise<{ data: StaffRecap[] }>} Array of staff recap records.
   */
  getStaffRecap: async (): Promise<{ data: StaffRecap[] }> => {
    return apiFetch<{ data: StaffRecap[] }>("/staff/staff/recap");
  },

  /**
   * Fetches all public tendik (non-teaching staff) data.
   * @returns {Promise<{ data: Tendik[] }>} Array of tendik records.
   */
  getAllTendik: async (): Promise<{ data: Tendik[] }> => {
    return apiFetch<{ data: Tendik[] }>("/staff/tendik");
  },
};
