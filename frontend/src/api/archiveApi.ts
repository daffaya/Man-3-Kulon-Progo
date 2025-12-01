/**
 * @fileoverview API service functions for archive management.
 * This module provides functions to interact with the backend archive API,
 * including fetching categories, fetching, downloading, deleting, and updating archives.
 */

import { Archive, Category } from "../types/archiveTypes";
import { apiFetch } from "../lib/api";

/**
 * Fetches all available categories from the backend API.
 * @returns {Promise<Category[]>} A promise that resolves to an array of Category objects.
 * @throws {Error} Throws an error if the network request fails or the server returns an error message.
 */
export const fetchCategories = async (): Promise<Category[]> => {
  const data = await apiFetch("/archives/categories");
  if (data.success) {
    return data.data;
  }
  throw new Error(data.error || "Gagal memuat kategori");
};

/**
 * Fetches a list of archives from the backend API, optionally filtered by search query and category.
 * @param {string} searchQuery - The search term to filter archives.
 * @param {string} categoryId - The ID of the category to filter archives by.
 * @returns {Promise<Archive[]>} A promise that resolves to an array of Archive objects.
 * @throws {Error} Throws an error if the network request fails or the server returns an error message.
 */
export const fetchArchives = async (
  searchQuery: string,
  categoryId: string
): Promise<Archive[]> => {
  const query = new URLSearchParams();
  if (searchQuery) query.append("search", searchQuery);
  if (categoryId) query.append("categoryId", categoryId);

  const data = await apiFetch(`/archives?${query.toString()}`);
  if (data.success) {
    return data.data;
  }
  throw new Error(data.error || "Gagal memuat arsip");
};

/**
 * Triggers the download of a specific archive file by its ID.
 * @param {number} id - The ID of the archive to download.
 * @param {string} fileName - The desired name for the downloaded file.
 * @throws {Error} Throws an error if the download request fails.
 */
export const downloadArchive = async (id: number, fileName: string) => {
  const response = await fetch(
    `https://backend.man3kulonprogo.sch.id/api/archives/${id}/download`,
    {
      credentials: "include",
    }
  );
  if (!response.ok) throw new Error("Gagal mendownload arsip");
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Deletes an archive from the server using its ID.
 * @param {number} id - The ID of the archive to delete.
 * @param {string | null} token - The authentication token for authorization.
 * @throws {Error} Throws an error if the deletion request fails.
 */
export const deleteArchive = async (id: number, token: string | null) => {
  await apiFetch(`/archives/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

/**
 * Updates an existing archive's information on the server.
 * @param {number} id - The ID of the archive to update.
 * @param {FormData} formData - The form data containing the updated archive information.
 * @param {string | null} token - The authentication token for authorization.
 * @returns {Promise<Partial<Archive>>} A promise that resolves to the updated archive data.
 * @throws {Error} Throws an error if the update request fails.
 */
export const updateArchive = async (
  id: number,
  formData: FormData,
  token: string | null
) => {
  const response = await fetch(
    `https://backend.man3kulonprogo.sch.id/api/archives/${id}`,
    {
      method: "PUT",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
      credentials: "include",
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Gagal mengedit arsip");
  return data.data;
};
