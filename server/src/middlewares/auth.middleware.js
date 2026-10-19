import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { SESSION_COOKIE_NAME } from "../constants/index.js";
import { fail } from "../utils/appError.js";

export function optionalAuth(req, res, next) {
  try {
    req.user = jwt.verify(req.cookies?.[SESSION_COOKIE_NAME], env.jwtSecret, {
      algorithms: ["HS256"],
    });
  } catch {
    req.user = null;
  }
  next();
}

export function auth(req, res, next) {
  if (!req.user) return fail(401, "Vui lòng đăng nhập");
  next();
}

export const role = (expected) => (req, res, next) => {
  if (req.user?.role !== expected)
    return fail(403, "Bạn không có quyền thực hiện thao tác này");
  next();
};

export const cookieOptions = Object.freeze({
  httpOnly: true,
  secure: env.production,
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
