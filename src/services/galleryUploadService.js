/**
 * @fileoverview Gallery upload service for handling image uploads.
 * This module provides a service for handling gallery image uploads, including file validation,
 * storage, and image processing such as thumbnail generation and optimization.
 */

import multer from "multer";
import path from "path";
import sharp from "sharp";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

/**
 * Service class for handling gallery image uploads.
 * Provides functionality for file validation, storage, and image processing.
 */
class GalleryUploadService {
  /**
   * Creates an instance of GalleryUploadService.
   * @param {Object} options - Configuration options for the service.
   * @param {string} [options.basePath="uploads/gallery"] - Base path for storing uploaded images.
   * @param {number} [options.maxFiles=10] - Maximum number of files allowed per upload.
   * @param {number} [options.maxFileSize=10485760] - Maximum file size in bytes (default: 10MB).
   * @param {string[]} [options.allowedMimeTypes] - Array of allowed MIME types.
   */
  constructor(options = {}) {
    this.basePath = options.basePath || "uploads/gallery";
    this.maxFiles = options.maxFiles || 10;
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024;
    this.allowedMimeTypes = options.allowedMimeTypes || [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    this._ensureBasePath();
  }

  /**
   * Ensures the base path for storing images exists.
   * @private
   */
  async _ensureBasePath() {
    try {
      const resolvedPath = path.resolve(this.basePath);
      await fs.mkdir(resolvedPath, { recursive: true });
    } catch (error) {
      console.error("Failed to create base path:", error);
    }
  }

  /**
   * Creates a multer middleware for handling file uploads.
   * @returns {Function} Express middleware function for handling file uploads.
   */
  createMiddleware() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.resolve(this.basePath);
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        const ext = path.extname(file.originalname);
        const filename = `${uniqueId}${ext}`;
        cb(null, filename);
      },
    });

    const fileFilter = this._createFileFilter();

    const upload = multer({
      storage,
      fileFilter,
      limits: { fileSize: this.maxFileSize, files: this.maxFiles },
    }).array("photos", this.maxFiles);

    return (req, res, next) => {
      upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          let message = "File upload error.";
          if (err.code === "LIMIT_FILE_SIZE") {
            message = `File is too large. Maximum size is ${
              this.maxFileSize / 1024 / 1024
            }MB.`;
          } else if (err.code === "LIMIT_FILE_COUNT") {
            message = `Too many files. Maximum is ${this.maxFiles} files.`;
          }
          return res.status(400).json({ message });
        } else if (err) {
          return res.status(400).json({ message: err.message });
        }

        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ message: "No files uploaded" });
        }

        next();
      });
    };
  }

  /**
   * Creates a file filter function for validating file types.
   * @private
   * @returns {Function} File filter function for multer.
   */
  _createFileFilter() {
    return (req, file, cb) => {
      if (this.allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            `Invalid file type. Only ${this.allowedMimeTypes.join(
              ", "
            )} are allowed.`
          ),
          false
        );
      }
    };
  }

  /**
   * Processes uploaded images by moving them to album folders and creating thumbnails.
   * @param {Array<Object>} files - Array of uploaded file objects from multer.
   * @param {string} albumId - ID of the album to organize images into.
   * @returns {Promise<Array<Object>>} Promise that resolves to an array of processed file information.
   */
  async processImages(files, albumId) {
    const albumPath = path.join(this.basePath, albumId);
    await fs.mkdir(albumPath, { recursive: true });

    const processedFiles = [];

    for (const file of files) {
      try {
        const sourcePath = file.path;
        const destPath = path.join(albumPath, file.filename);
        await fs.rename(sourcePath, destPath);

        const processed = await this._processSingleImage(destPath, file);
        processedFiles.push(processed);
      } catch (error) {
        console.error(`Failed to process image ${file.filename}:`, error);
        processedFiles.push({
          originalName: file.originalname,
          filename: file.filename,
          image_url: `/uploads/gallery/${albumId}/${file.filename}`,
          thumbnail_url: `/uploads/gallery/${albumId}/${file.filename}`,
          size: file.size,
        });
      }
    }

    return processedFiles;
  }

  /**
   * Processes a single image by creating a thumbnail and optimizing the original.
   * @private
   * @param {string} filePath - Path to the image file.
   * @param {Object} file - File object from multer.
   * @returns {Promise<Object>} Promise that resolves to processed file information.
   */
  async _processSingleImage(filePath, file) {
    try {
      const thumbnailFilename = `thumb_${file.filename}`;
      const thumbnailPath = path.join(
        path.dirname(filePath),
        thumbnailFilename
      );

      await sharp(filePath)
        .resize(300, 300, { fit: "cover" })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      await sharp(filePath)
        .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(filePath);

      const albumId = path.basename(path.dirname(filePath));
      return {
        originalName: file.originalname,
        filename: file.filename,
        image_url: `/uploads/gallery/${albumId}/${file.filename}`,
        thumbnail_url: `/uploads/gallery/${albumId}/${thumbnailFilename}`,
        size: file.size,
      };
    } catch (error) {
      console.error("Sharp processing error:", error);
      const albumId = path.basename(path.dirname(filePath));
      return {
        originalName: file.originalname,
        filename: file.filename,
        image_url: `/uploads/gallery/${albumId}/${file.filename}`,
        thumbnail_url: `/uploads/gallery/${albumId}/${file.filename}`,
        size: file.size,
      };
    }
  }
}

/**
 * Factory function to create a gallery upload service with its methods bound.
 * @param {Object} options - Configuration options for the service.
 * @returns {Object} Object containing the gallery upload middleware and image processing method.
 */
const createGalleryUploadService = (options = {}) => {
  const service = new GalleryUploadService(options);
  return {
    galleryUpload: service.createMiddleware.bind(service),
    processImages: service.processImages.bind(service),
  };
};

export default createGalleryUploadService;
