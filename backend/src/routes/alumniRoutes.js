import express from "express";
import alumniControllerFactory from "../controllers/alumniController.js";
import {
  authenticateTokenFactory,
  restrictTo,
} from "../middleware/authMiddleware.js";
import rateLimiter from "../middleware/rateLimiter.js";

const alumniRouterFactory = ({ pool, JWT_SECRET }) => {
  const router = express.Router();

  // Inisiasi controller dengan pool
  const { handleGetAlumni, handleUpdateAlumni } = alumniControllerFactory({
    pool,
  });

  // Rate limiter
  const limiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 100, // 100 request per IP
    message: { error: "Terlalu banyak permintaan. Coba lagi nanti" },
  });

  // Public Endpoint
  router.get("/", limiter, handleGetAlumni);

  // Protected Endpoint
  router.put(
    "/admin/:id",
    limiter,
    authenticateTokenFactory({ JWT_SECRET }),
    restrictTo(["guru_bk", "super_admin"]),
    handleUpdateAlumni
  );

  return router;
};

export default alumniRouterFactory;
