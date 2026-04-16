/**
 * @fileoverview API service functions for PMBM registration.
 * This module provides functions to interact with the PMBM registration endpoints,
 * including submitting new registrations and fetching registration data for admin use.
 */

import { apiFetch } from "../lib/api";
import type {
  PmbmFormData,
  PmbmPublicEntry,
  PmbmRegisterResponse,
  PmbmRegistrationSummary,
} from "../types/pmbmTypes";

/**
 * Retrieves the authentication token from localStorage.
 * @returns {string | null} The JWT token if present, otherwise null.
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

/**
 * Strips conditional fields that are not relevant to the chosen jalur
 * before sending the payload to the backend.
 * @param {PmbmFormData} data - The raw form data from the wizard.
 * @returns {Partial<PmbmFormData>} Cleaned payload ready for submission.
 */
const buildPayload = (data: PmbmFormData): Partial<PmbmFormData> => {
  const payload = { ...data } as Partial<PmbmFormData>;

  if (payload.jalur !== "keterampilan") delete payload.pilihan_keterampilan;
  if (payload.jalur !== "tahfidz") delete payload.jumlah_hafalan_juz;
  if (payload.jalur !== "kko") delete payload.cabang_olahraga;
  if (payload.jalur !== "akademik") delete payload.rata_rata_rapor;
  if (!payload.link_dokumen) delete payload.link_dokumen;

  return payload;
};

/**
 * An object containing methods for interacting with the PMBM registration API endpoints.
 */
const pmbmApi = {
  /**
   * Submits a new PMBM registration. This endpoint is public and does not require authentication.
   * @param {PmbmFormData} data - The complete registration form data.
   * @returns {Promise<PmbmRegisterResponse>} A promise resolving to the registration result including nomor_pendaftaran.
   */
  register: async (data: PmbmFormData): Promise<PmbmRegisterResponse> => {
    const payload = buildPayload(data);
    return await apiFetch("/pmbm/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Retrieves a paginated list of public PMBM registration entries.
   * This endpoint is publicly accessible and only returns non-sensitive data.
   *
   * @param {Object} [params] - Optional query parameters for filtering and pagination.
   * @param {string} [params.search] - Search keyword to match against full name or registration number.
   * @param {string} [params.jalur] - Filter results by registration track.
   * @param {number} [params.page=1] - Page number (1-based).
   * @param {number} [params.limit=20] - Number of records per page.
   *
   * @returns {Promise<Object>} A promise resolving to a paginated result:
   * @returns {PmbmPublicEntry[]} returns.data - Array of public registration entries.
   * @returns {number} returns.total - Total number of records matching the query.
   * @returns {number} returns.page - Current page number.
   * @returns {number} returns.limit - Number of records per page.
   */
  getPublic: async (params?: {
    search?: string;
    jalur?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: PmbmPublicEntry[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const query = new URLSearchParams(
      Object.entries(params ?? {})
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => [k, String(v)]),
    ).toString();

    return await apiFetch(`/pmbm/public${query ? `?${query}` : ""}`);
  },

  /**
   * Fetches a paginated list of registrations for admin use.
   * @param {Object} [params] - Optional query parameters.
   * @param {string} [params.jalur] - Filter by registration track.
   * @param {string} [params.status] - Filter by registration status.
   * @param {string} [params.search] - Search by name, registration number, or NISN.
   * @param {number} [params.page=1] - Page number.
   * @param {number} [params.limit=20] - Records per page.
   * @returns {Promise<{ data: PmbmRegistrationSummary[]; total: number; page: number; limit: number }>}
   */
  getAll: async (params?: {
    gelombang?: number;
    jalur?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: PmbmRegistrationSummary[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const token = getAuthToken();
    const query = new URLSearchParams(
      Object.entries(params ?? {})
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => [k, String(v)]),
    ).toString();

    return await apiFetch(`/pmbm/registrations${query ? `?${query}` : ""}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Fetches the full detail of a single registration by its ID.
   * @param {number} id - The ID of the registration record.
   * @returns {Promise<PmbmFormData & { id: number; nomor_pendaftaran: string; status: string; created_at: string }>}
   */
  getById: async (id: number) => {
    const token = getAuthToken();
    return await apiFetch(`/pmbm/registrations/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Updates the status of a registration record.
   * @param {number} id - The ID of the registration to update.
   * @param {string} status - The new status value (pending/verified/accepted/rejected).
   * @param {string} [catatan_admin] - Optional admin notes.
   * @returns {Promise<{ success: boolean; message: string }>}
   */
  updateStatus: async (
    id: number,
    status: string,
    catatan_admin?: string,
  ): Promise<{ success: boolean; message: string }> => {
    const token = getAuthToken();
    return await apiFetch(`/pmbm/registrations/${id}/status`, {
      method: "PATCH",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ status, catatan_admin }),
    });
  },
};

/**
 * Exports PMBM registration data to an Excel file.
 */
export const exportPmbmData = async (
  params?: {
    gelombang?: number;
    jalur?: string;
    status?: string;
  },
  token?: string | null,
): Promise<Blob> => {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL ||
    "https://backend.man3kulonprogo.sch.id/api";

  const query = new URLSearchParams(
    Object.entries(params ?? {})
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)]),
  ).toString();

  const url = `${backendUrl}/pmbm/export${query ? `?${query}` : ""}`;

  const response = await fetch(url, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.error || "Gagal mengekspor data");
    } catch (e) {
      throw new Error("Gagal mengekspor data: " + response.statusText);
    }
  }

  return response.blob();
};

export default pmbmApi;
