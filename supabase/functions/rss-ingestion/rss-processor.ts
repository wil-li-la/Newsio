// ==========================================
// RSS 處理邏輯
// ==========================================

import Parser from "npm:rss-parser@3.13.0";
import type { FeedSource, RssArticle, ProcessingResult } from "./types.ts";
import { CONFIG } from "./config.ts";
import { decodeHtmlEntities, chunkArray, sleep } from "./utils.ts";
import { 
  extractLabels, 
  inferCategory, 
  processHackerNewsEntry, 
  getImageUrl 
} from "./processors.ts";
import { storeArticle } from "./database.ts";

// 處理單個資料源
export async function processSingleSource(source: FeedSource, supabase: any): Promise<{
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
export async function processRssFeeds(supabase: any): Promise<ProcessingResult> {
  const totalResult: ProcessingResult = {
    processed: 0,
    stored: 0,
    skipped: 0,
    errors: [],
  };

  console.log(`🚀 Starting RSS ingestion with ${CONFIG.BATCH_SIZE} batch size`);
  const overallStartTime = Date.now();

  // 從配置中獲取源並按優先級排序
  const { RSS_FEEDS } = await import("./config.ts");
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
