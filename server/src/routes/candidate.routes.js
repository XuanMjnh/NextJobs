import { Router } from "express";
import * as candidateController from "../controllers/candidate.controller.js";
import { USER_ROLES } from "../constants/index.js";
import { auth, role } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import * as schema from "../validators/schemas.js";

const router = Router();
const candidateOnly = [auth, role(USER_ROLES.CANDIDATE)];
const jobId = validate(schema.id, "params", "id");

router.get(
  "/candidate/saved",
  ...candidateOnly,
  validate(schema.search, "query"),
  candidateController.saved,
);
router.get(
  "/candidate/applications",
  ...candidateOnly,
  validate(schema.search, "query"),
  candidateController.applied,
);
router.put(
  "/jobs/:id/saved",
  ...candidateOnly,
  jobId,
  candidateController.save,
);
router.delete(
  "/jobs/:id/saved",
  ...candidateOnly,
  jobId,
  candidateController.unsave,
);
router.post(
  "/jobs/:id/applications",
  ...candidateOnly,
  jobId,
  validate(schema.application),
  candidateController.apply,
);
router.patch(
  "/jobs/:id/withdraw",
  ...candidateOnly,
  jobId,
  candidateController.withdraw,
);

export default router;
