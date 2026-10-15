import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { readFile, unlink } from "node:fs/promises";
const enabled = process.env.NEXTJOBS_INTEGRATION === "1";
test(
  "MySQL: complete candidate/recruiter flow with CV ownership and closed jobs",
  { skip: !enabled },
  async () => {
    process.env.JWT_SECRET ||= "integration-only-secret-at-least-32-characters";
    const { env } = await import("../src/config/env.js");
    assert.ok(
      env.db.database.endsWith("_test"),
      "Integration requires database name ending in _test",
    );
    const { app } = await import("../src/app.js");
    const { pool } = await import("../src/config/db.js");
    const { filePath } = await import("../src/utils/files.js");
    const stamp = Date.now(),
      password = "TestPassword!123";
    const owner = request.agent(app),
      other = request.agent(app),
      candidate = request.agent(app),
      candidate2 = request.agent(app);
    const createdIds = [];
    let jobId;
    const files = [];
    const job = {
      title: "React Developer " + stamp,
      company: "Test Company",
      city: "Hà Nội",
      state: "Cầu Giấy",
      country: "Việt Nam",
      type: "Full-time",
      remote: "Partial-Remote",
      salary: "20 - 30 triệu",
      quantity: 2,
      field: "IT",
      experience_required: "1 năm",
      certificate_required: "Đại học",
      description: "Mô tả công việc\nPhát triển React",
      status: "open",
    };
    async function signup(agent, role, index) {
      const r = await agent
        .post("/api/auth/register")
        .send({ email: `test-${stamp}-${index}@example.com`, password, role });
      assert.equal(r.status, 201, JSON.stringify(r.body));
      createdIds.push(r.body.id);
      return r.body;
    }
    try {
      const u = await signup(owner, "recruiter", 1);
      await signup(other, "recruiter", 2);
      const c = await signup(candidate, "candidate", 3);
      await signup(candidate2, "candidate", 4);
      let r = await owner.post("/api/jobs").send(job);
      assert.equal(r.status, 201, JSON.stringify(r.body));
      jobId = r.body.id;
      assert.equal(r.body.recruiter_id, u.id);
      r = await candidate.post("/api/jobs").send(job);
      assert.equal(r.status, 403);
      r = await other
        .put("/api/jobs/" + jobId)
        .send({ ...job, title: "Hijacked" });
      assert.equal(r.status, 403);
      r = await request(app)
        .get("/api/jobs")
        .query({
          q: job.title,
          types: "Full-time",
          remotes: "Partial-Remote",
          location: "Hà Nội",
        });
      assert.equal(r.status, 200);
      assert.equal(r.body.total, 1);
      r = await request(app).get("/api/jobs").query({ q: "' OR 1=1 --" });
      assert.equal(r.status, 200);
      assert.equal(r.body.total, 0);
      r = await candidate.put("/api/jobs/" + jobId + "/saved");
      assert.equal(r.status, 201);
      await candidate.put("/api/jobs/" + jobId + "/saved");
      r = await candidate.get("/api/candidate/saved");
      assert.equal(r.body.total, 1);
      r = await candidate
        .post("/api/jobs/" + jobId + "/applications")
        .send({ cover_letter: "" });
      assert.equal(r.status, 400);
      const profile = {
        first_name: "Nguyễn",
        last_name: "Anh",
        city: "Hà Nội",
        state: "",
        country: "Việt Nam",
        company: "",
        certificate: "Đại học",
        experience: "2 năm",
        skills: [{ name: "React", level: "Advance", years: 2 }],
      };
      r = await candidate.put("/api/profile").send(profile);
      assert.equal(r.status, 200);
      assert.equal(r.body.skills[0].name, "React");
      r = await candidate
        .post("/api/profile/files/resume")
        .attach("file", Buffer.from("MZ unsafe"), "fake.pdf");
      assert.equal(r.status, 400);
      r = await candidate
        .post("/api/profile/files/resume")
        .attach("file", Buffer.from("%PDF-1.4\nFirst CV\n%%EOF"), "resume.pdf");
      assert.equal(r.status, 201);
      let [[p]] = await pool.execute(
        "SELECT resume FROM profiles WHERE user_id=?",
        [c.id],
      );
      files.push(p.resume);
      const original = await readFile(filePath(p.resume));
      r = await candidate
        .post("/api/jobs/" + jobId + "/applications")
        .send({ cover_letter: "Tôi muốn ứng tuyển" });
      assert.equal(r.status, 201, JSON.stringify(r.body));
      r = await candidate
        .post("/api/jobs/" + jobId + "/applications")
        .send({ cover_letter: "" });
      assert.equal(r.status, 409);
      r = await owner.get("/api/jobs/" + jobId + "/applicants");
      assert.equal(r.status, 200);
      assert.equal(r.body.length, 1);
      const a = r.body[0];
      assert.equal(a.first_name, "Nguyễn");
      assert.equal(a.skills[0].name, "React");
      const [[snapshot]] = await pool.execute(
        "SELECT resume FROM applications WHERE id=?",
        [a.id],
      );
      files.push(snapshot.resume);
      assert.notEqual(snapshot.resume, p.resume);
      r = await candidate
        .post("/api/profile/files/resume")
        .attach("file", Buffer.from("%PDF-1.4\nNew CV\n%%EOF"), "new.pdf");
      assert.equal(r.status, 201);
      [[p]] = await pool.execute(
        "SELECT resume FROM profiles WHERE user_id=?",
        [c.id],
      );
      files.push(p.resume);
      assert.deepEqual(await readFile(filePath(snapshot.resume)), original);
      r = await other.get("/api/applications/" + a.id + "/resume");
      assert.equal(r.status, 403);
      r = await candidate.get("/api/applications/" + a.id + "/resume");
      assert.equal(r.status, 403);
      r = await owner.get("/api/applications/" + a.id + "/resume");
      assert.equal(r.status, 200);
      assert.match(r.headers["content-disposition"], /attachment/);
      r = await owner
        .patch("/api/applications/" + a.id)
        .send({ status: "reviewing" });
      assert.equal(r.status, 200);
      r = await candidate.get("/api/candidate/applications");
      assert.equal(r.body.items[0].application_status, "reviewing");
      r = await candidate.patch("/api/jobs/" + jobId + "/withdraw");
      assert.equal(r.status, 200);
      r = await owner
        .patch("/api/applications/" + a.id)
        .send({ status: "accepted" });
      assert.equal(r.status, 409);
      r = await candidate2.put("/api/profile").send(profile);
      assert.equal(r.status, 200);
      await candidate2
        .post("/api/profile/files/resume")
        .attach("file", original, "resume.pdf");
      const [[p2]] = await pool.execute(
        "SELECT resume FROM profiles WHERE user_id=?",
        [createdIds[3]],
      );
      files.push(p2.resume);
      r = await owner.delete("/api/jobs/" + jobId);
      assert.equal(r.status, 200);
      r = await candidate2
        .post("/api/jobs/" + jobId + "/applications")
        .send({});
      assert.equal(r.status, 409);
      r = await request(app).get("/api/jobs").query({ q: job.title });
      assert.equal(r.body.total, 0);
      r = await candidate.get("/api/candidate/saved");
      assert.equal(r.body.items[0].status, "closed");
      r = await owner
        .put("/api/jobs/" + jobId)
        .send({ ...job, status: "open" });
      assert.equal(r.status, 200);
      r = await candidate.delete("/api/jobs/" + jobId + "/saved");
      assert.equal(r.status, 200);
      r = await candidate.get("/api/candidate/saved");
      assert.equal(r.body.total, 0);
      r = await request(app).get("/api/stats");
      assert.equal(r.status, 200);
      assert.ok(r.body.applications >= 0);
      await candidate.post("/api/auth/logout");
      r = await candidate.get("/api/auth/me");
      assert.equal(r.status, 401);
      r = await candidate
        .post("/api/auth/login")
        .send({ email: c.email, password });
      assert.equal(r.status, 200);
    } finally {
      if (jobId) {
        await pool.execute("DELETE FROM applications WHERE job_id=?", [jobId]);
        await pool.execute("DELETE FROM saved_jobs WHERE job_id=?", [jobId]);
        await pool.execute("DELETE FROM jobs WHERE id=?", [jobId]);
      }
      if (createdIds.length)
        await pool.query("DELETE FROM users WHERE id IN (?)", [createdIds]);
      for (const f of files) await unlink(filePath(f)).catch(() => {});
      await pool.end();
    }
  },
);
