import { Router } from "express";
import {
  authenticateTokenFactory,
  restrictTo,
} from "../middleware/authMiddleware.js";
import { createGalleryUploadMiddleware } from "../services/fileUploadService.js";

// Models
import createGalleryModel from "../models/galleryModel.js";
import createUserModel from "../models/userModel.js";

// Controller
import createGalleryController from "../controllers/galleryController.js";

/**
 * Factory function that creates and configures the router for admin gallery management.
 * This router handles CRUD operations for gallery albums and photos and is protected
 * by authentication and role-based authorization.
 *
 * @param {object} dependencies - The dependencies for the router.
 * @param {import('mysql2/promise').Pool} dependencies.pool - MySQL connection pool.
 * @param {string} dependencies.JWT_SECRET - Secret key for JWT authentication.
 * @returns {import('express').Router} Configured Express router for admin gallery routes.
 */
const adminGalleryRouterFactory = ({ pool, JWT_SECRET }) => {
  const router = Router();

  // --- Middleware Setup ---
  // Apply authentication to all routes in this router
  const authenticateToken = authenticateTokenFactory({ JWT_SECRET });
  router.use(authenticateToken);

  // Restrict access to all roles (semua role bisa akses gallery)
  router.use(
    restrictTo([
      "super_admin",
      "jurnalis",
      "pengelola_bmn",
      "guru_bk",
      "arsiparis",
    ])
  );

  // --- Model, Service, and Controller Initialization ---
  const galleryModel = createGalleryModel({ pool });
  const userModel = createUserModel({ pool });
  const galleryUpload = createGalleryUploadMiddleware();

  const galleryController = createGalleryController({
    galleryModel,
    userModel,
  });

  // --- API Endpoints ---

  /**
   * @route   POST /albums
   * @desc    Create a new album.
   * @access  Private (All roles)
   */
  router.post("/albums", galleryController.createAlbum);

  /**
   * @route   GET /albums
   * @desc    Get a list of all albums.
   * @access  Private (All roles)
   */
  router.get("/albums", galleryController.getAllAlbums);

  /**
   * @route   GET /albums/:id
   * @desc    Get a single album by its ID.
   * @access  Private (All roles)
   */
  router.get("/albums/:id", galleryController.getAlbumById);

  /**
   * @route   PUT /albums/:id
   * @desc    Update an existing album by its ID.
   * @access  Private (All roles)
   */
  router.put("/albums/:id", galleryController.updateAlbum);

  /**
   * @route   DELETE /albums/:id
   * @desc    Delete an album by its ID.
   * @access  Private (All roles)
   */
  router.delete("/albums/:id", galleryController.deleteAlbum);

  /**
   * @route   POST /photos
   * @desc    Upload photos to an album.
   * @access  Private (All roles)
   */
  router.post("/photos", galleryUpload, galleryController.uploadPhotos);

  /**
   * @route   PUT /albums/:album_id/cover
   * @desc    Set album cover photo.
   * @access  Private (All roles)
   */
  router.put("/albums/:album_id/cover", galleryController.setAlbumCover);

  /**
   * @route   PUT /albums/:album_id/photos/order
   * @desc    Update photo order in album.
   * @access  Private (All roles)
   */
  router.put(
    "/albums/:album_id/photos/order",
    galleryController.updatePhotoOrder
  );

  /**
   * @route   DELETE /photos/:id
   * @desc    Delete a photo by its ID.
   * @access  Private (All roles)
   */
  router.delete("/photos/:id", galleryController.deletePhoto);

  return router;
};

export default adminGalleryRouterFactory;
