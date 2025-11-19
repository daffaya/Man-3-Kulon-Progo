/**
 * @fileoverview Router for managing admin gallery-related endpoints.
 * This module defines and configures an Express router for CRUD operations on albums and photos.
 * It applies authentication and role-based authorization middleware to all routes.
 */

import { Router } from "express";
import {
  authenticateTokenFactory,
  restrictTo,
} from "../middleware/authMiddleware.js";
import createGalleryUploadMiddleware from "../middleware/galleryUpload.js";
import createGalleryModel from "../models/galleryModel.js";
import createGalleryController from "../controllers/galleryController.js";
import createGalleryUploadService from "../services/galleryUploadService.js";

/**
 * Factory function that creates the admin gallery router.
 * This router handles CRUD operations for albums and photos, with authentication and role-based access restrictions.
 *
 * @param {object} dependencies - The dependencies object.
 * @param {import('mysql2/promise').Pool} dependencies.pool - MySQL connection pool.
 * @param {string} dependencies.JWT_SECRET - Secret key for JWT authentication.
 * @returns {import('express').Router} Configured Express router.
 */
const adminGalleryRouterFactory = ({ pool, JWT_SECRET }) => {
  const router = Router();

  const authenticateToken = authenticateTokenFactory({ JWT_SECRET });
  router.use(authenticateToken);

  router.use(
    restrictTo([
      "super_admin",
      "jurnalis",
      "pengelola_bmn",
      "guru_bk",
      "arsiparis",
    ])
  );

  const galleryModel = createGalleryModel({ pool });
  const galleryUploadService = createGalleryUploadService();
  const galleryController = createGalleryController({
    galleryModel,
    galleryUploadService,
  });

  router.post("/albums", galleryController.createAlbum);
  router.get("/albums", galleryController.getAllAlbums);
  router.get("/albums/:id", galleryController.getAlbumById);
  router.put("/albums/:id", galleryController.updateAlbum);
  router.delete("/albums/:id", galleryController.deleteAlbum);

  router.post(
    "/photos",
    createGalleryUploadMiddleware(),
    galleryController.uploadPhotos
  );
  router.put("/albums/:album_id/cover", galleryController.setAlbumCover);
  router.put(
    "/albums/:album_id/photos/order",
    galleryController.updatePhotoOrder
  );
  router.delete("/photos/:id", galleryController.deletePhoto);

  return router;
};

export default adminGalleryRouterFactory;
