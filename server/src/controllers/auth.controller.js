import jwt from "jsonwebtoken";
import * as service from "../services/auth.service.js";
import { env } from "../config/env.js";
import { SESSION_COOKIE_NAME } from "../constants/index.js";
import { cookieOptions } from "../middlewares/auth.middleware.js";

function setSession(res, user) {
  const token = jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: "7d",
    algorithm: "HS256",
  });
  res.cookie(SESSION_COOKIE_NAME, token, cookieOptions);
}

export async function register(req, res) {
  const user = await service.register(req.validated.body);
  setSession(res, user);
  res.status(201).json(user);
}

export async function login(req, res) {
  const user = await service.login(req.validated.body);
  setSession(res, user);
  res.json(user);
}

export function logout(req, res) {
  res.clearCookie(SESSION_COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
  res.json({ message: "Đã đăng xuất" });
}
