import { Router } from "express";
import {
  authenticateTokenFactory,
  restrictTo,
} from "../middleware/authMiddleware.js";
import createCategoryModel from "../models/categoryModel.js";
import createCategoryController from "../controllers/categoryController.js";

/**
 * Factory function that creates the admin category router.
 *
 * @param {object} options
 * @param {import('mysql2/promise').Pool} options.pool - MySQL connection pool
 * @param {string} options.JWT_SECRET - Secret key for JWT authentication
 * @returns {import('express').Router} Express router for admin category routes
 */
const adminCategoryRouterFactory = ({ pool, JWT_SECRET }) => {
  const router = Router();

  const authenticateToken = authenticateTokenFactory({ JWT_SECRET });

  // Apply authentication and authorization
  router.use(authenticateToken);
  router.use(restrictTo(["super_admin", "jurnalis"]));

  // Initialize model and controller
  const categoryModel = createCategoryModel({ pool });
  const categoryController = createCategoryController({ categoryModel });

  // CRUD endpoints
  router.get("/", categoryController.getAllCategories);
  router.post("/", categoryController.createCategory);
  router.put("/:id", categoryController.updateCategory);
  router.delete("/:id", categoryController.deleteCategory);

  return router;
};

export default adminCategoryRouterFactory;
