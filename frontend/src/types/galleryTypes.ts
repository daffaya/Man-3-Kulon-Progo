// frontend/src/types/galleryTypes.ts

/**
 * Represents a gallery album.
 */
export interface Album {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_photo_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  photo_count: number;
  cover_image_url: string | null;
  cover_thumbnail_url: string | null;
}

/**
 * Data structure for creating or updating an album.
 */
export interface AlbumFormData {
  title: string;
  description?: string;
  cover_photo_id?: string | null;
}

/**
 * Represents a photo in an album.
 */
export interface Photo {
  id: string;
  album_id: string;
  title: string;
  description: string;
  image_url: string;
  thumbnail_url: string;
  alt_text: string;
  upload_order: number;
  created_at: string;
}

/**
 * Data structure for creating or updating a photo.
 */
export interface PhotoFormData {
  album_id: string;
  title?: string;
  description?: string;
  alt_text?: string;
  upload_order?: number;
}

/**
 * Pagination response data for albums.
 */
export interface PaginationData<T> {
  albums: T[];
  totalAlbums: number;
  totalPages: number;
  currentPage: number;
  albumsPerPage: number;
}

/**
 * Filters for querying albums.
 */
export interface GalleryFilters {
  keyword?: string;
  page?: number;
  limit?: number;
}
