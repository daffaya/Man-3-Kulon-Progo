// backend/server.js
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

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Serve uploads dengan header CORS yang aman
    const uploadsPath = path.join(__dirname, "uploads");
    app.use(
      "/uploads",
      (req, res, next) => {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        next();
      },
      express.static(uploadsPath)
    );

    // API routes
    const apiRoutes = apiRouterFactory({
      pool,
      JWT_SECRET,
      JWT_EXPIRATION,
      FRONTEND_URL,
    });
    app.use("/api", apiRoutes);

    // Serve frontend build
    const buildPath = path.join(__dirname, "..", "frontend", "dist");
    app.use(express.static(buildPath));

    app.get(/.*/, (req, res) => {
      res.sendFile(path.join(buildPath, "index.html"));
    });

    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ FATAL ERROR during application startup:", error);
    process.exit(1);
  }
})();
