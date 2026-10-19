import * as service from "../services/job.service.js";
import { fail } from "../utils/appError.js";
import { filePath } from "../utils/files.js";

export async function list(req, res) {
  res.json(await service.list(req.validated.query, req.user?.id));
}

export async function get(req, res) {
  res.json(await service.get(req.validated.params.id, req.user?.id));
}

export async function owned(req, res) {
  res.json(await service.list(req.validated.query, req.user.id, "owned"));
}

export async function create(req, res) {
  res.status(201).json(await service.create(req.validated.body, req.user.id));
}

export async function update(req, res) {
  res.json(
    await service.update(
      req.validated.params.id,
      req.validated.body,
      req.user.id,
    ),
  );
}

export async function close(req, res) {
  res.json(await service.close(req.validated.params.id, req.user.id));
}

export async function stats(req, res) {
  res.json(await service.stats());
}

export async function getLogo(req, res) {
  const job = await service.get(req.validated.params.id);
  if (!job.logo) fail(404, "Chưa có logo");
  res.sendFile(filePath(job.logo));
}
