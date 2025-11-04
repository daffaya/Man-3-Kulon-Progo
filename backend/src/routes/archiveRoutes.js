import express from "express";
import archiveControllerFactory from "../controllers/archiveController.js";
import {
  authenticateTokenFactory,
  restrictTo,
} from "../middleware/authMiddleware.js";
import rateLimiter from "../middleware/rateLimiter.js";
import { documentUpload } from "../services/fileUploadService.js";

const archiveRouterFactory = ({ pool, JWT_SECRET }) => {
  const router = express.Router();

  // Inisiasi controller dengan pool
  const {
    handleGetArchive,
    handleGetArchiveCategories,
    handleDownloadArchive,
    handleCreateArchive,
    handleUpdateArchive,
    handleDeleteArchive,
  } = archiveControllerFactory({ pool });

  // Rate limiter
  const limiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 100, // 100 request per IP
    message: { error: "Terlalu banyak permintaan. Coba lagi nanti" },
  });

  // Public Endpoint
  router.get("/", limiter, handleGetArchive);
  router.get("/categories", limiter, handleGetArchiveCategories);
  router.get("/:id/download", limiter, handleDownloadArchive);

  // Protected endpoint
  router.post(
    "/",
    authenticateTokenFactory({ JWT_SECRET }),
    restrictTo(["arsiparis", "super_admin"]),
    documentUpload,
    handleCreateArchive
  );
  router.put(
    "/:id",
    authenticateTokenFactory({ JWT_SECRET }),
    restrictTo(["arsiparis", "super_admin"]),
    documentUpload,
    handleUpdateArchive
  );
  router.delete(
    "/:id",
    authenticateTokenFactory({ JWT_SECRET }),
    restrictTo(["arsiparis", "super_admin"]),
    handleDeleteArchive
  );

  return router;
};

export default archiveRouterFactory;
