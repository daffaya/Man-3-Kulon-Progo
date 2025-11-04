// backend/src/services/galleryUploadService.js
import multer from "multer";
import path from "path";
import sharp from "sharp";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

/**
 * Dedicated service for gallery uploads with specific requirements:
 * - Multiple files support
 * - Image processing (thumbnail + compression)
 * - Album-based folder structure
 * - Batch error handling
 */
class GalleryUploadService {
  constructor(options = {}) {
    this.basePath = options.basePath || "uploads/gallery";
    this.maxFiles = options.maxFiles || 10;
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.allowedMimeTypes = options.allowedMimeTypes || [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
  }

  /**
   * Creates multer middleware for gallery uploads
   */
  createMiddleware() {
    const storage = this._createStorage();
    const fileFilter = this._createFileFilter();

    const upload = multer({
      storage,
      fileFilter,
      limits: {
        fileSize: this.maxFileSize,
        files: this.maxFiles,
      },
    }).array("photos", this.maxFiles);

    return this._wrapWithErrorHandler(upload);
  }

  /**
   * Creates storage configuration
   */
  _createStorage() {
    return multer.diskStorage({
      destination: async (req, file, cb) => {
        const albumId = req.body.album_id || "temp";
        const uploadPath = path.join(this.basePath, albumId);

        try {
          await fs.mkdir(uploadPath, { recursive: true });
          cb(null, uploadPath);
        } catch (error) {
          cb(error);
        }
      },
      filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueId}${ext}`);
      },
    });
  }

  /**
   * Creates file filter
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
   * Wraps multer upload with enhanced error handling
   */
  _wrapWithErrorHandler(upload) {
    return (req, res, next) => {
      upload(req, res, async (err) => {
        if (err) {
          // Clean up uploaded files on error
          if (req.files) {
            await this._cleanupFiles(req.files);
          }

          let message = "File upload error.";
          if (err.code === "LIMIT_FILE_SIZE") {
            message = `File is too large. Maximum size is ${
              this.maxFileSize / 1024 / 1024
            }MB.`;
          } else if (err.code === "LIMIT_FILE_COUNT") {
            message = `Too many files. Maximum is ${this.maxFiles} files.`;
          }

          return res.status(400).json({ message });
        }
        next();
      });
    };
  }

  /**
   * Processes uploaded images (creates thumbnails, compresses)
   */
  async processImages(files) {
    const processedFiles = [];

    for (const file of files) {
      try {
        const processed = await this._processSingleImage(file);
        processedFiles.push(processed);
      } catch (error) {
        console.error(`Failed to process image ${file.filename}:`, error);
        // Continue processing other files
      }
    }

    return processedFiles;
  }

  /**
   * Processes a single image
   */
  async _processSingleImage(file) {
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
      originalName: file.originalname,
      filename: file.filename,
      image_url: `/uploads/gallery/${albumId}/${file.filename}`,
      thumbnail_url: `/uploads/gallery/${albumId}/${thumbnailFilename}`,
      size: file.size,
    };
  }

  /**
   * Cleans up uploaded files
   */
  async _cleanupFiles(files) {
    for (const file of files) {
      try {
        await fs.unlink(file.path);

        // Try to delete thumbnail if it exists
        const thumbnailPath = path.join(
          path.dirname(file.path),
          `thumb_${file.filename}`
        );
        await fs.unlink(thumbnailPath).catch(() => {});
      } catch (error) {
        console.error("Failed to cleanup file:", error);
      }
    }
  }
}

/**
 * Factory function to create gallery upload service
 */
const createGalleryUploadService = (options = {}) => {
  const service = new GalleryUploadService(options);
  return {
    galleryUpload: service.createMiddleware.bind(service),
    processImages: service.processImages.bind(service),
  };
};

export default createGalleryUploadService;
