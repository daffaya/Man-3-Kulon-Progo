import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

/**
 * Factory function to create a Gallery Controller with CRUD operations.
 * @param {Object} dependencies - Dependencies to be injected
 * @param {Object} dependencies.galleryModel - Model for gallery operations
 * @param {Object} dependencies.userModel - Model for user operations (optional)
 * @returns {Object} Controller with CRUD methods
 */
const createGalleryController = ({ galleryModel, userModel }) => {
  /**
   * Helper function to prepare album data from request
   * @param {Object} req - Express request object
   * @param {string} [id] - Album ID (for updates)
   * @returns {Object} Prepared album data
   */
  const prepareAlbumData = async (req, id = null) => {
    const { title = "", description = "", cover_photo_id = null } = req.body;

    const slug = slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

    return {
      id: id || uuidv4(),
      title,
      slug,
      description,
      cover_photo_id,
      created_by: req.user.id,
    };
  };

  /**
   * Helper function to process uploaded images and create thumbnails
   * @param {Object} file - Uploaded file object
   * @returns {Promise<Object>} Processed file data
   */
  const processImage = async (file) => {
    // Generate thumbnail
    const thumbnailFilename = `thumb_${file.filename}`;
    const thumbnailPath = path.join(file.destination, thumbnailFilename);

    await sharp(file.path)
      .resize(300, 300, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    // Optimize original image
    await sharp(file.path)
      .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(file.path);

    // Return relative paths
    const albumId = path.basename(file.destination);
    return {
      image_url: `/uploads/gallery/${albumId}/${file.filename}`,
      thumbnail_url: `/uploads/gallery/${albumId}/${thumbnailFilename}`,
    };
  };

  return {
    /**
     * Creates a new album with data from request body.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    createAlbum: async (req, res) => {
      try {
        if (!req.body) {
          return res.status(400).json({ message: "Request body is missing" });
        }

        const { title } = req.body;
        if (!title) {
          return res.status(400).json({
            message: "Title is required",
          });
        }

        const albumData = await prepareAlbumData(req);
        const newAlbumId = await galleryModel.createAlbum(albumData);
        const newAlbum = await galleryModel.findAlbumById(newAlbumId);

        res.status(201).json({
          message: "Album created successfully",
          album: newAlbum,
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to create album",
          error: error.message,
        });
      }
    },

    /**
     * Updates an album by ID.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    updateAlbum: async (req, res) => {
      try {
        const { id } = req.params;

        if (!req.body) {
          return res.status(400).json({ message: "Request body is missing" });
        }

        const { title } = req.body;
        if (!title) {
          return res.status(400).json({
            message: "Title is required",
          });
        }

        const albumData = await prepareAlbumData(req, id);
        const updated = await galleryModel.updateAlbum(id, albumData);

        if (!updated) {
          return res.status(404).json({ message: "Album not found" });
        }

        const updatedAlbum = await galleryModel.findAlbumById(id);
        res.status(200).json({
          message: "Album updated successfully",
          album: updatedAlbum,
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to update album",
          error: error.message,
        });
      }
    },

    /**
     * Deletes an album by ID.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    deleteAlbum: async (req, res) => {
      try {
        const { id } = req.params;

        // Get album info for file cleanup
        const album = await galleryModel.findAlbumById(id);
        if (!album) {
          return res.status(404).json({ message: "Album not found" });
        }

        // Get photos for file cleanup
        const photos = await galleryModel.findPhotosByAlbumId(id);

        // Delete album (cascade will delete photos)
        const deleted = await galleryModel.deleteAlbum(id);

        if (!deleted) {
          return res.status(404).json({ message: "Album not found" });
        }

        // Clean up files
        for (const photo of photos) {
          try {
            const imagePath = path.join(
              __dirname,
              "../uploads",
              photo.image_url
            );
            const thumbnailPath = path.join(
              __dirname,
              "../uploads",
              photo.thumbnail_url
            );

            await fs.unlink(imagePath);
            await fs.unlink(thumbnailPath);
          } catch (fileError) {
            console.error("Failed to delete file:", fileError);
          }
        }

        res.status(200).json({ message: "Album deleted successfully" });
      } catch (error) {
        res.status(500).json({
          message: "Failed to delete album",
          error: error.message,
        });
      }
    },

    /**
     * Retrieves all albums for admin with filters and pagination.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    getAllAlbums: async (req, res) => {
      try {
        const filters = {
          keyword: req.query.keyword || "",
          page: parseInt(req.query.page, 10) || 1,
          limit: parseInt(req.query.limit, 10) || 12,
        };

        const result = await galleryModel.findAllAlbums(filters);
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({
          message: "Failed to fetch albums",
          error: error.message,
        });
      }
    },

    /**
     * Retrieves an album by ID.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    getAlbumById: async (req, res) => {
      try {
        const { id } = req.params;
        const album = await galleryModel.findAlbumById(id);

        if (!album) {
          return res.status(404).json({ message: "Album not found" });
        }

        const photos = await galleryModel.findPhotosByAlbumId(id);

        res.status(200).json({
          album,
          photos,
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to fetch album",
          error: error.message,
        });
      }
    },

    /**
     * Uploads photos to an album.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    // Di controller, bagian uploadPhotos
    uploadPhotos: async (req, res) => {
      try {
        const { album_id } = req.body;
        const files = req.files;

        if (!files || files.length === 0) {
          return res.status(400).json({
            message: "No files uploaded",
          });
        }

        // Process images using gallery upload service
        const processedFiles = await galleryUploadService.processImages(files);

        const uploadedPhotos = [];

        for (let i = 0; i < processedFiles.length; i++) {
          const file = processedFiles[i];

          const photoData = {
            album_id,
            title: file.originalName,
            description: "",
            image_url: file.image_url,
            thumbnail_url: file.thumbnail_url,
            alt_text: file.originalName,
            upload_order: i,
          };

          const photoId = await galleryModel.createPhoto(photoData);
          uploadedPhotos.push({
            id: photoId,
            image_url: file.image_url,
            thumbnail_url: file.thumbnail_url,
          });
        }

        res.status(201).json({
          message: "Photos uploaded successfully",
          photos: uploadedPhotos,
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to upload photos",
          error: error.message,
        });
      }
    },

    /**
     * Sets album cover.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    setAlbumCover: async (req, res) => {
      try {
        const { album_id, photo_id } = req.body;

        const updated = await galleryModel.updateAlbum(album_id, {
          cover_photo_id: photo_id,
        });

        if (!updated) {
          return res.status(404).json({ message: "Album not found" });
        }

        res.status(200).json({
          message: "Album cover updated successfully",
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to set album cover",
          error: error.message,
        });
      }
    },

    /**
     * Updates photo order in album.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    updatePhotoOrder: async (req, res) => {
      try {
        const { album_id } = req.params;
        const { photo_orders } = req.body;

        await galleryModel.updatePhotoOrder(album_id, photo_orders);

        res.status(200).json({
          message: "Photo order updated successfully",
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to update photo order",
          error: error.message,
        });
      }
    },

    /**
     * Deletes a photo by ID.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    deletePhoto: async (req, res) => {
      try {
        const { id } = req.params;

        const photo = await galleryModel.findPhotoById(id);
        if (!photo) {
          return res.status(404).json({ message: "Photo not found" });
        }

        const deleted = await galleryModel.deletePhoto(id);

        if (!deleted) {
          return res.status(404).json({ message: "Photo not found" });
        }

        // Clean up files
        try {
          const imagePath = path.join(__dirname, "../uploads", photo.image_url);
          const thumbnailPath = path.join(
            __dirname,
            "../uploads",
            photo.thumbnail_url
          );

          await fs.unlink(imagePath);
          await fs.unlink(thumbnailPath);
        } catch (fileError) {
          console.error("Failed to delete file:", fileError);
        }

        res.status(200).json({ message: "Photo deleted successfully" });
      } catch (error) {
        res.status(500).json({
          message: "Failed to delete photo",
          error: error.message,
        });
      }
    },
  };
};

export default createGalleryController;
