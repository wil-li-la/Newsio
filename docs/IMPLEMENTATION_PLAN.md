# 實作方案：從 newstable 遷移到 articles

## ✅ 已完成的後端更新

### 資料庫結構 ✅
- ✅ `image_url` 欄位已新增
- ✅ `category` 欄位已新增
- ✅ `labels` 欄位已新增（JSONB）
- ✅ `description` 欄位已新增
- ✅ 索引已建立

### RSS Ingestion 函數 ✅
- ✅ 已更新為儲存完整資料（圖片、分類、標籤、描述）
- ✅ 自動建立 sources
- ✅ 目前資料庫有 **108 篇文章**，100% 有圖片和分類

---

## 🎯 前端更新方案

現在只需要更新前端程式碼來使用新的資料結構：

---

## 方案：更新前端 API 服務（推薦執行）

### 優點
- ⏱️ 實作時間：15 分鐘
- ✅ 完整功能（圖片、標籤、分類）
- ✅ 資料庫已準備好，無需額外設定
- 🔧 改動最小，只需修改 `apiService.ts`
- 🔄 容易回滾

### 需要修改的檔案
1. `/apps/mobile/services/apiService.ts` - 修改查詢邏輯和資料映射

### 程式碼變更

#### 1. 修改 `apiService.ts`

```typescript
// 修改前（使用 newstable）
const { data, error } = await supabase
  .from('newstable')
  .select(...)

// 修改後（使用 articles，包含所有欄位）
const { data, error } = await supabase
  .from('articles')
  .select(`
    article_id,
    title,
    description,
    ai_summary,
    original_url,
    image_url,
    category,
    labels,
    published_at,
    source_id,
    sources (
      name
    )
  `)
  .order('published_at', { ascending: false, nullsFirst: false })
  .limit(fetchLimit);
```

#### 2. 更新資料映射

```typescript
// 新的 SupabaseArticleRow 型別（包含所有欄位）
type SupabaseArticleRow = {
  article_id: string;
  title: string | null;
  description: string | null;
  ai_summary: string | null;
  original_url: string | null;
  image_url: string | null;
  category: string | null;
  labels: string[] | null;
  published_at: string | null;
  source_id: string | null;
  sources: {
    name: string;
  } | null;
};

// 新的映射邏輯（完整功能）
.map<NewsArticle>((row) => ({
  id: row.article_id,
  title: row.title ?? undefined,
  description: row.description ?? row.ai_summary ?? undefined,
  structuredSummary: row.ai_summary ?? undefined,
  url: row.original_url ?? undefined,
  imageUrl: row.image_url ?? undefined, // ✅ 顯示圖片
  source: row.sources?.name ?? 'Unknown',
  category: row.category ?? undefined, // ✅ 顯示分類
  publishedAt: row.published_at ?? undefined,
  timestamp: row.published_at ?? undefined,
  labels: Array.isArray(row.labels) ? row.labels : [], // ✅ 顯示標籤
}));
```

---

## 📊 當前資料庫狀態

### Articles 表格結構
```sql
-- ✅ 已完成的欄位
article_id          UUID PRIMARY KEY
original_url        TEXT
title               TEXT
description         TEXT          -- ✅ 已新增
ai_summary          TEXT
image_url           TEXT          -- ✅ 已新增
category            TEXT          -- ✅ 已新增
labels              JSONB         -- ✅ 已新增
published_at        TIMESTAMP
source_id           UUID
author_id           UUID
credibility_status  TEXT
view_count          INTEGER
like_count          INTEGER
dislike_count       INTEGER
collection_count    INTEGER
share_count         INTEGER
```

### 資料統計
- 📊 總文章數：**108 篇**
- 🖼️ 有圖片：**100%**
- 📁 有分類：**100%**
- 🏷️ 有標籤：**0%** (BBC News 文章較少關鍵字匹配)

---

## 🚀 執行步驟

### 步驟 1: 更新 apiService.ts

修改 `/apps/mobile/services/apiService.ts` 檔案：

#### 1.1 更新型別定義

```typescript
type SupabaseArticleRow = {
  article_id: string;
  title: string | null;
  description: string | null;
  ai_summary: string | null;
  original_url: string | null;
  image_url: string | null;
  category: string | null;
  labels: string[] | null;
  published_at: string | null;
  source_id: string | null;
  sources: {
    name: string;
  } | null;
};
```

#### 1.2 更新查詢語句

將 `from('newstable')` 改為 `from('articles')`，並更新欄位選擇：

```typescript
const { data, error } = await supabase
  .from('articles')  // ✅ 改為 articles
  .select(`
    article_id,
    title,
    description,      // ✅ 新增
    ai_summary,
    original_url,     // ✅ 改名
    image_url,        // ✅ 新增
    category,         // ✅ 新增
    labels,           // ✅ 新增
    published_at,
    source_id,
    sources (
      name
    )
  `)
  .order('published_at', { ascending: false, nullsFirst: false })
  .limit(fetchLimit);
```

#### 1.3 更新資料映射

```typescript
return rows
  .filter((row) => !excludeSet.has(row.article_id))
  .slice(0, limit)
  .map<NewsArticle>((row) => ({
    id: row.article_id,
    title: row.title ?? undefined,
    description: row.description ?? row.ai_summary ?? undefined,
    structuredSummary: row.ai_summary ?? undefined,
    url: row.original_url ?? undefined,        // ✅ 改名
    imageUrl: row.image_url ?? undefined,      // ✅ 新增
    source: row.sources?.name ?? 'Unknown',
    category: row.category ?? undefined,       // ✅ 新增
    publishedAt: row.published_at ?? undefined,
    timestamp: row.published_at ?? undefined,
    labels: Array.isArray(row.labels) ? row.labels : [],  // ✅ 新增
  }));
```

### 步驟 2: 測試

執行以下指令測試：

```bash
# 啟動 mobile app
cd apps/mobile
npm start
```

### 步驟 3: 驗證

確認以下功能正常：
- ✅ 文章列表正常載入
- ✅ 圖片正常顯示
- ✅ 標籤正常顯示（如果有）
- ✅ 來源名稱正常顯示
- ✅ 滑動功能正常

---

## 📋 執行檢查清單

- [x] 資料庫結構已更新（image_url, category, labels, description）
- [x] RSS Ingestion 函數已更新
- [x] 資料庫有 108 篇測試文章
- [ ] 更新 apiService.ts
- [ ] 測試 mobile app
- [ ] 驗證所有功能正常

---

## 🎯 預期結果

更新完成後，您的 app 將：
- ✅ 顯示完整的文章資訊（標題、描述、摘要）
- ✅ 顯示文章圖片（100% 的文章都有圖片）
- ✅ 顯示文章分類（Technology, General 等）
- ✅ 顯示標籤（如果文章有標籤）
- ✅ 顯示來源名稱（BBC News, WIRED 等）

---

## 🔄 回滾方案

如果遇到問題，可以快速回滾：

1. 將 `apiService.ts` 中的 `from('articles')` 改回 `from('newstable')`
2. 恢復原本的欄位選擇和映射邏輯

---

## 📞 需要協助？

如果您需要我協助執行步驟 1（更新 apiService.ts），請告訴我，我會立即幫您修改！
