export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}
export async function api(path, options = {}) {
  const isForm = options.body instanceof FormData;
  const response = await fetch("/api" + path, {
    credentials: "include",
    ...options,
    headers: {
      ...(!isForm && options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
    body: options.body
      ? isForm
        ? options.body
        : JSON.stringify(options.body)
      : undefined,
  });
  const data = await response
    .json()
    .catch(() => ({ message: "Không thể kết nối máy chủ" }));
  if (!response.ok)
    throw new ApiError(data.message, response.status, data.errors);
  return data;
}
export async function upload(path, file) {
  const body = new FormData();
  body.append("file", file);
  return api(path, { method: "POST", body });
}
export const typeLabels = {
  "Full-time": "Toàn thời gian",
  "Part-time": "Bán thời gian",
  Freelance: "Tự do",
  Internship: "Thực tập",
};
export const remoteLabels = {
  "Remote-Only": "Làm việc từ xa",
  "Office-Only": "Văn phòng",
  "Partial-Remote": "Kết hợp",
};
export const statusLabels = {
  pending: "Chờ xem xét",
  reviewing: "Đang xem xét",
  accepted: "Được chấp nhận",
  rejected: "Không phù hợp",
  withdrawn: "Đã rút đơn",
};
export const date = (value) =>
  new Date(value).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
