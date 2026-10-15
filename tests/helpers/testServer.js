/**
 * @fileoverview Shared helper for authorization-matrix tests (AUDIT-033).
 * Spins up a real Express app around a given route factory, using a fake
 * DB pool (so tests don't need a live MySQL connection — they're only
 * exercising the auth/role middleware chain, not business logic) and a
 * real JWT signed with a test secret so authenticateTokenFactory's actual
 * verification logic runs unmodified.
 */
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

export const TEST_JWT_SECRET = "test-secret-for-authorization-matrix-tests";

/**
 * A pool stub that resolves every query/execute with an empty result set.
 * Good enough to let read handlers run past the DB call; if a handler's
 * shape needs more (e.g. destructuring a COUNT(*) row), it'll 500 instead
 * of crashing the test process — still distinguishable from 401/403, which
 * is all these tests assert on.
 */
export const fakePool = {
  query: async () => [[], []],
  execute: async () => [[], []],
};

export const signToken = (role, overrides = {}) =>
  jwt.sign(
    { id: 1, username: "test-user", role, ...overrides },
    TEST_JWT_SECRET,
    { expiresIn: "1h" },
  );

/**
 * Mounts routerFactory({ pool: fakePool, JWT_SECRET: TEST_JWT_SECRET }) at
 * mountPath on a fresh Express app and starts it on an ephemeral port.
 * @returns {Promise<{baseUrl: string, close: () => Promise<void>}>}
 */
export const startTestServer = async (routerFactory, mountPath) => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(mountPath, routerFactory({ pool: fakePool, JWT_SECRET: TEST_JWT_SECRET }));

  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({
        baseUrl: `http://127.0.0.1:${port}`,
        close: () => new Promise((r) => server.close(r)),
      });
    });
  });
};

/** Every role currently defined in the system (see web-context.md). */
export const ALL_ROLES = [
  "super_admin",
  "jurnalis",
  "arsiparis",
  "guru_bk",
  "pengelola_bmn",
];
