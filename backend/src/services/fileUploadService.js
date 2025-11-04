// backend/src/services/fileUploadService.js

import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Polyfill for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @fileoverview
 * A flexible and reusable service for handling file uploads with Multer.
 * It provides a factory function to create custom upload middleware
 * and several pre-configured middlewares for common use cases like
 * document uploads, article covers, and user avatars.
 */

/**
 * Creates a multer disk storage configuration.
 * This function handles directory creation and provides a default
 * unique filename generator, which can be overridden.
 *
 * @param {string} [subfolder=""] - The subfolder within the main uploads directory.
 * @param {Function} [filenameGenerator=null] - A custom function to generate filenames. Receives (req, file, cb).
 * @returns {multer.StorageEngine} A configured multer disk storage engine.
 */
const createStorage = (subfolder = "", filenameGenerator = null) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadPath = path.resolve(__dirname, "../../uploads");
      if (subfolder) {
        uploadPath = path.join(uploadPath, subfolder);
        // Ensure the directory exists before attempting to write to it
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
      }
      cb(null, uploadPath);
    },
    filename:
      filenameGenerator ||
      ((req, file, cb) => {
        // Default filename generator: timestamp-random-originalname
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      }),
  });
};

/**
 * Creates a multer file filter to validate file types based on MIME types.
 *
 * @param {string[]} allowedMimeTypes - An array of allowed MIME types.
 * @returns {multer.FileFilterCallback} A multer file filter function.
 */
const createFileFilter = (allowedMimeTypes) => {
  return (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Only ${allowedMimeTypes.join(", ")} are allowed.`
        ),
        false
      );
    }
  };
};

/**
 * Factory function to create a configured Express middleware for handling single file uploads.
 * It wraps multer's middleware to provide consistent error handling.
 *
 * @param {object} [options={}] - Configuration options for the middleware.
 * @param {string} [options.subfolder=""] - The subfolder to save files in.
 * @param {string[]} [options.allowedMimeTypes=[]] - An array of allowed MIME types.
 * @param {number} [options.maxFileSize=10*1024*1024] - The maximum file size in bytes (default: 10MB).
 * @param {string} [options.fieldName="file"] - The name of the field in the multipart form.
 * @param {Function} [options.filenameGenerator=null] - A custom function to generate filenames.
 * @returns {import('express').RequestHandler} An Express middleware function.
 */
const createUploadMiddleware = (options = {}) => {
  const {
    subfolder = "",
    allowedMimeTypes = [],
    maxFileSize = 10 * 1024 * 1024, // 10MB
    fieldName = "file",
    filenameGenerator = null,
  } = options;

  const storage = createStorage(subfolder, filenameGenerator);
  const fileFilter = createFileFilter(allowedMimeTypes);

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: maxFileSize },
  }).single(fieldName);

  // Return a standard Express middleware that handles multer errors
  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        let message = "File upload error.";
        if (err.code === "LIMIT_FILE_SIZE") {
          message = `File is too large. Maximum size is ${
            maxFileSize / 1024 / 1024
          }MB.`;
        }
        return res.status(400).json({ message });
      } else if (err) {
        // An unknown error occurred.
        return res.status(400).json({ message: err.message });
      }
      // Everything went fine.
      next();
    });
  };
};

/**
 * @constant {import('express').RequestHandler}
 * @description
 * Pre-configured middleware for uploading document files (PDF, DOC, DOCX).
 * - Max Size: 10MB.
 * - Field Name: 'file'.
 * - Filename Format: DDMMYYYY_originalname.
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
    cb(null, `${datePrefix}_${file.originalname}`);
  },
});

/**
 * @constant {import('express').RequestHandler}
 * @description
 * Pre-configured middleware for uploading article cover images.
 * - Supported Types: JPEG, PNG, GIF, WebP.
 * - Max Size: 5MB.
 * - Field Name: 'coverImageFile'.
 * - Saved in: 'uploads/covers'.
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

/**
 * @constant {import('express').RequestHandler}
 * @description
 * Pre-configured middleware for uploading user avatars.
 * - Supported Types: JPEG, PNG, SVG.
 * - Max Size: 10MB.
 * - Field Name: 'avatar'.
 * - Saved in: 'uploads/avatars'.
 */
const avatarUpload = createUploadMiddleware({
  subfolder: "avatars",
  allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"],
  maxFileSize: 10 * 1024 * 1024,
  fieldName: "avatar",
});

export { createUploadMiddleware, documentUpload, imageUpload, avatarUpload };
