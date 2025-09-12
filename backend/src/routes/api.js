import { Router } from "express";
import authRouterFactory from "./authRoutes.js";
import tagRouterFactory from "./tagRoutes.js";
import publicArticleRouterFactory from "./publicArticleRoutes.js";
import adminRouterFactory from "./adminRoutes.js";
import categoryRouterFactory from "./categoryRoutes.js";
import publicCategoryRouterFactory from "./publicCategoryRoutes.js";

const apiRouterFactory = ({
  pool,
  transporter,
  JWT_SECRET,
  JWT_EXPIRATION,
  FRONTEND_URL,
}) => {
  const apiRouter = Router();

  apiRouter.use(
    "/auth",
    authRouterFactory({ pool, JWT_SECRET, JWT_EXPIRATION })
  );


  apiRouter.use("/categories", publicCategoryRouterFactory({ pool }));

  apiRouter.use("/tags", tagRouterFactory({ pool }));

  apiRouter.use("/articles", publicArticleRouterFactory({ pool }));

  apiRouter.use(
    "/admin",
    adminRouterFactory({
      pool,
      JWT_SECRET,
      JWT_EXPIRATION,
      transporter,
      FRONTEND_URL,
    })
  );

  return apiRouter;
};

export default apiRouterFactory;
