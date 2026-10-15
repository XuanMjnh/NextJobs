import { test, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
process.env.JWT_SECRET ||= "test-only-secret-with-at-least-32-characters";
const { app } = await import("../src/app.js");
const { pool } = await import("../src/config/db.js");
const { buildFilter } = await import("../src/repositories/job.repository.js");
after(() => pool.end());
test("protected endpoints reject unauthenticated callers", async () => {
  for (const path of [
    "/api/auth/me",
    "/api/recruiter/jobs",
    "/api/candidate/saved",
    "/api/applications/1/resume",
    "/api/profile/resume",
  ])
    assert.equal((await request(app).get(path)).status, 401);
});
test("forged cookies and cross-site writes are rejected", async () => {
  assert.equal(
    (
      await request(app)
        .get("/api/auth/me")
        .set("Cookie", "nextjobs_session=invalid")
    ).status,
    401,
  );
  assert.equal(
    (
      await request(app)
        .post("/api/auth/logout")
        .set("Origin", "https://evil.example")
    ).status,
    403,
  );
  assert.equal(
    (
      await request(app)
        .post("/api/auth/logout")
        .set("Sec-Fetch-Site", "cross-site")
    ).status,
    403,
  );
});
test("input validation happens before touching MySQL", async () => {
  const r = await request(app)
    .post("/api/auth/register")
    .send({ email: "not-email", password: "x", role: "admin" });
  assert.equal(r.status, 400);
  assert.ok(r.body.errors.length);
  assert.equal((await request(app).get("/api/jobs?page=-1")).status, 400);
});
test("SQL filters bind malicious values and keep scopes constrained", () => {
  const input = {
    q: "' OR 1=1 --",
    location: "Hà Nội",
    types: "Full-time,Part-time",
    remotes: "Remote-Only",
    days: "7",
  };
  const f = buildFilter(input, 42, "owned");
  assert.ok(!f.sql.includes(input.q));
  assert.equal(f.params[0], 42);
  assert.ok(f.sql.includes("j.recruiter_id=?"));
  assert.ok(f.params.includes("%" + input.q + "%"));
  assert.ok(f.sql.includes("j.type IN (?,?)"));
  const saved = buildFilter({ ...input, q: "" }, 7, "saved");
  assert.ok(saved.sql.includes("sv.user_id=?"));
  assert.equal(saved.params[0], 7);
});
test("API 404 is JSON", async () => {
  const r = await request(app)
    .get("/api/unknown")
    .set(
      "Cookie",
      "nextjobs_session=" +
        jwt.sign({ id: 1, role: "candidate" }, process.env.JWT_SECRET),
    );
  assert.equal(r.status, 404);
  assert.ok(r.body.message);
});

test("roles are enforced before accessing database", async () => {
  const candidate = jwt.sign(
    { id: 1, role: "candidate" },
    process.env.JWT_SECRET,
  );
  const recruiter = jwt.sign(
    { id: 2, role: "recruiter" },
    process.env.JWT_SECRET,
  );
  assert.equal(
    (
      await request(app)
        .post("/api/jobs")
        .set("Cookie", "nextjobs_session=" + candidate)
        .send({})
    ).status,
    403,
  );
  assert.equal(
    (
      await request(app)
        .put("/api/jobs/1/saved")
        .set("Cookie", "nextjobs_session=" + recruiter)
    ).status,
    403,
  );
});
