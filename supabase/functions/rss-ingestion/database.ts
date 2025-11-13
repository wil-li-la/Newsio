// ==========================================
// 資料庫操作
// ==========================================

import type { RssArticle } from "./types.ts";

export async function getOrCreateSource(
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

export async function storeArticle(
  supabase: any,
  article: RssArticle,
  labels: string[]
): Promise<boolean> {
  try {
    // Get or create source_id
    const sourceId = await getOrCreateSource(supabase, article.source);

    // Upsert article - 如果 original_url 已存在則跳過，否則插入
    const { data, error } = await supabase
      .from("articles")
      .upsert(
        {
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
        },
        {
          onConflict: "original_url", // 基於 original_url 的唯一約束
          ignoreDuplicates: true, // 如果已存在則忽略
        }
      )
      .select();

    if (error) {
      // 如果是重複錯誤，視為正常情況
      if (error.code === "23505") {
        console.log("⏭️  Article already exists:", article.url);
        return false;
      }
      console.error("Error storing article:", error);
      return false;
    }

    // 檢查是否實際插入了新資料
    if (!data || data.length === 0) {
      console.log("⏭️  Article already exists:", article.url);
      return false;
    }

    console.log("✅ Article stored successfully:", article.title);
    return true;
  } catch (error) {
    console.error("Failed to store article:", error);
    return false;
  }
}
