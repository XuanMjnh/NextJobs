import { Router } from "express";
import * as recruiterController from "../controllers/recruiter.controller.js";
import * as jobController from "../controllers/job.controller.js";
import { USER_ROLES } from "../constants/index.js";
import { auth, role } from "../middlewares/auth.middleware.js";
import { upload, verifyUpload } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import * as jobService from "../services/job.service.js";
import * as schema from "../validators/schemas.js";

const router = Router();
const recruiterOnly = [auth, role(USER_ROLES.RECRUITER)];
const jobId = validate(schema.id, "params", "id");

async function validateOwnedLogoUpload(req, res, next) {
  if (req.params.kind !== "logo")
    return next(Object.assign(new Error("Chỉ hỗ trợ logo"), { status: 400 }));
  try {
    await jobService.owned(req.validated.params.id, req.user.id);
    next();
  } catch (error) {
    next(error);
  }
}

router.get(
  "/recruiter/jobs",
  ...recruiterOnly,
  validate(schema.search, "query"),
  jobController.owned,
);
router.post(
  "/jobs",
  ...recruiterOnly,
  validate(schema.job),
  jobController.create,
);
router.put(
  "/jobs/:id",
  ...recruiterOnly,
  jobId,
  validate(schema.job),
  jobController.update,
);
router.delete("/jobs/:id", ...recruiterOnly, jobId, jobController.close);
router.get(
  "/jobs/:id/applicants",
  ...recruiterOnly,
  jobId,
  recruiterController.applicants,
);
router.patch(
  "/applications/:id",
  ...recruiterOnly,
  validate(schema.id, "params", "id"),
  validate(schema.applicationStatus),
  recruiterController.status,
);
router.get(
  "/applications/:id/resume",
  ...recruiterOnly,
  validate(schema.id, "params", "id"),
  recruiterController.resume,
);
router.post(
  "/jobs/:id/files/:kind",
  ...recruiterOnly,
  jobId,
  validateOwnedLogoUpload,
  upload,
  verifyUpload,
  recruiterController.logo,
);

export default router;
