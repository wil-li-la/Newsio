import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { supabase } from '../lib/supabase';

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
  async (config) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error('Failed to attach auth token:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
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
  },
);

// API 服務
export const apiService = {
  // 取得所有文章
  getArticles: async () => {
    const response = await apiClient.get(API_ENDPOINTS.NEWS);
    return response.data; // Backend 返回 { success, count, data }
  },

  // 直接從 Supabase 取得摘要新聞
  getSummarizedArticles: async ({ limit = 30, excludeIds = [] } = {}) => {
    let query = supabase
      .from('news_article')
      .select('*')
      .order('timestamp', { ascending: false });

    const sanitizedExclude = (excludeIds || []).filter(Boolean);
    if (sanitizedExclude.length) {
      const formattedList = sanitizedExclude
        .map((value) => `"${String(value).replace(/"/g, '\\"')}"`)
        .join(',');

      query = query.not('article_id', 'in', `(${formattedList})`);
    }

    const { data, error } = await query.limit(limit);

    if (error) {
      console.error('Supabase: failed to fetch news_article', error);
      throw error;
    }

    const extractLabels = (value) => {
      if (!value) {
        return [];
      }
      if (typeof value === 'string') {
        return [value];
      }
      if (Array.isArray(value)) {
        return value.flatMap((item) => extractLabels(item));
      }
      if (typeof value === 'object') {
        return Object.values(value).flatMap((item) => extractLabels(item));
      }
      return [];
    };

    const normalizeImageUrl = (value) => {
      if (!value) {
        return null;
      }
      if (typeof value === 'string') {
        return value;
      }
      if (Array.isArray(value)) {
        const [first] = value;
        if (!first) {
          return null;
        }
        if (typeof first === 'string') {
          return first;
        }
        if (typeof first === 'object') {
          return first?.url || first?.src || null;
        }
      }
      if (typeof value === 'object') {
        return value?.url || value?.src || null;
      }
      return null;
    };

    return (data || []).map((item) => ({
      id: item.article_id ?? item.articleId ?? item.id,
      title: item.title,
      description: item.description,
      structuredSummary: item.structuredSummary ?? item.structured_summary,
      url: item.url,
      imageUrl: normalizeImageUrl(
        item.imageUrl ?? item.image_url ?? item.imageurl,
      ),
      source: item.source ?? item.publisher ?? 'Unknown source',
      labels: extractLabels(item.labels),
      publishedAt:
        item.publishedAt ?? item.published_at ?? item.timestamp ?? null,
    }));
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

};

export default apiService;
