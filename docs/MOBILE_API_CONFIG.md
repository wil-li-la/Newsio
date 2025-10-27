# 📱 Mobile App API 配置指南

## 概述

Mobile App 的 API URL 配置已經改為**環境變數驅動**，支援自動偵測和手動設定。

## 🎯 配置優先順序

1. **環境變數** `EXPO_PUBLIC_API_URL`（從 `.env` 讀取）
2. **自動偵測** Expo manifest 中的 `hostUri`
3. **Fallback** 預設值（localhost 或平台特定 IP）

## 🚀 快速設定

### 方法 1：自動設定（推薦）

```bash
# 在專案根目錄執行
./scripts/setup-mobile-env.sh
```

這個腳本會：
- ✅ 自動偵測你的本機 IP（en0 或 en1）
- ✅ 更新或創建 `.env` 檔案
- ✅ 設定 `EXPO_PUBLIC_API_URL=http://YOUR_IP:3000`

### 方法 2：手動設定

```bash
# 1. 查詢本機 IP
ipconfig getifaddr en0  # Mac
ipconfig                # Windows (找 IPv4 位址)

# 2. 複製環境變數範本
cp .env.example .env

# 3. 編輯 .env 檔案
nano .env

# 4. 設定 API URL
EXPO_PUBLIC_API_URL=http://10.0.0.160:3000  # 替換成你的 IP
```

## 🔄 網路切換處理

當你切換網路（例如從 Wi-Fi 切到手機熱點）時：

### 自動方式
```bash
./scripts/setup-mobile-env.sh
```

### 手動方式
```bash
# 1. 查詢新的 IP
ipconfig getifaddr en0

# 2. 更新 .env
EXPO_PUBLIC_API_URL=http://NEW_IP:3000

# 3. 重啟 Expo
# 按 Ctrl+C 停止，然後重新執行
npm start
```

## 📋 不同場景的配置

### 場景 1：iOS 模擬器（本機開發）

```bash
# .env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

或不設定（會自動 fallback 到 localhost）

### 場景 2：實體 iPhone/iPad（同網路）

```bash
# .env
EXPO_PUBLIC_API_URL=http://10.0.0.160:3000  # 你的 Mac IP
```

### 場景 3：Android 模擬器

```bash
# .env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000  # Android 模擬器特殊 IP
```

### 場景 4：實體 Android 手機（同網路）

```bash
# .env
EXPO_PUBLIC_API_URL=http://10.0.0.160:3000  # 你的電腦 IP
```

## 🐛 除錯

### 查看當前使用的 API URL

在 Mobile App 啟動時，會在 console 顯示：

```
📡 使用環境變數 API URL: http://10.0.0.160:3000
```

或

```
📡 自動偵測 API URL: http://10.0.0.160:3000
```

或

```
📡 使用 Fallback API URL: http://localhost:3000
```

### 常見問題

#### 1. 連接超時 (timeout)

**原因：** IP 地址不正確或 Backend 未啟動

**解決：**
```bash
# 確認 Backend 正在運行
docker-compose ps

# 確認可以從本機訪問
curl http://localhost:3000/api/news

# 確認可以從網路訪問
curl http://YOUR_IP:3000/api/news

# 重新設定環境變數
./scripts/setup-mobile-env.sh
```

#### 2. 環境變數未生效

**原因：** Expo 需要重啟才能讀取新的環境變數

**解決：**
```bash
# 停止 Expo (Ctrl+C)
# 清除快取並重啟
npm start -- --clear
```

#### 3. 自動偵測失敗

**原因：** 網路介面名稱不是 en0 或 en1

**解決：**
```bash
# 查看所有網路介面
ifconfig

# 手動設定 .env
EXPO_PUBLIC_API_URL=http://YOUR_IP:3000
```

## 🔧 進階配置

### 自訂 Fallback 配置

編輯 `apps/mobile/config/api.js`：

```javascript
const FALLBACK_CONFIG = {
  development: {
    ios: 'http://your-custom-url:3000',
    android: 'http://10.0.2.2:3000',
    default: 'http://localhost:3000',
  },
  production: {
    ios: 'https://api.yourapp.com',
    android: 'https://api.yourapp.com',
    default: 'https://api.yourapp.com',
  },
};
```

### 使用不同的 Port

```bash
# .env
EXPO_PUBLIC_API_URL=http://10.0.0.160:8080  # 自訂 port
```

## 📚 相關文件

- [Mobile App README](../apps/mobile/README.md)
- [Docker Compose 配置](../docker-compose.yml)
- [環境變數範本](../.env.example)

## 🎉 完成檢查清單

- [ ] 執行 `./scripts/setup-mobile-env.sh`
- [ ] 確認 `.env` 中有 `EXPO_PUBLIC_API_URL`
- [ ] 啟動 Docker: `docker-compose up`
- [ ] 啟動 Mobile App: `cd apps/mobile && npm start`
- [ ] 在 console 看到正確的 API URL
- [ ] App 成功載入新聞列表
