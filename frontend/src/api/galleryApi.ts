// frontend/src/api/galleryApi.ts
import {
  Album,
  AlbumFormData,
  Photo,
  PhotoFormData,
  PaginationData,
  GalleryFilters,
} from "../types/galleryTypes";

const API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001";

/**
 * Mengambil header Authorization jika token tersedia di localStorage.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Menangani response dari fetch API.
 * @param response Response dari fetch
 * @throws Error jika response tidak OK
 * @returns Data JSON
 */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Something went wrong");
  }
  return response.json();
};

const galleryApi = {
  /**
   * Membuat album baru.
   * @param formData Data album
   * @returns Album yang dibuat
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
   * Mengambil album untuk admin dengan filter.
   * @param filters Filter album
   * @returns Data album dengan pagination
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
   * Mengambil album publik dengan filter.
   * @param filters Filter album
   * @returns Data album dengan pagination
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
   * Mengambil album berdasarkan ID.
   * @param id ID album
   * @returns Album dengan foto-fotonya
   */
  getAlbumById: async (
    id: string
  ): Promise<{ album: Album; photos: Photo[] }> => {
    const timestamp = new Date().getTime();
    const response = await fetch(`${API_URL}/api/atmin/gallery/albums/${id}`, {
      headers: getAuthHeaders(),
      cache: "no-cache",
    });

    return handleResponse(response);
  },

  /**
   * Mengambil album publik berdasarkan ID.
   * @param id ID album
   * @returns Album dengan foto-fotonya
   */
  getPublicAlbumById: async (
    id: string
  ): Promise<{ album: Album; photos: Photo[] }> => {
    const response = await fetch(`${API_URL}/api/gallery/albums/${id}`);
    return handleResponse(response);
  },

  /**
   * Memperbarui album.
   * @param id ID album
   * @param formData Data album
   * @returns Album yang diperbarui
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
   * Menghapus album berdasarkan ID.
   * @param id ID album
   */
  deleteAlbum: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/api/atmin/gallery/albums/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    await handleResponse(response);
  },

  /**
   * Upload foto ke album.
   * @param albumId ID album
   * @param files File foto yang akan diupload
   * @returns Foto yang diupload
   */
  // Di galleryApi.ts, perbaiki uploadPhotos method
  uploadPhotos: async (albumId: string, files: File[]): Promise<Photo[]> => {
    console.log(
      "galleryApi.uploadPhotos called with albumId:",
      albumId,
      "files count:",
      files.length
    );

    const formData = new FormData();
    formData.append("album_id", albumId);

    files.forEach((file) => {
      console.log("Appending file:", file.name, file.size);
      formData.append("photos", file);
    });

    try {
      console.log("Sending request to:", `${API_URL}/api/atmin/gallery/photos`);

      // Tambahkan timeout yang lebih lama untuk upload gambar
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 60 seconds timeout, bukan 30

      const response = await fetch(`${API_URL}/api/atmin/gallery/photos`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Response error:", errorData);
        throw new Error(errorData.message || "Upload failed");
      }

      const result = await response.json();
      console.log("Upload response:", result);
      return result.photos || [];
    } catch (error: any) {
      console.error("UploadPhotos API error:", error);

      // Tangani error spesifik
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
   * Menentukan cover album.
   * @param albumId ID album
   * @param photoId ID foto yang akan dijadikan cover
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
        // Hanya kirim photo_id di body
        body: JSON.stringify({ photo_id: photoId }),
      }
    );

    await handleResponse(response);
  },

  /**
   * Memperbarui urutan foto di album.
   * @param albumId ID album
   * @param photoOrders Array dari {id, order}
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
   * Menghapus foto berdasarkan ID.
   * @param id ID foto
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
