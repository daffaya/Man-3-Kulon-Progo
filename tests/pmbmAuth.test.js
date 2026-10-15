/**
 * @fileoverview Authorization test for PMBM admin routes.
 * AUDIT-002 was reviewed and deliberately left as-is: every authenticated
 * role may access PMBM admin data (registrations, export, status update) —
 * no restrictTo() by design. This test exists to make that a documented,
 * enforced decision rather than an implicit gap: if someone later adds a
 * role restriction here without updating this test (or removes auth
 * entirely), CI catches the change either way. (AUDIT-033, Phase 2 scope)
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import pmbmRouterFactory from "../src/routes/pmbmRoutes.js";
import { startTestServer, signToken, ALL_ROLES } from "./helpers/testServer.js";

let ctx;

before(async () => {
  ctx = await startTestServer(pmbmRouterFactory, "/api/pmbm");
});

after(async () => {
  await ctx.close();
});

for (const role of ALL_ROLES) {
  test(`GET /api/pmbm/registrations — role=${role} — allowed (AUDIT-002: all authenticated roles, by decision)`, async () => {
    const res = await fetch(`${ctx.baseUrl}/api/pmbm/registrations`, {
      headers: { Authorization: `Bearer ${signToken(role)}` },
    });
    assert.notEqual(res.status, 401);
    assert.notEqual(res.status, 403);
  });
}

test("GET /api/pmbm/registrations — no token — 401 [AUDIT-002]", async () => {
  const res = await fetch(`${ctx.baseUrl}/api/pmbm/registrations`);
  assert.equal(res.status, 401);
});

test("GET /api/pmbm/debug-secret — no longer exists — 404 [AUDIT-003]", async () => {
  // authenticateToken is mounted via pmbmRouter.use() with no path, so it
  // runs for every request after it — including ones to routes that no
  // longer exist — meaning an unauthenticated hit here would 401 before
  // Express ever gets to say "no such route". Use a valid token so this
  // actually proves the route is gone, not just that auth runs first.
  const res = await fetch(`${ctx.baseUrl}/api/pmbm/debug-secret`, {
    headers: { Authorization: `Bearer ${signToken("super_admin")}` },
  });
  assert.equal(res.status, 404);
});
