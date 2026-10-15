import { ZodError } from "zod";
export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError)
    return res
      .status(400)
      .json({
        message: "Dữ liệu không hợp lệ",
        errors: err.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      });
  if (err.code === "ER_DUP_ENTRY")
    return res
      .status(409)
      .json({
        message: "Dữ liệu đã tồn tại (email, đơn ứng tuyển hoặc việc đã lưu)",
      });
  if (err.code === "LIMIT_FILE_SIZE")
    return res.status(400).json({ message: "Tệp tối đa 5 MB" });
  const status = err.status || (err.name === "MulterError" ? 400 : 500);
  if (status >= 500) console.error(err);
  res
    .status(status)
    .json({
      message:
        status >= 500
          ? "Không thể xử lý yêu cầu, vui lòng thử lại"
          : err.message,
    });
}
