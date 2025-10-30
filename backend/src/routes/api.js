import { Router } from "express";
import authRouterFactory from "./authRoutes.js";
import tagRouterFactory from "./tagRoutes.js";
import publicArticleRouterFactory from "./publicArticleRoutes.js";
import adminArticleRouterFactory from "./adminArticleRoutes.js";
import publicCategoryRouterFactory from "./publicCategoryRoutes.js";
import adminCategoryRouterFactory from "./adminCategoryRoutes.js";
import attendanceRouterFactory from "./attendanceRoutes.js";
import archiveRouterFactory from "./archiveRoutes.js";
import studentRouterFactory from "./studentRoutes.js";
import alumniRouterFactory from "./alumniRoutes.js";

/**
 * Factory function that creates the main API router.
 *
 * @param {object} options
 * @param {import('mysql2/promise').Pool} options.pool
 * @param {*} options.transporter
 * @param {string} options.JWT_SECRET
 * @param {string|number} options.JWT_EXPIRATION
 * @param {string} options.FRONTEND_URL
 * @returns {import('express').Router} Express router
 */
const apiRouterFactory = ({
  pool,
  transporter,
  JWT_SECRET,
  JWT_EXPIRATION,
  FRONTEND_URL,
}) => {
  const apiRouter = Router();

  // Public routes
  apiRouter.use(
    "/auth",
    authRouterFactory({ pool, JWT_SECRET, JWT_EXPIRATION })
  );
  apiRouter.use("/categories", publicCategoryRouterFactory({ pool }));
  apiRouter.use("/tags", tagRouterFactory({ pool }));
  apiRouter.use("/articles", publicArticleRouterFactory({ pool }));

  // Admin routes
  apiRouter.use(
    "/atmin/articles",
    adminArticleRouterFactory({ pool, JWT_SECRET })
  );
  apiRouter.use(
    "/atmin/categories",
    adminCategoryRouterFactory({ pool, JWT_SECRET })
  );

  // Other protected routes
  apiRouter.use("/attendance", attendanceRouterFactory({ pool, JWT_SECRET }));
  apiRouter.use("/archives", archiveRouterFactory({ pool, JWT_SECRET }));
  apiRouter.use("/students", studentRouterFactory({ pool, JWT_SECRET }));
  apiRouter.use("/alumni", alumniRouterFactory({ pool, JWT_SECRET }));

  return apiRouter;
};

export default apiRouterFactory;
