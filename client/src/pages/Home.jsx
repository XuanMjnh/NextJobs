import { Link, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import SearchBar from "../components/SearchBar";
import { useResource, ErrorBox, Loading } from "../components/UI";
export default function Home() {
  const navigate = useNavigate(),
    { data, error, loading } = useResource("/stats");
  const labels = {
    jobs: "Việc làm đang tuyển",
    recruiters: "Công ty đang tuyển",
    today: "Việc làm mới nhất",
    candidates: "Ứng viên",
    applicants: "Ứng viên đã ứng tuyển",
    applications: "Số lượt ứng tuyển",
  };
  return (
    <main className="home">
      <div className="home-inner">
        <p className="eyebrow">KẾT NỐI HÔM NAY • VỮNG BƯỚC NGÀY MAI</p>
        <h1>
          NextJobs - Công việc tương lai,
          <br />
          kết nối ứng viên và nhà tuyển dụng
        </h1>
        <SearchBar
          onSearch={(q, location) =>
            navigate("/jobs?" + new URLSearchParams({ q, location }))
          }
        />
        <div className="home-links">
          <span>Bắt đầu hành trình của bạn</span>
          <Link to="/jobs">Khám phá việc làm →</Link>
          <Link to="/register">Dành cho nhà tuyển dụng →</Link>
        </div>
        <section className="market">
          <div className="market-title">
            <h2>
              Thị trường việc làm <span aria-hidden="true">▥</span>
            </h2>
            <span>Dữ liệu từ hệ thống</span>
          </div>
          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorBox error={error} />
          ) : (
            <>
              <div className="market-summary">
                <div>
                  <strong>{data.jobs}</strong>
                  <span>Việc làm đang tuyển</span>
                </div>
                <div>
                  <strong>{data.recruiters}</strong>
                  <span>Công ty đang tuyển</span>
                </div>
                <div>
                  <strong>{data.candidates}</strong>
                  <span>Ứng viên</span>
                </div>
              </div>
              <div className="chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(labels).map(([key, name]) => ({
                      name,
                      value: Number(data[key]),
                    }))}
                    margin={{ top: 16, left: 0, right: 20, bottom: 15 }}
                  >
                    <defs>
                      <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#5eb5ff" />
                        <stop offset="100%" stopColor="#1d66d5" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#ffffff20" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#e9f3ff", fontSize: 11 }}
                      interval={0}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#e9f3ff", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#fff",
                        color: "#164081",
                        borderRadius: 8,
                      }}
                      formatter={(value) => [value, "Số lượng"]}
                    />
                    <Bar
                      dataKey="value"
                      fill="url(#bar)"
                      radius={[7, 7, 0, 0]}
                      maxBarSize={58}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {data.jobs === 0 && (
                <p className="market-empty">
                  Hệ thống chưa có tin tuyển dụng. Nhà tuyển dụng có thể đăng
                  tin sau khi tạo tài khoản.
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
