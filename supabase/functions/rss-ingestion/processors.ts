// ==========================================
// 內容處理器
// ==========================================

import type { FeedSource, HackerNewsData } from "./types.ts";
import { LABEL_KEYWORDS, CATEGORY_RULES, CONFIG } from "./config.ts";
import { extractImageFromHtml, fetchWithTimeout } from "./utils.ts";

export function extractLabels(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const found: string[] = [];

  for (const [keyword, label] of Object.entries(LABEL_KEYWORDS)) {
    if (text.includes(keyword)) {
      found.push(label);
    }
  }

  return [...new Set(found)];
}

export function inferCategory(entry: any, source: FeedSource): string {
  // Hacker News 特殊處理
  if (source.type === 'hackernews') {
    return source.category || 'Technology';
  }

  // 標準 RSS 處理
  const link = entry.link || "";

  for (const [domain, rules] of Object.entries(CATEGORY_RULES)) {
    if (link.includes(domain)) {
      if (typeof rules === "string") {
        return rules;
      }

      for (const [path, category] of Object.entries(rules)) {
        if (link.includes(path)) {
          return category;
        }
      }
    }
  }

  return "General";
}

// Hacker News 特殊處理函數
export function processHackerNewsEntry(entry: any, source: FeedSource): HackerNewsData {
  // HN 的特殊標籤提取
  const title = entry.title || "";
  const hnLabels = [];
  
  // 檢測 Ask HN, Show HN 等
  if (title.toLowerCase().includes('ask hn')) {
    hnLabels.push('Ask HN');
  }
  if (title.toLowerCase().includes('show hn')) {
    hnLabels.push('Show HN');
  }
  if (title.toLowerCase().includes('launch hn')) {
    hnLabels.push('Launch HN');
  }
  
  // 檢測技術關鍵字
  const techKeywords = ['ai', 'ml', 'blockchain', 'crypto', 'startup', 'vc', 'funding'];
  for (const keyword of techKeywords) {
    if (title.toLowerCase().includes(keyword)) {
      hnLabels.push(keyword.toUpperCase());
    }
  }
  
  return {
    specialLabels: hnLabels,
    isDiscussion: title.toLowerCase().includes('ask hn'),
    isShowcase: title.toLowerCase().includes('show hn')
  };
}

export async function getImageUrl(entry: any, source: FeedSource): Promise<string | null> {
  // Strategy 1: RSS enclosure
  if (entry.enclosure?.url) {
    return entry.enclosure.url;
  }

  // Strategy 2: Media content
  if (entry.mediaContent?.[0]?.url) {
    return entry.mediaContent[0].url;
  }

  // Strategy 3: Extract from content HTML
  const content =
    entry.contentEncoded || entry["content:encoded"] || entry.content;
  const htmlImg = extractImageFromHtml(content);
  if (htmlImg) return htmlImg;

  // Strategy 4: Hacker News 特殊處理 - 跳過圖片獲取以提高性能
  if (source.type === 'hackernews') {
    // HN 文章通常沒有圖片，或者圖片獲取成本高，直接返回 null
    return null;
  }

  // Strategy 5: Fetch og:image from article page (僅限高優先級源)
  if (entry.link && source.priority <= 2) {
    try {
      const response = await fetchWithTimeout(
        entry.link,
        CONFIG.IMAGE_FETCH_TIMEOUT
      );
      const html = await response.text();
      const ogMatch = html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
      );
      if (ogMatch?.[1]) return ogMatch[1];
    } catch (_e) {
      // Ignore fetch errors for better performance
    }
  }

  return null;
}
