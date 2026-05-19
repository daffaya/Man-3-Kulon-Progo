import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

/**
 * @fileoverview Multer configuration for CMS image uploads.
 * Stores files in /uploads/cms/ with unique filenames.
 * Accepts jpeg, jpg, png, webp, gif, svg.
 * Max size: 15MB. Field name: "image".
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "../../uploads/cms");
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
const ALLOWED_FILE_TYPES = /jpeg|jpg|png|webp|gif|svg/;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const extname = ALLOWED_FILE_TYPES.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = ALLOWED_FILE_TYPES.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  return cb(
    new Error(
      "Hanya file gambar yang diperbolehkan (jpeg, jpg, png, webp, gif, svg).",
    ),
    false,
  );
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter,
});

export default upload.single("image");
