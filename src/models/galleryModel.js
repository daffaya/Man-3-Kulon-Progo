/**
 * @fileoverview Gallery model for database interactions.
 * This module provides a factory function to create a Gallery model.
 * The model includes methods for CRUD (Create, Read, Update, Delete) operations
 * on both gallery albums and photos, including functionalities to find
 * albums/photos by various criteria, update album covers, and manage photo ordering.
 */

/**
 * Factory function that creates a Gallery model for interacting with the database.
 *
 * @param {object} options
 * @param {import('mysql2/promise').Pool} options.pool - MySQL connection pool.
 * @returns {object} Gallery model methods.
 */
const createGalleryModel = ({ pool }) => {
  return {
    /**
     * Creates a new album record in the database.
     *
     * @param {object} albumData - Data for the new album.
     * @param {string|number} albumData.id - Unique identifier for the album.
     * @param {string} albumData.title - Title of the album.
     * @param {string} albumData.slug - URL-friendly slug for the album.
     * @param {string} albumData.description - Description of the album.
     * @param {string|number} albumData.cover_photo_id - ID of the cover photo.
     * @param {string|number} albumData.created_by - ID of the user who created the album.
     * @returns {Promise<string|number>} A promise that resolves to the ID of the newly created album.
     */
    async createAlbum(albumData) {
      try {
        const { id, title, slug, description, cover_photo_id, created_by } =
          albumData;

        const sql = `
          INSERT INTO gallery_albums 
          SET 
            id = ?, 
            title = ?, 
            slug = ?, 
            description = ?, 
            cover_photo_id = ?, 
            created_by = ?
        `;

        const params = [
          id,
          title,
          slug,
          description,
          cover_photo_id,
          created_by,
        ];

        const [result] = await pool.execute(sql, params);
        return result.insertId || id;
      } catch (error) {
        console.error("[GalleryModel] Error creating album:", error);
        throw error;
      }
    },

    /**
     * Finds all albums with optional filters and pagination.
     *
     * @param {object} [filters={}] - Filtering and pagination options.
     * @param {string} [filters.keyword=""] - Keyword to search in title and description.
     * @param {number} [filters.page=1] - The page number for pagination.
     * @param {number} [filters.limit=12] - The number of albums per page.
     * @returns {Promise<{albums: object[], totalAlbums: number, totalPages: number, currentPage: number, albumsPerPage: number}>} A promise that resolves to an object containing the albums and pagination metadata.
     */
    async findAllAlbums(filters = {}) {
      const { keyword = "", page = 1, limit = 12 } = filters;

      const offset = (page - 1) * limit;
      const conditions = [];
      const queryParams = [];

      if (keyword) {
        conditions.push(
          "(gallery_albums.title LIKE ? OR gallery_albums.description LIKE ?)"
        );
        queryParams.push(`%${keyword}%`, `%${keyword}%`);
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const sql = `
        SELECT
          a.id,
          a.title,
          a.slug,
          a.description,
          a.cover_photo_id,
          a.created_by,
          a.created_at,
          a.updated_at,
          COALESCE(photo_counts.photo_count, 0) as photo_count,
          cover_p.image_url as cover_image_url,
          cover_p.thumbnail_url as cover_thumbnail_url
        FROM gallery_albums a
        LEFT JOIN (
          SELECT album_id, COUNT(id) as photo_count
          FROM gallery_photos
          GROUP BY album_id
        ) photo_counts ON a.id = photo_counts.album_id
        LEFT JOIN gallery_photos cover_p ON a.cover_photo_id = cover_p.id
        ${whereClause}
        GROUP BY a.id
        ORDER BY a.created_at DESC
        LIMIT ${limit} OFFSET ${offset};
      `;

      const [rows] = await pool.execute(sql, queryParams);

      const [totalRows] = await pool.execute(
        `
        SELECT COUNT(*) AS total
        FROM gallery_albums a
        ${whereClause};
      `,
        queryParams
      );

      const totalAlbums = totalRows[0].total;

      const albums = rows.map((row) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description,
        cover_photo_id: row.cover_photo_id,
        created_by: row.created_by,
        created_at: row.created_at,
        updated_at: row.updated_at,
        photo_count: row.photo_count,
        cover_image_url: row.cover_image_url,
        cover_thumbnail_url: row.cover_thumbnail_url,
      }));

      return {
        albums,
        totalAlbums,
        totalPages: Math.ceil(totalAlbums / limit),
        currentPage: page,
        albumsPerPage: limit,
      };
    },

    /**
     * Finds a single album by its unique ID.
     *
     * @param {string|number} id - The ID of the album to find.
     * @returns {Promise<object|null>} A promise that resolves to the album object if found, otherwise `null`.
     */
    async findAlbumById(id) {
      const [rows] = await pool.execute(
        `
        SELECT
          a.id,
          a.title,
          a.slug,
          a.description,
          a.cover_photo_id,
          a.created_by,
          a.created_at,
          a.updated_at,
          COUNT(p.id) as photo_count,
          p.image_url as cover_image_url,
          p.thumbnail_url as cover_thumbnail_url
        FROM gallery_albums a
        LEFT JOIN gallery_photos p ON a.cover_photo_id = p.id
        WHERE a.id = ?;
      `,
        [id]
      );

      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description,
        cover_photo_id: row.cover_photo_id,
        created_by: row.created_by,
        created_at: row.created_at,
        updated_at: row.updated_at,
        photo_count: row.photo_count,
        cover_image_url: row.cover_image_url,
        cover_thumbnail_url: row.cover_thumbnail_url,
      };
    },

    /**
     * Finds a single album by its unique slug.
     *
     * @param {string} slug - The slug of the album to find.
     * @returns {Promise<object|null>} A promise that resolves to the album object if found, otherwise `null`.
     */
    async findAlbumBySlug(slug) {
      const [rows] = await pool.execute(
        `
        SELECT
          a.id,
          a.title,
          a.slug,
          a.description,
          a.cover_photo_id,
          a.created_by,
          a.created_at,
          a.updated_at,
          COALESCE(photo_counts.photo_count, 0) as photo_count,
          cover_p.image_url as cover_image_url,
          cover_p.thumbnail_url as cover_thumbnail_url
        FROM gallery_albums a
        LEFT JOIN (
          SELECT album_id, COUNT(id) as photo_count
          FROM gallery_photos
          GROUP BY album_id
        ) photo_counts ON a.id = photo_counts.album_id
        LEFT JOIN gallery_photos cover_p ON a.cover_photo_id = cover_p.id
        WHERE a.slug = ?;
      `,
        [slug]
      );

      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description,
        cover_photo_id: row.cover_photo_id,
        created_by: row.created_by,
        created_at: row.created_at,
        updated_at: row.updated_at,
        photo_count: row.photo_count,
        cover_image_url: row.cover_image_url,
        cover_thumbnail_url: row.cover_thumbnail_url,
      };
    },

    /**
     * Updates an existing album in the database by its ID.
     *
     * @param {string|number} id - The ID of the album to update.
     * @param {object} albumData - An object containing the album data to be updated.
     * @param {string} albumData.title - Updated title of the album.
     * @param {string} albumData.slug - Updated slug for the album.
     * @param {string} albumData.description - Updated description of the album.
     * @param {string|number} albumData.cover_photo_id - Updated ID of the cover photo.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the album was successfully updated, otherwise `false`.
     */
    async updateAlbum(id, albumData) {
      const { title, slug, description, cover_photo_id } = albumData;

      const sql = `
        UPDATE gallery_albums SET
          title = ?,
          slug = ?,
          description = ?,
          cover_photo_id = ?,
          updated_at = NOW()
        WHERE id = ?;
      `;

      const [result] = await pool.execute(sql, [
        title,
        slug,
        description,
        cover_photo_id,
        id,
      ]);

      return result.affectedRows > 0;
    },

    /**
     * Deletes an album from the database by its ID.
     *
     * @param {string|number} id - The ID of the album to delete.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the album was successfully deleted, otherwise `false`.
     */
    async deleteAlbum(id) {
      const [result] = await pool.execute(
        "DELETE FROM gallery_albums WHERE id = ?;",
        [id]
      );
      return result.affectedRows > 0;
    },

    /**
     * Updates the cover photo of an album.
     *
     * @param {string|number} albumId - The ID of the album to update.
     * @param {string|number} coverPhotoId - The ID of the photo to set as the cover.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the album cover was successfully updated, otherwise `false`.
     */
    async updateAlbumCover(albumId, coverPhotoId) {
      try {
        const sql = `
          UPDATE gallery_albums SET
            cover_photo_id = ?,
            updated_at = NOW()
          WHERE id = ?;
        `;

        const [result] = await pool.execute(sql, [coverPhotoId, albumId]);
        return result.affectedRows > 0;
      } catch (error) {
        console.error("[GalleryModel] Error updating album cover:", error);
        throw error;
      }
    },

    /**
     * Creates a new photo record in the database.
     *
     * @param {object} photoData - Data for the new photo.
     * @param {string|number} [photoData.id] - Unique identifier for the photo (optional, will be auto-generated if not provided).
     * @param {string|number} photoData.album_id - ID of the album the photo belongs to.
     * @param {string} [photoData.title] - Title of the photo.
     * @param {string} [photoData.description] - Description of the photo.
     * @param {string} photoData.image_url - URL to the full-size image.
     * @param {string} photoData.thumbnail_url - URL to the thumbnail image.
     * @param {string} [photoData.alt_text] - Alt text for the image.
     * @param {number} [photoData.upload_order] - Order of the photo in the album.
     * @returns {Promise<string|number>} A promise that resolves to the ID of the newly created photo.
     */
    async createPhoto(photoData) {
      try {
        const {
          id,
          album_id,
          title,
          description,
          image_url,
          thumbnail_url,
          alt_text,
          upload_order,
        } = photoData;

        const sql = id
          ? `
            INSERT INTO gallery_photos 
            SET 
              id = ?, 
              album_id = ?, 
              title = ?, 
              description = ?, 
              image_url = ?, 
              thumbnail_url = ?, 
              alt_text = ?, 
              upload_order = ?
          `
          : `
            INSERT INTO gallery_photos 
            SET 
              album_id = ?, 
              title = ?, 
              description = ?, 
              image_url = ?, 
              thumbnail_url = ?, 
              alt_text = ?, 
              upload_order = ?
          `;

        const params = id
          ? [
              id,
              album_id,
              title || null,
              description || null,
              image_url,
              thumbnail_url,
              alt_text || null,
              upload_order || 0,
            ]
          : [
              album_id,
              title || null,
              description || null,
              image_url,
              thumbnail_url,
              alt_text || null,
              upload_order || 0,
            ];

        const [result] = await pool.execute(sql, params);
        return result.insertId;
      } catch (error) {
        console.error("[GalleryModel] Error creating photo:", error);
        throw error;
      }
    },

    /**
     * Finds all photos belonging to a specific album.
     *
     * @param {string|number} albumId - The ID of the album.
     * @returns {Promise<object[]>} A promise that resolves to an array of photo objects.
     */
    async findPhotosByAlbumId(albumId) {
      const [rows] = await pool.execute(
        `
        SELECT
          id,
          album_id,
          title,
          description,
          image_url,
          thumbnail_url,
          alt_text,
          upload_order,
          created_at
        FROM gallery_photos 
        WHERE album_id = ? 
        ORDER BY upload_order ASC, created_at ASC;
      `,
        [albumId]
      );

      return rows.map((row) => ({
        id: row.id,
        album_id: row.album_id,
        title: row.title,
        description: row.description,
        image_url: row.image_url,
        thumbnail_url: row.thumbnail_url,
        alt_text: row.alt_text,
        upload_order: row.upload_order,
        created_at: row.created_at,
      }));
    },

    /**
     * Finds a single photo by its unique ID.
     *
     * @param {string|number} id - The ID of the photo to find.
     * @returns {Promise<object|null>} A promise that resolves to the photo object if found, otherwise `null`.
     */
    async findPhotoById(id) {
      const [rows] = await pool.execute(
        "SELECT * FROM gallery_photos WHERE id = ?;",
        [id]
      );

      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        id: row.id,
        album_id: row.album_id,
        title: row.title,
        description: row.description,
        image_url: row.image_url,
        thumbnail_url: row.thumbnail_url,
        alt_text: row.alt_text,
        upload_order: row.upload_order,
        created_at: row.created_at,
      };
    },

    /**
     * Updates an existing photo in the database by its ID.
     *
     * @param {string|number} id - The ID of the photo to update.
     * @param {object} photoData - An object containing the photo data to be updated.
     * @param {string} photoData.title - Updated title of the photo.
     * @param {string} photoData.description - Updated description of the photo.
     * @param {string} photoData.alt_text - Updated alt text for the photo.
     * @param {number} photoData.upload_order - Updated order of the photo in the album.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the photo was successfully updated, otherwise `false`.
     */
    async updatePhoto(id, photoData) {
      const { title, description, alt_text, upload_order } = photoData;

      const sql = `
        UPDATE gallery_photos SET
          title = ?,
          description = ?,
          alt_text = ?,
          upload_order = ?
        WHERE id = ?;
      `;

      const [result] = await pool.execute(sql, [
        title,
        description,
        alt_text,
        upload_order,
        id,
      ]);

      return result.affectedRows > 0;
    },

    /**
     * Deletes a photo from the database by its ID.
     *
     * @param {string|number} id - The ID of the photo to delete.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the photo was successfully deleted, otherwise `false`.
     */
    async deletePhoto(id) {
      const [result] = await pool.execute(
        "DELETE FROM gallery_photos WHERE id = ?;",
        [id]
      );
      return result.affectedRows > 0;
    },

    /**
     * Updates the order of photos in an album.
     *
     * @param {string|number} albumId - The ID of the album.
     * @param {Array<{id: string|number, order: number}>} photoOrders - Array of objects containing photo IDs and their new order.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the photo orders were successfully updated.
     */
    async updatePhotoOrder(albumId, photoOrders) {
      const query = `
        UPDATE gallery_photos 
        SET upload_order = ?
        WHERE id = ? AND album_id = ?
      `;

      for (const photo of photoOrders) {
        await pool.execute(query, [photo.order, photo.id, albumId]);
      }

      return true;
    },
  };
};

export default createGalleryModel;
