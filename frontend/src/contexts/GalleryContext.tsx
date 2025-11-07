// frontend/src/contexts/GalleryContext.tsx
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

  const createAlbum = useCallback(
    async (albumData: AlbumFormData): Promise<string> => {
      // Ubah return type ke Promise<string>
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const newAlbum = await galleryApi.createAlbum(albumData); // Tangkap response
        setState((prev) => ({ ...prev, loading: false }));
        // Refresh the albums list
        await fetchAdminAlbums();
        return newAlbum.id; // Kembalikan ID album
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

  const updateAlbum = useCallback(
    async (id: string, albumData: AlbumFormData) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await galleryApi.updateAlbum(id, albumData);
        setState((prev) => ({ ...prev, loading: false }));
        // Refresh the albums list
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

  const deleteAlbum = useCallback(
    async (id: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await galleryApi.deleteAlbum(id);
        setState((prev) => ({ ...prev, loading: false }));
        // Refresh the albums list
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

  const uploadPhotos = useCallback(
    async (albumId: string, files: File[]) => {
      console.log(
        "GalleryContext uploadPhotos called with albumId:",
        albumId,
        "files:",
        files
      );
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        console.log("Calling galleryApi.uploadPhotos...");
        await galleryApi.uploadPhotos(albumId, files);
        console.log("galleryApi.uploadPhotos completed successfully");

        // Tambahkan cache busting timestamp untuk memastikan gambar baru dimuat
        const timestamp = new Date().getTime();

        // Refresh the current album dengan parameter timestamp
        if (state.currentAlbum?.id === albumId) {
          console.log("Refreshing current album...");
          await fetchAlbumById(albumId);
          console.log("Current album refreshed");

          // Tambahkan refresh untuk memastikan state terupdate
          setState((prev) => ({
            ...prev,
            loading: false,
            // Tambahkan timestamp untuk memaksa re-render
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
        console.error("Error in uploadPhotos:", error);
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

  const setAlbumCover = useCallback(
    async (albumId: string, photoId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await galleryApi.setAlbumCover(albumId, photoId);
        setState((prev) => ({ ...prev, loading: false }));
        // Refresh the current album
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

  const updatePhotoOrder = useCallback(
    async (albumId: string, photoOrders: { id: string; order: number }[]) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await galleryApi.updatePhotoOrder(albumId, photoOrders);
        setState((prev) => ({ ...prev, loading: false }));
        // Refresh the current album
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

  const deletePhoto = useCallback(
    async (id: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await galleryApi.deletePhoto(id);
        setState((prev) => ({ ...prev, loading: false }));
        // Refresh the current album
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

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error("useGallery must be used within a GalleryProvider");
  }
  return context;
};
