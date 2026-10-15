import * as jobs from "../repositories/job.repository.js";
import * as jobService from "../services/job.service.js";
import * as applications from "../services/application.service.js";
import * as schema from "../validators/schemas.js";
import { fail } from "../utils/errors.js";
import { filePath } from "../utils/files.js";
export async function applicants(req, res) {
  res.json(
    await applications.list(schema.id.parse(req.params.id), req.user.id),
  );
}
export async function status(req, res) {
  const data = schema.applicationStatus.parse(req.body);
  await applications.status(
    schema.id.parse(req.params.id),
    req.user.id,
    data.status,
  );
  res.json({ message: "Đã cập nhật trạng thái" });
}
export async function resume(req, res) {
  const a = await applications.authorized(
    schema.id.parse(req.params.id),
    req.user.id,
  );
  res.download(filePath(a.resume), "CV-ung-vien.pdf");
}
export async function logo(req, res) {
  const id = schema.id.parse(req.params.id);
  await jobService.owned(id, req.user.id);
  await jobs.update(id, { logo: req.file.filename });
  res.status(201).json({ message: "Đã tải logo" });
}
export async function getLogo(req, res) {
  const j = await jobService.get(schema.id.parse(req.params.id));
  if (!j.logo) fail(404, "Chưa có logo");
  res.sendFile(filePath(j.logo));
}
