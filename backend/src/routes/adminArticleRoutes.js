import { Router } from "express";
import {
  authenticateTokenFactory,
  restrictTo,
} from "../middleware/authMiddleware.js";
import { imageUpload } from "../services/fileUploadService.js";

import createArticleModel from "../models/articleModel.js";
import createCategoryModel from "../models/categoryModel.js";
import createArticleController from "../controllers/articleController.js";

/**
 * Factory function that creates the admin article router.
 *
 * @param {object} options
 * @param {import('mysql2/promise').Pool} options.pool - MySQL connection pool
 * @param {string} options.JWT_SECRET - Secret key for JWT authentication
 * @returns {import('express').Router} Express router for admin article routes
 */
const adminArticleRouterFactory = ({ pool, JWT_SECRET }) => {
  const router = Router();

  const authenticateToken = authenticateTokenFactory({ JWT_SECRET });

  // Apply authentication and authorization
  router.use(authenticateToken);
  router.use(restrictTo(["super_admin", "jurnalis"]));

  // Initialize models and controller
  const articleModel = createArticleModel({ pool });
  const categoryModel = createCategoryModel({ pool });
  const articleController = createArticleController({
    articleModel,
    categoryModel,
  });

  // CRUD endpoints with optional file upload
  router.post("/", imageUpload, articleController.createArticle);
  router.get("/", articleController.getAllArticles);
  router.get("/:id", articleController.getArticleById);
  router.put("/:id", imageUpload, articleController.updateArticle);
  router.delete("/:id", articleController.deleteArticle);

  return router;
};

export default adminArticleRouterFactory;
