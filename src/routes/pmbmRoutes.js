/**
 * @fileoverview Defines the Express router for PMBM registration endpoints.
 * This module creates and configures routes for public registration submission
 * and admin management of PMBM registration records.
 */

import { Router } from "express";
import pmbmControllerFactory from "../controllers/pmbmController.js";
import { authenticateTokenFactory } from "../middleware/authMiddleware.js";
import rateLimiter from "../middleware/rateLimiter.js";

/**
 * Factory function to create an Express router for PMBM routes.
 * @param {Object} dependencies - The dependencies for the router.
 * @param {mysql.Pool} dependencies.pool - The database connection pool.
 * @param {string} dependencies.JWT_SECRET - The JWT secret for token verification.
 * @returns {Router} The configured Express router for PMBM endpoints.
 */
const pmbmRouterFactory = ({ pool, JWT_SECRET }) => {
  const pmbmRouter = Router();
  const authenticateToken = authenticateTokenFactory({ JWT_SECRET });

  const {
    handleRegister,
    handleGetPublic,
    handleGetAll,
    handleGetById,
    handleUpdateStatus,
    handleExport,
    handleUpdate,
  } = pmbmControllerFactory({ pool });

  // AUDIT-015: public PII-intake endpoint — throttle to curb spam/abuse
  // during the real admissions window (same config as archiveRoutes.js).
  const registerLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Terlalu banyak permintaan. Coba lagi nanti" },
  });

  // Public
  pmbmRouter.post("/register", registerLimiter, handleRegister);
  pmbmRouter.get("/public", handleGetPublic);

  // Protected
  pmbmRouter.use(authenticateToken);
  pmbmRouter.get("/registrations", handleGetAll);
  pmbmRouter.get("/registrations/export", handleExport);
  pmbmRouter.get("/registrations/:id", handleGetById);
  pmbmRouter.patch("/registrations/:id/status", handleUpdateStatus);
  pmbmRouter.put("/registrations/:id", handleUpdate);

  return pmbmRouter;
};

export default pmbmRouterFactory;
