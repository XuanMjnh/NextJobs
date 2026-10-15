import * as users from "../repositories/user.repository.js";
import * as schema from "../validators/schemas.js";
import { fail } from "../utils/errors.js";
import { filePath } from "../utils/files.js";
export async function me(req, res) {
  const p = await users.getProfile(req.user.id);
  if (!p) fail(401, "Tài khoản không tồn tại");
  res.json(p);
}
export async function update(req, res) {
  await users.updateProfile(req.user.id, schema.profile.parse(req.body));
  res.json(await users.getProfile(req.user.id));
}
export async function upload(req, res) {
  await users.setFile(req.user.id, req.params.kind, req.file.filename);
  res.status(201).json({ message: "Đã tải tệp lên" });
}
export async function resume(req, res) {
  const p = await users.getProfile(req.user.id);
  if (!p?.resume) fail(404, "Chưa có CV");
  res.download(filePath(p.resume), "CV.pdf");
}
export async function photo(req, res) {
  const p = await users.getProfile(schema.id.parse(req.params.id));
  if (!p?.photo) fail(404, "Chưa có ảnh");
  res.sendFile(filePath(p.photo));
}
