/**
 * @fileoverview Admin CMS Routes — write operations, JWT + super_admin required.
 * Mount at /api/atmin/cms in api.js
 */

import { Router } from "express";
import {
  authenticateTokenFactory,
  restrictTo,
} from "../middleware/authMiddleware.js";
import createCmsModel from "../models/cmsModel.js";
import createCmsController from "../controllers/cmsController.js";

/**
 * Factory function that creates the admin CMS router.
 * @param {object} options
 * @param {import('mysql2/promise').Pool} options.pool
 * @param {string} options.JWT_SECRET
 * @returns {import('express').Router}
 */
const adminCmsRouterFactory = ({ pool, JWT_SECRET }) => {
  const router = Router();

  // Apply auth + role to all routes in this router
  const authenticateToken = authenticateTokenFactory({ JWT_SECRET });
  router.use(authenticateToken);
  router.use(restrictTo(["super_admin"]));

  const cmsModel = createCmsModel({ pool });
  const cmsController = createCmsController({ cmsModel });

  /**
   * GET /api/atmin/cms/collections/:type
   * Fetch ALL items including inactive — for admin management UI.
   * Must be declared BEFORE /:page/:section to avoid conflict.
   */
  router.get("/collections/:type", cmsController.getCollectionAdmin);

  /**
   * POST /api/atmin/cms/collections/:type
   * Add a new item to a collection.
   */
  router.post("/collections/:type", cmsController.createCollectionItem);

  /**
   * PUT /api/atmin/cms/collections/:type/:id
   * Update a collection item.
   */
  router.put("/collections/:type/:id", cmsController.updateCollectionItem);

  /**
   * DELETE /api/atmin/cms/collections/:type/:id
   * Delete a collection item.
   */
  router.delete("/collections/:type/:id", cmsController.deleteCollectionItem);

  /**
   * PUT /api/atmin/cms/:page/:section
   * Upsert a section's content.
   */
  router.put("/:page/:section", cmsController.upsertSection);

  return router;
};

export default adminCmsRouterFactory;
