/**
 * @fileoverview /api/year-transition — preview and execute the new academic
 * year wizard. super_admin only.
 */
import { Router } from "express";
import { authenticateTokenFactory, restrictTo } from "../middleware/authMiddleware.js";
import yearTransitionServiceFactory from "../services/yearTransitionService.js";
import { sendError } from "../utils/errorResponse.js";

const yearTransitionRouterFactory = ({ pool, JWT_SECRET, now }) => {
  const router = Router();
  const service = yearTransitionServiceFactory({ pool, now });
  router.use(authenticateTokenFactory({ JWT_SECRET }), restrictTo([]));

  const inputOf = (body = {}) => ({
    fromYearId: body.from_year_id,
    toYearId: body.to_year_id,
    newClassCounts: body.new_class_counts,
    confirm: body.confirm,
  });

  router.post("/preview", async (req, res) => {
    try {
      res.json(await service.preview(inputOf(req.body)));
    } catch (error) {
      sendError(res, error, "Gagal menyusun rencana transisi tahun ajaran");
    }
  });

  router.post("/execute", async (req, res) => {
    try {
      res.json(await service.execute(inputOf(req.body)));
    } catch (error) {
      sendError(res, error, "Gagal menjalankan transisi tahun ajaran");
    }
  });

  return router;
};

export default yearTransitionRouterFactory;
