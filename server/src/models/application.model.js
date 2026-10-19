import { pool } from "../config/db.js";
import { fail } from "../utils/appError.js";
export async function save(userId, jobId) {
  await pool.execute(
    "INSERT IGNORE INTO saved_jobs(user_id,job_id) VALUES(?,?)",
    [userId, jobId],
  );
}
export async function unsave(userId, jobId) {
  await pool.execute("DELETE FROM saved_jobs WHERE user_id=? AND job_id=?", [
    userId,
    jobId,
  ]);
}
export async function create(userId, jobId, resume, letter) {
  const c = await pool.getConnection();
  try {
    await c.beginTransaction();
    const [rows] = await c.execute(
      "SELECT status FROM jobs WHERE id=? FOR UPDATE",
      [jobId],
    );
    if (!rows[0]) fail(404, "Không tìm thấy công việc");
    if (rows[0].status !== "open") fail(409, "Tin tuyển dụng đã đóng");
    await c.execute(
      "INSERT INTO applications(user_id,job_id,resume,cover_letter) VALUES(?,?,?,?)",
      [userId, jobId, resume, letter],
    );
    await c.commit();
  } catch (e) {
    await c.rollback();
    throw e;
  } finally {
    c.release();
  }
}
export async function withdraw(userId, jobId) {
  const [r] = await pool.execute(
    "UPDATE applications SET status='withdrawn' WHERE user_id=? AND job_id=? AND status IN ('pending','reviewing')",
    [userId, jobId],
  );
  return r.affectedRows;
}
export async function list(jobId) {
  const [rows] = await pool.execute(
    `SELECT a.id,a.user_id,a.status,a.cover_letter,a.created_at,u.email,p.first_name,p.last_name,p.city,p.certificate,p.experience FROM applications a JOIN users u ON u.id=a.user_id JOIN profiles p ON p.user_id=u.id WHERE a.job_id=? ORDER BY a.created_at DESC`,
    [jobId],
  );
  if (!rows.length) return rows;
  const ids = rows.map((a) => a.user_id);
  const [skills] = await pool.query(
    "SELECT user_id,name,level,years FROM skills WHERE user_id IN (?)",
    [ids],
  );
  return rows.map((a) => ({
    ...a,
    skills: skills
      .filter((s) => s.user_id === a.user_id)
      .map(({ user_id, ...skill }) => skill),
  }));
}
export async function get(id) {
  const [rows] = await pool.execute(
    "SELECT a.*,j.recruiter_id FROM applications a JOIN jobs j ON j.id=a.job_id WHERE a.id=?",
    [id],
  );
  return rows[0];
}
export async function updateStatus(id, status) {
  const [r] = await pool.execute(
    "UPDATE applications SET status=? WHERE id=? AND status<>'withdrawn'",
    [status, id],
  );
  return r.affectedRows;
}
