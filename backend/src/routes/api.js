/**
 * @fileoverview Main API router. This module aggregates and mounts all
 * sub-routers for the application, separating public, admin, and other protected routes.
 */

import { Router } from "express";
import authRouterFactory from "./authRoutes.js";
import tagRouterFactory from "./tagRoutes.js";
import publicArticleRouterFactory from "./publicArticleRoutes.js";
import adminArticleRouterFactory from "./adminArticleRoutes.js";
import publicCategoryRouterFactory from "./publicCategoryRoutes.js";
import adminCategoryRouterFactory from "./adminCategoryRoutes.js";
import attendanceRouterFactory from "./attendanceRoutes.js";
import archiveRouterFactory from "./archiveRoutes.js";
import studentRouterFactory from "./studentRoutes.js";
import publicStudentStatsRouterFactory from "./publicStudentStatRoutes.js";
import alumniRouterFactory from "./alumniRoutes.js";
import userRouterFactory from "./userRoutes.js";
import publicGalleryRouterFactory from "./publicGalleryRoutes.js";
import adminGalleryRouterFactory from "./adminGalleryRoutes.js";

/**
 * @typedef {object} ApiRouterOptions
 * @property {import('mysql2/promise').Pool} pool - The MySQL connection pool.
 * @property {object} transporter - The Nodemailer transporter for sending emails.
 * @property {string} JWT_SECRET - The secret key for signing JSON Web Tokens.
 * @property {string|number} JWT_EXPIRATION - The expiration time for JWTs.
 * @property {string} FRONTEND_URL - The URL of the frontend application.
 */

/**
 * Factory function that creates and configures the main API router.
 * It mounts various sub-routers for different parts of the application.
 *
 * @param {ApiRouterOptions} options - Configuration options for the routers.
 * @returns {import('express').Router} The configured Express router.
 */
const apiRouterFactory = ({
  pool,
  transporter,
  JWT_SECRET,
  JWT_EXPIRATION,
  FRONTEND_URL,
}) => {
  const apiRouter = Router();

  /**
   * Health check endpoint to verify that the API is running.
   * Useful for load balancers and monitoring services.
   * @route GET /
   * @returns {object} Status message indicating API is running
   */
  apiRouter.get("/", (req, res) => {
    res.status(200).json({ status: "OK", message: "API is running" });
  });

  // Public Routes - These routes do not require authentication
  apiRouter.use(
    "/auth",
    authRouterFactory({
      pool,
      transporter,
      JWT_SECRET,
      JWT_EXPIRATION,
      FRONTEND_URL,
    })
  );
  apiRouter.use("/categories", publicCategoryRouterFactory({ pool }));
  apiRouter.use("/tags", tagRouterFactory({ pool }));
  apiRouter.use("/articles", publicArticleRouterFactory({ pool }));
  apiRouter.use("/gallery", publicGalleryRouterFactory({ pool }));

  // Admin Routes - These routes are protected and intended for administrative users
  apiRouter.use(
    "/atmin/articles",
    adminArticleRouterFactory({ pool, JWT_SECRET })
  );
  apiRouter.use(
    "/atmin/categories",
    adminCategoryRouterFactory({ pool, JWT_SECRET })
  );
  apiRouter.use(
    "/atmin/gallery",
    adminGalleryRouterFactory({ pool, JWT_SECRET })
  );

  // User Routes - Routes for authenticated users to manage their own profiles
  apiRouter.use("/users", userRouterFactory({ pool, JWT_SECRET }));

  // Protected Routes - Routes that require authentication but are not strictly for user profiles or admin tasks
  apiRouter.use("/attendance", attendanceRouterFactory({ pool, JWT_SECRET }));
  apiRouter.use("/archives", archiveRouterFactory({ pool, JWT_SECRET }));
  apiRouter.use("/students", studentRouterFactory({ pool, JWT_SECRET }));
  apiRouter.use("/alumni", alumniRouterFactory({ pool, JWT_SECRET }));
  apiRouter.use("/studentStats", publicStudentStatsRouterFactory({ pool }));

  return apiRouter;
};

export default apiRouterFactory;
