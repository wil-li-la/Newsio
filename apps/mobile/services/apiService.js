import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

// 建立 axios 實例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在這裡添加 token
    // const token = await AsyncStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 回應攔截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // 伺服器回應錯誤
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // 請求已發送但沒有收到回應
      console.error('Network Error:', error.request);
    } else {
      // 其他錯誤
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API 服務
export const apiService = {
  // 取得所有文章
  getArticles: async () => {
    const response = await apiClient.get(API_ENDPOINTS.NEWS);
    return response.data; // Backend 返回 { success, count, data }
  },

  // 取得單一文章
  getArticleById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.NEWS_BY_ID(id));
    return response.data;
  },

  // 搜尋文章
  searchArticles: async (query) => {
    const response = await apiClient.post(API_ENDPOINTS.SEARCH, {
      query: query,
    });
    return response.data;
  },

  // 使用者登入
  login: async (email, password) => {
    return apiClient.post(API_ENDPOINTS.LOGIN, {
      email,
      password,
    });
  },

  // 使用者註冊
  register: async (email, password, name) => {
    return apiClient.post(API_ENDPOINTS.REGISTER, {
      email,
      password,
      name,
    });
  },

  // 取得使用者資料
  getProfile: async () => {
    return apiClient.get(API_ENDPOINTS.PROFILE);
  },
};

export default apiService;
