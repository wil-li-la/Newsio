// ==========================================
// 型別定義
// ==========================================

export interface RssArticle {
  article_id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  image_url: string | null;
  source: string;
  category: string;
  published_at: string;
}

export interface ProcessingResult {
  processed: number;
  stored: number;
  skipped: number;
  errors: string[];
}

export interface FeedSource {
  url: string;
  name: string;
  type: 'standard' | 'hackernews';
  category?: string;
  priority: number; // 1=高優先級, 2=中優先級, 3=低優先級
}

export interface HackerNewsData {
  specialLabels: string[];
  isDiscussion: boolean;
  isShowcase: boolean;
}
