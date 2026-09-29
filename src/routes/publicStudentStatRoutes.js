/**
 * @fileoverview Defines the Express router for public student statistics.
 * This module creates and configures a public route to provide the total count of active students.
 */

import { Router } from "express";

/**
 * Higher-order function to wrap async route handlers.
 * Catches errors from async functions and forwards them to Express's error handling middleware.
 * @param {Function} fn - The async route handler function.
 * @returns {Function} The wrapped middleware function.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Factory function to create an Express router for public student statistics.
 * @param {Object} dependencies - The dependencies for the router.
 * @param {mysql.Pool} dependencies.pool - The database connection pool.
 * @returns {Router} The configured Express router for student statistics endpoints.
 */
const publicStudentStatsRouterFactory = ({ pool }) => {
  const router = Router();

  /**
   * Handles GET request to fetch the total number of active students.
   * @route GET /students
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Object} JSON response with the total student count or an error message.
   */
  router.get(
    "/students",
    asyncHandler(async (req, res) => {
      try {
        const [rows] = await pool.execute(
          "SELECT COUNT(*) as total FROM students WHERE is_active = 1 AND is_deleted = 0"
        );
        const totalStudents = rows[0].total;
        res.json({ totalStudents });
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch student statistics" });
      }
    })
  );

  return router;
};

export default publicStudentStatsRouterFactory;
