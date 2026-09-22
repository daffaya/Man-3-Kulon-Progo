/**
 * @fileoverview Router untuk halaman share artikel dengan og:meta dinamis.
 * Endpoint ini men-generate HTML statis (bukan React SPA) khusus untuk
 * dibaca crawler bot (WhatsApp/Facebook/Twitter/dll) yang tidak menjalankan
 * JS. Manusia yang membuka link ini langsung di-redirect ke SPA asli.
 */

import crypto from "crypto";
import { Router } from "express";

/**
 * Escape karakter HTML dasar untuk mencegah injection di meta tag.
 * @param {string} str
 * @returns {string}
 */
const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

/**
 * Factory function untuk router share artikel.
 *
 * @param {object} options
 * @param {import('mysql2/promise').Pool} options.pool - MySQL connection pool.
 * @param {string} options.FRONTEND_URL - Base URL frontend SPA (untuk redirect & fallback og:image).
 * @returns {import('express').Router}
 */
const shareRouterFactory = ({ pool, FRONTEND_URL }) => {
  const shareRouter = Router();

  /**
   * GET /share/berita/:slug
   * Generate HTML dengan og:title, og:image, og:description untuk 1 artikel,
   * lalu redirect ke halaman SPA asli.
   */
  shareRouter.get("/berita/:slug", async (req, res) => {
    const { slug } = req.params;

    try {
      const [rows] = await pool.execute(
        `
        SELECT title, overview, cover_image, slug
        FROM articles
        WHERE slug = ? AND published = TRUE
        LIMIT 1;
        `,
        [slug],
      );

      if (rows.length === 0) {
        return res.redirect(302, `${FRONTEND_URL}/berita`);
      }

      const article = rows[0];
      const targetUrl = `${FRONTEND_URL}/berita/${article.slug}`;

      // cover_image bisa berupa URL absolut atau path relatif
      // (/uploads/covers/xxx.jpg)
      let coverImage;

      if (!article.cover_image) {
        coverImage = `${FRONTEND_URL}/logo.png`;
      } else if (/^https?:\/\//i.test(article.cover_image)) {
        coverImage = article.cover_image;
      } else {
        const backendUrl = `${req.protocol}://${req.get("host")}`;

        const path = article.cover_image.startsWith("/")
          ? article.cover_image
          : `/${article.cover_image}`;

        coverImage = `${backendUrl}${path}`;
      }

      const title = escapeHtml(article.title);
      const description = escapeHtml((article.overview || "").slice(0, 160));
      const safeTargetUrl = escapeHtml(targetUrl);
      const safeCoverImage = escapeHtml(coverImage);

      // Nonce unik per request.
      const nonce = crypto.randomBytes(32).toString("base64");

      // CSP hanya mengizinkan inline script dengan nonce ini.
      res.set(
        "Content-Security-Policy",
        [
          `script-src 'nonce-${nonce}'`,
          "object-src 'none'",
          "base-uri 'none'",
        ].join("; "),
      );

      res.set("Content-Type", "text/html; charset=utf-8");

      res.send(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<title>${title}</title>

<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${safeCoverImage}" />
<meta property="og:url" content="${safeTargetUrl}" />
<meta property="og:type" content="article" />

<meta name="twitter:card" content="summary_large_image" />

<meta http-equiv="refresh" content="0; url=${safeTargetUrl}" />

<script nonce="${nonce}">
window.location.replace(${JSON.stringify(targetUrl)});
</script>
</head>

<body>
<p>Mengalihkan ke <a href="${safeTargetUrl}">${safeTargetUrl}</a>...</p>
</body>
</html>`);
    } catch (error) {
      console.error(`Error generating share page for slug "${slug}":`, error);

      res.redirect(302, `${FRONTEND_URL}/berita`);
    }
  });

  return shareRouter;
};

export default shareRouterFactory;
