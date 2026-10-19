# NextJobs

Ứng dụng tuyển dụng trực tuyến gồm giao diện cho ứng viên và nhà tuyển dụng.

## Công nghệ sử dụng

- **Frontend:** React 19, Vite 6, React Router 7, Recharts và CSS
- **Backend:** Node.js, Express 5
- **Cơ sở dữ liệu:** MySQL 8, kết nối qua `mysql2`
- **Xác thực và bảo mật:** JWT, bcryptjs, Helmet, CORS và Zod
- **Công cụ phát triển:** npm workspaces, concurrently và Prettier

## Cấu trúc thư mục

```text
nextjobs/
├── client/                  # Ứng dụng React
│   ├── public/assets/       # Hình ảnh và tài nguyên tĩnh
│   └── src/
│       ├── components/      # Thành phần giao diện dùng chung
│       ├── contexts/        # React contexts
│       ├── pages/           # Các trang
│       ├── services/        # Gọi API
│       ├── main.jsx         # Điểm khởi chạy frontend
│       └── styles.css       # CSS
├── server/                  # API và dữ liệu backend
│  
│   ├── src/
│   │   ├── config/          # Cấu hình môi trường và database
│   │   ├── controllers/     # Xử lý request
│   │   ├── middleware/      # Xác thực, upload và xử lý lỗi
│   │   ├── repositories/    # Truy vấn database
│   │   ├── routes/          # Định nghĩa API routes
│   │   ├── services/        # Nghiệp vụ ứng dụng
│   │   ├── utils/           # Hàm tiện ích
│   │   ├── validators/      # Kiểm tra dữ liệu
│   │   ├── app.js           # Cấu hình Express
│   │   └── server.js        # Khởi chạy API
│   ├── tests/               # Kiểm thử backend
│   
├── package.json             # Scripts và npm workspaces
└── package-lock.json        # Khóa phiên bản dependencies
```
