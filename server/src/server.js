import { app } from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./config/db.js";
try {
  await pool.query("SELECT 1");
  const server = app.listen(env.port, () =>
    console.log(`NextJobs API: http://localhost:${env.port}`),
  );
  for (const signal of ["SIGTERM", "SIGINT"])
    process.on(signal, () =>
      server.close(async () => {
        await pool.end();
        process.exit(0);
      }),
    );
} catch (e) {
  console.error(
    "Không thể kết nối MySQL. Kiểm tra server/.env và schema trong server/database/001_initial.sql.",
    e.code,
  );
  process.exit(1);
}
