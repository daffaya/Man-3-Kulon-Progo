import { Router } from "express";
import {
  authenticateTokenFactory,
  restrictTo,
} from "../middleware/authMiddleware.js";
import cmsUpload from "../middleware/cmsUpload.js";

/**
 * Factory for CMS upload route.
 * Mount at /api/atmin/cms in api.js (before adminCmsRoutes).
 *
 * POST /api/atmin/cms/upload
 * - Auth: JWT + super_admin
 * - Body: multipart/form-data, field name: "image"
 * - Returns: { url: string } — path relatif yang bisa langsung dipakai di frontend
 */
const cmsUploadRouterFactory = ({ JWT_SECRET }) => {
  const router = Router();

  const authenticateToken = authenticateTokenFactory({ JWT_SECRET });
  router.use(authenticateToken);
  router.use(restrictTo(["super_admin"]));

  /**
   * POST /upload
   * Upload a single image for use in CMS content.
   */
  router.post("/upload", cmsUpload, (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Tidak ada file yang diupload." });
    }

    // Return URL relatif — sesuaikan prefix jika backend serve /uploads/ sebagai static
    const url = `/uploads/cms/${req.file.filename}`;
    return res.json({ url });
  });

  return router;
};

export default cmsUploadRouterFactory;
