// backend/src/services/fileUploadService.js

import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Creates a multer disk storage configuration.
 * @param {string} [subfolder=""] - The subfolder within the main uploads directory to save files to.
 * @returns {multer.StorageEngine} A configured multer disk storage engine.
 */
const createStorage = (subfolder = "") => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadPath = path.resolve(__dirname, "../../uploads");
      if (subfolder) {
        uploadPath = path.join(uploadPath, subfolder);
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const now = new Date();
      const timestamp = now.getTime();
      const ext = path.extname(file.originalname);
      const filename = `${timestamp}${ext}`;
      cb(null, filename);
    },
  });
};

/**
 * Creates a multer file filter to validate file types.
 * @param {string[]} allowedMimeTypes - An array of allowed MIME types.
 * @returns {Function} A multer file filter function.
 */
const createFileFilter = (allowedMimeTypes) => {
  return (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Tipe file tidak valid. Hanya ${allowedMimeTypes.join(
            ", "
          )} yang diperbolehkan.`
        ),
        false
      );
    }
  };
};

/**
 * Factory function to create a configured multer upload middleware.
 * @param {object} [options={}] - Configuration options for the middleware.
 * @param {string} [options.subfolder=""] - The subfolder to save files in.
 * @param {string[]} [options.allowedMimeTypes=[]] - An array of allowed MIME types.
 * @param {number} [options.maxFileSize=10*1024*1024] - The maximum file size in bytes (default 10MB).
 * @param {string} [options.fieldName="file"] - The name of the field in the multipart form.
 * @param {Function} [options.filenameGenerator=null] - A custom function to generate filenames.
 * @returns {Function} An Express middleware function for handling file uploads.
 */
const createUploadMiddleware = (options = {}) => {
  const {
    subfolder = "",
    allowedMimeTypes = [],
    maxFileSize = 10 * 1024 * 1024,
    fieldName = "file",
    filenameGenerator = null,
  } = options;

  const storage = createStorage(subfolder);
  const fileFilter = createFileFilter(allowedMimeTypes);

  if (filenameGenerator) {
    storage.filename = filenameGenerator;
  }

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxFileSize,
    },
  }).single(fieldName);

  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
};

/**
 * Pre-configured middleware for uploading document files.
 * Supports PDF, DOC, and DOCX files up to 10MB.
 * Filenames are formatted as DDMMYYYY_originalname.
 */
const documentUpload = createUploadMiddleware({
  allowedMimeTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  maxFileSize: 10 * 1024 * 1024,
  fieldName: "file",
  filenameGenerator: (req, file, cb) => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const datePrefix = `${day}${month}${year}`;
    const fileName = file.originalname;
    cb(null, `${datePrefix}_${fileName}`);
  },
});

/**
 * Pre-configured middleware for uploading article cover images.
 * Supports JPEG, PNG, GIF, and WebP files up to 5MB.
 * Files are saved in the 'covers' subfolder with a timestamp-based filename.
 */
const imageUpload = createUploadMiddleware({
  subfolder: "covers",
  allowedMimeTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ],
  maxFileSize: 5 * 1024 * 1024,
  fieldName: "coverImageFile",
});

// Default export for backward compatibility.
export default documentUpload;

// Named exports for more specific use cases.
export { documentUpload, imageUpload, createUploadMiddleware };
