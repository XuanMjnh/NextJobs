import * as jobService from "../services/job.service.js";
import * as applications from "../services/application.service.js";
import { filePath } from "../utils/files.js";

export async function applicants(req, res) {
  res.json(await applications.list(req.validated.params.id, req.user.id));
}

export async function status(req, res) {
  await applications.status(
    req.validated.params.id,
    req.user.id,
    req.validated.body.status,
  );
  res.json({ message: "Đã cập nhật trạng thái" });
}

export async function resume(req, res) {
  const application = await applications.authorized(
    req.validated.params.id,
    req.user.id,
  );
  res.download(filePath(application.resume), "CV-ung-vien.pdf");
}

export async function logo(req, res) {
  await jobService.update(
    req.validated.params.id,
    { logo: req.file.filename },
    req.user.id,
  );
  res.status(201).json({ message: "Đã tải logo" });
}
