import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useResource, Loading, ErrorBox } from "../components/UI";
import {
  api,
  date,
  typeLabels,
  remoteLabels,
  statusLabels,
} from "../services/api";
export default function JobDetail() {
  const { id } = useParams(),
    { data: job, error, loading, reload } = useResource("/jobs/" + id),
    { user } = useAuth(),
    navigate = useNavigate(),
    [actionError, setActionError] = useState(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [letter, setLetter] = useState("");
  async function action(path, method, body) {
    if (!user) return navigate("/login", { state: { from: "/jobs/" + id } });
    setBusy(true);
    setActionError(null);
    setMessage("");
    try {
      const r = await api(path, { method, body });
      setMessage(r.message);
      reload();
    } catch (e) {
      setActionError(e);
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <Loading />;
  if (error)
    return (
      <div className="container">
        <ErrorBox error={error} />
      </div>
    );
  const own = user?.id === job.recruiter_id;
  return (
    <main className="container detail-page">
      <Link className="back-link" to="/jobs">
        ← Trở về danh sách việc làm
      </Link>
      <div className="detail-grid">
        <div>
          <section className="panel detail-top">
            <div className="detail-company">
              <div className="company-logo">
                {job.logo ? (
                  <img src={"/api/jobs/" + id + "/logo"} alt={job.company} />
                ) : (
                  job.company.slice(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <p className="company-name">{job.company}</p>
                <h1>{job.title}</h1>
                <p className="muted">
                  Đăng ngày {date(job.created_at)} •{" "}
                  {job.status === "open"
                    ? "Đang tuyển dụng"
                    : "Đã đóng tuyển dụng"}
                </p>
              </div>
            </div>
            <div className="job-facts">
              <div>
                <small>Thu nhập</small>
                <strong>{job.salary}</strong>
              </div>
              <div>
                <small>Địa điểm</small>
                <strong>{job.city}</strong>
              </div>
              <div>
                <small>Kinh nghiệm</small>
                <strong>{job.experience_required || "Không yêu cầu"}</strong>
              </div>
            </div>
            <ErrorBox error={actionError} />
            {message && (
              <p role="status" className="alert success">
                {message}
              </p>
            )}
            {own ? (
              <div className="actions">
                <Link className="button" to={"/recruiter/jobs/" + id + "/edit"}>
                  Chỉnh sửa tin
                </Link>
                <Link
                  className="outline"
                  to={"/recruiter/jobs/" + id + "/applicants"}
                >
                  Ứng viên ({job.applicant_count})
                </Link>
              </div>
            ) : (
              user?.role !== "recruiter" && (
                <div className="application-form">
                  {job.application_status ? (
                    <>
                      <p>
                        Trạng thái:{" "}
                        <span className={"status " + job.application_status}>
                          {statusLabels[job.application_status]}
                        </span>
                      </p>
                      {["pending", "reviewing"].includes(
                        job.application_status,
                      ) && (
                        <button
                          className="outline"
                          disabled={busy}
                          onClick={() => {
                            if (
                              window.confirm("Bạn muốn rút đơn ứng tuyển này?")
                            )
                              action("/jobs/" + id + "/withdraw", "PATCH");
                          }}
                        >
                          Rút đơn ứng tuyển
                        </button>
                      )}
                    </>
                  ) : job.status === "open" ? (
                    <>
                      <label className="field">
                        <span>Thư giới thiệu (không bắt buộc)</span>
                        <textarea
                          value={letter}
                          onChange={(e) => setLetter(e.target.value)}
                          maxLength={5000}
                          placeholder="Chia sẻ đôi điều về bạn…"
                          rows={3}
                        />
                      </label>
                      <p className="muted">
                        CV PDF trong <Link to="/profile">hồ sơ của bạn</Link> sẽ
                        được gửi cùng đơn ứng tuyển.
                      </p>
                      <button
                        disabled={busy}
                        onClick={() =>
                          action("/jobs/" + id + "/applications", "POST", {
                            cover_letter: letter,
                          })
                        }
                      >
                        Ứng tuyển ngay →
                      </button>
                    </>
                  ) : (
                    <p className="muted">Tin tuyển dụng đã đóng.</p>
                  )}
                  <button
                    className="save-button"
                    disabled={busy}
                    onClick={() =>
                      action(
                        "/jobs/" + id + "/saved",
                        job.is_saved ? "DELETE" : "PUT",
                      )
                    }
                  >
                    {job.is_saved ? "★ Đã lưu" : "☆ Lưu công việc"}
                  </button>
                </div>
              )
            )}
          </section>
          <section className="panel description">
            <h2>Chi tiết tuyển dụng</h2>
            <p className="pre-wrap">{job.description}</p>
            <h3>Địa điểm làm việc</h3>
            <p>
              {[job.city, job.state, job.country].filter(Boolean).join(", ")}
            </p>
          </section>
        </div>
        <aside>
          <section className="panel general-info">
            <h2>Thông tin chung</h2>
            {[
              ["Loại công việc", typeLabels[job.type]],
              ["Hình thức", remoteLabels[job.remote]],
              ["Số lượng tuyển", job.quantity + " người"],
              ["Ngành nghề", job.field || "Không yêu cầu"],
              ["Trình độ", job.certificate_required || "Không yêu cầu"],
            ].map(([k, v]) => (
              <div key={k}>
                <span>{k}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </section>
        </aside>
      </div>
    </main>
  );
}
