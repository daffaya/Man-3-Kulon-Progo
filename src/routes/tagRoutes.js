/**
 * @fileoverview Defines the Express router for tag-related endpoints.
 * This module creates and configures routes for retrieving unique tags from published articles.
 */

import { Router } from "express";

/**
 * Factory function to create an Express router for tag routes.
 * @param {Object} dependencies - The dependencies for the router.
 * @param {mysql.Pool} dependencies.pool - The database connection pool.
 * @returns {Router} The configured Express router for tag endpoints.
 */
const tagRouterFactory = ({ pool }) => {
  const tagRouter = Router();

  /**
   * Handles GET request to fetch all unique tags from published articles.
   * @route GET /
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Object} JSON response with an array of unique tags or an error message.
   */
  tagRouter.get("/", async (req, res) => {
    try {
      const [rows] = await pool.execute(
        "SELECT tags FROM articles WHERE published = TRUE"
      );

      const allTags = new Set();

      rows.forEach((row) => {
        if (row.tags) {
          let tagsArray;
          if (typeof row.tags === "string") {
            try {
              tagsArray = JSON.parse(row.tags);
            } catch (e) {
              tagsArray = [];
            }
          } else if (Array.isArray(row.tags)) {
            tagsArray = row.tags;
          } else {
            tagsArray = [];
          }

          if (Array.isArray(tagsArray)) {
            tagsArray.forEach((tag) => {
              if (typeof tag === "string" && tag.trim() !== "") {
                allTags.add(tag.trim());
              }
            });
          }
        }
      });

      const uniqueTags = Array.from(allTags).sort();

      res.status(200).json(uniqueTags);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch tags", error: error.message });
    }
  });

  return tagRouter;
};

export default tagRouterFactory;
