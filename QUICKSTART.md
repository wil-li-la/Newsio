# 🚀 Quick Start Guide

## Step 1: 啟動 Docker Desktop

1. 打開 **Docker Desktop** 應用程式
2. 等待 Docker 完全啟動（左下角顯示綠色）

## Step 2: 啟動所有服務

```bash
cd /Users/hongyicheng/Desktop/code/test/newsflow-v2

# 啟動所有服務（PostgreSQL + Backend + Web）
docker-compose up --build
```

## Step 3: 等待服務啟動

你會看到以下輸出：

```
✅ postgres  | database system is ready to accept connections
✅ backend   | NewsFlow Backend API running on http://localhost:3000
✅ web       | VITE ready in XXX ms
```

## Step 4: 填充測試資料

**開啟新的終端視窗**，執行：

```bash
cd /Users/hongyicheng/Desktop/code/test/newsflow-v2

# 填充 10 篇示範新聞
docker exec -it newsflow-backend npm run seed
```

## Step 5: 訪問應用

- **Web 應用**: http://localhost:5173
- **Backend API**: http://localhost:3000/health
- **API 文檔**: http://localhost:3000/api/news

## 常見問題

### Q: Docker 啟動失敗？

```bash
# 檢查 Docker 是否運行
docker ps

# 如果沒有運行，啟動 Docker Desktop
```

### Q: Port 被佔用？

```bash
# 檢查哪個程序佔用 port
lsof -i :3000  # Backend
lsof -i :5173  # Web
lsof -i :5432  # PostgreSQL

# 停止衝突的服務
docker-compose down
```

### Q: 想要重新開始？

```bash
# 停止並刪除所有容器和資料
docker-compose down -v

# 重新啟動
docker-compose up --build
```

## 開發工作流程

### 1. 每天開始工作

```bash
# 啟動服務
docker-compose up
```

### 2. 修改代碼

- **Backend**: 修改 `services/backend/src/` 下的檔案，自動重新載入
- **Web**: 修改 `apps/web/src/` 下的檔案，瀏覽器自動刷新

### 3. 查看日誌

```bash
# 查看所有服務日誌
docker-compose logs -f

# 只看 backend
docker-compose logs -f backend

# 只看 web
docker-compose logs -f web
```

### 4. 停止服務

```bash
# 按 Ctrl+C 停止
# 或在新終端執行
docker-compose down
```

## 測試 API

### 使用 curl

```bash
# 健康檢查
curl http://localhost:3000/health

# 獲取新聞
curl http://localhost:3000/api/news?limit=5

# 搜尋新聞
curl -X POST http://localhost:3000/api/news/search \
  -H "Content-Type: application/json" \
  -d '{"query": "technology"}'
```

### 使用瀏覽器

直接訪問：
- http://localhost:3000/api/news
- http://localhost:3000/health

## 下一步

1. ✅ 確認 Web 介面可以顯示新聞
2. ✅ 測試搜尋功能
3. 📱 設定 Mobile 應用（需要 Expo）
4. 🚀 部署到 AWS（參考 README.md）

## 需要幫助？

查看完整文檔：
- [README.md](./README.md) - 完整專案文檔
- [Backend API](./services/backend/README.md) - API 詳細說明
- [Web App](./apps/web/README.md) - Web 前端說明

---

**祝開發順利！** 🎉
