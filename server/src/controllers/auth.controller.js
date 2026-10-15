import jwt from "jsonwebtoken";
import * as service from "../services/auth.service.js";
import * as schema from "../validators/schemas.js";
import { env } from "../config/env.js";
import { cookieOptions } from "../middleware/auth.js";
function session(res, user) {
  res.cookie(
    "nextjobs_session",
    jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, {
      expiresIn: "7d",
      algorithm: "HS256",
    }),
    cookieOptions,
  );
}
export async function register(req, res) {
  const user = await service.register(schema.register.parse(req.body));
  session(res, user);
  res.status(201).json(user);
}
export async function login(req, res) {
  const user = await service.login(schema.login.parse(req.body));
  session(res, user);
  res.json(user);
}
export function logout(req, res) {
  res.clearCookie("nextjobs_session", { ...cookieOptions, maxAge: undefined });
  res.json({ message: "Đã đăng xuất" });
}
