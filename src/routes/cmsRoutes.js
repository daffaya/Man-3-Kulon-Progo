/**
 * @fileoverview Public CMS Routes — read only, no auth required, responses cached.
 */

import { Router } from "express";
import createCmsModel from "../models/cmsModel.js";
import createCmsController from "../controllers/cmsController.js";
import publicCache, { PUBLIC_CACHE } from "../middleware/publicCache.js";

/**
 * Pages whose content is time-sensitive (e.g. PMBM registration wave / open-close
 * dates) must never be served stale by browser or CDN caches: always revalidate
 * (ETag -> 304 when unchanged). Everything else may be cached briefly.
 */
const ALWAYS_REVALIDATE_PAGES = new Set(["pmbm"]);

const cmsCacheControl = publicCache((req) =>
  ALWAYS_REVALIDATE_PAGES.has(req.params.page) ? "no-cache" : PUBLIC_CACHE,
);

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
  router.get("/collections/:type", cmsCacheControl, cmsController.getCollection);

  /**
   * GET /api/cms/:page
   * Fetch all sections for a page.
   */
  router.get("/:page", cmsCacheControl, cmsController.getPage);

  /**
   * GET /api/cms/:page/:section
   * Fetch a single section.
   */
  router.get("/:page/:section", cmsCacheControl, cmsController.getSection);

  return router;
};

export default cmsRouterFactory;
