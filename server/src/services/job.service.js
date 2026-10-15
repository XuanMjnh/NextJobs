import * as jobs from "../repositories/job.repository.js";
import { fail } from "../utils/errors.js";
export async function get(id, userId) {
  const j = await jobs.get(id, userId);
  if (!j) fail(404, "Không tìm thấy công việc");
  return j;
}
export async function owned(id, userId) {
  const j = await get(id, userId);
  if (j.recruiter_id !== userId)
    fail(403, "Bạn chỉ được quản lý tin tuyển dụng của mình");
  return j;
}
