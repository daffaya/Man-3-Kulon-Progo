/**
 * @fileoverview Defines the Express router for staff management endpoints.
 * This module creates and configures protected CRUD routes for staff resources.
 */

import { Router } from "express";
import {
  authenticateTokenFactory,
  restrictTo,
} from "../middleware/authMiddleware.js";

// Model
import createStaffModel from "../models/staffModel.js";

// Controller
import createStaffController from "../controllers/staffController.js";

/**
 * Factory function to create an Express router for staff routes.
 *
 * @param {Object} dependencies - The dependencies for the router.
 * @param {mysql.Pool} dependencies.pool - The database connection pool.
 * @param {string} dependencies.JWT_SECRET - Secret key for JWT authentication.
 * @returns {Router} The configured Express router for staff endpoints.
 */
const staffRouterFactory = ({ pool, JWT_SECRET }) => {
  const router = Router();

  // Initialize model and controller
  const staffModel = createStaffModel({ pool });
  const staffController = createStaffController({ staffModel });

  // Authentication & authorization middleware
  const authenticateToken = authenticateTokenFactory({ JWT_SECRET });
  router.use(authenticateToken);
  router.use(restrictTo(["super_admin"]));

  // CRUD routes (protected)
  router.post("/", staffController.createStaff);
  router.get("/", staffController.getAllStaff);
  router.get("/:id", staffController.getStaffById);
  router.put("/:id", staffController.updateStaff);
  router.delete("/:id", staffController.deleteStaff);

  return router;
};

export default staffRouterFactory;
