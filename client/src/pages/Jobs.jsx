import { useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import JobCard from "../components/JobCard";
import {
  ErrorBox,
  Loading,
  Empty,
  useResource,
  Pagination,
} from "../components/UI";
import { typeLabels, remoteLabels } from "../services/api";
const configs = {
  public: { title: "Việc làm phù hợp với bạn", endpoint: "/jobs" },
  saved: { title: "Việc làm đã lưu", endpoint: "/candidate/saved" },
  applied: {
    title: "Việc làm đã ứng tuyển",
    endpoint: "/candidate/applications",
  },
  owned: { title: "Quản lý tin tuyển dụng", endpoint: "/recruiter/jobs" },
};
export default function Jobs({ scope = "public" }) {
  const [params, setParams] = useSearchParams(),
    config = configs[scope],
    { data, error, loading, reload } = useResource(
      config.endpoint + "?" + params.toString(),
    );
  function set(key, value) {
    const n = new URLSearchParams(params);
    n.set(key, value);
    n.set("page", "1");
    setParams(n);
  }
  function toggle(key, value) {
    const list = (params.get(key) || "").split(",").filter(Boolean);
    set(
      key,
      list.includes(value)
        ? list.filter((v) => v !== value).join(",")
        : [...list, value].join(","),
    );
  }
  return (
    <main>
      <div className="search-strip">
        <div className="container">
          <SearchBar
            q={params.get("q") || ""}
            location={params.get("location") || ""}
            onSearch={(q, location) => {
              const n = new URLSearchParams(params);
              n.set("q", q);
              n.set("location", location);
              n.set("page", "1");
              setParams(n);
            }}
          />
        </div>
      </div>
      <div className="container jobs-layout">
        <aside className="filters">
          <div className="filter-title">
            <h2>Bộ lọc tìm kiếm</h2>
            <button className="text-button" onClick={() => setParams({})}>
              Xóa lọc
            </button>
          </div>
          {[
            ["types", "Loại công việc", typeLabels],
            ["remotes", "Hình thức làm việc", remoteLabels],
          ].map(([key, title, labels]) => (
            <fieldset key={key}>
              <legend>{title}</legend>
              {Object.entries(labels).map(([value, label]) => (
                <label className="check" key={value}>
                  <input
                    type="checkbox"
                    checked={(params.get(key) || "").split(",").includes(value)}
                    onChange={() => toggle(key, value)}
                  />
                  {label}
                </label>
              ))}
            </fieldset>
          ))}
          <fieldset>
            <legend>Ngày đăng</legend>
            {[
              ["", "Tất cả"],
              ["1", "24 giờ gần đây"],
              ["7", "1 tuần gần đây"],
              ["30", "1 tháng gần đây"],
            ].map(([value, label]) => (
              <label className="check" key={value}>
                <input
                  type="radio"
                  name="days"
                  checked={(params.get("days") || "") === value}
                  onChange={() => set("days", value)}
                />
                {label}
              </label>
            ))}
          </fieldset>
          <div className="filter-note">
            Một công việc mới.
            <br />
            <strong>Một tương lai mới.</strong>
          </div>
        </aside>
        <section className="results">
          <div className="results-heading">
            <div>
              <p className="eyebrow">
                NEXTJOBS /{" "}
                {scope === "owned" ? "NHÀ TUYỂN DỤNG" : "CƠ HỘI NGHỀ NGHIỆP"}
              </p>
              <h1>{config.title}</h1>
              <p className="muted">
                {data ? `${data.total} công việc` : "Đang tìm kiếm…"}{" "}
                <span>• Sắp xếp: Mới nhất</span>
              </p>
            </div>
          </div>
          <ErrorBox error={error} />
          {loading ? (
            <Loading />
          ) : (
            !error && (
              <>
                {data.items.length ? (
                  data.items.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onChange={reload}
                      owned={scope === "owned"}
                    />
                  ))
                ) : (
                  <Empty>
                    {scope === "saved"
                      ? "Lưu các công việc bạn quan tâm để xem lại tại đây."
                      : scope === "applied"
                        ? "Các đơn ứng tuyển của bạn sẽ hiển thị tại đây."
                        : "Thử đổi từ khóa hoặc bỏ bớt bộ lọc."}
                  </Empty>
                )}
                <Pagination
                  {...data}
                  onChange={(page) => {
                    const n = new URLSearchParams(params);
                    n.set("page", page);
                    setParams(n);
                  }}
                />
              </>
            )
          )}
        </section>
      </div>
    </main>
  );
}
