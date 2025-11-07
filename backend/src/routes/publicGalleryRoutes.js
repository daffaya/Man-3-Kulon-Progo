import { Router } from "express";
import createGalleryModel from "../models/galleryModel.js";
import createGalleryController from "../controllers/galleryController.js";

/**
 * Membuat dan mengonfigurasi router untuk galeri publik.
 * Router ini hanya menyediakan endpoint baca (read-only) untuk album dan foto.
 *
 * @param {object} dependencies - Dependensi router.
 * @param {import('mysql2/promise').Pool} dependencies.pool - Koneksi pool MySQL.
 * @returns {import('express').Router} Router Express yang sudah dikonfigurasi.
 */
const publicGalleryRouterFactory = ({ pool }) => {
  const router = Router();

  // Inisialisasi model dan controller
  const galleryModel = createGalleryModel({ pool });
  const galleryController = createGalleryController({ galleryModel });

  /**
   * Album Routes (Publik)
   */
  router.get("/albums", galleryController.getAllAlbums);
  router.get("/albums/:slug", galleryController.getAlbumBySlug);

  return router;
};

export default publicGalleryRouterFactory;
