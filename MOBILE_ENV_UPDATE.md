# 📱 Mobile App 環境變數更新總結

## 🎯 改進內容

將 Mobile App 的 API URL 配置從**硬編碼**改為**環境變數驅動**，解決網路切換時需要手動修改程式碼的問題。

## ✅ 完成的改動

### 1. 重構 API 配置檔案

**檔案：** `apps/mobile/config/api.js`

**改動：**
- ✅ 使用 `process.env.EXPO_PUBLIC_API_URL` 讀取環境變數
- ✅ 新增自動偵測功能（從 Expo manifest 讀取 hostUri）
- ✅ 保留 Fallback 機制（localhost 或平台特定 IP）
- ✅ 加入 console.log 方便除錯

**優先順序：**
1. 環境變數 `EXPO_PUBLIC_API_URL`
2. 自動偵測 Expo hostUri
3. Fallback 預設值

### 2. 創建自動設定腳本

**檔案：** `scripts/setup-mobile-env.sh`

**功能：**
- ✅ 自動偵測本機 IP（支援 macOS 和 Linux）
- ✅ 自動創建或更新 `.env` 檔案
- ✅ 設定 `EXPO_PUBLIC_API_URL=http://YOUR_IP:3000`
- ✅ 提供友善的提示訊息

**使用方式：**
```bash
./scripts/setup-mobile-env.sh
```

### 3. 更新環境變數範本

**檔案：** `.env.example`

**改動：**
- ✅ 加入 `EXPO_PUBLIC_API_URL` 說明
- ✅ 提供詳細的設定步驟
- ✅ 包含不同場景的範例

### 4. 更新文檔

**檔案：**
- ✅ `apps/mobile/README.md` - 更新快速開始指南
- ✅ `docs/MOBILE_API_CONFIG.md` - 新增完整配置指南

## 🚀 使用方式

### 快速開始（3 步驟）

```bash
# 1. 自動設定環境變數
./scripts/setup-mobile-env.sh

# 2. 啟動 Backend
docker-compose up

# 3. 啟動 Mobile App
cd apps/mobile && npm start
```

### 網路切換時

```bash
# 重新執行設定腳本即可
./scripts/setup-mobile-env.sh

# 重啟 Expo
npm start
```

## 🔄 Before vs After

### Before（硬編碼）

```javascript
// apps/mobile/config/api.js
const API_CONFIG = {
  development: {
    ios: 'http://10.0.0.160:3000',  // ❌ 硬編碼，切換網路要改程式碼
    android: 'http://10.0.2.2:3000',
    physical: 'http://10.0.0.160:3000',
  },
};
```

**問題：**
- ❌ 切換網路時要手動修改程式碼
- ❌ IP 寫死在程式碼中
- ❌ 容易忘記更新
- ❌ 團隊成員的 IP 不同，需要各自修改

### After（環境變數）

```javascript
// apps/mobile/config/api.js
const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;

export const getApiUrl = () => {
  if (ENV_API_URL) {
    return ENV_API_URL;  // ✅ 從 .env 讀取
  }
  // 自動偵測或 fallback
};
```

```bash
# .env
EXPO_PUBLIC_API_URL=http://10.0.0.160:3000  # ✅ 集中管理
```

**優點：**
- ✅ 切換網路只需執行腳本
- ✅ 配置集中在 `.env`
- ✅ 支援自動偵測
- ✅ 團隊成員各自維護自己的 `.env`

## 📋 配置場景

### 場景 1：iOS 模擬器（本機）
```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### 場景 2：實體設備（同網路）
```bash
EXPO_PUBLIC_API_URL=http://10.0.0.160:3000
```

### 場景 3：Android 模擬器
```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

### 場景 4：不設定（自動偵測）
```bash
# 留空或不設定，會自動從 Expo hostUri 偵測
```

## 🐛 除錯資訊

啟動 Mobile App 時會顯示：

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

## 📚 相關文件

- [Mobile API 配置指南](docs/MOBILE_API_CONFIG.md)
- [Mobile App README](apps/mobile/README.md)
- [環境變數範本](.env.example)

## ✨ 優勢總結

1. **自動化** - 一鍵設定，無需手動修改程式碼
2. **靈活性** - 支援環境變數、自動偵測、Fallback 三種方式
3. **可維護性** - 配置集中管理，易於更新
4. **團隊友善** - 每個人維護自己的 `.env`，不影響他人
5. **除錯友善** - Console 顯示當前使用的 API URL

## 🎉 完成！

現在你可以：
- ✅ 執行 `./scripts/setup-mobile-env.sh` 自動設定
- ✅ 切換網路時重新執行腳本即可
- ✅ 不再需要手動修改程式碼
- ✅ 團隊成員各自維護自己的 `.env`
