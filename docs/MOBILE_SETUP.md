# 📱 Mobile APP 開發環境設置指南

## 📊 當前環境檢查結果

### ✅ 已安裝
- **Node.js:** v24.4.1 ✓ (需求: >= 18.0.0)
- **npm:** 11.4.2 ✓ (需求: >= 9.0.0)
- **Xcode:** 26.0.1 ✓ (Build 17A400)
- **CocoaPods:** 1.16.2 ✓ (需要同意 Xcode license)

### ❌ 尚未安裝/配置
- **Expo CLI:** 未安裝
- **React Native CLI:** 未安裝
- **Android Studio / ADB:** 未安裝
- **Mobile App 專案:** 只有 README，尚未初始化

---

## 🚀 開發 Mobile APP 需要的步驟

### 方案 A：使用 Expo（推薦新手）

#### 優點
- ✅ 設置簡單快速
- ✅ 可以用手機掃 QR code 直接測試
- ✅ 不需要 Xcode 或 Android Studio（開發階段）
- ✅ 內建許多常用功能

#### 缺點
- ❌ 某些原生功能受限
- ❌ App 體積較大

#### 安裝步驟

**1. 安裝 Expo CLI**
```bash
npm install -g expo-cli
# 或使用 npx（不需全域安裝）
```

**2. 初始化 Mobile 專案**
```bash
cd apps/mobile
npx create-expo-app . --template blank
```

**3. 安裝必要套件**
```bash
npm install @react-navigation/native
npm install @react-navigation/stack
npm install react-native-gesture-handler
npm install react-native-reanimated
npm install axios
```

**4. 啟動開發伺服器**
```bash
npm start
# 或從根目錄執行
npm run mobile
```

**5. 在手機上測試**
- 下載 **Expo Go** app（iOS/Android）
- 掃描終端機顯示的 QR code
- 即可在手機上看到 app

---

### 方案 B：使用 React Native CLI（進階）

#### 優點
- ✅ 完整的原生功能存取
- ✅ 更好的效能
- ✅ App 體積較小

#### 缺點
- ❌ 設置複雜
- ❌ 需要 Xcode 和 Android Studio
- ❌ 編譯時間較長

#### 安裝步驟

**1. 同意 Xcode License（必須）**
```bash
sudo xcodebuild -license accept
```

**2. 安裝 React Native CLI**
```bash
npm install -g react-native-cli
```

**3. 安裝 iOS 開發工具**
```bash
# 安裝 CocoaPods 依賴
cd apps/mobile/ios
pod install
```

**4. 安裝 Android 開發工具**
- 下載並安裝 [Android Studio](https://developer.android.com/studio)
- 設定 Android SDK
- 設定環境變數：
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**5. 初始化 React Native 專案**
```bash
cd apps/mobile
npx react-native init NewsFlowMobile --template react-native-template-typescript
```

---

## 📦 需要安裝的套件清單

### 核心套件
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-native": "^0.73.0",
    "axios": "^1.6.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/stack": "^6.3.0",
    "react-native-gesture-handler": "^2.14.0",
    "react-native-reanimated": "^3.6.0",
    "react-native-safe-area-context": "^4.8.0",
    "react-native-screens": "^3.29.0"
  }
}
```

### 功能套件（根據需求）
```bash
# 狀態管理
npm install @reduxjs/toolkit react-redux

# 本地儲存
npm install @react-native-async-storage/async-storage

# 圖片處理
npm install react-native-fast-image

# WebView（內嵌瀏覽器）
npm install react-native-webview

# 手勢處理（Tinder-like swipe）
npm install react-native-deck-swiper
```

---

## 🔧 Backend API 連接配置

Mobile app 需要連接到你的 Backend API：

**開發環境配置：**
```javascript
// apps/mobile/config/api.js
const API_CONFIG = {
  // 本地開發（模擬器）
  ios: 'http://localhost:3000',
  android: 'http://10.0.2.2:3000', // Android 模擬器特殊 IP
  
  // 實體手機測試（需要同一網路）
  physical: 'http://192.168.x.x:3000', // 替換成你的電腦 IP
  
  // 生產環境
  production: 'https://your-api-domain.com'
};
```

**查詢你的電腦 IP：**
```bash
# macOS
ipconfig getifaddr en0
```

---

## 📝 建議的開發流程

### 第一階段：快速原型（使用 Expo）
1. ✅ 使用 Expo 快速建立專案
2. ✅ 開發基本 UI 和功能
3. ✅ 用手機測試使用者體驗
4. ✅ 確認 API 連接正常

### 第二階段：功能完善
1. 實作 Tinder-like 滑動介面
2. 整合使用者認證
3. 實作新聞列表和詳情頁
4. 加入搜尋和篩選功能

### 第三階段：原生優化（可選）
1. 如果需要特殊原生功能，考慮遷移到 React Native CLI
2. 優化效能和 App 體積
3. 準備上架 App Store / Google Play

---

## 🎯 推薦方案

**對於你的情況，我建議：**

### 選擇 Expo 的理由
1. ✅ 你已經有 Xcode，但還沒同意 license
2. ✅ 沒有 Android Studio（如果只做 iOS 可以暫時不裝）
3. ✅ Mobile 專案還是空的，可以從頭開始
4. ✅ 快速驗證想法和功能
5. ✅ Backend API 已經準備好

### 立即可以開始的步驟
```bash
# 1. 同意 Xcode license（必須）
sudo xcodebuild -license accept

# 2. 初始化 Expo 專案
cd apps/mobile
npx create-expo-app . --template blank

# 3. 安裝依賴
npm install

# 4. 啟動開發
npm start

# 5. 在手機上安裝 Expo Go 並掃描 QR code
```

---

## 🔍 環境檢查指令

執行以下指令檢查環境是否就緒：

```bash
# Node.js 環境
node --version  # 應該 >= 18.0.0
npm --version   # 應該 >= 9.0.0

# iOS 開發
xcodebuild -version  # 檢查 Xcode
pod --version        # 檢查 CocoaPods

# Android 開發（如果需要）
adb --version        # 檢查 Android Debug Bridge

# Expo（如果使用）
npx expo --version   # 檢查 Expo CLI
```

---

## 📱 測試裝置選項

### 選項 1：iOS 模擬器（推薦）
- 使用 Xcode 內建的 iOS Simulator
- 不需要實體裝置
- 啟動方式：`npm run ios`

### 選項 2：實體手機 + Expo Go
- 下載 Expo Go app
- 掃描 QR code
- 最接近真實使用體驗

### 選項 3：Android 模擬器
- 需要安裝 Android Studio
- 設定較複雜
- 啟動方式：`npm run android`

---

## ⚠️ 常見問題

### Q: 需要付費的 Apple Developer 帳號嗎？
**A:** 開發階段不需要。只有要上架 App Store 才需要（每年 $99 USD）。

### Q: 可以只開發 iOS 版本嗎？
**A:** 可以。使用 React Native 的優點是程式碼共用，但你可以先專注在一個平台。

### Q: Expo 和 React Native CLI 可以互相轉換嗎？
**A:** 可以。Expo 專案可以 "eject" 成純 React Native 專案，但這是單向的。

### Q: Backend API 在 Docker 裡，Mobile 怎麼連接？
**A:** 
- iOS 模擬器：使用 `http://localhost:3000`
- Android 模擬器：使用 `http://10.0.2.2:3000`
- 實體手機：使用你電腦的區域網路 IP（如 `http://192.168.1.100:3000`）

---

## 📚 相關資源

- [Expo 官方文件](https://docs.expo.dev/)
- [React Native 官方文件](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Expo Go App](https://expo.dev/client)

---

## 🎬 下一步

建議你先執行以下指令，我可以協助你初始化 Mobile 專案：

```bash
# 同意 Xcode license
sudo xcodebuild -license accept

# 初始化 Expo 專案
cd apps/mobile
npx create-expo-app . --template blank
```

需要我幫你建立初始的 Mobile 專案結構嗎？
