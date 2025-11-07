// backend/src/controllers/galleryController.js
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";
import GalleryService from "../services/galleryService.js";
import GalleryModel from "../models/galleryModel.js";

/**
 * Factory function to create a Gallery Controller with CRUD operations.
 * @param {Object} dependencies - Dependencies to be injected
 * @param {Object} dependencies.galleryModel - Model for gallery operations
 * @returns {Object} Controller with CRUD methods
 */
const createGalleryController = ({ galleryModel }) => {
  const galleryService = new GalleryService();

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
     * Retrieves an album by slug (for public access).
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    getAlbumBySlug: async (req, res) => {
      try {
        const { slug } = req.params;
        const album = await galleryModel.findAlbumBySlug(slug);

        if (!album) {
          return res.status(404).json({ message: "Album not found" });
        }

        const photos = await galleryModel.findPhotosByAlbumId(album.id);

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
    uploadPhotos: async (req, res) => {
      try {
        const { album_id } = req.body;
        const files = req.files;

        console.log("Upload request received:", {
          album_id,
          filesCount: files?.length,
        });

        if (!files || files.length === 0) {
          return res.status(400).json({ message: "No files uploaded" });
        }

        if (!album_id) {
          return res.status(400).json({ message: "Album ID is required" });
        }

        // Process uploaded files using gallery service
        const processedFiles = await galleryService.processUploadedFiles(
          files,
          album_id
        );

        // Save processed files to database
        const savedPhotos = [];
        for (const file of processedFiles) {
          // Validate all required fields
          if (!file.filename || !file.url || !file.thumbnailUrl) {
            console.error("Invalid file data:", file);
            continue; // Skip this file
          }

          const photoData = {
            id: undefined, // Biarkan database generate ID (auto increment)
            album_id: album_id,
            title: file.originalName || file.filename, // Gunakan originalName jika tersedia
            description: "", // Kosongkan karena tidak ada input deskripsi
            image_url: file.url,
            thumbnail_url: file.thumbnailUrl,
            alt_text: file.originalName || file.filename, // Gunakan nama file sebagai alt text
            upload_order: savedPhotos.length + 1, // Berikan urutan berdasarkan jumlah foto yang sudah disimpan
          };

          try {
            const photoId = await galleryModel.createPhoto(photoData);
            savedPhotos.push({ id: photoId, ...file });
          } catch (dbError) {
            console.error("Database error for file:", file, dbError);
          }
        }

        if (savedPhotos.length === 0) {
          return res.status(500).json({
            message: "Failed to save any photos to database",
          });
        }

        res.status(201).json({
          message: "Photos uploaded successfully",
          photos: savedPhotos,
        });
      } catch (error) {
        console.error("UploadPhotos controller error:", error);

        // Return proper JSON error response
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
        // Ambil album_id dari params, bukan dari body
        const { album_id } = req.params;
        const { photo_id } = req.body;

        console.log("Setting album cover:", { album_id, photo_id });

        // Validasi input
        if (!album_id || !photo_id) {
          return res.status(400).json({
            message: "Album ID and Photo ID are required",
          });
        }

        // Gunakan metode khusus untuk update cover saja
        const updated = await galleryModel.updateAlbumCover(album_id, photo_id);

        if (!updated) {
          return res.status(404).json({ message: "Album not found" });
        }

        res.status(200).json({
          message: "Album cover updated successfully",
        });
      } catch (error) {
        console.error("Error in setAlbumCover:", error);
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
