import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

/**
 * Creates and configures a Multer middleware for handling gallery image uploads.
 * This middleware handles multiple image files, saves them to a temporary directory,
 * and applies file type and size restrictions.
 *
 * @returns {Function} An Express middleware function configured by Multer.
 */
const createGalleryUploadMiddleware = () => {
  // Ensure the temporary directory for uploads exists
  const tempDir = path.resolve("uploads/temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, tempDir);
    },
    filename: (req, file, cb) => {
      const uniqueId = uuidv4();
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueId}${ext}`);
    },
  });

  /**
   * Multer file filter function to accept only specific image types.
   * @param {Object} req - The Express request object.
   * @param {Object} file - The file object from the request.
   * @param {Function} cb - The callback function to indicate if the file should be accepted.
   */
  const fileFilter = (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
        ),
        false
      );
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024, files: 10 },
  }).array("photos", 10);
};

export default createGalleryUploadMiddleware;
