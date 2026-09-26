/**
 * @fileoverview End-to-end test for the AUDIT-011 cookie-based auth
 * migration: POST /login must set an httpOnly cookie (and must NOT return
 * the raw JWT in the response body anymore), that cookie must authenticate
 * a subsequent request with no Authorization header at all, and POST
 * /logout must clear it. Run with real HTTP requests (not just calling the
 * route handler directly) so Set-Cookie / Cookie header handling is
 * actually exercised, not assumed.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import authRouterFactory from "../src/routes/authRoutes.js";
import kelulusanRouterFactory from "../src/routes/kelulusanRoutes.js";
import { startTestServer, TEST_JWT_SECRET } from "./helpers/testServer.js";

const TEST_PASSWORD = "correct-horse-battery-staple";
let passwordHash;

let authCtx;
let kelulusanCtx;

before(async () => {
  passwordHash = await bcrypt.hash(TEST_PASSWORD, 4); // low cost factor — test speed only

  const fakePool = {
    execute: async () => [
      [
        {
          id: 1,
          username: "testadmin",
          password_hash: passwordHash,
          full_name: "Test Admin",
          avatar: null,
          role: "super_admin",
          created_at: new Date().toISOString(),
        },
      ],
    ],
    query: async () => [[], []],
  };

  const app = authRouterFactory({
    pool: fakePool,
    JWT_SECRET: TEST_JWT_SECRET,
    JWT_EXPIRATION: "1h",
  });

  authCtx = await startTestServerFromRouter(app, "/api/auth");
  kelulusanCtx = await startTestServer(kelulusanRouterFactory, "/api/kelulusan");
});

after(async () => {
  await authCtx.close();
  await kelulusanCtx.close();
});

// startTestServer in the shared helper builds its own router via a factory
// signature of (deps) => router; authRouterFactory needs slightly different
// deps than the {pool, JWT_SECRET} shape the helper assumes, so build this
// one's app directly instead of forcing it through the shared helper.
async function startTestServerFromRouter(router, mountPath) {
  const express = (await import("express")).default;
  const cookieParser = (await import("cookie-parser")).default;
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(mountPath, router);
  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({
        baseUrl: `http://127.0.0.1:${port}`,
        close: () => new Promise((r) => server.close(r)),
      });
    });
  });
}

test("POST /login sets an httpOnly cookie and does NOT return the token in the body [AUDIT-011]", async () => {
  const res = await fetch(`${authCtx.baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "testadmin", password: TEST_PASSWORD }),
  });

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(
    "token" in body,
    false,
    "response body must not contain the raw JWT anymore",
  );

  const setCookie = res.headers.get("set-cookie");
  assert.ok(setCookie, "Set-Cookie header must be present");
  assert.match(setCookie, /token=/);
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /Secure/i);
});

test("cookie from login authenticates a protected route with NO Authorization header [AUDIT-011]", async () => {
  const loginRes = await fetch(`${authCtx.baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "testadmin", password: TEST_PASSWORD }),
  });
  const setCookie = loginRes.headers.get("set-cookie");
  const cookiePair = setCookie.split(";")[0]; // "token=<jwt>"

  const res = await fetch(`${kelulusanCtx.baseUrl}/api/kelulusan`, {
    headers: { Cookie: cookiePair }, // no Authorization header at all
  });

  assert.notEqual(res.status, 401);
  assert.notEqual(res.status, 403);
});

test("POST /logout clears the cookie", async () => {
  const res = await fetch(`${authCtx.baseUrl}/api/auth/logout`, {
    method: "POST",
  });
  assert.equal(res.status, 200);
  const setCookie = res.headers.get("set-cookie");
  assert.ok(setCookie, "logout must send a Set-Cookie header clearing it");
  // clearCookie sends an already-expired cookie with empty value
  assert.match(setCookie, /token=;/);
});

test("no cookie and no Authorization header — still 401 [regression guard]", async () => {
  const res = await fetch(`${kelulusanCtx.baseUrl}/api/kelulusan`);
  assert.equal(res.status, 401);
});
