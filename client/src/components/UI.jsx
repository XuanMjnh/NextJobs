import { useEffect, useState } from "react";
import { api } from "../services/api";
export function ErrorBox({ error }) {
  if (!error) return null;
  return (
    <div className="alert error" role="alert">
      {typeof error === "string" ? error : error.message}
      {error.errors?.length > 0 && (
        <ul>
          {error.errors.map((e, i) => (
            <li key={i}>
              {e.field}: {e.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
export function Empty({ children }) {
  return (
    <div className="empty">
      <span className="empty-symbol">⌕</span>
      <h3>Chưa có kết quả</h3>
      <p>{children}</p>
    </div>
  );
}
export function Loading() {
  return (
    <div className="loading" role="status">
      Đang tải dữ liệu…
    </div>
  );
}
export function Field({ label, children, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children || <input {...props} />}
    </label>
  );
}
export function useResource(path) {
  const [data, setData] = useState(null),
    [error, setError] = useState(null),
    [loading, setLoading] = useState(true),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(null);
    api(path)
      .then((d) => {
        if (live) setData(d);
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
  }, [path, revision]);
  return { data, error, loading, reload: () => setRevision((v) => v + 1) };
}
export function Pagination({ page, total, limit, onChange }) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Phân trang">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ← Trước
      </button>
      <span>
        Trang {page} / {pages}
      </span>
      <button disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Sau →
      </button>
    </nav>
  );
}
