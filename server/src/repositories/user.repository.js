import { pool } from "../config/db.js";
export async function byEmail(email) {
  const [rows] = await pool.execute("SELECT * FROM users WHERE email=?", [
    email,
  ]);
  return rows[0];
}
export async function createUser(data) {
  const c = await pool.getConnection();
  try {
    await c.beginTransaction();
    const [r] = await c.execute(
      "INSERT INTO users(email,password_hash,role) VALUES(?,?,?)",
      [data.email, data.password_hash, data.role],
    );
    await c.execute("INSERT INTO profiles(user_id) VALUES(?)", [r.insertId]);
    await c.commit();
    return { id: r.insertId, email: data.email, role: data.role };
  } catch (e) {
    await c.rollback();
    throw e;
  } finally {
    c.release();
  }
}
export async function getProfile(id) {
  const [rows] = await pool.execute(
    "SELECT u.id,u.email,u.role,p.* FROM users u JOIN profiles p ON p.user_id=u.id WHERE u.id=?",
    [id],
  );
  if (!rows[0]) return null;
  const [skills] = await pool.execute(
    "SELECT id,name,level,years FROM skills WHERE user_id=?",
    [id],
  );
  return { ...rows[0], skills };
}
export async function updateProfile(id, p) {
  const c = await pool.getConnection();
  try {
    await c.beginTransaction();
    await c.execute(
      "UPDATE profiles SET first_name=?,last_name=?,city=?,state=?,country=?,company=?,certificate=?,experience=? WHERE user_id=?",
      [
        p.first_name,
        p.last_name,
        p.city,
        p.state,
        p.country,
        p.company,
        p.certificate,
        p.experience,
        id,
      ],
    );
    await c.execute("DELETE FROM skills WHERE user_id=?", [id]);
    for (const s of p.skills)
      await c.execute(
        "INSERT INTO skills(user_id,name,level,years) VALUES(?,?,?,?)",
        [id, s.name, s.level, s.years],
      );
    await c.commit();
  } catch (e) {
    await c.rollback();
    throw e;
  } finally {
    c.release();
  }
}
export async function setFile(id, kind, name) {
  const column = kind === "resume" ? "resume" : "photo";
  await pool.execute(`UPDATE profiles SET ${column}=? WHERE user_id=?`, [
    name,
    id,
  ]);
}
