# Setup and Installation

## Prerequisites

- Node.js >= 18 
- npm >= 9 
- MongoDB instance (local or remote)

## 1. Clone Repository

```bash
git clone https://github.com/iTeddy1/fullstack-coding-test-2026.git
cd fullstack-coding-test-2026
```

## 2. Quick Start (Windows Batch)

Run this from /scripts to install backend/frontend dependencies and start both apps:

```bat
setup-and-run.bat
```

Available helper scripts:

- `install-deps.bat`: installs backend and frontend dependencies
- `run-app.bat`: starts backend and frontend in separate terminal windows
- `setup-and-run.bat`: runs install, then starts both apps

## 3. Environment Variables

Backend file: `backend/.env`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fullstack-coding-test-2026
```

Frontend file: `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000
```

## 4. Manual Setup

Install dependencies:

```bash
cd ./backend
npm install

cd ./frontend
npm install
```

Run the application:

```bash
cd ./backend
npm run dev
```

In a second terminal:

```bash
cd ./frontend
npm run dev
```

Default local URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
