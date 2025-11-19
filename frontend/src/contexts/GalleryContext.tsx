/**
 * @fileoverview Gallery context provider for managing gallery-related state and operations.
 * This context provides centralized state management for albums and photos, including
 * CRUD operations, pagination, and loading states. It separates public and admin
 * gallery data and provides methods for managing both.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import galleryApi from "../api/galleryApi";
import {
  Album,
  AlbumFormData,
  Photo,
  GalleryFilters,
  PaginationData,
} from "../types/galleryTypes";

/**
 * Interface defining the shape of the gallery context.
 * Includes state properties and action methods for gallery management.
 */
interface GalleryContextType {
  // State
  state: {
    albums: Album[];
    adminAlbums: Album[];
    currentAlbum: Album | null;
    currentPhotos: Photo[];
    loading: boolean;
    adminLoading: boolean;
    error: string | null;
    adminPagination: {
      currentPage: number;
      totalPages: number;
      totalAlbums: number;
      albumsPerPage: number;
    };
    publicPagination: {
      currentPage: number;
      totalPages: number;
      totalAlbums: number;
      albumsPerPage: number;
    };
  };

  // Actions
  fetchAlbums: (filters?: GalleryFilters) => Promise<void>;
  fetchAdminAlbums: (filters?: GalleryFilters) => Promise<void>;
  fetchAlbumById: (id: string) => Promise<void>;
  fetchPublicAlbumById: (id: string) => Promise<void>;
  createAlbum: (albumData: AlbumFormData) => Promise<string>;
  updateAlbum: (id: string, albumData: AlbumFormData) => Promise<void>;
  deleteAlbum: (id: string) => Promise<void>;
  uploadPhotos: (albumId: string, files: File[]) => Promise<void>;
  setAlbumCover: (albumId: string, photoId: string) => Promise<void>;
  updatePhotoOrder: (
    albumId: string,
    photoOrders: { id: string; order: number }[]
  ) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
  clearCurrentAlbum: () => void;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

interface GalleryProviderProps {
  children: ReactNode;
}

/**
 * Provider component that manages gallery state and provides gallery-related actions.
 * Handles both public and admin gallery data with separate states and pagination.
 * @param {ReactNode} children - Child components that will have access to the gallery context
 */
export const GalleryProvider: React.FC<GalleryProviderProps> = ({
  children,
}) => {
  const [state, setState] = useState({
    albums: [] as Album[],
    adminAlbums: [] as Album[],
    currentAlbum: null as Album | null,
    currentPhotos: [] as Photo[],
    loading: false,
    adminLoading: false,
    error: null as string | null,
    adminPagination: {
      currentPage: 1,
      totalPages: 1,
      totalAlbums: 0,
      albumsPerPage: 12,
    },
    publicPagination: {
      currentPage: 1,
      totalPages: 1,
      totalAlbums: 0,
      albumsPerPage: 12,
    },
  });

  /**
   * Fetches public albums with optional filters.
   * Updates the albums state and pagination information.
   * @param {GalleryFilters} filters - Optional filters for pagination and search
   */
  const fetchAlbums = useCallback(
    async (filters: GalleryFilters = {}) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await galleryApi.getPublicAlbums({
          ...filters,
          page: filters.page || state.publicPagination.currentPage,
          limit: filters.limit || state.publicPagination.albumsPerPage,
        });

        setState((prev) => ({
          ...prev,
          albums: response.albums,
          publicPagination: {
            currentPage: response.currentPage,
            totalPages: response.totalPages,
            totalAlbums: response.totalAlbums,
            albumsPerPage: response.albumsPerPage,
          },
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch albums",
        }));
      }
    },
    [state.publicPagination.currentPage, state.publicPagination.albumsPerPage]
  );

  /**
   * Fetches admin albums with optional filters.
   * Updates the adminAlbums state and pagination information.
   * @param {GalleryFilters} filters - Optional filters for pagination and search
   */
  const fetchAdminAlbums = useCallback(
    async (filters: GalleryFilters = {}) => {
      setState((prev) => ({ ...prev, adminLoading: true, error: null }));

      try {
        const response = await galleryApi.getAdminAlbums({
          ...filters,
          page: filters.page || state.adminPagination.currentPage,
          limit: filters.limit || state.adminPagination.albumsPerPage,
        });

        setState((prev) => ({
          ...prev,
          adminAlbums: response.albums,
          adminPagination: {
            currentPage: response.currentPage,
            totalPages: response.totalPages,
            totalAlbums: response.totalAlbums,
            albumsPerPage: response.albumsPerPage,
          },
          adminLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          adminLoading: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch albums",
        }));
      }
    },
    [state.adminPagination.currentPage, state.adminPagination.albumsPerPage]
  );

  /**
   * Fetches a specific album by ID for admin view.
   * Updates the currentAlbum and currentPhotos state.
   * @param {string} id - The ID of the album to fetch
   */
  const fetchAlbumById = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await galleryApi.getAlbumById(id);
      setState((prev) => ({
        ...prev,
        currentAlbum: response.album,
        currentPhotos: response.photos,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch album",
      }));
    }
  }, []);

  /**
   * Fetches a specific public album by ID.
   * Updates the currentAlbum and currentPhotos state.
   * @param {string} id - The ID of the album to fetch
   */
  const fetchPublicAlbumById = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await galleryApi.getPublicAlbumById(id);
      setState((prev) => ({
        ...prev,
        currentAlbum: response.album,
        currentPhotos: response.photos,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch album",
      }));
    }
  }, []);

  /**
   * Creates a new album with the provided data.
   * @param {AlbumFormData} albumData - The data for the new album
   * @returns {Promise<string>} The ID of the created album
   */
  const createAlbum = useCallback(
    async (albumData: AlbumFormData): Promise<string> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const newAlbum = await galleryApi.createAlbum(albumData);
        setState((prev) => ({ ...prev, loading: false }));
        await fetchAdminAlbums();
        return newAlbum.id;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error ? error.message : "Failed to create album",
        }));
        throw error;
      }
    },
    [fetchAdminAlbums]
  );

  /**
   * Updates an existing album with new data.
   * @param {string} id - The ID of the album to update
   * @param {AlbumFormData} albumData - The new data for the album
   */
  const updateAlbum = useCallback(
    async (id: string, albumData: AlbumFormData) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await galleryApi.updateAlbum(id, albumData);
        setState((prev) => ({ ...prev, loading: false }));
        await fetchAdminAlbums();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error ? error.message : "Failed to update album",
        }));
        throw error;
      }
    },
    [fetchAdminAlbums]
  );

  /**
   * Deletes an album by ID.
   * @param {string} id - The ID of the album to delete
   */
  const deleteAlbum = useCallback(
    async (id: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await galleryApi.deleteAlbum(id);
        setState((prev) => ({ ...prev, loading: false }));
        await fetchAdminAlbums();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error ? error.message : "Failed to delete album",
        }));
        throw error;
      }
    },
    [fetchAdminAlbums]
  );

  /**
   * Uploads photos to a specific album.
   * Refreshes the current album data after successful upload.
   * @param {string} albumId - The ID of the album to upload photos to
   * @param {File[]} files - The files to upload
   */
  const uploadPhotos = useCallback(
    async (albumId: string, files: File[]) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await galleryApi.uploadPhotos(albumId, files);

        const timestamp = new Date().getTime();

        if (state.currentAlbum?.id === albumId) {
          await fetchAlbumById(albumId);

          setState((prev) => ({
            ...prev,
            loading: false,
            currentAlbum: prev.currentAlbum
              ? {
                  ...prev.currentAlbum,
                  updated_at: new Date().toISOString(),
                }
              : null,
          }));
        } else {
          setState((prev) => ({ ...prev, loading: false }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error ? error.message : "Failed to upload photos",
        }));
        throw error;
      }
    },
    [fetchAlbumById, state.currentAlbum?.id]
  );

  /**
   * Sets a photo as the album cover.
   * @param {string} albumId - The ID of the album
   * @param {string} photoId - The ID of the photo to set as cover
   */
  const setAlbumCover = useCallback(
    async (albumId: string, photoId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await galleryApi.setAlbumCover(albumId, photoId);
        setState((prev) => ({ ...prev, loading: false }));
        if (state.currentAlbum?.id === albumId) {
          await fetchAlbumById(albumId);
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to set album cover",
        }));
        throw error;
      }
    },
    [fetchAlbumById, state.currentAlbum?.id]
  );

  /**
   * Updates the order of photos in an album.
   * @param {string} albumId - The ID of the album
   * @param {Array} photoOrders - Array of photo IDs with their new order
   */
  const updatePhotoOrder = useCallback(
    async (albumId: string, photoOrders: { id: string; order: number }[]) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await galleryApi.updatePhotoOrder(albumId, photoOrders);
        setState((prev) => ({ ...prev, loading: false }));
        if (state.currentAlbum?.id === albumId) {
          await fetchAlbumById(albumId);
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update photo order",
        }));
        throw error;
      }
    },
    [fetchAlbumById, state.currentAlbum?.id]
  );

  /**
   * Deletes a photo by ID.
   * Refreshes the current album data after successful deletion.
   * @param {string} id - The ID of the photo to delete
   */
  const deletePhoto = useCallback(
    async (id: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await galleryApi.deletePhoto(id);
        setState((prev) => ({ ...prev, loading: false }));
        if (state.currentAlbum) {
          await fetchAlbumById(state.currentAlbum.id);
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error ? error.message : "Failed to delete photo",
        }));
        throw error;
      }
    },
    [fetchAlbumById, state.currentAlbum]
  );

  /**
   * Clears the current album and photos state.
   */
  const clearCurrentAlbum = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentAlbum: null,
      currentPhotos: [],
    }));
  }, []);

  const value: GalleryContextType = {
    state,
    fetchAlbums,
    fetchAdminAlbums,
    fetchAlbumById,
    fetchPublicAlbumById,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    uploadPhotos,
    setAlbumCover,
    updatePhotoOrder,
    deletePhoto,
    clearCurrentAlbum,
  };

  return (
    <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>
  );
};

/**
 * Hook to access the gallery context.
 * Throws an error if used outside of a GalleryProvider.
 * @returns {GalleryContextType} The gallery context value
 */
export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error("useGallery must be used within a GalleryProvider");
  }
  return context;
};
