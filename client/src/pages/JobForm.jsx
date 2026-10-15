import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api, upload, typeLabels, remoteLabels } from "../services/api";
import { Field, ErrorBox, Loading } from "../components/UI";
export default function JobForm() {
  const { id } = useParams(),
    editing = !!id,
    { user } = useAuth(),
    navigate = useNavigate();
  const [form, setForm] = useState({
      title: "",
      company: user.company || "",
      city: "",
      state: "",
      country: "Việt Nam",
      type: "Full-time",
      remote: "Office-Only",
      salary: "",
      quantity: 1,
      field: "",
      experience_required: "",
      certificate_required: "",
      description: "",
      status: "open",
    }),
    [loading, setLoading] = useState(editing),
    [error, setError] = useState(null),
    [busy, setBusy] = useState(false),
    [logo, setLogo] = useState(null),
    [savedId, setSavedId] = useState(null);
  useEffect(() => {
    if (!id) return;
    let live = true;
    api("/jobs/" + id)
      .then((d) => {
        if (live) {
          if (d.recruiter_id !== user.id)
            throw Error("Bạn không có quyền chỉnh sửa tin này");
          setForm(d);
        }
      })
      .catch((e) => {
        if (live) setError(e);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [id, user.id]);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const target = id || savedId;
      const result = await api(target ? "/jobs/" + target : "/jobs", {
        method: target ? "PUT" : "POST",
        body: form,
      });
      setSavedId(result.id);
      if (logo) await upload("/jobs/" + result.id + "/files/logo", logo);
      navigate("/recruiter");
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  function field(key, label, props = {}) {
    return (
      <Field
        key={key}
        label={label}
        value={form[key]}
        maxLength={200}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        {...props}
      />
    );
  }
  if (loading) return <Loading />;
  return (
    <main className="container editor-page">
      <Link to="/recruiter" className="back-link">
        ← Tin tuyển dụng của tôi
      </Link>
      <section className="panel">
        <p className="eyebrow">NHÀ TUYỂN DỤNG</p>
        <h1>
          {editing ? "Chỉnh sửa tin tuyển dụng" : "Đăng tin tuyển dụng mới"}
        </h1>
        <ErrorBox error={error} />
        <form onSubmit={submit}>
          <div className="form-grid">
            {field("title", "Tên công việc", { required: true })}
            {field("company", "Công ty", { required: true })}
            <Field label="Loại công việc">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {Object.entries(typeLabels).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Hình thức làm việc">
              <select
                value={form.remote}
                onChange={(e) => setForm({ ...form, remote: e.target.value })}
              >
                {Object.entries(remoteLabels).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            {field("salary", "Thu nhập", {
              required: true,
              maxLength: 100,
              placeholder: "20 - 30 triệu",
            })}
            {field("quantity", "Số lượng tuyển", {
              type: "number",
              min: 1,
              max: 10000,
              required: true,
            })}
            {field("field", "Ngành nghề")}
            {field("experience_required", "Kinh nghiệm yêu cầu")}
            {field("certificate_required", "Trình độ học vấn")}
            <Field label="Trạng thái">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="open">Đang tuyển</option>
                <option value="closed">Đóng tuyển dụng</option>
              </select>
            </Field>
          </div>
          <Field label="Mô tả công việc, yêu cầu và quyền lợi">
            <textarea
              rows={12}
              value={form.description}
              maxLength={10000}
              required
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Mô tả công việc…"
            />
          </Field>
          <h2>Địa điểm làm việc</h2>
          <div className="form-grid">
            {field("city", "Địa chỉ / thành phố", { required: true })}
            {field("state", "Xã / phường")}
            {field("country", "Tỉnh / quốc gia", { required: true })}
            <Field label="Logo công ty (PNG/JPG, tối đa 5 MB)">
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => setLogo(e.target.files[0])}
              />
            </Field>
          </div>
          <div className="form-footer">
            <Link className="outline" to="/recruiter">
              Hủy
            </Link>
            <button disabled={busy}>
              {busy
                ? "Đang lưu…"
                : editing
                  ? "Lưu thay đổi"
                  : "Đăng tin tuyển dụng"}
            </button>
          </div>
        </form>
        {editing && (
          <div className="close-section">
            <p>
              Đóng tin để ngừng nhận đơn mới. Các hồ sơ đã nộp vẫn được lưu.
            </p>
            <button
              className="outline danger"
              disabled={busy || form.status === "closed"}
              onClick={async () => {
                if (!window.confirm("Đóng tin tuyển dụng này?")) return;
                setBusy(true);
                try {
                  await api("/jobs/" + id, { method: "DELETE" });
                  navigate("/recruiter");
                } catch (e) {
                  setError(e);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Đóng tin tuyển dụng
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
