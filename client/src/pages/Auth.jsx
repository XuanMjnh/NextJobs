import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ErrorBox, Field } from "../components/UI";
export default function Auth({ mode }) {
  const registering = mode === "register",
    { authenticate } = useAuth(),
    navigate = useNavigate(),
    location = useLocation();
  const [error, setError] = useState(null),
    [busy, setBusy] = useState(false),
    [visible, setVisible] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const u = await authenticate(mode, data);
      const from = location.state?.from;
      navigate(
        from?.startsWith("/") && !from.startsWith("//")
          ? from
          : u.role === "recruiter"
            ? "/recruiter"
            : "/jobs",
        { replace: true },
      );
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-hero">
      <section className="auth-container">
        <div className="auth-left">
          <span className="auth-badge">NextJobs</span>
          <h1>Công việc tương lai của bạn bắt đầu từ đây</h1>
          <p>Khám phá cơ hội phù hợp và kết nối cùng nhà tuyển dụng.</p>
          <ul>
            <li>Tìm kiếm và lọc công việc</li>
            <li>Theo dõi trạng thái ứng tuyển</li>
            <li>Lưu công việc yêu thích</li>
          </ul>
        </div>
        <div className="auth-right">
          <h2>{registering ? "Đăng ký tài khoản" : "Đăng nhập"}</h2>
          <p className="muted">
            {registering
              ? "Cùng NextJobs mở ra cơ hội mới"
              : "Chào mừng trở lại 👋"}
          </p>
          <ErrorBox error={error} />
          <form onSubmit={submit}>
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              maxLength={190}
            />
            <Field label="Mật khẩu">
              <div className="password-input">
                <input
                  aria-label="Mật khẩu"
                  name="password"
                  type={visible ? "text" : "password"}
                  autoComplete={
                    registering ? "new-password" : "current-password"
                  }
                  required
                  minLength={registering ? 10 : 1}
                  maxLength={72}
                />
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </Field>
            {registering && (
              <>
                <Field label="Bạn là">
                  <select name="role">
                    <option value="candidate">Ứng viên tìm việc</option>
                    <option value="recruiter">Nhà tuyển dụng</option>
                  </select>
                </Field>
                <small className="muted">Mật khẩu từ 10 đến 72 ký tự.</small>
              </>
            )}
            <button className="full" disabled={busy}>
              {busy
                ? "Đang xử lý…"
                : registering
                  ? "Tạo tài khoản"
                  : "Đăng nhập"}
            </button>
          </form>
          <p className="auth-switch">
            {registering ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
            <Link to={registering ? "/login" : "/register"}>
              {registering ? "Đăng nhập" : "Đăng ký ngay"}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
