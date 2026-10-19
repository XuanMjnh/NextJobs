import { ZodError } from "zod";
import { HTTP_STATUS } from "../constants/index.js";
import { logger } from "../utils/logger.js";

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof ZodError) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Dữ liệu không hợp lệ",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (err.code === "ER_DUP_ENTRY") {
    return res.status(HTTP_STATUS.CONFLICT).json({
      message: "Dữ liệu đã tồn tại (email, đơn ứng tuyển hoặc việc đã lưu)",
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: "Tệp tối đa 5 MB" });
  }

  const status = err.status || (err.name === "MulterError" ? 400 : 500);
  if (status >= HTTP_STATUS.INTERNAL_SERVER_ERROR)
    logger.error(`${req.method} ${req.originalUrl} failed`, err);

  return res.status(status).json({
    message:
      status >= HTTP_STATUS.INTERNAL_SERVER_ERROR
        ? "Không thể xử lý yêu cầu, vui lòng thử lại"
        : err.message,
  });
}
