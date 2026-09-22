/**
 * @fileoverview Router for public gallery endpoints.
 * This module defines and configures an Express router for read-only access to albums and photos.
 */

import { Router } from "express";
import createGalleryModel from "../models/galleryModel.js";
import createGalleryController from "../controllers/galleryController.js";

/**
 * Factory function that creates the public gallery router.
 * This router provides read-only endpoints for albums and photos.
 *
 * @param {object} dependencies - The dependencies object.
 * @param {import('mysql2/promise').Pool} dependencies.pool - MySQL connection pool.
 * @returns {import('express').Router} Configured Express router.
 */
const publicGalleryRouterFactory = ({ pool }) => {
  const router = Router();

  const galleryModel = createGalleryModel({ pool });
  const galleryController = createGalleryController({ galleryModel });

  /**
   * GET /api/gallery/albums
   * Fetches all public albums.
   *
   * @route GET /api/gallery/albums
   * @returns {object} A list of all public albums.
   */
  router.get("/albums", galleryController.getAllAlbums);

  /**
   * GET /api/gallery/albums/:slug
   * Fetches a single public album by its slug, including its photos.
   *
   * @route GET /api/gallery/albums/:slug
   * @param {string} req.params.slug - The slug of the album to fetch.
   * @returns {object} The requested album with its photos.
   */
  router.get("/albums/:slug", galleryController.getAlbumBySlug);

  return router;
};

export default publicGalleryRouterFactory;
