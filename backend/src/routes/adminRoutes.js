import { Router } from "express";
import authenticateTokenFactory from "../middleware/authMiddleware.js";
import categoryRouterFactory from "./categoryRoutes.js";
import publicArticleRouterFactory from "./publicArticleRoutes.js";

const adminRouterFactory = ({
  pool,
  JWT_SECRET,
  JWT_EXPIRATION,
  FRONTEND_URL,
}) => {
  const adminRouter = Router();
  const authenticateToken = authenticateTokenFactory({ JWT_SECRET });
  adminRouter.use(authenticateToken);

const adminArticleRouter = publicArticleRouterFactory({ pool });
adminRouter.use("/articles", adminArticleRouter);

  const adminCategoryRouter = categoryRouterFactory({ pool });
  adminRouter.use("/categories", adminCategoryRouter);

  return adminRouter;
};

export default adminRouterFactory;
