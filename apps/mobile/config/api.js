import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * API 配置
 * 
 * 優先順序：
 * 1. 環境變數 EXPO_PUBLIC_API_URL（從 .env 讀取）
 * 2. Expo manifest 中的 hostUri（自動偵測開發伺服器 IP）
 * 3. Fallback 預設值
 * 
 * 設定方式：
 * 1. 複製 .env.example 為 .env
 * 2. 執行 `ipconfig getifaddr en0` (Mac) 或 `ipconfig` (Windows) 取得本機 IP
 * 3. 在 .env 中設定：EXPO_PUBLIC_API_URL=http://YOUR_IP:3000
 * 4. 重啟 Expo: npm start
 */

// 從環境變數讀取 API URL
const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;

// 從 Expo manifest 自動偵測開發伺服器 IP
const getAutoDetectedUrl = () => {
  try {
    // Expo 開發時會提供 hostUri (例如: 10.0.0.160:8081)
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const host = hostUri.split(':')[0];
      return `http://${host}:3000`;
    }
  } catch (error) {
    console.warn('無法自動偵測 IP:', error);
  }
  return null;
};

// Fallback 配置
const FALLBACK_CONFIG = {
  development: {
    ios: 'http://localhost:3000',
    android: 'http://10.0.2.2:3000', // Android 模擬器特殊 IP
    default: 'http://localhost:3000',
  },
  production: {
    ios: 'https://your-api-domain.com',
    android: 'https://your-api-domain.com',
    default: 'https://your-api-domain.com',
  },
};

// 取得 API Base URL
export const getApiUrl = () => {
  // 1. 優先使用環境變數
  if (ENV_API_URL) {
    console.log('📡 使用環境變數 API URL:', ENV_API_URL);
    return ENV_API_URL;
  }

  // 2. 開發模式下嘗試自動偵測
  if (__DEV__) {
    const autoUrl = getAutoDetectedUrl();
    if (autoUrl) {
      console.log('📡 自動偵測 API URL:', autoUrl);
      return autoUrl;
    }
  }

  // 3. 使用 Fallback
  const env = __DEV__ ? 'development' : 'production';
  const config = FALLBACK_CONFIG[env];
  const fallbackUrl = Platform.select({
    ios: config.ios,
    android: config.android,
    default: config.default,
  });
  
  console.log('📡 使用 Fallback API URL:', fallbackUrl);
  return fallbackUrl;
};

export const API_BASE_URL = getApiUrl();

// API 端點
export const API_ENDPOINTS = {
  // 文章相關
  NEWS: '/api/news',
  NEWS_BY_ID: (id) => `/api/news/${id}`,
  
  // 使用者相關
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  PROFILE: '/api/user/profile',
  
  // 搜尋
  SEARCH: '/api/news/search',
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  getApiUrl,
};
