import { Router } from "express";

// Models
import createGalleryModel from "../models/galleryModel.js";

// Controller
import createGalleryController from "../controllers/galleryController.js";

/**
 * Factory function that creates and configures the router for public gallery access.
 * This router handles read-only operations for gallery albums and photos.
 *
 * @param {object} dependencies - The dependencies for the router.
 * @param {import('mysql2/promise').Pool} dependencies.pool - MySQL connection pool.
 * @returns {import('express').Router} Configured Express router for public gallery routes.
 */
const publicGalleryRouterFactory = ({ pool }) => {
  const router = Router();

  // --- Model and Controller Initialization ---
  const galleryModel = createGalleryModel({ pool });
  const galleryController = createGalleryController({
    galleryModel,
  });

  // --- API Endpoints ---

  /**
   * @route   GET /albums
   * @desc    Get a list of all albums (public).
   * @access  Public
   */
  router.get("/albums", galleryController.getAllAlbums);

  /**
   * @route   GET /albums/:id
   * @desc    Get a single album by its ID (public).
   * @access  Public
   */
  router.get("/albums/:id", galleryController.getAlbumById);

  return router;
};

export default publicGalleryRouterFactory;
