# 從 newstable 遷移到 articles 表格 - 分析與實作方案

## 📊 表格結構比較

### newstable 表格欄位
```
- article_id: string (主鍵)
- title: string
- description: string
- structuredSummary: string (AI 生成的摘要)
- imageUrl: string (圖片 URL)
- source: string (來源名稱，如 "The Verge")
- category: string (分類，如 "Technology")
- labels: array (標籤陣列)
- publishedAt: timestamp (發布時間)
- timestamp: timestamp (系統時間戳)
- url: string (原文連結)
```

### articles 表格欄位
```
- article_id: string (UUID 主鍵)
- title: string
- original_url: string (原文連結)
- ai_summary: string (AI 生成的摘要)
- credibility_status: string (可信度狀態)
- published_at: timestamp (發布時間)
- author_id: uuid (作者 ID，外鍵)
- source_id: uuid (來源 ID，外鍵)
- view_count: number (瀏覽數)
- like_count: number (按讚數)
- dislike_count: number (不喜歡數)
- collection_count: number (收藏數)
- share_count: number (分享數)
```

## 🔍 欄位對應分析

| newstable 欄位 | articles 對應 | 狀態 | 解決方案 |
|---------------|--------------|------|---------|
| `article_id` | `article_id` | ✅ 直接對應 | 直接使用 |
| `title` | `title` | ✅ 直接對應 | 直接使用 |
| `url` | `original_url` | ✅ 直接對應 | 欄位名稱改變 |
| `structuredSummary` | `ai_summary` | ✅ 直接對應 | 欄位名稱改變 |
| `publishedAt` | `published_at` | ✅ 直接對應 | 欄位名稱改變 |
| `description` | ❌ 不存在 | ⚠️ 缺失 | 可用 `ai_summary` 替代 |
| `imageUrl` | ❌ 不存在 | ⚠️ 缺失 | 需要額外處理（見下方方案） |
| `source` | `source_id` | ⚠️ 需要 JOIN | 需要關聯 `sources` 表格 |
| `category` | ❌ 不存在 | ⚠️ 缺失 | 需要額外處理（見下方方案） |
| `labels` | ❌ 不存在 | ⚠️ 缺失 | 需要額外處理（見下方方案） |
| `timestamp` | ❌ 不存在 | ⚠️ 缺失 | 可用 `published_at` 替代 |

## 🎯 卡片內容需求分析

根據 `ArticleCard.tsx` 組件，卡片需要以下資料：

### 必要欄位
1. **title** - 文章標題 ✅
2. **source** - 來源名稱（顯示在卡片頂部）⚠️
3. **publishedAt** - 發布時間（格式化顯示）✅
4. **structuredSummary / description** - 摘要內容 ✅
5. **url** - 原文連結（Open 按鈕）✅

### 選用欄位
6. **imageUrl** - 文章圖片 ⚠️
7. **labels** - 標籤陣列（顯示為標籤 chips）⚠️

## 🚨 主要問題

### 問題 1: imageUrl 缺失
**影響**: 卡片無法顯示圖片，影響視覺體驗

**可能解決方案**:
- **方案 A**: 在 `articles` 表格新增 `image_url` 欄位
- **方案 B**: 建立 `article_media` 關聯表格
- **方案 C**: 從原文 URL 動態抓取（效能較差）
- **方案 D**: 暫時不顯示圖片，使用佔位符

### 問題 2: source 需要 JOIN
**影響**: 需要額外查詢才能取得來源名稱

**解決方案**:
- 使用 Supabase 的 JOIN 語法：`.select('*, sources(name)')`
- 目前 `sources` 表格為空，需要先填充資料

### 問題 3: labels 和 category 缺失
**影響**: 無法顯示標籤和分類

**可能解決方案**:
- **方案 A**: 建立 `tags` 和 `article_tags` 關聯表格
- **方案 B**: 在 `articles` 表格新增 `labels` JSONB 欄位
- **方案 C**: 暫時不顯示標籤

## 💡 推薦實作方案

### 階段一：最小可行方案（MVP）
**目標**: 快速遷移，保持基本功能

```typescript
// 修改 apiService.ts
const { data, error } = await supabase
  .from('articles')
  .select(`
    article_id,
    title,
    ai_summary,
    original_url,
    published_at,
    source_id,
    sources (
      name
    )
  `)
  .order('published_at', { ascending: false })
  .limit(fetchLimit);

// 資料映射
{
  id: row.article_id,
  title: row.title,
  description: row.ai_summary,  // 使用 ai_summary 替代
  structuredSummary: row.ai_summary,
  url: row.original_url,
  imageUrl: undefined,  // 暫時不顯示圖片
  source: row.sources?.name || 'Unknown',  // 從 JOIN 取得
  category: undefined,  // 暫時不顯示分類
  publishedAt: row.published_at,
  timestamp: row.published_at,
  labels: [],  // 暫時空陣列
}
```

**優點**:
- ✅ 快速實作，改動最小
- ✅ 保持核心功能（標題、摘要、來源、時間）
- ✅ 不需要修改資料庫結構

**缺點**:
- ❌ 無圖片顯示
- ❌ 無標籤顯示
- ❌ 需要確保 `sources` 表格有資料

### 階段二：完整方案（推薦）
**目標**: 完整功能，更好的用戶體驗

#### 2.1 資料庫結構調整

```sql
-- 1. 在 articles 表格新增欄位
ALTER TABLE articles 
ADD COLUMN image_url TEXT,
ADD COLUMN category TEXT,
ADD COLUMN labels JSONB DEFAULT '[]'::jsonb;

-- 2. 建立索引以提升查詢效能
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_category ON articles(category);
```

#### 2.2 資料遷移腳本

```javascript
// 從 newstable 遷移資料到 articles
// 包含圖片、分類、標籤等資訊
```

#### 2.3 API 服務更新

```typescript
const { data, error } = await supabase
  .from('articles')
  .select(`
    article_id,
    title,
    ai_summary,
    original_url,
    published_at,
    image_url,
    category,
    labels,
    source_id,
    sources (
      name
    )
  `)
  .order('published_at', { ascending: false })
  .limit(fetchLimit);
```

**優點**:
- ✅ 完整功能支援
- ✅ 更好的資料結構
- ✅ 為未來功能擴展做準備

**缺點**:
- ❌ 需要修改資料庫結構
- ❌ 需要資料遷移
- ❌ 實作時間較長

## 📝 實作步驟建議

### 選項 A: 最小可行方案（1-2 小時）

1. **修改 `apiService.ts`**
   - 將查詢從 `newstable` 改為 `articles`
   - 更新欄位映射
   - 加入 `sources` JOIN

2. **確保 sources 表格有資料**
   - 檢查現有文章的來源
   - 填充 `sources` 表格

3. **測試**
   - 確認卡片正常顯示
   - 確認滑動功能正常

### 選項 B: 完整方案（4-6 小時）

1. **資料庫遷移**
   - 在 `articles` 新增欄位
   - 建立索引

2. **資料遷移腳本**
   - 從 `newstable` 複製資料到 `articles`
   - 處理 source 對應關係

3. **更新 API 服務**
   - 修改查詢語句
   - 更新資料映射

4. **測試與驗證**
   - 功能測試
   - 效能測試

## 🎯 建議

**我推薦先採用「階段一：最小可行方案」**，原因如下：

1. ✅ 快速驗證 `articles` 表格是否適用
2. ✅ 降低風險，可以快速回滾
3. ✅ 保持核心功能運作
4. ✅ 之後可以逐步優化

**後續優化方向**：
- 根據實際使用情況決定是否需要圖片
- 評估標籤功能的重要性
- 考慮建立完整的關聯表格結構

## 🔧 需要確認的問題

1. **sources 表格是否已有資料？** 如果沒有，需要先填充
2. **是否需要保留 newstable 表格？** 作為備份或並行使用
3. **圖片功能的重要性？** 決定是否需要在階段一就處理
4. **是否有其他功能依賴 newstable？** 確保不會影響其他功能
