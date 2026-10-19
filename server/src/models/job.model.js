import { pool } from "../config/db.js";
export function buildFilter(s, userId, scope = "public") {
  const where = [];
  const params = [];
  if (scope === "owned") {
    where.push("j.recruiter_id=?");
    params.push(userId);
  } else if (scope === "saved") {
    where.push(
      "EXISTS(SELECT 1 FROM saved_jobs sv WHERE sv.job_id=j.id AND sv.user_id=?)",
    );
    params.push(userId);
  } else if (scope === "applied") {
    where.push(
      "EXISTS(SELECT 1 FROM applications ax WHERE ax.job_id=j.id AND ax.user_id=?)",
    );
    params.push(userId);
  } else where.push("j.status='open'");
  if (s.q) {
    where.push("(j.title LIKE ? OR j.company LIKE ?)");
    params.push(`%${s.q}%`, `%${s.q}%`);
  }
  if (s.location) {
    where.push("(j.city LIKE ? OR j.state LIKE ? OR j.country LIKE ?)");
    params.push(...Array(3).fill(`%${s.location}%`));
  }
  for (const [key, column] of [
    ["types", "type"],
    ["remotes", "remote"],
  ]) {
    const values = [...new Set(s[key].split(",").filter(Boolean))];
    if (values.length) {
      where.push(`j.${column} IN (${values.map(() => "?").join(",")})`);
      params.push(...values);
    }
  }
  if (s.days) {
    where.push("j.created_at>=DATE_SUB(UTC_TIMESTAMP(),INTERVAL ? DAY)");
    params.push(Number(s.days));
  }
  return { sql: where.length ? " WHERE " + where.join(" AND ") : "", params };
}
const projection = `j.*,EXISTS(SELECT 1 FROM saved_jobs s WHERE s.job_id=j.id AND s.user_id=?) AS is_saved,
 (SELECT a.status FROM applications a WHERE a.job_id=j.id AND a.user_id=?) AS application_status,
 (SELECT COUNT(*) FROM applications a WHERE a.job_id=j.id AND a.status<>'withdrawn') AS applicant_count`;
export async function list(s, userId = 0, scope = "public") {
  const f = buildFilter(s, userId, scope);
  const [count] = await pool.execute(
    "SELECT COUNT(*) AS total FROM jobs j" + f.sql,
    f.params,
  );
  const [items] = await pool.query(
    "SELECT " +
      projection +
      " FROM jobs j" +
      f.sql +
      " ORDER BY j.created_at DESC,j.id DESC LIMIT ? OFFSET ?",
    [userId, userId, ...f.params, s.limit, (s.page - 1) * s.limit],
  );
  return { items, total: count[0].total, page: s.page, limit: s.limit };
}
export async function get(id, userId = 0, connection = pool) {
  const [rows] = await connection.execute(
    "SELECT " + projection + " FROM jobs j WHERE j.id=?",
    [userId, userId, id],
  );
  return rows[0];
}
export async function create(data, recruiterId) {
  const [r] = await pool.query("INSERT INTO jobs SET ?", {
    ...data,
    recruiter_id: recruiterId,
  });
  return get(r.insertId, recruiterId);
}
export async function update(id, data) {
  await pool.query("UPDATE jobs SET ? WHERE id=?", [data, id]);
  return get(id);
}
export async function stats() {
  const [r] = await pool.query(`SELECT
 (SELECT COUNT(*) FROM jobs WHERE status='open') AS jobs,
 (SELECT COUNT(DISTINCT recruiter_id) FROM jobs WHERE status='open') AS recruiters,
 (SELECT COUNT(*) FROM jobs WHERE status='open' AND DATE(CONVERT_TZ(created_at,'+00:00','+07:00'))=DATE(CONVERT_TZ(UTC_TIMESTAMP(),'+00:00','+07:00'))) AS today,
 (SELECT COUNT(*) FROM users WHERE role='candidate') AS candidates,
 (SELECT COUNT(DISTINCT user_id) FROM applications WHERE status<>'withdrawn') AS applicants,
 (SELECT COUNT(*) FROM applications WHERE status<>'withdrawn') AS applications`);
  return r[0];
}
