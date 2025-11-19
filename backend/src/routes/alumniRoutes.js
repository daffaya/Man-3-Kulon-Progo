/**
 * @fileoverview Defines the Express router for alumni-related endpoints.
 * This module creates and configures routes for retrieving and updating alumni data.
 * It includes public endpoints for fetching alumni and protected endpoints for administrative updates,
 * utilizing middleware for rate limiting, authentication, and role-based access control.
 */

import express from "express";
import alumniControllerFactory from "../controllers/alumniController.js";
import {
  authenticateTokenFactory,
  restrictTo,
} from "../middleware/authMiddleware.js";
import rateLimiter from "../middleware/rateLimiter.js";

/**
 * Factory function to create an Express router for alumni routes.
 * @param {Object} dependencies - The dependencies for the router.
 * @param {mysql.Pool} dependencies.pool - The database connection pool.
 * @param {string} dependencies.JWT_SECRET - The secret key for JWT authentication.
 * @returns {express.Router} The configured Express router for alumni endpoints.
 */
const alumniRouterFactory = ({ pool, JWT_SECRET }) => {
  const router = express.Router();

  const { handleGetAlumni, handleUpdateAlumni } = alumniControllerFactory({
    pool,
  });

  const limiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Terlalu banyak permintaan. Coba lagi nanti" },
  });

  router.get("/", limiter, handleGetAlumni);

  router.put(
    "/admin/:id",
    limiter,
    authenticateTokenFactory({ JWT_SECRET }),
    restrictTo(["guru_bk", "super_admin"]),
    handleUpdateAlumni
  );

  return router;
};

export default alumniRouterFactory;
