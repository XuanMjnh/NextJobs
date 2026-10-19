import { users } from "../models/index.js";
import { fail } from "../utils/appError.js";

export async function getProfile(userId) {
  const profile = await users.getProfile(userId);
  if (!profile) fail(401, "Tài khoản không tồn tại");
  return profile;
}

export async function updateProfile(userId, data) {
  await users.updateProfile(userId, data);
  return getProfile(userId);
}

export async function setFile(userId, kind, filename) {
  await users.setFile(userId, kind, filename);
}

export async function getResume(userId) {
  const profile = await getProfile(userId);
  if (!profile.resume) fail(404, "Chưa có CV");
  return profile.resume;
}

export async function getPhoto(userId) {
  const profile = await users.getProfile(userId);
  if (!profile?.photo) fail(404, "Chưa có ảnh");
  return profile.photo;
}
