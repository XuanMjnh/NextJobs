import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  api,
  typeLabels,
  remoteLabels,
  statusLabels,
  date,
} from "../services/api";
import { useState } from "react";
import { ErrorBox } from "./UI";
export default function JobCard({ job, onChange, owned = false }) {
  const { user } = useAuth(),
    navigate = useNavigate(),
    [error, setError] = useState(null),
    [busy, setBusy] = useState(false);
  async function save() {
    if (!user) return navigate("/login", { state: { from: "/jobs" } });
    setBusy(true);
    try {
      await api(`/jobs/${job.id}/saved`, {
        method: job.is_saved ? "DELETE" : "PUT",
      });
      onChange?.();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="job-card">
      <Link className="company-logo" to={"/jobs/" + job.id}>
        {job.logo ? (
          <img
            src={"/api/jobs/" + job.id + "/logo"}
            alt={"Logo " + job.company}
          />
        ) : (
          <span>{job.company.slice(0, 2).toUpperCase()}</span>
        )}
      </Link>
      <div className="job-content">
        <div className="job-heading">
          <Link to={"/jobs/" + job.id}>
            <h3>{job.title}</h3>
          </Link>
          <strong className="salary">{job.salary}</strong>
        </div>
        <p className="company-name">{job.company}</p>
        <div className="tags">
          <span>⌖ {job.city}</span>
          <span>{typeLabels[job.type]}</span>
          <span>{remoteLabels[job.remote]}</span>
          {job.status === "closed" && <span className="closed">Đã đóng</span>}
        </div>
        <div className="card-bottom">
          <small>Ngày đăng: {date(job.created_at)}</small>
          <div className="actions">
            {owned ? (
              <>
                <span>{job.applicant_count} ứng viên</span>
                <Link
                  className="outline small"
                  to={"/recruiter/jobs/" + job.id + "/applicants"}
                >
                  Xem ứng viên
                </Link>
                <Link
                  className="outline small"
                  to={"/recruiter/jobs/" + job.id + "/edit"}
                >
                  Chỉnh sửa
                </Link>
              </>
            ) : (
              <>
                {job.application_status ? (
                  <span className={"status " + job.application_status}>
                    {statusLabels[job.application_status]}
                  </span>
                ) : (
                  <Link className="apply-link" to={"/jobs/" + job.id}>
                    Xem & ứng tuyển
                  </Link>
                )}
                {user?.role !== "recruiter" && (
                  <button
                    className={"save-button " + (job.is_saved ? "saved" : "")}
                    disabled={busy}
                    onClick={save}
                  >
                    {job.is_saved ? "★ Đã lưu" : "☆ Lưu tin"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        <ErrorBox error={error} />
      </div>
    </article>
  );
}
