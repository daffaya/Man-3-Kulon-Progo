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

/**
 * The base URL for the backend API, retrieved from environment variables.
 * Defaults to "http://localhost:3001" for local development.
 * @type {string}
 */
const API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001";

/**
 * Retrieves the authorization headers for API requests.
 * Checks localStorage for a JWT token and includes it in the headers if present.
 * @returns {Record<string, string>} The authorization headers.
 */
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Handles the response from a fetch API call.
 * Checks if the response is OK and parses the JSON body.
 * Throws an error with a message from the response body if the response is not OK.
 * @param {Response} response - The response object from a fetch call.
 * @returns {Promise<any>} A promise that resolves with the parsed JSON data.
 * @throws {Error} If the response status is not OK.
 */
const handleResponse = async (response: Response): Promise<any> => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Something went wrong");
  }
  return response.json();
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
    const response = await fetch(`${API_URL}/api/atmin/gallery/albums`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(formData),
    });

    const result = await handleResponse(response);
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

    const response = await fetch(
      `${API_URL}/api/atmin/gallery/albums?${params}`,
      {
        headers: getAuthHeaders(),
      }
    );

    return handleResponse(response);
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

    const response = await fetch(`${API_URL}/api/gallery/albums?${params}`);
    return handleResponse(response);
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
    const response = await fetch(`${API_URL}/api/atmin/gallery/albums/${id}`, {
      headers: getAuthHeaders(),
      cache: "no-cache",
    });

    return handleResponse(response);
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
    const response = await fetch(`${API_URL}/api/gallery/albums/${id}`);
    return handleResponse(response);
  },

  /**
   * Updates an existing album by sending a PUT request to the server.
   * @param {string} id - The ID of the album to update.
   * @param {AlbumFormData} formData - The updated data for the album.
   * @returns {Promise<Album>} A promise that resolves with the updated album.
   * @throws {Error} If the API request fails.
   */
  updateAlbum: async (id: string, formData: AlbumFormData): Promise<Album> => {
    const response = await fetch(`${API_URL}/api/atmin/gallery/albums/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(formData),
    });

    const result = await handleResponse(response);
    return result.album || result;
  },

  /**
   * Deletes an album by its ID.
   * @param {string} id - The ID of the album to delete.
   * @returns {Promise<void>} A promise that resolves when the album is successfully deleted.
   * @throws {Error} If the API request fails.
   */
  deleteAlbum: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/api/atmin/gallery/albums/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    await handleResponse(response);
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

      const response = await fetch(`${API_URL}/api/atmin/gallery/photos`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
        },
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
    const response = await fetch(
      `${API_URL}/api/atmin/gallery/albums/${albumId}/cover`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ photo_id: photoId }),
      }
    );

    await handleResponse(response);
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
    const response = await fetch(
      `${API_URL}/api/atmin/gallery/albums/${albumId}/photos/order`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ photo_orders: photoOrders }),
      }
    );

    await handleResponse(response);
  },

  /**
   * Deletes a photo by its ID.
   * @param {string} id - The ID of the photo to delete.
   * @returns {Promise<void>} A promise that resolves when the photo is successfully deleted.
   * @throws {Error} If the API request fails.
   */
  deletePhoto: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/api/atmin/gallery/photos/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    await handleResponse(response);
  },
};

export default galleryApi;
