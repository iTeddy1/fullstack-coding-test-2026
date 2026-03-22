# Thiết lập và Cài đặt

## Điều kiện tiên quyết

- Node.js >= 18
- npm >= 9
- Một instance MongoDB (cục bộ hoặc từ xa)

## 1. Clone Repository

```bash
git clone https://github.com/iTeddy1/fullstack-coding-test-2026.git
cd fullstack-coding-test-2026
```

## 2. Khởi động nhanh (Windows Batch)

Chạy lệnh này từ thư mục /scripts để cài dependencies cho backend/frontend và khởi động cả hai ứng dụng:

```bat
setup-and-run.bat
```

Các script hỗ trợ có sẵn:

- `install-deps.bat`: cài dependencies cho backend và frontend
- `run-app.bat`: khởi động backend và frontend trong các cửa sổ terminal riêng biệt
- `setup-and-run.bat`: chạy cài đặt trước, sau đó khởi động cả hai ứng dụng

## 3. Biến môi trường

File backend: `backend/.env`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fullstack-coding-test-2026
```

File frontend: `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000
```

## 4. Thiết lập thủ công

Cài dependencies:

```bash
cd ./backend
npm install

cd ./frontend
npm install
```

Chạy ứng dụng:

```bash
cd ./backend
npm run dev
```

Trong terminal thứ hai:

```bash
cd ./frontend
npm run dev
```

URL local mặc định:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
