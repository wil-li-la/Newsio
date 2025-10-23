import { Platform } from 'react-native';

// API 配置
const API_CONFIG = {
  // 本地開發
  development: {
    // iOS 模擬器使用實際 IP（從 Expo 終端顯示的 IP）
    // 如果 Expo 顯示不同的 IP，請修改此處
    ios: 'http://172.20.10.2:3000',
    // Android 模擬器使用特殊 IP
    android: 'http://10.0.2.2:3000',
    // 實體裝置使用電腦的區域網路 IP（需要修改成你的 IP）
    // 執行 `ipconfig getifaddr en0` 查詢你的 IP
    physical: 'http://172.20.10.2:3000',
  },
  // 生產環境
  production: {
    ios: 'https://your-api-domain.com',
    android: 'https://your-api-domain.com',
    physical: 'https://your-api-domain.com',
  }
};

// 判斷當前環境
const ENV = __DEV__ ? 'development' : 'production';

// 判斷是否為實體裝置（簡化版本，實際可能需要更複雜的判斷）
const isPhysicalDevice = false; // 如果在實體裝置測試，改為 true

// 取得 API Base URL
export const getApiUrl = () => {
  const config = API_CONFIG[ENV];
  
  if (isPhysicalDevice) {
    return config.physical;
  }
  
  return Platform.select({
    ios: config.ios,
    android: config.android,
    default: config.ios,
  });
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
