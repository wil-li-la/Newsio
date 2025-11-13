// ==========================================
// 工具函數
// ==========================================

import { CONFIG } from "./config.ts";

export function decodeHtmlEntities(text: string): string {
  if (!text) return text;

  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&#8217;": "'",
    "&#8216;": "'",
    "&#8220;": '"',
    "&#8221;": '"',
    "&#8211;": "–",
    "&#8212;": "—",
    "&#8230;": "…",
    "&nbsp;": " ",
    "&ndash;": "–",
    "&mdash;": "—",
    "&ldquo;": '"',
    "&rdquo;": '"',
    "&lsquo;": "'",
    "&rsquo;": "'",
    "&hellip;": "…",
  };

  let decoded = text;

  // Handle multiple levels of encoding
  for (let i = 0; i < 3; i++) {
    let changed = false;
    for (const [entity, char] of Object.entries(entities)) {
      const before = decoded;
      decoded = decoded.replace(new RegExp(entity, "g"), char);
      if (decoded !== before) changed = true;
    }
    if (!changed) break;
  }

  return decoded.trim();
}

export function extractImageFromHtml(html: string): string | null {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] || null;
}

export async function fetchWithTimeout(
  url: string,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": CONFIG.USER_AGENT,
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// 工具函數：分批處理陣列
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// 工具函數：延遲執行
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
