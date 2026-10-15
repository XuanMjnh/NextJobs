import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api, upload } from "../services/api";
import { ErrorBox, Field } from "../components/UI";
export default function Profile() {
  const { user, refresh } = useAuth(),
    [form, setForm] = useState({ ...user, skills: user.skills || [] }),
    [error, setError] = useState(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const candidate = user.role === "candidate";
  function field(key, label, props = {}) {
    return (
      <Field
        key={key}
        label={label}
        value={form[key] || ""}
        maxLength={200}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        {...props}
      />
    );
  }
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage("");
    try {
      await api("/profile", { method: "PUT", body: form });
      await refresh();
      setMessage("Đã lưu hồ sơ");
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  async function file(kind, e) {
    const selected = e.target.files[0];
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      await upload("/profile/files/" + kind, selected);
      const u = await refresh();
      setForm((f) => ({ ...f, photo: u.photo, resume: u.resume }));
      setMessage("Đã tải tệp lên");
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }
  return (
    <main className="container profile-page">
      <p className="eyebrow">
        TÀI KHOẢN / {candidate ? "ỨNG VIÊN" : "NHÀ TUYỂN DỤNG"}
      </p>
      <h1>Hồ sơ của tôi</h1>
      <div className="profile-grid">
        <aside className="panel profile-aside">
          <img
            className="avatar"
            src={
              form.photo
                ? "/api/profiles/" + user.id + "/photo?v=" + form.photo
                : "/assets/default-avatar.png"
            }
            alt="Ảnh đại diện"
          />
          <h3>
            {form.first_name} {form.last_name}
          </h3>
          <p className="muted">{user.email}</p>
          <span className="tag">
            {candidate ? "Ứng viên" : "Nhà tuyển dụng"}
          </span>
          <Field label="Ảnh đại diện (PNG/JPG, tối đa 5 MB)">
            <input
              type="file"
              accept="image/png,image/jpeg"
              disabled={busy}
              onChange={(e) => file("photo", e)}
            />
          </Field>
          {candidate && (
            <>
              <hr />
              <Field label="CV (PDF, tối đa 5 MB)">
                <input
                  type="file"
                  accept="application/pdf"
                  disabled={busy}
                  onChange={(e) => file("resume", e)}
                />
              </Field>
              {form.resume ? (
                <a
                  className="outline"
                  href="/api/profile/resume"
                  target="_blank"
                  rel="noreferrer"
                >
                  Tải CV hiện tại ↓
                </a>
              ) : (
                <p className="muted">
                  Chưa có CV. Hãy tải CV trước khi ứng tuyển.
                </p>
              )}
            </>
          )}
        </aside>
        <section className="panel">
          <h2>Thông tin cá nhân</h2>
          <ErrorBox error={error} />
          {message && (
            <p className="alert success" role="status">
              {message}
            </p>
          )}
          <form onSubmit={save}>
            <div className="form-grid">
              {field("first_name", "Họ", { required: true, maxLength: 100 })}
              {field("last_name", "Tên", { required: true, maxLength: 100 })}
              <Field label="Email" value={user.email} disabled />
              {!candidate && field("company", "Công ty")}
              {field("city", "Địa chỉ / thành phố")}
              {field("state", "Xã / phường")}
              {field("country", "Tỉnh / quốc gia")}
              {candidate && field("certificate", "Trình độ học vấn")}
            </div>
            {candidate && (
              <>
                <Field label="Kinh nghiệm">
                  <textarea
                    rows={4}
                    value={form.experience || ""}
                    maxLength={1000}
                    onChange={(e) =>
                      setForm({ ...form, experience: e.target.value })
                    }
                  />
                </Field>
                <h2>Kỹ năng</h2>
                {form.skills.map((skill, i) => (
                  <div className="skill-row" key={i}>
                    <Field
                      label="Tên kỹ năng"
                      value={skill.name}
                      maxLength={100}
                      required
                      onChange={(e) =>
                        setForm({
                          ...form,
                          skills: form.skills.map((s, n) =>
                            n === i ? { ...s, name: e.target.value } : s,
                          ),
                        })
                      }
                    />
                    <Field
                      label="Số năm"
                      type="number"
                      min="0"
                      max="99"
                      step="0.5"
                      value={skill.years}
                      required
                      onChange={(e) =>
                        setForm({
                          ...form,
                          skills: form.skills.map((s, n) =>
                            n === i ? { ...s, years: e.target.value } : s,
                          ),
                        })
                      }
                    />
                    <Field label="Trình độ">
                      <select
                        value={skill.level}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            skills: form.skills.map((s, n) =>
                              n === i ? { ...s, level: e.target.value } : s,
                            ),
                          })
                        }
                      >
                        <option value="Beginner">Hiểu biết</option>
                        <option value="Intermediate">Có kinh nghiệm</option>
                        <option value="Advance">Thành thạo</option>
                      </select>
                    </Field>
                    <button
                      type="button"
                      className="text-button danger"
                      aria-label={"Xóa kỹ năng " + skill.name}
                      onClick={() =>
                        setForm({
                          ...form,
                          skills: form.skills.filter((_, n) => n !== i),
                        })
                      }
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="outline"
                  disabled={form.skills.length >= 30}
                  onClick={() =>
                    setForm({
                      ...form,
                      skills: [
                        ...form.skills,
                        { name: "", years: 0, level: "Beginner" },
                      ],
                    })
                  }
                >
                  + Thêm kỹ năng
                </button>
              </>
            )}
            <div className="form-footer">
              <button disabled={busy}>
                {busy ? "Đang lưu…" : "Lưu hồ sơ"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
