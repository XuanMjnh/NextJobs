import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { PROFILE_UPLOAD_KINDS, USER_ROLES } from "../constants/index.js";
import { auth } from "../middlewares/auth.middleware.js";
import { upload, verifyUpload } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import * as schema from "../validators/schemas.js";

const router = Router();

function validateProfileUpload(req, res, next) {
  if (!PROFILE_UPLOAD_KINDS.includes(req.params.kind))
    return next(
      Object.assign(new Error("Loại tệp không hợp lệ"), { status: 400 }),
    );
  if (req.params.kind === "resume" && req.user.role !== USER_ROLES.CANDIDATE) {
    return next(
      Object.assign(new Error("Chỉ ứng viên được tải CV"), { status: 403 }),
    );
  }
  next();
}

router.get(
  "/profiles/:id/photo",
  validate(schema.id, "params", "id"),
  userController.photo,
);
router.put("/profile", auth, validate(schema.profile), userController.update);
router.get("/profile/resume", auth, userController.resume);
router.post(
  "/profile/files/:kind",
  auth,
  validateProfileUpload,
  upload,
  verifyUpload,
  userController.upload,
);

export default router;
