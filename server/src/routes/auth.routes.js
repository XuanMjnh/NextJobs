import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/auth.controller.js";
import * as userController from "../controllers/user.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import * as schema from "../validators/schemas.js";

const router = Router();
const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau 15 phút.",
  },
});

router.post(
  "/auth/register",
  authLimit,
  validate(schema.register),
  authController.register,
);
router.post(
  "/auth/login",
  authLimit,
  validate(schema.login),
  authController.login,
);
router.post("/auth/logout", authController.logout);
router.get("/auth/me", auth, userController.me);

export default router;
