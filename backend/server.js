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
     * Serves uploaded files.
     *
     * IMPORTANT: this path lives OUTSIDE the app root on purpose.
     * The `backend` git branch is force-pushed as an orphan branch on every
     * deploy (see deploy-backend.yml), so anything inside the app root that
     * isn't tracked in git risks being wiped on redeploy. UPLOADS_DIR must
     * point to a persistent folder outside the app root
     * (e.g. /home/u277943328/persistent-uploads), set via Hostinger's
     * environment variable dashboard.
     *
     * Falls back to the old in-repo ./uploads path only for local dev when
     * UPLOADS_DIR isn't set.
     */
    const uploadsPath = process.env.UPLOADS_DIR
      ? path.resolve(process.env.UPLOADS_DIR)
      : path.join(__dirname, "uploads");

    console.log(`📁 Serving uploads from: ${uploadsPath}`);

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

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ FATAL ERROR during application startup:", error);
    process.exit(1);
  }
})();
