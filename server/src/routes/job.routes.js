import { Router } from "express";
import * as jobController from "../controllers/job.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import * as schema from "../validators/schemas.js";

const router = Router();

router.get("/stats", jobController.stats);
router.get("/jobs", validate(schema.search, "query"), jobController.list);
router.get(
  "/jobs/:id/logo",
  validate(schema.id, "params", "id"),
  jobController.getLogo,
);
router.get("/jobs/:id", validate(schema.id, "params", "id"), jobController.get);

export default router;
