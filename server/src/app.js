import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { pool } from "./config/db.js";
import { optionalAuth } from "./middlewares/auth.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { router } from "./routes/index.js";
import { HTTP_STATUS } from "./constants/index.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(optionalAuth);
app.use(
  "/api",
  rateLimit({
    windowMs: 60_000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
  }),
);
app.use("/api", (req, res, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const origin = req.get("origin");
    const fetchSite = req.get("sec-fetch-site");
    if ((origin && origin !== env.clientUrl) || fetchSite === "cross-site")
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json({ message: "Nguồn yêu cầu không được phép" });
  }
  next();
});

app.get("/api/health", async (req, res) => {
  await pool.query("SELECT 1");
  res.json({ status: "ok" });
});

app.use("/api", router);
app.use("/api", (req, res) =>
  res.status(HTTP_STATUS.NOT_FOUND).json({ message: "API không tồn tại" }),
);

const dist = fileURLToPath(new URL("../../client/dist/", import.meta.url));
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get("/{*path}", (req, res) => res.sendFile(`${dist}/index.html`));
}

app.use(errorHandler);
