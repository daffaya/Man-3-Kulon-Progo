/**
 * @fileoverview Defines the Express router for archive-related endpoints.
 * This module creates and configures routes for retrieving, creating, updating, and deleting archive documents.
 * It includes public endpoints for fetching archives and downloading documents, as well as protected endpoints
 * for administrative operations, utilizing middleware for rate limiting, authentication, and role-based access control.
 */

import express from "express";
import archiveControllerFactory from "../controllers/archiveController.js";
import {
  authenticateTokenFactory,
  restrictTo,
} from "../middleware/authMiddleware.js";
import rateLimiter from "../middleware/rateLimiter.js";
import { documentUpload } from "../services/fileUploadService.js";

/**
 * Factory function to create an Express router for archive routes.
 * @param {Object} dependencies - The dependencies for the router.
 * @param {mysql.Pool} dependencies.pool - The database connection pool.
 * @param {string} dependencies.JWT_SECRET - The secret key for JWT authentication.
 * @returns {express.Router} The configured Express router for archive endpoints.
 */
const archiveRouterFactory = ({ pool, JWT_SECRET }) => {
  const router = express.Router();

  const {
    handleGetArchive,
    handleGetArchiveCategories,
    handleDownloadArchive,
    handleCreateArchive,
    handleUpdateArchive,
    handleDeleteArchive,
  } = archiveControllerFactory({ pool });

  const limiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Terlalu banyak permintaan. Coba lagi nanti" },
  });

  router.get("/", limiter, handleGetArchive);
  router.get("/categories", limiter, handleGetArchiveCategories);
  router.get("/:id/download", limiter, handleDownloadArchive);

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
