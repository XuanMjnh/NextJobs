import { app } from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./config/db.js";
import { logger } from "./utils/logger.js";

try {
  await pool.query("SELECT 1");
  const server = app.listen(env.port, () => {
    logger.info(`NextJobs API đang chạy tại http://localhost:${env.port}`);
  });

  for (const signal of ["SIGTERM", "SIGINT"]) {
    process.once(signal, () => {
      server.close(async (error) => {
        if (error) logger.error("Lỗi khi đóng HTTP server", error);
        try {
          await pool.end();
        } catch (poolError) {
          logger.error("Lỗi khi đóng kết nối MySQL", poolError);
        }
        process.exit(error ? 1 : 0);
      });
    });
  }
} catch (error) {
  logger.error(
    "Không thể khởi động backend. Kiểm tra server/.env và đảm bảo MySQL/schema đã được khởi tạo.",
    error.code || error,
  );
  process.exit(1);
}
