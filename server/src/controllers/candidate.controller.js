import * as applications from "../services/application.service.js";
import * as jobs from "../services/job.service.js";

export async function saved(req, res) {
  res.json(await jobs.list(req.validated.query, req.user.id, "saved"));
}

export async function applied(req, res) {
  res.json(await jobs.list(req.validated.query, req.user.id, "applied"));
}

export async function save(req, res) {
  await applications.save(req.user.id, req.validated.params.id);
  res.status(201).json({ message: "Đã lưu công việc" });
}

export async function unsave(req, res) {
  await applications.unsave(req.user.id, req.validated.params.id);
  res.json({ message: "Đã bỏ lưu" });
}

export async function apply(req, res) {
  await applications.apply(
    req.user.id,
    req.validated.params.id,
    req.validated.body.cover_letter,
  );
  res.status(201).json({ message: "Ứng tuyển thành công" });
}

export async function withdraw(req, res) {
  await applications.withdraw(req.user.id, req.validated.params.id);
  res.json({ message: "Đã rút đơn" });
}
