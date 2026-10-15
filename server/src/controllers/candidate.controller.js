import * as jobs from "../repositories/job.repository.js";
import * as applications from "../repositories/application.repository.js";
import * as service from "../services/application.service.js";
import * as schema from "../validators/schemas.js";
export async function saved(req, res) {
  res.json(
    await jobs.list(schema.search.parse(req.query), req.user.id, "saved"),
  );
}
export async function applied(req, res) {
  res.json(
    await jobs.list(schema.search.parse(req.query), req.user.id, "applied"),
  );
}
export async function save(req, res) {
  await service.save(req.user.id, schema.id.parse(req.params.id));
  res.status(201).json({ message: "Đã lưu công việc" });
}
export async function unsave(req, res) {
  await applications.unsave(req.user.id, schema.id.parse(req.params.id));
  res.json({ message: "Đã bỏ lưu" });
}
export async function apply(req, res) {
  const data = schema.application.parse(req.body);
  await service.apply(
    req.user.id,
    schema.id.parse(req.params.id),
    data.cover_letter,
  );
  res.status(201).json({ message: "Ứng tuyển thành công" });
}
export async function withdraw(req, res) {
  await service.withdraw(req.user.id, schema.id.parse(req.params.id));
  res.json({ message: "Đã rút đơn" });
}
