# 系統啟動說明（技術版）

## 目標讀者
資工系學生、具備基礎程式概念但不熟悉前後端開發的開發者

---

## 你執行的命令

### 1. `docker-compose up --build`

**作用：** 啟動整個應用程式的所有服務

**詳細說明：**
- **Docker Compose** 是一個容器編排工具，可以同時管理多個 Docker 容器
- 這個命令會讀取 `docker-compose.yml` 配置檔，並啟動三個服務：
  
  1. **PostgreSQL 資料庫** (port 5432)
     - 使用官方的 `postgres:16-alpine` 映像檔
     - 儲存應用程式的所有資料（文章、使用者等）
     - 資料會持久化在 Docker volume 中
  
  2. **Backend API 服務** (port 3000)
     - Node.js 後端應用程式
     - 提供 RESTful API 端點
     - 連接到 PostgreSQL 資料庫
     - 處理業務邏輯（如文章管理、使用者認證）
  
  3. **Web 前端服務** (port 5173)
     - React + Vite 前端應用程式
     - 提供使用者介面
     - 透過 HTTP 請求與 Backend API 溝通

- **`--build` 參數：** 強制重新建構 Docker 映像檔
  - 如果你修改了 `Dockerfile` 或程式碼，這個參數確保使用最新版本
  - 會執行 `npm install` 安裝所有依賴套件

**執行流程：**
```
1. 讀取 docker-compose.yml
2. 建構 backend 和 web 的 Docker 映像檔
3. 拉取 PostgreSQL 映像檔（如果本地沒有）
4. 啟動 PostgreSQL 容器
5. 等待資料庫健康檢查通過
6. 啟動 Backend 容器（依賴資料庫）
7. 啟動 Web 容器（依賴 Backend）
8. 所有服務開始運行
```

---

### 2. `docker exec -it newsflow-backend npm run seed`

**作用：** 在資料庫中填入測試資料

**詳細說明：**
- **`docker exec`：** 在正在運行的容器內執行命令
- **`-it`：** 互動模式（interactive + tty）
- **`newsflow-backend`：** 目標容器名稱
- **`npm run seed`：** 在容器內執行的命令
  - 執行 `database/seed.js` 腳本
  - 插入 10 篇範例文章
  - 建立一個測試使用者（demo@newsflow.com）

**為什麼需要這個步驟？**
- 新建立的資料庫是空的
- Seeding 提供初始資料，方便開發和測試
- 你可以立即看到應用程式的功能，而不需要手動建立資料

---

## 技術架構

```
瀏覽器 (localhost:5173)
    ↓
Web Frontend (React + Vite)
    ↓ HTTP API 請求
Backend API (Node.js + Express)
    ↓ SQL 查詢
PostgreSQL Database
```

**服務依賴關係：**
- PostgreSQL 必須先啟動並健康
- Backend 依賴 PostgreSQL
- Web 依賴 Backend

**Port Mapping：**
- `5173:5173` - Web 前端
- `3000:3000` - Backend API
- `5432:5432` - PostgreSQL

---

## 關鍵概念

### Docker 容器化
每個服務運行在獨立的容器中，環境隔離，避免依賴衝突。

### Volume 掛載
本地程式碼目錄掛載到容器內，修改程式碼後會自動重新載入（hot reload）。

### 環境變數
透過 `docker-compose.yml` 設定資料庫連線、API 金鑰等配置。
