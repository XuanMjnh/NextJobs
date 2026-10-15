import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { fail } from "../utils/errors.js";
export function optionalAuth(req, res, next) {
  try {
    req.user = jwt.verify(req.cookies.nextjobs_session, env.jwtSecret, {
      algorithms: ["HS256"],
    });
  } catch {
    req.user = null;
  }
  next();
}
export function auth(req, res, next) {
  if (!req.user)
    return next(
      Object.assign(new Error("Vui lòng đăng nhập"), { status: 401 }),
    );
  next();
}
export const role = (expected) => (req, res, next) => {
  if (req.user?.role !== expected)
    fail(403, "Bạn không có quyền thực hiện thao tác này");
  next();
};
export const cookieOptions = {
  httpOnly: true,
  secure: env.production,
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
