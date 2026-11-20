/**
 * Covers B12, B13, FR-13 — role matrix for attendance read endpoints, wizard
 * and year routes, replaced student endpoints, and the public password header.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import attendanceRouterFactory from "../src/routes/attendanceRoutes.js";
import publicAttendanceRouterFactory from "../src/routes/publicAttendanceRoutes.js";
import academicYearRouterFactory from "../src/routes/academicYearRoutes.js";
import yearTransitionRouterFactory from "../src/routes/yearTransitionRoutes.js";
import studentRouterFactory from "../src/routes/studentRoutes.js";
import { startTestServer, signToken, ALL_ROLES } from "./helpers/testServer.js";

const READ_ALLOWED = ["super_admin", "guru_bk"];
let att, years, trans, students, pub;

before(async () => {
  att = await startTestServer(attendanceRouterFactory, "/api/attendance");
  years = await startTestServer(academicYearRouterFactory, "/api/academic-years");
  trans = await startTestServer(yearTransitionRouterFactory, "/api/year-transition");
  students = await startTestServer(studentRouterFactory, "/api/students");
  pub = await startTestServer(
    (deps) => publicAttendanceRouterFactory({ ...deps, PUBLIC_ATTENDANCE_PASSWORD: "rahasia" }),
    "/api/public/attendance",
  );
});
after(async () => {
  await Promise.all([att, years, trans, students, pub].map((c) => c.close()));
});

const call = (ctx, path, role, init = {}) =>
  fetch(`${ctx.baseUrl}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${signToken(role)}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });

const READ_PATHS = [
  "/api/attendance?classId=1&date=2026-10-13",
  "/api/attendance/students?classId=1",
  "/api/attendance/recap?classId=1&period=daily&startDate=2026-10-13",
  "/api/attendance/classes",
  "/api/attendance/missing?startDate=2026-10-01&endDate=2026-10-13",
  "/api/attendance/holidays",
];

for (const role of ALL_ROLES) {
  const allowed = READ_ALLOWED.includes(role);
  for (const p of READ_PATHS) {
    test(`[B12] GET ${p.split("?")[0]} — ${role} — ${allowed ? "allowed" : "denied"}`, async () => {
      const res = await call(att, p, role);
      if (allowed) assert.ok(![401, 403].includes(res.status), `got ${res.status}`);
      else assert.equal(res.status, 403);
    });
  }

  test(`[FR-12] holidays write is super_admin only — ${role}`, async () => {
    const res = await call(att, "/api/attendance/holidays", role, {
      method: "POST",
      body: JSON.stringify({ date: "2026-10-09", description: "x" }),
    });
    if (role === "super_admin") assert.notEqual(res.status, 403);
    else assert.equal(res.status, 403);
  });

  test(`year-transition and academic-year writes are super_admin only — ${role}`, async () => {
    const a = await call(trans, "/api/year-transition/preview", role, { method: "POST", body: "{}" });
    const b = await call(years, "/api/academic-years", role, { method: "POST", body: "{}" });
    const c = await call(students, "/api/students/import/commit", role, { method: "POST", body: "{}" });
    for (const res of [a, b, c]) {
      if (role === "super_admin") assert.notEqual(res.status, 403);
      else assert.equal(res.status, 403);
    }
  });

  test(`transfer is guru_bk/super_admin, leave is super_admin — ${role}`, async () => {
    const t = await call(students, "/api/students/1/transfer", role, { method: "POST", body: "{}" });
    const l = await call(students, "/api/students/1/leave", role, { method: "POST", body: "{}" });
    if (allowed) assert.notEqual(t.status, 403);
    else assert.equal(t.status, 403);
    if (role === "super_admin") assert.notEqual(l.status, 403);
    else assert.equal(l.status, 403);
  });
}

test("[FR-09] replaced student endpoints answer 410 Gone", async () => {
  for (const p of ["/api/students/bulk-move-class", "/api/students/graduate", "/api/students/import"]) {
    const res = await call(students, p, "super_admin", { method: "POST", body: "{}" });
    assert.equal(res.status, 410);
  }
});

test("[FR-04] save with an invalid body returns 400, not 500", async () => {
  const res = await call(att, "/api/attendance", "guru_bk", { method: "POST", body: JSON.stringify({ classId: 1, date: "bukan" }) });
  assert.equal(res.status, 400);
});

test("[B13] public recap: password only via header; query string is not accepted", async () => {
  const q = "classId=1&period=daily&startDate=2026-10-13";
  const inQuery = await fetch(`${pub.baseUrl}/api/public/attendance/recap?${q}&password=rahasia`);
  assert.equal(inQuery.status, 400);
  const wrong = await fetch(`${pub.baseUrl}/api/public/attendance/recap?${q}`, { headers: { "X-Attendance-Password": "salah" } });
  assert.equal(wrong.status, 401);
  const ok = await fetch(`${pub.baseUrl}/api/public/attendance/recap?${q}`, { headers: { "X-Attendance-Password": "rahasia" } });
  assert.equal(ok.status, 200);
});
