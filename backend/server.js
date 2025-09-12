import express from "express";
import bodyParser from "body-parser"; // Atau nanti ganti express.json()
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
    const {
      pool,
      transporter,
      JWT_SECRET,
      JWT_EXPIRATION,
      FRONTEND_URL,
    } = await initializeApplication();

    const app = express();
    const PORT = process.env.PORT || 3001;

    app.use(cors());
    app.use(express.json());
    console.log("Global middleware configured.");
    const apiRoutes = apiRouterFactory({
      pool,
      transporter,
      JWT_SECRET,
      JWT_EXPIRATION,
      FRONTEND_URL,
    });
    console.log("API router created using factory function.");

    const buildPath = path.join(__dirname, "..", "frontend", "dist");
    app.use(express.static(buildPath));

    app.use("/api", apiRoutes);

    app.get("/{*any}", (req, res) => {
      res.sendFile(path.join(buildPath, "index.html"));
    });

    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("\nFATAL ERROR during application startup:", error);
    process.exit(1);
  }
})();
