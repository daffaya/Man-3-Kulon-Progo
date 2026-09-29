/**
 * @fileoverview Cache-Control for public, read-only JSON endpoints.
 *
 * Sets the header ONLY on successful (200) responses, so 404/500 errors are
 * never cached. Applied per route, controllers stay untouched.
 *
 * Express already adds a weak ETag to res.json(), so a response without
 * max-age (or with "no-cache") is still revalidated cheaply via 304.
 *
 * Usage:
 *   router.get("/x", publicCache("public, max-age=60"), handler);
 *   router.get("/y", publicCache((req) => req.params.id === "a" ? "no-cache" : "public, max-age=60"), handler);
 *
 * NOTE: browser/CDN caches are not cleared when an admin edits content, so
 * max-age is also the maximum time an edit can take to show up. Keep it short.
 */

export const PUBLIC_MAX_AGE_SECONDS = 60;
export const PUBLIC_CACHE = `public, max-age=${PUBLIC_MAX_AGE_SECONDS}`;

/**
 * @param {string | ((req: import('express').Request) => string | null | undefined)} policy
 *   A Cache-Control value, or a function returning one (return falsy to send no header).
 * @returns {import('express').RequestHandler}
 */
const publicCache = (policy) =>
  function publicCacheMiddleware(req, res, next) {
    const sendJson = res.json.bind(res);

    res.json = (body) => {
      if (res.statusCode === 200) {
        const value = typeof policy === "function" ? policy(req) : policy;
        if (value) res.setHeader("Cache-Control", value);
      }
      return sendJson(body);
    };

    next();
  };

export default publicCache;
