import { jobs } from "../models/index.js";
import { fail } from "../utils/appError.js";

export function list(filters, userId = 0, scope = "public") {
  return jobs.list(filters, userId, scope);
}

export async function get(id, userId = 0) {
  const job = await jobs.get(id, userId);
  if (!job) fail(404, "Không tìm thấy công việc");
  return job;
}

export async function owned(id, userId) {
  const job = await get(id, userId);
  if (job.recruiter_id !== userId)
    fail(403, "Bạn chỉ được quản lý tin tuyển dụng của mình");
  return job;
}

export async function create(data, recruiterId) {
  return jobs.create(data, recruiterId);
}

export async function update(id, data, recruiterId) {
  await owned(id, recruiterId);
  return jobs.update(id, data);
}

export async function close(id, recruiterId) {
  return update(id, { status: "closed" }, recruiterId);
}

export function stats() {
  return jobs.stats();
}
