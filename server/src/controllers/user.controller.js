import * as service from "../services/user.service.js";
import { filePath } from "../utils/files.js";

export async function me(req, res) {
  res.json(await service.getProfile(req.user.id));
}

export async function update(req, res) {
  res.json(await service.updateProfile(req.user.id, req.validated.body));
}

export async function upload(req, res) {
  await service.setFile(req.user.id, req.params.kind, req.file.filename);
  res.status(201).json({ message: "Đã tải tệp lên" });
}

export async function resume(req, res) {
  const filename = await service.getResume(req.user.id);
  res.download(filePath(filename), "CV.pdf");
}

export async function photo(req, res) {
  const filename = await service.getPhoto(req.validated.params.id);
  res.sendFile(filePath(filename));
}
