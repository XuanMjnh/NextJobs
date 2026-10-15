import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useResource, Loading, ErrorBox, Empty } from "../components/UI";
import { api, date, statusLabels } from "../services/api";
export default function Applicants() {
  const { id } = useParams(),
    { data, error, loading, reload } = useResource(
      "/jobs/" + id + "/applicants",
    ),
    job = useResource("/jobs/" + id),
    [actionError, setActionError] = useState(null),
    [busy, setBusy] = useState(null);
  async function status(a, value) {
    setBusy(a.id);
    setActionError(null);
    try {
      await api("/applications/" + a.id, {
        method: "PATCH",
        body: { status: value },
      });
      reload();
    } catch (e) {
      setActionError(e);
    } finally {
      setBusy(null);
    }
  }
  return (
    <main className="container applicants-page">
      <Link className="back-link" to="/recruiter">
        ← Tin tuyển dụng của tôi
      </Link>
      <h1>Ứng viên đã ứng tuyển</h1>
      <p className="muted">
        {job.data?.title} {data && `• ${data.length} hồ sơ`}
      </p>
      <ErrorBox error={error || actionError} />
      {loading ? (
        <Loading />
      ) : (
        !error &&
        (data.length ? (
          data.map((a) => (
            <article className="panel applicant" key={a.id}>
              <div className="applicant-heading">
                <div>
                  <h2>
                    {a.first_name} {a.last_name}
                  </h2>
                  <a href={"mailto:" + a.email}>{a.email}</a>
                  <p className="muted">
                    {a.city} • Nộp ngày {date(a.created_at)}
                  </p>
                </div>
                <span className={"status " + a.status}>
                  {statusLabels[a.status]}
                </span>
              </div>
              <dl>
                <dt>Học vấn</dt>
                <dd>{a.certificate || "Chưa cập nhật"}</dd>
                <dt>Kinh nghiệm</dt>
                <dd className="pre-wrap">{a.experience || "Chưa cập nhật"}</dd>
              </dl>
              <div className="tags">
                {a.skills.map((s, i) => (
                  <span key={i}>
                    {s.name} • {s.years} năm •{" "}
                    {
                      {
                        Beginner: "Hiểu biết",
                        Intermediate: "Có kinh nghiệm",
                        Advance: "Thành thạo",
                      }[s.level]
                    }
                  </span>
                ))}
              </div>
              {a.cover_letter && (
                <blockquote className="pre-wrap">{a.cover_letter}</blockquote>
              )}
              <div className="actions">
                <a
                  className="outline"
                  href={"/api/applications/" + a.id + "/resume"}
                  target="_blank"
                  rel="noreferrer"
                >
                  Tải CV đã nộp ↓
                </a>
                <label className="inline-label">
                  Trạng thái{" "}
                  <select
                    aria-label={
                      "Trạng thái của " + a.first_name + " " + a.last_name
                    }
                    value={a.status}
                    disabled={busy === a.id || a.status === "withdrawn"}
                    onChange={(e) => status(a, e.target.value)}
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option
                        key={value}
                        value={value}
                        disabled={value === "withdrawn"}
                      >
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </article>
          ))
        ) : (
          <Empty>Chưa có ứng viên nộp hồ sơ cho công việc này.</Empty>
        ))
      )}
    </main>
  );
}
