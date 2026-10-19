import { copyFile, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { applications, users } from "../models/index.js";
import * as jobs from "./job.service.js";
import { filePath } from "../utils/files.js";
import { fail } from "../utils/appError.js";

export async function apply(userId, jobId, letter) {
  const profile = await users.getProfile(userId);
  if (!profile?.resume || !profile.first_name || !profile.last_name)
    fail(
      400,
      "Vui lòng cập nhật họ tên và tải CV PDF trong hồ sơ trước khi ứng tuyển",
    );

  const snapshot = `${randomUUID()}.pdf`;
  await copyFile(filePath(profile.resume), filePath(snapshot));
  try {
    await applications.create(userId, jobId, snapshot, letter);
  } catch (error) {
    await unlink(filePath(snapshot)).catch(() => {});
    throw error;
  }
}

export async function save(userId, jobId) {
  await jobs.get(jobId);
  await applications.save(userId, jobId);
}

export async function unsave(userId, jobId) {
  await applications.unsave(userId, jobId);
}

export async function withdraw(userId, jobId) {
  if (!(await applications.withdraw(userId, jobId)))
    fail(409, "Chỉ có thể rút đơn đang chờ hoặc đang xem xét");
}

export async function authorized(id, recruiterId) {
  const application = await applications.get(id);
  if (!application) fail(404, "Không tìm thấy đơn ứng tuyển");
  if (application.recruiter_id !== recruiterId)
    fail(403, "Không có quyền xem hồ sơ này");
  return application;
}

export async function list(jobId, recruiterId) {
  await jobs.owned(jobId, recruiterId);
  return applications.list(jobId);
}

export async function status(id, recruiterId, nextStatus) {
  await authorized(id, recruiterId);
  if (!(await applications.updateStatus(id, nextStatus)))
    fail(409, "Ứng viên đã rút đơn");
}
