/**
 * @fileoverview API service for managing photo galleries.
 * This module provides functions to interact with the backend API for
 * creating, reading, updating, and deleting photo albums and photos.
 * It handles both public and administrative operations, including
 * photo uploads and ordering. Authentication is managed using JWT tokens.
 */

import {
  Album,
  AlbumFormData,
  Photo,
  PhotoFormData,
  PaginationData,
  GalleryFilters,
} from "../types/galleryTypes";
import { apiFetch } from "../lib/api";

/**
 * Retrieves the authorization token from localStorage.
 * @returns {string | null} The JWT token if present, otherwise null.
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

/**
 * An object containing functions to interact with the gallery API endpoints.
 */
const galleryApi = {
  /**
   * Creates a new album by sending a POST request to the server.
   * @param {AlbumFormData} formData - The data for the new album.
   * @returns {Promise<Album>} A promise that resolves with the newly created album.
   * @throws {Error} If the API request fails.
   */
  createAlbum: async (formData: AlbumFormData): Promise<Album> => {
    const token = getAuthToken();
    const result = await apiFetch("/atmin/gallery/albums", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(formData),
    });
    return result.album || result;
  },

  /**
   * Fetches a paginated list of albums for administrative purposes.
   * Supports filtering by keyword.
   * @param {GalleryFilters} [filters={}] - The filters to apply to the album list.
   * @returns {Promise<PaginationData<Album>>} A promise that resolves with the paginated list of albums.
   * @throws {Error} If the API request fails.
   */
  getAdminAlbums: async (
    filters: GalleryFilters = {}
  ): Promise<PaginationData<Album>> => {
    const params = new URLSearchParams();

    if (filters.keyword) params.append("keyword", filters.keyword);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const token = getAuthToken();
    return apiFetch(`/atmin/gallery/albums?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Fetches a paginated list of albums for public viewing.
   * Supports filtering by keyword.
   * @param {GalleryFilters} [filters={}] - The filters to apply to the album list.
   * @returns {Promise<PaginationData<Album>>} A promise that resolves with the paginated list of albums.
   * @throws {Error} If the API request fails.
   */
  getPublicAlbums: async (
    filters: GalleryFilters = {}
  ): Promise<PaginationData<Album>> => {
    const params = new URLSearchParams();

    if (filters.keyword) params.append("keyword", filters.keyword);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    return apiFetch(`/gallery/albums?${params}`);
  },

  /**
   * Fetches a single album by its ID for administrative purposes, including its photos.
   * @param {string} id - The ID of the album to fetch.
   * @returns {Promise<{ album: Album; photos: Photo[] }>} A promise that resolves with the album and its photos.
   * @throws {Error} If the API request fails.
   */
  getAlbumById: async (
    id: string
  ): Promise<{ album: Album; photos: Photo[] }> => {
    const token = getAuthToken();
    return apiFetch(`/atmin/gallery/albums/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-cache",
    });
  },

  /**
   * Fetches a single album by its ID for public viewing, including its photos.
   * @param {string} id - The ID of the album to fetch.
   * @returns {Promise<{ album: Album; photos: Photo[] }>} A promise that resolves with the album and its photos.
   * @throws {Error} If the API request fails.
   */
  getPublicAlbumById: async (
    id: string
  ): Promise<{ album: Album; photos: Photo[] }> => {
    return apiFetch(`/gallery/albums/${id}`);
  },

  /**
   * Updates an existing album by sending a PUT request to the server.
   * @param {string} id - The ID of the album to update.
   * @param {AlbumFormData} formData - The updated data for the album.
   * @returns {Promise<Album>} A promise that resolves with the updated album.
   * @throws {Error} If the API request fails.
   */
  updateAlbum: async (id: string, formData: AlbumFormData): Promise<Album> => {
    const token = getAuthToken();
    const result = await apiFetch(`/atmin/gallery/albums/${id}`, {
      method: "PUT",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(formData),
    });
    return result.album || result;
  },

  /**
   * Deletes an album by its ID.
   * @param {string} id - The ID of the album to delete.
   * @returns {Promise<void>} A promise that resolves when the album is successfully deleted.
   * @throws {Error} If the API request fails.
   */
  deleteAlbum: async (id: string): Promise<void> => {
    const token = getAuthToken();
    await apiFetch(`/atmin/gallery/albums/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Uploads one or more photos to a specific album.
   * Includes a timeout and specific error handling for network issues.
   * @param {string} albumId - The ID of the album to upload photos to.
   * @param {File[]} files - An array of photo files to upload.
   * @returns {Promise<Photo[]>} A promise that resolves with an array of the uploaded photo data.
   * @throws {Error} If the upload fails, times out, or a network error occurs.
   */
  uploadPhotos: async (albumId: string, files: File[]): Promise<Photo[]> => {
    const formData = new FormData();
    formData.append("album_id", albumId);

    files.forEach((file) => {
      formData.append("photos", file);
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL ||
        "https://backend.man3kulonprogo.sch.id/api";

      // For FormData, we need to use fetch directly to avoid Content-Type header
      const token = getAuthToken();
      const response = await fetch(`${backendUrl}/atmin/gallery/photos`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const result = await response.json();
      return result.photos || [];
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error(
          "Request timeout. Silakan coba lagi dengan gambar yang lebih kecil."
        );
      } else if (error.name === "TypeError") {
        throw new Error(
          "Network error. Silakan periksa koneksi internet Anda."
        );
      } else {
        throw error;
      }
    }
  },

  /**
   * Sets a specific photo as the cover image for an album.
   * @param {string} albumId - The ID of the album.
   * @param {string} photoId - The ID of the photo to set as the cover.
   * @returns {Promise<void>} A promise that resolves when the cover is successfully updated.
   * @throws {Error} If the API request fails.
   */
  setAlbumCover: async (albumId: string, photoId: string): Promise<void> => {
    const token = getAuthToken();
    await apiFetch(`/atmin/gallery/albums/${albumId}/cover`, {
      method: "PUT",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ photo_id: photoId }),
    });
  },

  /**
   * Updates the display order of photos within an album.
   * @param {string} albumId - The ID of the album.
   * @param {{ id: string; order: number }[]} photoOrders - An array of objects, each containing a photo ID and its new order.
   * @returns {Promise<void>} A promise that resolves when the photo order is successfully updated.
   * @throws {Error} If the API request fails.
   */
  updatePhotoOrder: async (
    albumId: string,
    photoOrders: { id: string; order: number }[]
  ): Promise<void> => {
    const token = getAuthToken();
    await apiFetch(`/atmin/gallery/albums/${albumId}/photos/order`, {
      method: "PUT",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ photo_orders: photoOrders }),
    });
  },

  /**
   * Deletes a photo by its ID.
   * @param {string} id - The ID of the photo to delete.
   * @returns {Promise<void>} A promise that resolves when the photo is successfully deleted.
   * @throws {Error} If the API request fails.
   */
  deletePhoto: async (id: string): Promise<void> => {
    const token = getAuthToken();
    await apiFetch(`/atmin/gallery/photos/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
};

export default galleryApi;
