// PERF P0-5: public read endpoints send Cache-Control (only on 200), controllers
// untouched. Also checks the properties that make public caching safe here.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import express from "express";
import cors from "cors";
import publicCache, { PUBLIC_CACHE } from "../src/middleware/publicCache.js";
import cmsRouterFactory from "../src/routes/cmsRoutes.js";
import publicArticleRouterFactory from "../src/routes/publicArticleRoutes.js";
import publicGalleryRouterFactory from "../src/routes/publicGalleryRoutes.js";

let server;
let base;

before(async () => {
  const app = express();

  // Same CORS shape as server.js (origin allow-list function + credentials).
  const allowed = ["https://man3kulonprogo.sch.id"];
  app.use(
    cors({
      origin: (origin, cb) =>
        !origin || allowed.includes(origin) ? cb(null, true) : cb(new Error("Not allowed by CORS")),
      credentials: true,
    }),
  );

  app.get("/ok", publicCache(PUBLIC_CACHE), (req, res) => res.json({ a: 1 }));
  app.get("/missing", publicCache(PUBLIC_CACHE), (req, res) => res.status(404).json({ m: "nf" }));
  app.get("/boom", publicCache(PUBLIC_CACHE), (req, res) => res.status(500).json({ m: "err" }));
  app.get("/none", publicCache(() => null), (req, res) => res.json({ a: 1 }));
  app.get("/page/:page", publicCache((req) => (req.params.page === "pmbm" ? "no-cache" : PUBLIC_CACHE)),
    (req, res) => res.json({ page: req.params.page }));

  server = http.createServer(app);
  await new Promise((r) => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((r) => server.close(r)));

test("200 JSON gets Cache-Control", async () => {
  const res = await fetch(`${base}/ok`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("cache-control"), "public, max-age=60");
});

test("404 and 500 responses are NOT cacheable", async () => {
  for (const path of ["/missing", "/boom"]) {
    const res = await fetch(`${base}${path}`);
    assert.equal(res.headers.get("cache-control"), null, path);
  }
});

test("policy function can pick a value per request, or none", async () => {
  assert.equal((await fetch(`${base}/page/home`)).headers.get("cache-control"), "public, max-age=60");
  assert.equal((await fetch(`${base}/page/pmbm`)).headers.get("cache-control"), "no-cache");
  assert.equal((await fetch(`${base}/none`)).headers.get("cache-control"), null);
});

// node:http on purpose: Node's fetch() hides 304 responses from tests.
const rawGet = (path, headers = {}) =>
  new Promise((resolve, reject) => {
    http
      .get(`${base}${path}`, { headers }, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body }));
      })
      .on("error", reject);
  });

test("ETag revalidation works: 304 with empty body, and Cache-Control is refreshed", async () => {
  const first = await rawGet("/ok");
  assert.equal(first.status, 200);
  assert.ok(first.headers.etag, "express should send an ETag");

  const second = await rawGet("/ok", { "If-None-Match": first.headers.etag });
  assert.equal(second.status, 304);
  assert.equal(second.body, "");
  assert.equal(second.headers["cache-control"], "public, max-age=60");
});

test("cached CORS responses vary by Origin (a response for origin A is never reused for origin B)", async () => {
  const res = await fetch(`${base}/ok`, { headers: { Origin: "https://man3kulonprogo.sch.id" } });
  assert.equal(res.headers.get("access-control-allow-origin"), "https://man3kulonprogo.sch.id");
  assert.match(res.headers.get("vary") ?? "", /Origin/i);
  assert.equal(res.headers.get("cache-control"), "public, max-age=60");
});

// ---- wiring: every public GET route in the real routers has the middleware

const wiredGetRoutes = (router) =>
  router.stack
    .filter((layer) => layer.route?.methods.get)
    .map((layer) => ({
      path: layer.route.path,
      cached: layer.route.stack.some((l) => l.name === "publicCacheMiddleware"),
    }));

test("cms router: all 3 public GET routes are wired", () => {
  const routes = wiredGetRoutes(cmsRouterFactory({ pool: {} }));
  assert.deepEqual(routes.map((r) => r.path), ["/collections/:type", "/:page", "/:page/:section"]);
  assert.ok(routes.every((r) => r.cached), JSON.stringify(routes));
});

test("public article router: list and detail are wired", () => {
  const routes = wiredGetRoutes(publicArticleRouterFactory({ pool: {} }));
  assert.deepEqual(routes.map((r) => r.path), ["/", "/:slug"]);
  assert.ok(routes.every((r) => r.cached), JSON.stringify(routes));
});

test("public gallery router: albums and album detail are wired", () => {
  const routes = wiredGetRoutes(publicGalleryRouterFactory({ pool: {} }));
  assert.deepEqual(routes.map((r) => r.path), ["/albums", "/albums/:slug"]);
  assert.ok(routes.every((r) => r.cached), JSON.stringify(routes));
});
