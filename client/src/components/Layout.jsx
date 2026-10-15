import {
  NavLink,
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ErrorBox, Loading } from "./UI";
import { useState } from "react";
export function Header() {
  const { user, logout } = useAuth(),
    navigate = useNavigate();
  const [error, setError] = useState("");
  return (
    <>
      <header className="navbar">
        <Link className="brand" to="/">
          Next<span>Jobs</span>
        </Link>
        <nav aria-label="Điều hướng chính">
          <NavLink to="/jobs">Tìm việc làm</NavLink>
          {user?.role === "candidate" && (
            <>
              <NavLink to="/saved">Việc đã lưu</NavLink>
              <NavLink to="/applications">Việc đã ứng tuyển</NavLink>
            </>
          )}
          {user?.role === "recruiter" && (
            <>
              <NavLink to="/recruiter">Tin tuyển dụng</NavLink>
              <NavLink to="/recruiter/jobs/new">Đăng tin mới</NavLink>
            </>
          )}
        </nav>
        <div className="nav-actions">
          {user ? (
            <>
              <NavLink className="profile-link" to="/profile">
                {user.photo && (
                  <img src={"/api/profiles/" + user.id + "/photo"} alt="" />
                )}
                {user.first_name
                  ? `${user.first_name} ${user.last_name}`
                  : "Hồ sơ của tôi"}
              </NavLink>
              <button
                className="outline small"
                onClick={async () => {
                  try {
                    await logout();
                    navigate("/");
                  } catch (e) {
                    setError(e.message);
                  }
                }}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Đăng nhập</Link>
              <Link className="button" to="/register">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </header>
      <ErrorBox error={error} />
    </>
  );
}
export function Footer() {
  return (
    <footer>
      <Link className="brand" to="/">
        NextJobs
      </Link>
      <span>Công việc tương lai, kết nối ứng viên và nhà tuyển dụng</span>
      <small>© {new Date().getFullYear()} NextJobs</small>
    </footer>
  );
}
export function Protected({ role, children }) {
  const { user, loading, error } = useAuth(),
    location = useLocation();
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  if (!user)
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  if (role && user.role !== role)
    return (
      <div className="container">
        <ErrorBox error="Bạn không có quyền truy cập trang này." />
        <Link to="/jobs">Tìm việc làm</Link>
      </div>
    );
  return children;
}
