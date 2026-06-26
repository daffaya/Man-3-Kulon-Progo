/**
 * @fileoverview Defines the Express router for public staff-related endpoints.
 * This module provides public routes for staff and teacher recap data without authentication.
 */

import { Router } from "express";

// Model
import createStaffModel from "../models/staffModel.js";

// Controller
import createStaffController from "../controllers/staffController.js";

/**
 * Factory function to create an Express router for public staff routes.
 *
 * @param {Object} dependencies - The dependencies for the router.
 * @param {mysql.Pool} dependencies.pool - The database connection pool.
 * @returns {Router} The configured Express router for public staff endpoints.
 */
const publicStaffRouterFactory = ({ pool }) => {
  const router = Router();

  // Initialize model and controller
  const staffModel = createStaffModel({ pool });
  const staffController = createStaffController({ staffModel });

  // Public recap routes
  router.get("/teachers/recap", staffController.getTeacherRecap);
  router.get("/staff/recap", staffController.getStaffRecap);
  router.get("/tendik", staffController.getAllTendik);

  return router;
};

export default publicStaffRouterFactory;
