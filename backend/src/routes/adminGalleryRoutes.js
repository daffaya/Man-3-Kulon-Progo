// backend/src/routes/adminGalleryRoutes.js
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
 * Membuat router untuk manajemen galeri admin.
 * Router ini menangani CRUD album dan foto, dengan autentikasi dan pembatasan akses peran.
 *
 * @param {object} dependencies - Dependensi router.
 * @param {import('mysql2/promise').Pool} dependencies.pool - Koneksi pool MySQL.
 * @param {string} dependencies.JWT_SECRET - Secret key untuk autentikasi JWT.
 * @returns {import('express').Router} Router Express yang sudah dikonfigurasi.
 */
const adminGalleryRouterFactory = ({ pool, JWT_SECRET }) => {
  const router = Router();

  // Middleware autentikasi & otorisasi
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

  // Inisialisasi model, service, dan controller
  const galleryModel = createGalleryModel({ pool });
  const galleryUploadService = createGalleryUploadService();
  const galleryController = createGalleryController({
    galleryModel,
    galleryUploadService,
  });

  /**
   * Album Routes
   */
  router.post("/albums", galleryController.createAlbum);
  router.get("/albums", galleryController.getAllAlbums);
  router.get("/albums/:id", galleryController.getAlbumById);
  router.put("/albums/:id", galleryController.updateAlbum);
  router.delete("/albums/:id", galleryController.deleteAlbum);

  /**
   * Photo Routes
   */
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
