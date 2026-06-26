/**
 * @fileoverview Defines the Express router for public category endpoints.
 * This module creates and configures routes for retrieving category data without authentication.
 */

import { Router } from "express";

/**
 * Factory function to create an Express router for public category routes.
 * @param {Object} dependencies - The dependencies for the router.
 * @param {mysql.Pool} dependencies.pool - The database connection pool.
 * @returns {Router} The configured Express router for public category endpoints.
 */
const publicCategoryRouterFactory = ({ pool }) => {
  const publicCategoryRouter = Router();

  /**
   * Handles GET request to fetch all categories.
   * @route GET /
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Object} JSON response with category data or error message.
   */
  publicCategoryRouter.get("/", async (req, res) => {
    try {
      const sql = `SELECT id, name, slug, description FROM categories ORDER BY name ASC`;

      const [rows] = await pool.execute(sql);

      res.status(200).json(rows);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch categories", error: error.message });
    }
  });

  return publicCategoryRouter;
};

export default publicCategoryRouterFactory;
