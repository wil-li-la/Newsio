import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Parser from "npm:rss-parser@3.13.0";

// ==========================================
// 型別定義
// ==========================================
interface RssArticle {
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

interface ProcessingResult {
  processed: number;
  stored: number;
  skipped: number;
  errors: string[];
}

// ==========================================
// 配置區
// ==========================================

// 資料源配置
interface FeedSource {
  url: string;
  name: string;
  type: 'standard' | 'hackernews';
  category?: string;
  priority: number; // 1=高優先級, 2=中優先級, 3=低優先級
}

const RSS_FEEDS: FeedSource[] = [
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

const LABEL_KEYWORDS: Record<string, string> = {
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

const CATEGORY_RULES: Record<string, Record<string, string> | string> = {
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

const CONFIG = {
  MAX_ARTICLES_PER_FEED: 30, // 減少每個源的文章數量
  IMAGE_FETCH_TIMEOUT: 2000, // 減少圖片獲取超時
  REQUEST_TIMEOUT: 5000,
  USER_AGENT: "Newsio-EdgeFunction/1.0",
  BATCH_SIZE: 2, // 每批處理的源數量
  BATCH_DELAY: 1500, // 批次間延遲 (毫秒)
  MAX_CONCURRENT_IMAGES: 3, // 最大並發圖片請求
};

// ==========================================
// 工具函數
// ==========================================
function decodeHtmlEntities(text: string): string {
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

function extractLabels(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const found: string[] = [];

  for (const [keyword, label] of Object.entries(LABEL_KEYWORDS)) {
    if (text.includes(keyword)) {
      found.push(label);
    }
  }

  return [...new Set(found)];
}

function inferCategory(entry: any, source: FeedSource): string {
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
function processHackerNewsEntry(entry: any, source: FeedSource) {
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

function extractImageFromHtml(html: string): string | null {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] || null;
}

async function fetchWithTimeout(
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

async function getImageUrl(entry: any, source: FeedSource): Promise<string | null> {
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

// 工具函數：分批處理陣列
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// 工具函數：延遲執行
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// 資料庫操作
// ==========================================
async function getOrCreateSource(
  supabase: any,
  sourceName: string
): Promise<string | null> {
  try {
    // Check if source already exists
    const { data: existing, error: selectError } = await supabase
      .from("sources")
      .select("source_id")
      .eq("name", sourceName)
      .maybeSingle();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Error checking source:", selectError);
      return null;
    }

    if (existing) {
      return existing.source_id;
    }

    // Create new source
    const { data: newSource, error: insertError } = await supabase
      .from("sources")
      .insert({ name: sourceName })
      .select("source_id")
      .single();

    if (insertError) {
      console.error("Error creating source:", insertError);
      return null;
    }

    console.log(`✅ Created new source: ${sourceName}`);
    return newSource.source_id;
  } catch (error) {
    console.error("Failed to get or create source:", error);
    return null;
  }
}

async function checkArticleExists(
  supabase: any,
  url: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("articles")
    .select("article_id")
    .eq("original_url", url)
    .maybeSingle();

  if (error) {
    console.error("Error checking article existence:", error);
    return false;
  }

  return !!data;
}

async function storeArticle(
  supabase: any,
  article: RssArticle,
  labels: string[]
): Promise<boolean> {
  try {
    // Check if article already exists (using original_url)
    const exists = await checkArticleExists(supabase, article.url);
    if (exists) {
      console.log("Article already exists:", article.url);
      return false;
    }

    // Get or create source_id
    const sourceId = await getOrCreateSource(supabase, article.source);

    // Insert article with all fields
    const { error } = await supabase.from("articles").insert({
      original_url: article.url,
      title: article.title,
      description: article.description,
      ai_summary: article.content,
      image_url: article.image_url,
      category: article.category,
      labels: labels, // JSONB array
      published_at: article.published_at,
      source_id: sourceId,
      credibility_status: "pending",
      view_count: 0,
      like_count: 0,
      dislike_count: 0,
      collection_count: 0,
      share_count: 0,
    });

    if (error) {
      console.error("Error storing article:", error);
      return false;
    }

    console.log("✅ Article stored successfully:", article.title);
    return true;
  } catch (error) {
    console.error("Failed to store article:", error);
    return false;
  }
}

// ==========================================
// 主處理流程
// ==========================================
// 處理單個資料源
async function processSingleSource(source: FeedSource, supabase: any): Promise<{
  processed: number;
  stored: number;
  skipped: number;
  errors: string[];
}> {
  const result = {
    processed: 0,
    stored: 0,
    skipped: 0,
    errors: []
  };

  try {
    console.log(`🔄 Processing ${source.name} (${source.type})`);
    const startTime = Date.now();
    
    const parser = new Parser();
    const feed = await parser.parseURL(source.url);
    const items = (feed.items || []).slice(0, CONFIG.MAX_ARTICLES_PER_FEED);

    console.log(`📥 Found ${items.length} items from ${source.name}`);

    // 處理每個文章項目
    for (const item of items) {
      result.processed++;

      try {
        // Hacker News 特殊處理
        const hnData = source.type === 'hackernews' ? 
          processHackerNewsEntry(item, source) : null;

        // 提取圖片 (根據優先級決定是否獲取)
        const imageUrl = await getImageUrl(item, source);

        // 對於低優先級源，如果沒有圖片就跳過
        if (source.priority >= 3 && (!imageUrl || !imageUrl.startsWith("http"))) {
          console.log(`⏭️  Skipping low-priority article without image: ${item.title?.substring(0, 50)}...`);
          result.skipped++;
          continue;
        }

        // 解碼文本
        const title = decodeHtmlEntities(item.title || "Untitled");
        const description = decodeHtmlEntities(
          item.contentSnippet || item.summary || item.description || ""
        );

        // 提取標籤
        let labels = extractLabels(title, description);
        
        // 添加 Hacker News 特殊標籤
        if (hnData?.specialLabels) {
          labels = [...labels, ...hnData.specialLabels];
        }

        // 推斷分類
        const category = inferCategory(item, source);

        // 構建文章對象
        const article: RssArticle = {
          article_id:
            item.guid ||
            item.id ||
            item.link ||
            `${source.url}#${title}`,
          title,
          description: description.substring(0, 500),
          content: description.substring(0, 1000),
          url: item.link || source.url,
          image_url: imageUrl,
          source: source.name,
          category,
          published_at:
            item.isoDate || item.pubDate || new Date().toISOString(),
        };

        // 存儲文章
        const stored = await storeArticle(supabase, article, labels);
        if (stored) {
          result.stored++;
        } else {
          result.skipped++;
        }
      } catch (itemError: any) {
        console.error(`❌ Error processing item from ${source.name}:`, itemError.message);
        result.errors.push(`${source.name} - Item: ${itemError.message}`);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Completed ${source.name} in ${duration}ms - Processed: ${result.processed}, Stored: ${result.stored}, Skipped: ${result.skipped}`);

  } catch (feedError: any) {
    console.error(`❌ Error processing feed ${source.name}:`, feedError.message);
    result.errors.push(`${source.name}: ${feedError.message}`);
  }

  return result;
}

// 主處理函數 - 分批處理
async function processRssFeeds(supabase: any): Promise<ProcessingResult> {
  const totalResult: ProcessingResult = {
    processed: 0,
    stored: 0,
    skipped: 0,
    errors: [],
  };

  console.log(`🚀 Starting RSS ingestion with ${RSS_FEEDS.length} sources`);
  const overallStartTime = Date.now();

  // 按優先級排序源
  const sortedSources = [...RSS_FEEDS].sort((a, b) => a.priority - b.priority);
  
  // 分批處理
  const batches = chunkArray(sortedSources, CONFIG.BATCH_SIZE);
  console.log(`📦 Processing ${batches.length} batches of ${CONFIG.BATCH_SIZE} sources each`);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`\n🔄 Processing batch ${i + 1}/${batches.length}`);
    
    // 並行處理批次中的源
    const batchPromises = batch.map(source => processSingleSource(source, supabase));
    const batchResults = await Promise.allSettled(batchPromises);
    
    // 合併結果
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const sourceResult = result.value;
        totalResult.processed += sourceResult.processed;
        totalResult.stored += sourceResult.stored;
        totalResult.skipped += sourceResult.skipped;
        totalResult.errors.push(...sourceResult.errors);
      } else {
        const sourceName = batch[index].name;
        console.error(`❌ Batch processing failed for ${sourceName}:`, result.reason);
        totalResult.errors.push(`${sourceName}: Batch processing failed - ${result.reason}`);
      }
    });
    
    // 批次間延遲 (除了最後一批)
    if (i < batches.length - 1) {
      console.log(`⏳ Waiting ${CONFIG.BATCH_DELAY}ms before next batch...`);
      await sleep(CONFIG.BATCH_DELAY);
    }
  }

  const totalDuration = Date.now() - overallStartTime;
  console.log(`\n🎉 RSS ingestion completed in ${totalDuration}ms`);
  console.log(`📊 Final stats - Processed: ${totalResult.processed}, Stored: ${totalResult.stored}, Skipped: ${totalResult.skipped}, Errors: ${totalResult.errors.length}`);

  return totalResult;
}

// ==========================================
// Edge Function 入口
// ==========================================
Deno.serve(async (_req) => {
  try {
    // Initialize Supabase Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Execute RSS ingestion
    console.log("Starting RSS ingestion...");
    const result = await processRssFeeds(supabase);
    console.log("RSS ingestion completed:", result);

    // Return result
    return new Response(
      JSON.stringify({
        success: true,
        message: "RSS ingestion completed",
        ...result,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Edge Function error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start`
  2. Run `supabase functions serve rss-ingestion`
  3. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/rss-ingestion' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

*/
