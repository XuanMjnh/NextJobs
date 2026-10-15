import { Router } from "express";
import rateLimit from "express-rate-limit";
import { auth, role } from "../middleware/auth.js";
import { upload, verifyUpload } from "../middleware/upload.js";
import * as a from "../controllers/auth.controller.js";
import * as p from "../controllers/profile.controller.js";
import * as j from "../controllers/job.controller.js";
import * as c from "../controllers/candidate.controller.js";
import * as r from "../controllers/recruiter.controller.js";
import { fail } from "../utils/errors.js";
export const router = Router();
const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau 15 phút.",
  },
});
router.post("/auth/register", authLimit, a.register);
router.post("/auth/login", authLimit, a.login);
router.post("/auth/logout", a.logout);
router.get("/stats", j.stats);
router.get("/jobs", j.list);
router.get("/jobs/:id", j.get);
router.get("/jobs/:id/logo", r.getLogo);
router.get("/profiles/:id/photo", p.photo);
router.use(auth);
router.get("/auth/me", p.me);
router.put("/profile", p.update);
router.get("/profile/resume", p.resume);
router.post(
  "/profile/files/:kind",
  (req, res, next) => {
    if (!["photo", "resume"].includes(req.params.kind))
      fail(400, "Loại tệp không hợp lệ");
    if (req.params.kind === "resume" && req.user.role !== "candidate")
      fail(403, "Chỉ ứng viên được tải CV");
    next();
  },
  upload,
  verifyUpload,
  p.upload,
);
router.get("/candidate/saved", role("candidate"), c.saved);
router.get("/candidate/applications", role("candidate"), c.applied);
router.put("/jobs/:id/saved", role("candidate"), c.save);
router.delete("/jobs/:id/saved", role("candidate"), c.unsave);
router.post("/jobs/:id/applications", role("candidate"), c.apply);
router.patch("/jobs/:id/withdraw", role("candidate"), c.withdraw);
router.get("/recruiter/jobs", role("recruiter"), j.owned);
router.post("/jobs", role("recruiter"), j.create);
router.put("/jobs/:id", role("recruiter"), j.update);
router.delete("/jobs/:id", role("recruiter"), j.close);
router.get("/jobs/:id/applicants", role("recruiter"), r.applicants);
router.patch("/applications/:id", role("recruiter"), r.status);
router.get("/applications/:id/resume", role("recruiter"), r.resume);
router.post(
  "/jobs/:id/files/:kind",
  role("recruiter"),
  async (req, res, next) => {
    if (req.params.kind !== "logo") fail(400, "Chỉ hỗ trợ logo");
    await import("../services/job.service.js").then((s) =>
      s.owned(Number(req.params.id), req.user.id),
    );
    next();
  },
  upload,
  verifyUpload,
  r.logo,
);
