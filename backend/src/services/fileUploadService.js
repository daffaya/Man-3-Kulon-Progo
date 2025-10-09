import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Konfigurasi storage untuk Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve(__dirname, "../../uploads");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const datePrefix = `${day}${month}${year}`; // Format DDMMYYYY
    const fileName = file.originalname;
    cb(null, `${datePrefix}_${fileName}`);
  },
});

// Filter untuk hanya izinkan PDF dan Word
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Tipe file tidak valid. Hanya PDF dan Word (.doc, .docx) yang diperbolehkan."
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
}).single("file");

export default upload;
