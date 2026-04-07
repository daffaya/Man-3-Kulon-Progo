/**
 * @fileoverview Defines the Express router for PMBM registration endpoints.
 * This module creates and configures routes for public registration submission
 * and admin management of PMBM registration records.
 */

import { Router } from "express";
import pmbmControllerFactory from "../controllers/pmbmController.js";
import { authenticateTokenFactory } from "../middleware/authMiddleware.js";

/**
 * Factory function to create an Express router for PMBM routes.
 * @param {Object} dependencies - The dependencies for the router.
 * @param {mysql.Pool} dependencies.pool - The database connection pool.
 * @returns {Router} The configured Express router for PMBM endpoints.
 */
const pmbmRouterFactory = ({ pool, JWT_SECRET }) => {
  const pmbmRouter = Router();
  const verifyToken = authenticateTokenFactory({ JWT_SECRET });
  const { handleRegister, handleGetAll, handleGetById, handleUpdateStatus } =
    pmbmControllerFactory({ pool });

  /**
   * @route POST /register
   * @description Submit a new PMBM registration. Public — no authentication required.
   */
  pmbmRouter.post("/register", handleRegister);

  /**
   * @route GET /registrations
   * @description Retrieve a paginated list of registrations. Requires authentication.
   */
  pmbmRouter.get("/registrations", verifyToken, handleGetAll);

  /**
   * @route GET /registrations/:id
   * @description Retrieve full details of a single registration. Requires authentication.
   */
  pmbmRouter.get("/registrations/:id", verifyToken, handleGetById);

  /**
   * @route PATCH /registrations/:id/status
   * @description Update the status of a registration. Requires authentication.
   */
  pmbmRouter.patch(
    "/registrations/:id/status",
    verifyToken,
    handleUpdateStatus,
  );

  return pmbmRouter;
};

export default pmbmRouterFactory;
