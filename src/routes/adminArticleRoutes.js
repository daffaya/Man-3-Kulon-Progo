/**
 * @fileoverview Defines the Express router for administrative article management.
 * This module sets up the routes for creating, reading, updating, and deleting articles,
 * with authentication and role-based access control.
 */

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

  // Apply authentication to all routes in this router
  const authenticateToken = authenticateTokenFactory({ JWT_SECRET });
  router.use(authenticateToken);

  // Restrict access to specific roles
  router.use(restrictTo(["super_admin", "jurnalis"]));

  const articleModel = createArticleModel({ pool });
  const categoryModel = createCategoryModel({ pool });
  const userModel = createUserModel({ pool });

  const articleController = createArticleController({
    articleModel,
    categoryModel,
    userModel,
  });

  router.post("/", imageUpload, articleController.createArticle);
  router.get("/", articleController.getAllArticles);
  router.get("/:id", articleController.getArticleById);
  router.put("/:id", imageUpload, articleController.updateArticle);
  router.delete("/:id", articleController.deleteArticle);

  return router;
};

export default adminArticleRouterFactory;
