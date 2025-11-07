import multer from "multer";
import path from "path";
import sharp from "sharp";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

class GalleryUploadService {
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

    // Ensure base path exists on initialization
    this._ensureBasePath();
  }

  async _ensureBasePath() {
    try {
      const resolvedPath = path.resolve(this.basePath);
      await fs.mkdir(resolvedPath, { recursive: true });
      console.log("Base path created/verified:", resolvedPath);
    } catch (error) {
      console.error("Failed to create base path:", error);
    }
  }

  createMiddleware() {
    console.log("Creating gallery upload middleware");

    // Gunakan storage sederhana seperti fileUploadService
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        console.log("Storage destination called for:", file.originalname);

        // Resolve path seperti di fileUploadService
        const uploadPath = path.resolve(this.basePath);
        console.log("Upload path:", uploadPath);

        // Langsung cb tanpa async operation
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        console.log("Generating filename for:", file.originalname);
        const uniqueId = uuidv4();
        const ext = path.extname(file.originalname);
        const filename = `${uniqueId}${ext}`;
        console.log("Generated filename:", filename);
        cb(null, filename);
      },
    });

    const fileFilter = this._createFileFilter();

    const upload = multer({
      storage,
      fileFilter,
      limits: { fileSize: this.maxFileSize, files: this.maxFiles },
    }).array("photos", this.maxFiles);

    // Gunakan error handling sederhana seperti fileUploadService
    return (req, res, next) => {
      console.log("=== GALLERY UPLOAD MIDDLEWARE START ===");
      console.log("Request body:", req.body);

      upload(req, res, (err) => {
        console.log("=== MULTER UPLOAD CALLBACK ===");

        if (err instanceof multer.MulterError) {
          console.error("Multer error:", err);
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
          console.error("Unknown error:", err);
          return res.status(400).json({ message: err.message });
        }

        console.log("Files received:", req.files ? req.files.length : 0);

        if (!req.files || req.files.length === 0) {
          console.log("No files in request");
          return res.status(400).json({ message: "No files uploaded" });
        }

        // Langsung next tanpa proses kompleks
        console.log("Upload successful, calling next()");
        next();
      });
    };
  }

  _createFileFilter() {
    return (req, file, cb) => {
      console.log("File filter called for:", file.originalname, file.mimetype);
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

  // Method ini untuk dipanggil di controller setelah upload berhasil
  // Di dalam method processImages di GalleryUploadService.js
  async processImages(files, albumId) {
    console.log("Processing images:", files.length, "for album:", albumId);

    // Buat folder album jika belum ada
    const albumPath = path.join(this.basePath, albumId);
    await fs.mkdir(albumPath, { recursive: true });

    const processedFiles = [];

    for (const file of files) {
      try {
        console.log(`Processing file: ${file.originalname}`);

        // Pindahkan file dari temp location ke album folder
        const sourcePath = file.path;
        const destPath = path.join(albumPath, file.filename);

        console.log(`Moving from ${sourcePath} to ${destPath}`);
        await fs.rename(sourcePath, destPath);

        // Proses image (buat thumbnail, kompresi)
        const processed = await this._processSingleImage(destPath, file);
        processedFiles.push(processed);
      } catch (error) {
        console.error(`Failed to process image ${file.filename}:`, error);
        // Tetap masukkan ke array dengan info dasar
        processedFiles.push({
          originalName: file.originalname,
          filename: file.filename,
          image_url: `/uploads/gallery/${albumId}/${file.filename}`,
          thumbnail_url: `/uploads/gallery/${albumId}/${file.filename}`,
          size: file.size,
        });
      }
    }

    console.log("Image processing completed");
    return processedFiles;
  }

  async _processSingleImage(filePath, file) {
    console.log(`Processing single image: ${file.originalname}`);

    try {
      // Generate thumbnail
      const thumbnailFilename = `thumb_${file.filename}`;
      const thumbnailPath = path.join(
        path.dirname(filePath),
        thumbnailFilename
      );

      await sharp(filePath)
        .resize(300, 300, { fit: "cover" })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      // Optimize original image
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
      // Return basic info if processing fails
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

const createGalleryUploadService = (options = {}) => {
  console.log("Creating gallery upload service");
  const service = new GalleryUploadService(options);
  return {
    galleryUpload: service.createMiddleware.bind(service),
    processImages: service.processImages.bind(service),
  };
};

export default createGalleryUploadService;
