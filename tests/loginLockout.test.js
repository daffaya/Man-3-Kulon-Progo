/**
 * @fileoverview Test for AUDIT-018's per-account login lockout: 5 failed
 * attempts against the same username must lock it out (429) even with the
 * correct password on the 6th try, independent of the per-IP rate limiter.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import express from "express";
import cookieParser from "cookie-parser";
import authRouterFactory from "../src/routes/authRoutes.js";
import { TEST_JWT_SECRET } from "./helpers/testServer.js";

const REAL_PASSWORD = "correct-horse-battery-staple";
let ctx;

before(async () => {
  const passwordHash = await bcrypt.hash(REAL_PASSWORD, 4);
  const fakePool = {
    execute: async () => [
      [
        {
          id: 1,
          username: "lockouttest",
          password_hash: passwordHash,
          full_name: "Lockout Test",
          avatar: null,
          role: "super_admin",
          created_at: new Date().toISOString(),
        },
      ],
    ],
    query: async () => [[], []],
  };

  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    "/api/auth",
    authRouterFactory({
      pool: fakePool,
      JWT_SECRET: TEST_JWT_SECRET,
      JWT_EXPIRATION: "1h",
    }),
  );

  await new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      ctx = {
        baseUrl: `http://127.0.0.1:${port}`,
        close: () => new Promise((r) => server.close(r)),
      };
      resolve();
    });
  });
});

after(async () => {
  await ctx.close();
});

const attemptLogin = (username, password) =>
  fetch(`${ctx.baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

test("5 failed logins lock the account; the 6th attempt is 429 even with the correct password [AUDIT-018]", async () => {
  for (let i = 0; i < 5; i++) {
    const res = await attemptLogin("lockouttest", "wrong-password");
    assert.equal(res.status, 401, `attempt ${i + 1} should be a plain 401`);
  }

  const lockedRes = await attemptLogin("lockouttest", REAL_PASSWORD);
  assert.equal(lockedRes.status, 429);
  const body = await lockedRes.json();
  assert.equal(body.success, false);
  assert.ok(lockedRes.headers.get("retry-after"));
});

test("a different username is unaffected by another account's lockout", async () => {
  const res = await attemptLogin("someone-else", "whatever");
  assert.equal(res.status, 401); // not 429 — lockout is per-username
});
