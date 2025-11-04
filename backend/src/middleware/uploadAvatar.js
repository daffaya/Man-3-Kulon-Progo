import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

/**
 * @fileoverview Multer configuration for uploading a single avatar image.
 * This module provides a pre-configured middleware to handle file uploads.
 *
 * Features:
 * - Stores uploaded files temporarily in a 'temp' directory.
 * - Generates a unique filename to prevent overwrites.
 * - Validates file type to ensure only images (jpeg, jpg, png, svg) are uploaded.
 * - Enforces a maximum file size of 10MB.
 * - Expects the file from a form field named 'avatar'.
 */

// Polyfill for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
const UPLOAD_DIR = path.join(__dirname, "../temp");
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = /jpeg|jpg|png|svg/;

// --- Multer Storage Engine ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Create a unique filename to avoid collisions
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// --- File Filter ---
const fileFilter = (req, file, cb) => {
  // Check both the file extension and the mimetype for security
  const extname = ALLOWED_FILE_TYPES.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = ALLOWED_FILE_TYPES.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    const error = new Error(
      "Error: File upload only supports image types (jpeg, jpg, png, svg)."
    );
    return cb(error, false);
  }
};

// --- Initialize Multer ---
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter,
});

// Export the middleware configured for a single file upload with the field name 'avatar'
export default upload.single("avatar");
