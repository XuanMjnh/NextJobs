import bcrypt from "bcryptjs";
import { users } from "../models/index.js";
import { fail } from "../utils/appError.js";

export async function register(data) {
  return users.createUser({
    ...data,
    password_hash: await bcrypt.hash(data.password, 12),
  });
}

export async function login(data) {
  const user = await users.byEmail(data.email);
  if (!user || !(await bcrypt.compare(data.password, user.password_hash)))
    fail(401, "Email hoặc mật khẩu không đúng");

  return { id: user.id, email: user.email, role: user.role };
}
