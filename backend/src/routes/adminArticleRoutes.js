// backend/src/routes/adminArticleRoutes.js

import { Router } from "express";
import {
  authenticateTokenFactory,
  restrictTo,
} from "../middleware/authMiddleware.js";
import { imageUpload } from "../services/fileUploadService.js";

// Models
import createArticleModel from "../models/articleModel.js";
import createCategoryModel from "../models/categoryModel.js";
import createUserModel from "../models/userModel.js";

// Controller
import createArticleController from "../controllers/articleController.js";

/**
 * Factory function that creates and configures the router for admin article management.
 * This router handles CRUD operations for articles and is protected by authentication
 * and role-based authorization.
 *
 * @param {object} dependencies - The dependencies for the router.
 * @param {import('mysql2/promise').Pool} dependencies.pool - MySQL connection pool.
 * @param {string} dependencies.JWT_SECRET - Secret key for JWT authentication.
 * @returns {import('express').Router} Configured Express router for admin article routes.
 */
const adminArticleRouterFactory = ({ pool, JWT_SECRET }) => {
  const router = Router();

  // --- Middleware Setup ---
  // Apply authentication to all routes in this router
  const authenticateToken = authenticateTokenFactory({ JWT_SECRET });
  router.use(authenticateToken);

  // Restrict access to specific roles
  router.use(restrictTo(["super_admin", "jurnalis"]));

  // --- Model and Controller Initialization ---
  const articleModel = createArticleModel({ pool });
  const categoryModel = createCategoryModel({ pool });
  const userModel = createUserModel({ pool });

  const articleController = createArticleController({
    articleModel,
    categoryModel,
    userModel,
  });

  // --- API Endpoints ---

  /**
   * @route   POST /
   * @desc    Create a new article with an optional image upload.
   * @access  Private (Super Admin, Jurnalis)
   */
  router.post("/", imageUpload, articleController.createArticle);

  /**
   * @route   GET /
   * @desc    Get a list of all articles.
   * @access  Private (Super Admin, Jurnalis)
   */
  router.get("/", articleController.getAllArticles);

  /**
   * @route   GET /:id
   * @desc    Get a single article by its ID.
   * @access  Private (Super Admin, Jurnalis)
   */
  router.get("/:id", articleController.getArticleById);

  /**
   * @route   PUT /:id
   * @desc    Update an existing article by its ID with an optional image upload.
   * @access  Private (Super Admin, Jurnalis)
   */
  router.put("/:id", imageUpload, articleController.updateArticle);

  /**
   * @route   DELETE /:id
   * @desc    Delete an article by its ID.
   * @access  Private (Super Admin, Jurnalis)
   */
  router.delete("/:id", articleController.deleteArticle);

  return router;
};

export default adminArticleRouterFactory;
