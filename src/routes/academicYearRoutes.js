/**
 * @fileoverview /api/academic-years — list (any logged-in user), create and
 * update (super_admin only).
 */
import { Router } from "express";
import { authenticateTokenFactory, restrictTo } from "../middleware/authMiddleware.js";
import academicYearServiceFactory from "../services/academicYearService.js";
import { sendError } from "../utils/errorResponse.js";

const academicYearRouterFactory = ({ pool, JWT_SECRET }) => {
  const router = Router();
  const service = academicYearServiceFactory({ pool });
  router.use(authenticateTokenFactory({ JWT_SECRET }));

  router.get("/", async (req, res) => {
    try {
      res.json(await service.listWithCurrent());
    } catch (error) {
      sendError(res, error, "Gagal mengambil data tahun ajaran");
    }
  });

  router.post("/", restrictTo([]), async (req, res) => {
    try {
      const { start_date, end_date } = req.body || {};
      res.status(201).json(await service.create({ start_date, end_date }));
    } catch (error) {
      sendError(res, error, "Gagal membuat tahun ajaran");
    }
  });

  router.put("/:id", restrictTo([]), async (req, res) => {
    try {
      const { start_date, end_date } = req.body || {};
      res.json(await service.update(Number(req.params.id), { start_date, end_date }));
    } catch (error) {
      sendError(res, error, "Gagal mengubah tahun ajaran");
    }
  });

  return router;
};

export default academicYearRouterFactory;
