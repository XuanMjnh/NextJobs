import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Header, Footer, Protected } from "./components/Layout";
const Home = lazy(() => import("./pages/Home"));
const Auth = lazy(() => import("./pages/Auth"));
const Jobs = lazy(() => import("./pages/Jobs"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const JobForm = lazy(() => import("./pages/JobForm"));
const Applicants = lazy(() => import("./pages/Applicants"));
import "./styles.css";
class ErrorBoundary extends React.Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <main className="container">
        <h1>Không thể hiển thị trang</h1>
        <p>Vui lòng tải lại trang để thử lại.</p>
        <a href="/">Trang chủ</a>
      </main>
    ) : (
      this.props.children
    );
  }
}
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <ErrorBoundary>
          <Suspense fallback={<div className="loading">Đang tải trang…</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/login"
                element={<Auth key="login" mode="login" />}
              />
              <Route
                path="/register"
                element={<Auth key="register" mode="register" />}
              />
              <Route path="/jobs" element={<Jobs key="public" />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route
                path="/profile"
                element={
                  <Protected>
                    <Profile />
                  </Protected>
                }
              />
              <Route
                path="/saved"
                element={
                  <Protected role="candidate">
                    <Jobs key="saved" scope="saved" />
                  </Protected>
                }
              />
              <Route
                path="/applications"
                element={
                  <Protected role="candidate">
                    <Jobs key="applied" scope="applied" />
                  </Protected>
                }
              />
              <Route
                path="/recruiter"
                element={
                  <Protected role="recruiter">
                    <Jobs key="owned" scope="owned" />
                  </Protected>
                }
              />
              <Route
                path="/recruiter/jobs/new"
                element={
                  <Protected role="recruiter">
                    <JobForm key="new" />
                  </Protected>
                }
              />
              <Route
                path="/recruiter/jobs/:id/edit"
                element={
                  <Protected role="recruiter">
                    <JobForm />
                  </Protected>
                }
              />
              <Route
                path="/recruiter/jobs/:id/applicants"
                element={
                  <Protected role="recruiter">
                    <Applicants />
                  </Protected>
                }
              />
              <Route
                path="*"
                element={
                  <main className="container empty">
                    <h1>404 — Không tìm thấy trang</h1>
                    <Link to="/">Về trang chủ</Link>
                  </main>
                }
              />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
