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
const RSS_FEEDS = [
  "https://www.theverge.com/rss/index.xml",
  "https://feeds.bbci.co.uk/news/rss.xml",
  "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
  "https://techcrunch.com/feed/",
  "https://www.wired.com/feed/rss",
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
  MAX_ARTICLES_PER_FEED: 50,
  IMAGE_FETCH_TIMEOUT: 3000,
  REQUEST_TIMEOUT: 5000,
  USER_AGENT: "Newsio-EdgeFunction/1.0",
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

function inferCategory(entry: any, feedUrl: string): string {
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

async function getImageUrl(entry: any): Promise<string | null> {
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

  // Strategy 4: Fetch og:image from article page
  if (entry.link) {
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
      // Ignore fetch errors
    }
  }

  return null;
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
async function processRssFeeds(supabase: any): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    processed: 0,
    stored: 0,
    skipped: 0,
    errors: [],
  };

  const parser = new Parser();

  for (const feedUrl of RSS_FEEDS) {
    try {
      console.log(`Processing feed: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);

      const items = (feed.items || []).slice(0, CONFIG.MAX_ARTICLES_PER_FEED);

      for (const item of items) {
        result.processed++;

        try {
          // Extract image
          const imageUrl = await getImageUrl(item);

          // Skip articles without valid image (optional)
          if (
            !imageUrl ||
            imageUrl.trim() === "" ||
            !imageUrl.startsWith("http")
          ) {
            console.log("Skipping article without valid image:", item.title);
            result.skipped++;
            continue;
          }

          // Decode text
          const title = decodeHtmlEntities(item.title || "Untitled");
          const description = decodeHtmlEntities(
            item.contentSnippet || item.summary || ""
          );

          // Extract labels
          const labels = extractLabels(title, description);

          // Infer category
          const category = inferCategory(item, feedUrl);

          // Build article object
          const article: RssArticle = {
            article_id:
              item.guid ||
              item.id ||
              item.link ||
              `${feedUrl}#${title}`,
            title,
            description: description.substring(0, 500),
            content: description.substring(0, 1000), // Use as ai_summary
            url: item.link || feedUrl,
            image_url: imageUrl,
            source: feed.title || new URL(feedUrl).hostname,
            category,
            published_at:
              item.isoDate || item.pubDate || new Date().toISOString(),
          };

          // Store article with labels
          const stored = await storeArticle(supabase, article, labels);
          if (stored) {
            result.stored++;
          } else {
            result.skipped++;
          }
        } catch (itemError: any) {
          console.error("Error processing item:", itemError);
          result.errors.push(`Item error: ${itemError.message}`);
        }
      }
    } catch (feedError: any) {
      console.error(`Error processing feed ${feedUrl}:`, feedError);
      result.errors.push(`Feed ${feedUrl}: ${feedError.message}`);
    }
  }

  return result;
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
