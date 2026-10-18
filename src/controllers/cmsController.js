/**
 * @fileoverview CMS Controller.
 * Handles public read endpoints (cached) and admin write endpoints (invalidates cache).
 */

import cmsCache from "../utils/cmsCache.js";
import { sendServerError } from "../utils/errorResponse.js";

/**
 * Cache key helpers — consistent naming across controller and cache.
 */
const cacheKey = {
  page: (page) => `cms:page:${page}`,
  section: (page, section) => `cms:section:${page}:${section}`,
  collection: (type) => `cms:collection:${type}`,
};

/**
 * Factory function that creates the CMS controller.
 * @param {object} dependencies
 * @param {object} dependencies.cmsModel
 * @returns {object} Controller methods
 */
const createCmsController = ({ cmsModel }) => {
  return {
    // ─────────────────────────────────────────────
    // PUBLIC — read only, responses are cached
    // ─────────────────────────────────────────────

    /**
     * GET /api/cms/:page
     * Returns all sections for a page as a single JSON object.
     * Cached for 5 minutes.
     */
    getPage: async (req, res) => {
      try {
        const { page } = req.params;
        const key = cacheKey.page(page);

        const cached = cmsCache.get(key);
        if (cached) return res.status(200).json(cached);

        const data = await cmsModel.findByPage(page);

        if (Object.keys(data).length === 0) {
          return res.status(404).json({ message: `Page '${page}' not found` });
        }

        cmsCache.set(key, data);
        return res.status(200).json(data);
      } catch (error) {
        return sendServerError(res, error, "Failed to fetch page content");
      }
    },

    /**
     * GET /api/cms/:page/:section
     * Returns a single section's data.
     * Cached for 5 minutes.
     */
    getSection: async (req, res) => {
      try {
        const { page, section } = req.params;
        const key = cacheKey.section(page, section);

        const cached = cmsCache.get(key);
        if (cached) return res.status(200).json(cached);

        const data = await cmsModel.findSection(page, section);

        if (!data) {
          return res.status(404).json({
            message: `Section '${section}' not found on page '${page}'`,
          });
        }

        cmsCache.set(key, data);
        return res.status(200).json(data);
      } catch (error) {
        return sendServerError(res, error, "Failed to fetch section");
      }
    },

    /**
     * GET /api/cms/collections/:type
     * Returns active collection items ordered by sort_order.
     * Cached for 5 minutes.
     */
    getCollection: async (req, res) => {
      try {
        const { type } = req.params;
        const key = cacheKey.collection(type);

        const cached = cmsCache.get(key);
        if (cached) return res.status(200).json(cached);

        const data = await cmsModel.findCollection(type);
        cmsCache.set(key, data);
        return res.status(200).json(data);
      } catch (error) {
        return sendServerError(res, error, "Failed to fetch collection");
      }
    },

    // ─────────────────────────────────────────────
    // ADMIN — write operations, always invalidate cache
    // ─────────────────────────────────────────────

    /**
     * PUT /api/atmin/cms/:page/:section
     * Upsert a section. Invalidates page + section cache on success.
     */
    upsertSection: async (req, res) => {
      try {
        const { page, section } = req.params;
        const { data } = req.body;

        if (!data || typeof data !== "object") {
          return res.status(400).json({
            message: "Request body must contain a 'data' object",
          });
        }

        await cmsModel.upsertSection(page, section, data, req.user?.id ?? null);

        // Invalidate both the specific section key and the full page key
        cmsCache.invalidate(cacheKey.section(page, section));
        cmsCache.invalidate(cacheKey.page(page));

        return res.status(200).json({
          message: `Section '${section}' on page '${page}' updated successfully`,
        });
      } catch (error) {
        return sendServerError(res, error, "Failed to update section");
      }
    },

    /**
     * GET /api/atmin/cms/collections/:type
     * Admin view — returns ALL items including inactive ones.
     */
    getCollectionAdmin: async (req, res) => {
      try {
        const { type } = req.params;
        const data = await cmsModel.findCollectionAdmin(type);
        return res.status(200).json(data);
      } catch (error) {
        return sendServerError(res, error, "Failed to fetch collection");
      }
    },

    /**
     * POST /api/atmin/cms/collections/:type
     * Add a new item to a collection.
     */
    createCollectionItem: async (req, res) => {
      try {
        const { type } = req.params;
        const { data, sort_order = 0 } = req.body;

        if (!data || typeof data !== "object") {
          return res.status(400).json({
            message: "Request body must contain a 'data' object",
          });
        }

        const newId = await cmsModel.createCollectionItem(
          type,
          data,
          sort_order,
          req.user?.id ?? null,
        );

        cmsCache.invalidate(cacheKey.collection(type));

        return res.status(201).json({
          message: "Collection item created successfully",
          id: newId,
        });
      } catch (error) {
        return sendServerError(res, error, "Failed to create collection item");
      }
    },

    /**
     * PUT /api/atmin/cms/collections/:type/:id
     * Update a collection item.
     */
    updateCollectionItem: async (req, res) => {
      try {
        const { type, id } = req.params;
        const { data, sort_order = 0, is_active = true } = req.body;

        if (!data || typeof data !== "object") {
          return res.status(400).json({
            message: "Request body must contain a 'data' object",
          });
        }

        const updated = await cmsModel.updateCollectionItem(
          parseInt(id, 10),
          data,
          sort_order,
          is_active,
          req.user?.id ?? null,
        );

        if (!updated) {
          return res.status(404).json({ message: "Collection item not found" });
        }

        cmsCache.invalidate(cacheKey.collection(type));

        return res.status(200).json({
          message: "Collection item updated successfully",
        });
      } catch (error) {
        return sendServerError(res, error, "Failed to update collection item");
      }
    },

    /**
     * DELETE /api/atmin/cms/collections/:type/:id
     * Delete a collection item.
     */
    deleteCollectionItem: async (req, res) => {
      try {
        const { type, id } = req.params;

        const deleted = await cmsModel.deleteCollectionItem(parseInt(id, 10));

        if (!deleted) {
          return res.status(404).json({ message: "Collection item not found" });
        }

        cmsCache.invalidate(cacheKey.collection(type));

        return res.status(200).json({
          message: "Collection item deleted successfully",
        });
      } catch (error) {
        return sendServerError(res, error, "Failed to delete collection item");
      }
    },
  };
};

export default createCmsController;
