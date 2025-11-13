// ==========================================
// 配置區
// ==========================================

import type { FeedSource } from "./types.ts";

export const RSS_FEEDS: FeedSource[] = [
  // 高優先級 - 主要新聞源
  {
    url: "https://www.theverge.com/rss/index.xml",
    name: "The Verge",
    type: "standard",
    priority: 1
  },
  {
    url: "https://feeds.bbci.co.uk/news/rss.xml",
    name: "BBC News",
    type: "standard",
    priority: 1
  },
  {
    url: "https://techcrunch.com/feed/",
    name: "TechCrunch",
    type: "standard",
    priority: 1
  },
  
  // 中優先級 - 科技新聞
  {
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
    name: "NYT Technology",
    type: "standard",
    priority: 2
  },
  {
    url: "https://www.wired.com/feed/rss",
    name: "Wired",
    type: "standard",
    priority: 2
  },
  
  // Hacker News 源
  {
    url: "https://hnrss.org/frontpage",
    name: "Hacker News - Front Page",
    type: "hackernews",
    category: "Technology",
    priority: 2
  },
  {
    url: "https://hnrss.org/ask",
    name: "Hacker News - Ask HN",
    type: "hackernews",
    category: "Ask HN",
    priority: 3
  },
  {
    url: "https://hnrss.org/show?points=50",
    name: "Hacker News - Show HN (50+ points)",
    type: "hackernews",
    category: "Show HN",
    priority: 3
  }
];

export const LABEL_KEYWORDS: Record<string, string> = {
  // Tech companies
  openai: "OpenAI",
  chatgpt: "OpenAI",
  gpt: "OpenAI",
  tesla: "Tesla",
  spacex: "SpaceX",
  "elon musk": "Elon Musk",
  apple: "Apple",
  iphone: "Apple",
  meta: "Meta",
  facebook: "Meta",
  google: "Google",
  alphabet: "Google",
  microsoft: "Microsoft",
  amazon: "Amazon",
  netflix: "Netflix",
  nvidia: "NVIDIA",
  // Politics
  trump: "Donald Trump",
  biden: "Joe Biden",
  harris: "Kamala Harris",
  ukraine: "Ukraine War",
  russia: "Russia",
  putin: "Vladimir Putin",
  china: "China",
  "xi jinping": "Xi Jinping",
  // Finance
  bitcoin: "Bitcoin",
  cryptocurrency: "Crypto",
  fed: "Federal Reserve",
  inflation: "Inflation",
  recession: "Economy",
  // Health
  covid: "COVID-19",
  vaccine: "Vaccines",
  fda: "FDA",
  // Climate
  "climate change": "Climate Change",
  "global warming": "Climate Change",
  "renewable energy": "Clean Energy",
};

export const CATEGORY_RULES: Record<string, Record<string, string> | string> = {
  "bbc.co.uk": {
    "/world/": "World",
    "/business/": "Business",
    "/technology/": "Technology",
    "/science/": "Science",
    "/health/": "Health",
    "/sport/": "Sports",
  },
  "nytimes.com": {
    "/world/": "World",
    "/business/": "Business",
    "/technology/": "Technology",
    "/science/": "Science",
    "/health/": "Health",
    "/sports/": "Sports",
    "/politics/": "Politics",
  },
  "theverge.com": "Technology",
};

export const CONFIG = {
  MAX_ARTICLES_PER_FEED: 30, // 減少每個源的文章數量
  IMAGE_FETCH_TIMEOUT: 2000, // 減少圖片獲取超時
  REQUEST_TIMEOUT: 5000,
  USER_AGENT: "Newsio-EdgeFunction/1.0",
  BATCH_SIZE: 2, // 每批處理的源數量
  BATCH_DELAY: 1500, // 批次間延遲 (毫秒)
  MAX_CONCURRENT_IMAGES: 3, // 最大並發圖片請求
};
