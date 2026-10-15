import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
dotenv.config({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
  quiet: true,
});
export const env = {
  port: Number(process.env.PORT || 4000),
  production: process.env.NODE_ENV === "production",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET,
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "nextjobs",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "nextjobs",
    charset: "utf8mb4",
    timezone: "Z",
  },
};
if (!env.jwtSecret || env.jwtSecret.length < 32)
  throw new Error(
    "JWT_SECRET phải có ít nhất 32 ký tự. Sao chép server/.env.example thành server/.env.",
  );
export const uploadDir = fileURLToPath(
  new URL("../../uploads/", import.meta.url),
);
