# 📱 NewsFlow Mobile App

React Native + Expo 新聞聚合應用程式

## ✅ 已完成設置

- ✅ Expo 專案初始化
- ✅ React Navigation 導航系統
- ✅ API 服務層配置
- ✅ 基本的新聞列表 UI
- ✅ Backend API 連接

## 🚀 快速開始

### 1. 設定環境變數（自動）

```bash
# 在專案根目錄執行自動設定腳本
./scripts/setup-mobile-env.sh
```

這個腳本會：
- 自動偵測你的本機 IP
- 更新 `.env` 中的 `EXPO_PUBLIC_API_URL`
- 讓 Mobile App 能正確連接到 Docker 中的 Backend

**手動設定（可選）：**
```bash
# 1. 查詢本機 IP
ipconfig getifaddr en0  # Mac
ipconfig                # Windows

# 2. 編輯 .env 檔案
EXPO_PUBLIC_API_URL=http://YOUR_IP:3000
```

### 2. 啟動 Backend

```bash
# 在專案根目錄
docker-compose up
```

Backend API 會運行在 `http://localhost:3000`（容器內）和 `http://YOUR_IP:3000`（網路內）

### 3. 啟動 Mobile App

```bash
# 在 apps/mobile 目錄
npm start

# 或從根目錄
npm run mobile
```

### 4. 選擇測試方式

#### 方式 A：iOS 模擬器（推薦）
```bash
npx expo run:ios
```
- 會自動開啟 iOS Simulator
- 自動使用 `.env` 中設定的 API URL

#### 方式 B：實體手機 + Expo Go
1. 在手機上安裝 **Expo Go** app
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. 掃描終端機顯示的 QR code

3. **自動連接：** App 會使用 `.env` 中設定的 API URL
   ```bash
   # 查詢你的電腦 IP
   ipconfig getifaddr en0
   ```
   
   然後編輯 `config/api.js`：
   ```javascript
   physical: 'http://你的IP:3000',  // 例如：http://192.168.1.100:3000
   isPhysicalDevice: true,  // 改為 true
   ```

#### 方式 C：Android 模擬器
```bash
npm run android
```
- 需要先安裝 Android Studio
- 自動使用 `http://10.0.2.2:3000` 連接 Backend

## 📁 專案結構

```
apps/mobile/
├── App.js                 # 主應用程式入口
├── config/
│   └── api.js            # API 配置（URL、端點）
├── services/
│   └── apiService.js     # API 請求服務
├── assets/               # 圖片、字體等資源
├── package.json          # 依賴套件
└── babel.config.js       # Babel 配置
```

## 🔧 當前功能

### ✅ 已實作
- 📰 從 Backend API 獲取文章列表
- 🔄 下拉刷新
- ⚠️ 錯誤處理和重試
- 📱 響應式 UI 設計
- 🎨 現代化的卡片式設計

### 🚧 待開發
- 🔍 搜尋功能
- 📖 文章詳情頁
- 👤 使用者登入/註冊
- ❤️ 收藏功能
- 👆 Tinder-like 滑動介面
- 🌐 內嵌瀏覽器

## 🛠️ 技術棧

- **React Native** 0.81.4
- **Expo** ~54.0.14
- **React Navigation** 6.1.9
- **Axios** 1.6.0
- **React Native Gesture Handler** 2.20.2
- **React Native Reanimated** 3.16.1

## 📝 開發指南

### 修改 API URL

編輯 `config/api.js`：

```javascript
// 開發環境
development: {
  ios: 'http://localhost:3000',
  android: 'http://10.0.2.2:3000',
  physical: 'http://你的電腦IP:3000',  // 修改這裡
}
```

### 添加新的 API 端點

1. 在 `config/api.js` 添加端點：
```javascript
export const API_ENDPOINTS = {
  NEW_ENDPOINT: '/api/new-endpoint',
};
```

2. 在 `services/apiService.js` 添加方法：
```javascript
export const apiService = {
  newMethod: async () => {
    return apiClient.get(API_ENDPOINTS.NEW_ENDPOINT);
  },
};
```

### 調試技巧

```bash
# 查看詳細日誌
npx expo start --dev-client

# 清除快取
npx expo start -c

# 查看 Metro bundler 日誌
# 終端機會顯示所有 console.log 輸出
```

## ⚠️ 常見問題

### Q: 無法連接到 Backend API

**A: 檢查以下項目：**
1. Backend 是否正在運行？
   ```bash
   docker ps  # 應該看到 newsflow-backend
   ```

2. 使用正確的 IP 位址？
   - iOS 模擬器：`localhost:3000`
   - Android 模擬器：`10.0.2.2:3000`
   - 實體手機：你的電腦 IP（需要同一網路）

3. 防火牆是否阻擋？
   ```bash
   # macOS 允許連接
   # 系統偏好設定 > 安全性與隱私 > 防火牆
   ```

### Q: Expo Go 掃描 QR code 後無法載入

**A: 確保：**
- 手機和電腦在同一個 Wi-Fi 網路
- 沒有使用 VPN
- 修改 `config/api.js` 中的 `isPhysicalDevice` 為 `true`

### Q: iOS 模擬器啟動失敗

**A: 執行：**
```bash
# 重新安裝 iOS Simulator
xcode-select --install

# 列出可用的模擬器
xcrun simctl list devices
```

### Q: 套件安裝錯誤

**A: 清除並重新安裝：**
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

## 📱 測試資料

Backend 已經有 10 篇範例文章（透過 `npm run seed` 建立）。

測試使用者：
- Email: `demo@newsflow.com`
- Password: （查看 `services/backend/database/seed.js`）

## 🎯 下一步開發建議

1. **實作導航系統**
   - 首頁（文章列表）
   - 文章詳情頁
   - 搜尋頁
   - 個人資料頁

2. **添加狀態管理**
   ```bash
   npm install @reduxjs/toolkit react-redux
   ```

3. **實作使用者認證**
   - 登入/註冊畫面
   - Token 儲存（AsyncStorage）
   - 受保護的路由

4. **優化 UI/UX**
   - 骨架屏（Skeleton）
   - 動畫效果
   - 深色模式

5. **實作 Tinder-like 滑動**
   ```bash
   npm install react-native-deck-swiper
   ```

## 📚 相關文件

- [Expo 官方文件](https://docs.expo.dev/)
- [React Native 官方文件](https://reactnavigation.org/)
- [Backend API 文件](../../services/backend/README.md)

## 🆘 需要幫助？

查看其他文件：
- `docs/MOBILE_SETUP.md` - 完整的環境設置指南
- `docs/SETUP_TECHNICAL.md` - 技術架構說明
- `QUICKSTART.md` - 快速開始指南

---

**祝開發順利！** 🚀
