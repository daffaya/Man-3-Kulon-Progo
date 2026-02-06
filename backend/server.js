/**
 * @fileoverview Main application entry point.
 * This file initializes and starts the Express server. It configures middleware,
 * mounts API routes, serves static assets (uploads and the frontend build),
 * and sets up a catch-all route for client-side routing.
 */

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { initializeApplication } from "./src/bootstrap.js";
import apiRouterFactory from "./src/routes/api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Immediately-invoked function expression (IIFE) to initialize and start the server.
 * It first bootstraps the application to get necessary dependencies like the
 * database pool and configuration, then configures and starts the Express app.
 * @async
 */
(async () => {
  try {
    const { pool, JWT_SECRET, JWT_EXPIRATION, FRONTEND_URL } =
      await initializeApplication();

    const app = express();
    const PORT = process.env.PORT || 3001;

    // Middleware Configuration
    const allowedOrigins = (
      process.env.ALLOWED_ORIGINS ||
      process.env.FRONTEND_URL ||
      "http://localhost:5173"
    )
      .split(",")
      .map((origin) => origin.trim());

    app.use(
      cors({
        origin: function (origin, callback) {
          if (!origin) return callback(null, true);

          if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        credentials: true,
      }),
    );
    app.use(express.json());

    /**
     * Serves uploaded files from the 'uploads' directory.
     * Sets a Cross-Origin-Resource-Policy header to allow access.
     * @route GET /uploads/*
     */
    const uploadsPath = path.join(__dirname, "uploads");
    app.use(
      "/uploads",
      (req, res, next) => {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        next();
      },
      express.static(uploadsPath),
    );

    // API Routes
    const apiRoutes = apiRouterFactory({
      pool,
      JWT_SECRET,
      JWT_EXPIRATION,
      FRONTEND_URL,
    });
    app.use("/api", apiRoutes);

    // Frontend Static Assets
    const buildPath = path.join(__dirname, "..", "frontend", "dist");
    app.use(express.static(buildPath));

    /**
     * Catch-all handler to serve the frontend's index.html for any non-API routes.
     * This enables client-side routing for a Single Page Application (SPA).
     * @route GET /*
     */
    app.get(/.*/, (req, res) => {
      res.sendFile(path.join(buildPath, "index.html"));
    });
  } catch (error) {
    console.error("❌ FATAL ERROR during application startup:", error);
    process.exit(1);
  }
})();
