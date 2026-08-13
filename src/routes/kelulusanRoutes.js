/**
 * @fileoverview Kelulusan routes factory.
 */

import { Router } from "express";
import kelulusanControllerFactory from "../controllers/kelulusanController.js";
import { authenticateTokenFactory } from "../middleware/authMiddleware.js";
import excelUpload from "../middleware/excelUpload.js";

const kelulusanRouterFactory = ({ pool, JWT_SECRET }) => {
  const router = Router();

  const authenticateToken = authenticateTokenFactory({ JWT_SECRET });

  const {
    handleCekKelulusan,
    handleGetAll,
    handleGetTahunAjaran,
    handleImport,
    handleDelete,
  } = kelulusanControllerFactory({ pool });

  // ── Public ──────────────────────────────────────────
  router.get("/cek/:nisn", handleCekKelulusan);

  // ── IMPORTANT: bypass OPTIONS request ───────────────
  router.use((req, res, next) => {
    if (req.method === "OPTIONS") return next();
    next();
  });

  // ── Admin (protected) ────────────────────────────────
  router.use(authenticateToken);

  router.get("/", handleGetAll);
  router.get("/tahun-ajaran", handleGetTahunAjaran);
  router.post("/import", excelUpload.single("file"), handleImport);
  router.delete("/:tahun_ajaran", handleDelete);

  return router;
};

export default kelulusanRouterFactory;
