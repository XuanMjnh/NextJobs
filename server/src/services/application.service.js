import * as applications from "../repositories/application.repository.js";
import * as users from "../repositories/user.repository.js";
import * as jobs from "./job.service.js";
import { copyFile, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { filePath } from "../utils/files.js";
import { fail } from "../utils/errors.js";
export async function apply(userId, jobId, letter) {
  const p = await users.getProfile(userId);
  if (!p?.resume || !p.first_name || !p.last_name)
    fail(
      400,
      "Vui lòng cập nhật họ tên và tải CV PDF trong hồ sơ trước khi ứng tuyển",
    );
  const snapshot = randomUUID() + ".pdf";
  await copyFile(filePath(p.resume), filePath(snapshot));
  try {
    await applications.create(userId, jobId, snapshot, letter);
  } catch (e) {
    await unlink(filePath(snapshot)).catch(() => {});
    throw e;
  }
}
export async function save(userId, jobId) {
  await jobs.get(jobId);
  await applications.save(userId, jobId);
}
export async function withdraw(userId, jobId) {
  if (!(await applications.withdraw(userId, jobId)))
    fail(409, "Chỉ có thể rút đơn đang chờ hoặc đang xem xét");
}
export async function authorized(id, recruiterId) {
  const a = await applications.get(id);
  if (!a) fail(404, "Không tìm thấy đơn ứng tuyển");
  if (a.recruiter_id !== recruiterId) fail(403, "Không có quyền xem hồ sơ này");
  return a;
}
export async function list(jobId, recruiterId) {
  await jobs.owned(jobId, recruiterId);
  return applications.list(jobId);
}
export async function status(id, recruiterId, status) {
  await authorized(id, recruiterId);
  if (!(await applications.updateStatus(id, status)))
    fail(409, "Ứng viên đã rút đơn");
}
