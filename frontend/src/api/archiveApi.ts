/**
 * @fileoverview API service functions for archive management.
 * This module provides functions to interact with the backend archive API,
 * including fetching categories, fetching, downloading, deleting, and updating archives.
 */

import { Archive, Category } from "../types/archiveTypes";

/**
 * Fetches all available categories from the backend API.
 * @returns {Promise<Category[]>} A promise that resolves to an array of Category objects.
 * @throws {Error} Throws an error if the network request fails or the server returns an error message.
 */
export const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_API_URL}/api/archives/categories`
  );
  const data = await response.json();
  if (response.ok && data.success) {
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
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_API_URL}/api/archives?${query.toString()}`
  );
  const data = await response.json();
  if (response.ok && data.success) {
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
    `${import.meta.env.VITE_BACKEND_API_URL}/api/archives/${id}/download`
  );
  if (!response.ok) {
    throw new Error("Gagal mendownload arsip");
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Deletes an archive from the server using its ID.
 * @param {number} id - The ID of the archive to delete.
 * @param {string | null} token - The authentication token for authorization.
 * @throws {Error} Throws an error if the deletion request fails.
 */
export const deleteArchive = async (id: number, token: string | null) => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_API_URL}/api/archives/${id}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await response.json();
  if (response.ok && data.success) {
    return;
  }
  throw new Error(data.error || "Gagal menghapus arsip");
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
): Promise<Partial<Archive>> => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_API_URL}/api/archives/${id}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }
  );
  const data = await response.json();
  if (response.ok && data.success) {
    return data.data;
  }
  throw new Error(data.error || "Gagal mengedit arsip");
};
