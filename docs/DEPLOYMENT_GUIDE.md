# 🚀 資料庫與 RSS Ingestion 部署指南

## ✅ 已完成的更新

### 1. RSS Ingestion 函數更新
- ✅ 新增 `getOrCreateSource()` 函數：自動建立或取得 source_id
- ✅ 更新 `storeArticle()` 函數：儲存完整資料
  - `image_url` - 文章圖片
  - `category` - 分類
  - `labels` - 標籤陣列（JSONB）
  - `description` - 描述
  - `source_id` - 來源 ID（自動建立）

### 2. 資料庫遷移腳本
- ✅ 創建 SQL 遷移檔案：`supabase/migrations/20251109_add_article_fields.sql`

---

## 📋 部署步驟

### 步驟 1: 更新資料庫結構 ⚠️ **需要手動執行**

#### 方法 A：使用 Supabase Dashboard（推薦）

1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇您的專案
3. 點擊左側選單的 **SQL Editor**
4. 點擊 **New Query**
5. 複製貼上以下 SQL：

```sql
-- Add new columns to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS labels JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_articles_published_at 
ON articles(published_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_articles_category 
ON articles(category) WHERE category IS NOT NULL;

-- GIN index for JSONB labels
CREATE INDEX IF NOT EXISTS idx_articles_labels 
ON articles USING GIN (labels);

-- Add comments for documentation
COMMENT ON COLUMN articles.image_url IS 'URL of the article''s featured image';
COMMENT ON COLUMN articles.category IS 'Article category (e.g., Technology, Business, etc.)';
COMMENT ON COLUMN articles.labels IS 'Array of labels/tags in JSONB format';
COMMENT ON COLUMN articles.description IS 'Short description or excerpt of the article';
```

6. 點擊 **Run** 執行 SQL
7. 確認看到成功訊息

#### 方法 B：使用 Supabase CLI（需要 service role key）

```bash
# 如果有 service role key，可以使用 CLI
npx supabase db execute --file supabase/migrations/20251109_add_article_fields.sql
```

#### 驗證資料庫更新

執行以下腳本確認欄位已新增：

```bash
node scripts/update-articles-schema.js
```

應該看到：
```
✅ All columns exist! Schema is up to date.
```

---

### 步驟 2: 部署 RSS Ingestion 函數

RSS ingestion 函數已經更新完成，現在需要部署到 Supabase。

#### 使用 Supabase CLI 部署

```bash
# 部署 RSS ingestion 函數
npx supabase functions deploy rss-ingestion
```

如果遇到登入問題，先執行：
```bash
npx supabase login
```

---

### 步驟 3: 測試 RSS Ingestion

#### 手動觸發 RSS Ingestion

```bash
# 取得您的 Supabase URL 和 anon key
# 從 .env 檔案或 Supabase Dashboard

curl -i --location --request POST 'https://YOUR_PROJECT.supabase.co/functions/v1/rss-ingestion' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json'
```

或使用 Supabase Dashboard：
1. 前往 **Edge Functions**
2. 選擇 `rss-ingestion`
3. 點擊 **Invoke** 測試

#### 檢查結果

執行以下腳本查看新文章：

```bash
node scripts/check-articles.js
```

---

## 🔍 驗證清單

執行以下檢查確保一切正常：

### ✅ 資料庫結構檢查

```bash
node scripts/update-articles-schema.js
```

預期輸出：
```
✅ All columns exist! Schema is up to date.
```

### ✅ 檢查 articles 表格資料

創建檢查腳本：

```javascript
// scripts/check-articles.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function checkArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      article_id,
      title,
      image_url,
      category,
      labels,
      description,
      published_at,
      source_id,
      sources (name)
    `)
    .order('published_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`✅ Found ${data.length} articles\n`);
  data.forEach((article, i) => {
    console.log(`[${i + 1}] ${article.title}`);
    console.log(`    Source: ${article.sources?.name || 'Unknown'}`);
    console.log(`    Category: ${article.category || 'N/A'}`);
    console.log(`    Labels: ${article.labels?.join(', ') || 'None'}`);
    console.log(`    Image: ${article.image_url ? '✅' : '❌'}`);
    console.log(`    Published: ${article.published_at}\n`);
  });
}

checkArticles();
```

執行：
```bash
node scripts/check-articles.js
```

### ✅ 檢查 sources 表格

```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
supabase.from('sources').select('*').then(({ data }) => console.log('Sources:', data));
"
```

---

## 🎯 預期結果

成功部署後，RSS ingestion 應該：

1. ✅ 從 RSS feeds 抓取文章
2. ✅ 自動建立 sources（如果不存在）
3. ✅ 儲存完整的文章資料：
   - 標題、描述、摘要
   - 圖片 URL
   - 分類
   - 標籤陣列
   - 來源 ID
   - 發布時間

---

## 🐛 常見問題排解

### 問題 1: 資料庫欄位不存在

**錯誤訊息**：
```
column "image_url" of relation "articles" does not exist
```

**解決方案**：
確保已執行步驟 1 的 SQL 腳本

### 問題 2: RSS Ingestion 部署失敗

**錯誤訊息**：
```
Error: Not logged in
```

**解決方案**：
```bash
npx supabase login
```

### 問題 3: sources 表格錯誤

**錯誤訊息**：
```
null value in column "name" violates not-null constraint
```

**解決方案**：
這是正常的，`getOrCreateSource` 函數會自動處理

### 問題 4: 沒有新文章被儲存

**檢查步驟**：
1. 確認 RSS feeds 可以訪問
2. 檢查文章是否有圖片（目前會跳過無圖片的文章）
3. 查看 Edge Function 日誌

---

## 📊 監控與維護

### 設定定期執行（可選）

可以使用 Supabase 的 Cron Jobs 或外部服務（如 GitHub Actions）定期觸發 RSS ingestion。

### 查看 Edge Function 日誌

1. 前往 Supabase Dashboard
2. 選擇 **Edge Functions**
3. 選擇 `rss-ingestion`
4. 查看 **Logs** 標籤

---

## ✨ 下一步

資料庫和 RSS ingestion 更新完成後，可以：

1. **測試資料抓取**：手動觸發 RSS ingestion，確認資料正確儲存
2. **更新前端**：修改 `apiService.ts` 使用新的資料結構
3. **驗證顯示**：確認卡片正確顯示圖片、標籤等資訊

---

## 📝 總結

### 已完成 ✅
- RSS ingestion 函數更新
- 資料庫遷移 SQL 腳本準備完成

### 待執行 ⚠️
- 在 Supabase Dashboard 執行 SQL（步驟 1）
- 部署 RSS ingestion 函數（步驟 2）
- 測試並驗證（步驟 3）

### 後續工作 📋
- 更新前端 API 服務（`apiService.ts`）
- 測試完整流程
- 可選：設定定期執行

---

**準備好執行了嗎？** 🚀

請先完成步驟 1（更新資料庫），然後告訴我結果，我們再繼續下一步！
