/**
 * Factory function that creates a Gallery model for interacting with the database.
 *
 * @param {object} options
 * @param {import('mysql2/promise').Pool} options.pool - MySQL connection pool
 * @returns {object} Gallery model methods
 */
const createGalleryModel = ({ pool }) => {
  return {
    /**
     * Create a new album record.
     * @param {object} albumData - Data for the new album.
     * @returns {Promise<string|number>} Inserted album ID.
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
     * Find all albums with pagination.
     * @param {object} [filters={}]
     * @returns {Promise<{albums: object[], totalAlbums: number, totalPages: number, currentPage: number, albumsPerPage: number}>}
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
          COUNT(p.id) as photo_count,
          p.image_url as cover_image_url,
          p.thumbnail_url as cover_thumbnail_url
        FROM gallery_albums a
        LEFT JOIN gallery_photos p ON a.cover_photo_id = p.id
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
     * Find album by its ID.
     * @param {string|number} id
     * @returns {Promise<object|null>}
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
     * Update album by ID.
     * @param {string|number} id
     * @param {object} albumData
     * @returns {Promise<boolean>} Whether the update succeeded
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
     * Delete album by ID.
     * @param {string|number} id
     * @returns {Promise<boolean>}
     */
    async deleteAlbum(id) {
      const [result] = await pool.execute(
        "DELETE FROM gallery_albums WHERE id = ?;",
        [id]
      );
      return result.affectedRows > 0;
    },

    /**
     * Create a new photo record.
     * @param {object} photoData - Data for the new photo.
     * @returns {Promise<string|number>} Inserted photo ID.
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

        const sql = `
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
        `;

        const params = [
          id,
          album_id,
          title,
          description,
          image_url,
          thumbnail_url,
          alt_text,
          upload_order,
        ];

        const [result] = await pool.execute(sql, params);
        return result.insertId || id;
      } catch (error) {
        console.error("[GalleryModel] Error creating photo:", error);
        throw error;
      }
    },

    /**
     * Find all photos by album ID.
     * @param {string|number} albumId
     * @returns {Promise<object[]>}
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
     * Find photo by its ID.
     * @param {string|number} id
     * @returns {Promise<object|null>}
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
     * Update photo by ID.
     * @param {string|number} id
     * @param {object} photoData
     * @returns {Promise<boolean>} Whether the update succeeded
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
     * Delete photo by ID.
     * @param {string|number} id
     * @returns {Promise<boolean>}
     */
    async deletePhoto(id) {
      const [result] = await pool.execute(
        "DELETE FROM gallery_photos WHERE id = ?;",
        [id]
      );
      return result.affectedRows > 0;
    },

    /**
     * Update photo order in album.
     * @param {string|number} albumId
     * @param {Array} photoOrders - Array of {id, order} objects
     * @returns {Promise<boolean>} Whether the update succeeded
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
