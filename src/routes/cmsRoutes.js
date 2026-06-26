/**
 * @fileoverview Public CMS Routes — read only, no auth required, responses cached.
 */

import { Router } from "express";
import createCmsModel from "../models/cmsModel.js";
import createCmsController from "../controllers/cmsController.js";

/**
 * Factory function that creates the public CMS router.
 * @param {object} options
 * @param {import('mysql2/promise').Pool} options.pool
 * @returns {import('express').Router}
 */
const cmsRouterFactory = ({ pool }) => {
  const router = Router();

  const cmsModel = createCmsModel({ pool });
  const cmsController = createCmsController({ cmsModel });

  /**
   * GET /api/cms/collections/:type
   * Fetch active collection items (slider, quick_actions, dll.)
   * Declared BEFORE /:page to avoid route conflict.
   */
  router.get("/collections/:type", cmsController.getCollection);

  /**
   * GET /api/cms/:page
   * Fetch all sections for a page.
   */
  router.get("/:page", cmsController.getPage);

  /**
   * GET /api/cms/:page/:section
   * Fetch a single section.
   */
  router.get("/:page/:section", cmsController.getSection);

  return router;
};

export default cmsRouterFactory;
