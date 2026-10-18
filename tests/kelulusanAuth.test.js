/**
 * @fileoverview Authorization-matrix test for kelulusan (graduation) admin
 * routes — the exact bug class AUDIT-004 fixed (missing role restriction).
 * One assertion per role × route so a future refactor that accidentally
 * removes restrictTo(["guru_bk", "super_admin"]) fails CI, not a user
 * report. (AUDIT-033, Phase 2 scope: routes fixed in Phase 0)
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import kelulusanRouterFactory from "../src/routes/kelulusanRoutes.js";
import { startTestServer, signToken, ALL_ROLES } from "./helpers/testServer.js";

const ALLOWED_ROLES = ["super_admin", "guru_bk"];

let ctx;

before(async () => {
  ctx = await startTestServer(kelulusanRouterFactory, "/api/kelulusan");
});

after(async () => {
  await ctx.close();
});

for (const role of ALL_ROLES) {
  const shouldAllow = ALLOWED_ROLES.includes(role);

  test(`GET /api/kelulusan — role=${role} — ${shouldAllow ? "allowed" : "denied"} [AUDIT-004]`, async () => {
    const res = await fetch(`${ctx.baseUrl}/api/kelulusan`, {
      headers: { Authorization: `Bearer ${signToken(role)}` },
    });

    if (shouldAllow) {
      assert.notEqual(res.status, 401);
      assert.notEqual(res.status, 403);
    } else {
      assert.equal(res.status, 403);
    }
  });
}

test("GET /api/kelulusan — no token — 401 [AUDIT-004]", async () => {
  const res = await fetch(`${ctx.baseUrl}/api/kelulusan`);
  assert.equal(res.status, 401);
});

test("GET /api/kelulusan/cek/:nisn — public endpoint stays reachable with no token", async () => {
  // Regression guard for AUDIT-032/AUDIT-004: the public cek-kelulusan
  // route must NOT end up behind the admin restrictTo() block.
  const res = await fetch(`${ctx.baseUrl}/api/kelulusan/cek/1234567890`);
  assert.notEqual(res.status, 401);
  assert.notEqual(res.status, 403);
});
