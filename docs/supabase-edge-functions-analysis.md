# Supabase Edge Functions 功能須知與 RSS Ingestion 重構分析

## 目錄
1. [Supabase Edge Functions 概述](#supabase-edge-functions-概述)
2. [Edge Functions 限制與約束](#edge-functions-限制與約束)
3. [最佳實踐與開發須知](#最佳實踐與開發須知)
4. [當前 RSS Ingestion 分析](#當前-rss-ingestion-分析)
5. [重構建議與方案](#重構建議與方案)
6. [實施計劃](#實施計劃)

---

## Supabase Edge Functions 概述

### 什麼是 Edge Functions
Supabase Edge Functions 是基於 Deno 運行時的全球分布式 TypeScript 函數，運行在靠近用戶的邊緣節點上。主要特點：

- **全球分布**: 低延遲執行
- **TypeScript 優先**: 原生支持 TypeScript 和 WASM
- **Deno 運行時**: 開源、可移植
- **無服務器**: 自動擴展和管理

### 運行架構
1. **請求進入邊緣網關** - 處理路由、認證、JWT 驗證
2. **應用認證和策略** - 安全檢查和速率限制
3. **邊緣運行時執行** - 在最近的節點執行函數
4. **整合和數據訪問** - 調用 Supabase APIs 或第三方服務
5. **可觀測性和日誌** - 記錄執行指標
6. **響應返回** - 通過網關返回結果

---

## Edge Functions 限制與約束

### 運行時限制

#### 內存和時間限制
- **最大內存**: 256MB
- **最大執行時間 (Wall Clock)**:
  - 免費計劃: 150秒
  - 付費計劃: 400秒
- **最大 CPU 時間**: 2秒 (實際 CPU 使用時間，不包括 I/O 等待)
- **請求空閒超時**: 150秒 (未響應則返回 504)

#### 函數大小和數量限制
- **最大函數大小**: 20MB (打包後)
- **每項目函數數量**:
  - 免費: 100個
  - Pro: 500個
  - Team: 1000個
  - Enterprise: 無限制

#### 日誌限制
- **最大日誌消息長度**: 10,000 字符
- **日誌事件閾值**: 每 10 秒 100 個事件

### 網絡和功能限制

#### 網絡限制
- **禁用端口**: 25 和 587 (SMTP)
- **HTML 內容**: 僅支持自定義域名 (否則 `text/html` 會被重寫為 `text/plain`)

#### 不支持的功能
- **Web Worker API** 或 Node vm API
- **靜態文件部署**: 需要使用 Docker CLI
- **多線程庫**: 如 libvips、sharp 等

### 冷啟動考慮
- Edge Functions 可能遇到冷啟動
- 設計時應考慮短期、冪等操作
- 長時間運行的任務應移至背景工作器

---

## 最佳實踐與開發須知

### 數據庫連接策略

#### 推薦方式: supabase-js 客戶端
```typescript
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '',
  {
    global: {
      headers: { Authorization: req.headers.get('Authorization')! }
    }
  }
)
```

**優點**:
- 自動 Row Level Security 執行
- 內建 JSON 序列化
- 一致的錯誤處理
- TypeScript 支持

#### 直接 Postgres 連接
```typescript
import { Pool } from 'https://deno.land/x/postgres@v0.17.0/mod.ts'

const pool = new Pool({
  tls: { enabled: false },
  database: 'postgres',
  hostname: Deno.env.get('DB_HOSTNAME'),
  user: Deno.env.get('DB_USER'),
  port: 6543,
  password: Deno.env.get('DB_PASSWORD'),
}, 1)
```

### 安全和配置
- **環境變數**: 使用 Supabase 項目密鑰管理
- **認證**: 通過 JWT 和 RLS 策略
- **CORS**: 需要明確設置 CORS 標頭

### 適用場景
- 需要低延遲的認證或公開 HTTP 端點
- Webhook 接收器 (Stripe、GitHub 等)
- 按需圖像或 Open Graph 生成
- 小型 AI 推理任務
- 發送交易郵件
- 消息機器人 (Slack、Discord 等)

---

## 當前 RSS Ingestion 分析

### 功能概述
當前的 RSS Ingestion Edge Function 主要功能：
1. 解析多個 RSS 源 (The Verge, BBC, NYT, TechCrunch, Wired)
2. 提取文章元數據和圖片
3. 自動分類和標籤化
4. 存儲到 Supabase 數據庫
5. 去重處理

### 當前實現的問題分析

#### 1. **性能和超時風險** ⚠️
- **問題**: 處理 5 個 RSS 源，每個最多 50 篇文章 (總計 250 篇)
- **風險**: 可能超過 400 秒的 wall clock 限制
- **影響**: 函數可能在處理完成前被終止

#### 2. **圖片獲取策略效率低** ⚠️
- **問題**: 為每篇文章發起 HTTP 請求獲取 og:image
- **風險**: 網絡 I/O 密集，增加執行時間
- **影響**: 可能導致超時或資源耗盡

#### 3. **錯誤處理不完善** ⚠️
- **問題**: 單個文章失敗可能影響整體處理
- **風險**: 部分數據丟失
- **影響**: 用戶體驗和數據完整性

#### 4. **內存使用未優化** ⚠️
- **問題**: 同時處理所有文章數據
- **風險**: 可能超過 256MB 內存限制
- **影響**: 函數崩潰或性能下降

#### 5. **缺乏進度追蹤** ⚠️
- **問題**: 無法知道處理進度
- **風險**: 調試困難
- **影響**: 運維和監控困難

### 當前實現的優點
- ✅ 使用 supabase-js 客戶端 (符合最佳實踐)
- ✅ 良好的錯誤處理結構
- ✅ 合理的數據模型設計
- ✅ HTML 實體解碼處理
- ✅ 去重邏輯完善

---

## 重構建議與方案

### 方案 1: 分批處理優化 (推薦)

#### 核心改進
1. **分批處理**: 將 RSS 源分批處理，避免超時
2. **異步優化**: 使用 Promise.allSettled 並行處理
3. **內存管理**: 流式處理，避免大量數據同時載入
4. **錯誤恢復**: 單個失敗不影響整體

#### 實現策略
```typescript
// 分批處理 RSS 源
const BATCH_SIZE = 2; // 每批處理 2 個源
const batches = chunkArray(RSS_FEEDS, BATCH_SIZE);

for (const batch of batches) {
  const promises = batch.map(feedUrl => processSingleFeed(feedUrl));
  const results = await Promise.allSettled(promises);
  // 處理結果
}
```

#### 優點
- 降低超時風險
- 提高錯誤容忍度
- 更好的資源管理
- 保持現有架構

#### 缺點
- 總執行時間可能更長
- 需要更複雜的狀態管理

### 方案 2: 微服務拆分

#### 核心改進
1. **RSS 解析服務**: 專門解析 RSS 並提取基本信息
2. **圖片處理服務**: 異步處理圖片獲取和優化
3. **數據存儲服務**: 專門處理數據庫操作
4. **協調服務**: 協調各個微服務

#### 實現策略
```typescript
// RSS 解析服務
export async function parseRssFeeds() {
  // 只解析 RSS，不獲取圖片
}

// 圖片處理服務
export async function processImages() {
  // 異步處理圖片獲取
}

// 數據存儲服務
export async function storeArticles() {
  // 批量存儲文章
}
```

#### 優點
- 單一職責原則
- 更好的可擴展性
- 獨立部署和監控
- 更容易測試

#### 缺點
- 架構複雜度增加
- 需要服務間通信
- 部署和運維成本

### 方案 3: 背景任務 + 輕量觸發器 (最佳)

#### 核心改進
1. **輕量觸發器**: Edge Function 只負責觸發任務
2. **背景處理**: 使用 Supabase 的 pg_cron 或外部調度器
3. **狀態管理**: 使用數據庫表追蹤處理狀態
4. **分階段處理**: RSS 解析 → 圖片處理 → 數據清理

#### 實現策略
```typescript
// 觸發器函數 (Edge Function)
export async function triggerRssIngestion() {
  // 創建任務記錄
  const taskId = await createIngestionTask();
  
  // 觸發背景處理
  await scheduleBackgroundProcessing(taskId);
  
  return { taskId, status: 'scheduled' };
}

// 背景處理 (Database Function 或外部服務)
CREATE OR REPLACE FUNCTION process_rss_batch()
RETURNS void AS $$
BEGIN
  -- 處理 RSS 解析
  -- 分批處理以避免超時
END;
$$ LANGUAGE plpgsql;
```

#### 優點
- 完全避免 Edge Function 超時
- 更好的資源利用
- 可以處理大量數據
- 更好的錯誤恢復

#### 缺點
- 需要額外的調度機制
- 實時性降低
- 架構複雜度中等

---

## 實施計劃

### 階段 1: 立即優化 (1-2 天)

#### 目標
解決當前最緊急的超時和性能問題

#### 任務
1. **實施分批處理**
   - 將 RSS 源分為 2-3 批處理
   - 添加批次間的短暫延遲

2. **優化圖片獲取**
   - 減少超時時間 (3秒 → 1秒)
   - 添加圖片獲取失敗的優雅處理
   - 考慮跳過圖片獲取步驟作為臨時方案

3. **改進錯誤處理**
   - 使用 Promise.allSettled
   - 記錄詳細的錯誤信息
   - 添加重試機制

#### 代碼示例
```typescript
// 分批處理實現
const processFeedsInBatches = async (feeds: string[], batchSize: number) => {
  const results = [];
  
  for (let i = 0; i < feeds.length; i += batchSize) {
    const batch = feeds.slice(i, i + batchSize);
    const batchPromises = batch.map(feed => processSingleFeed(feed));
    const batchResults = await Promise.allSettled(batchPromises);
    
    results.push(...batchResults);
    
    // 批次間短暫延遲
    if (i + batchSize < feeds.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
};
```

### 階段 2: 架構重構 (1 週)

#### 目標
實施背景任務架構，徹底解決超時問題

#### 任務
1. **創建任務管理表**
   ```sql
   CREATE TABLE rss_ingestion_tasks (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     status TEXT NOT NULL DEFAULT 'pending',
     started_at TIMESTAMP WITH TIME ZONE,
     completed_at TIMESTAMP WITH TIME ZONE,
     error_message TEXT,
     processed_count INTEGER DEFAULT 0,
     total_count INTEGER DEFAULT 0
   );
   ```

2. **重寫 Edge Function 為觸發器**
   - 只負責創建任務和返回狀態
   - 執行時間 < 5 秒

3. **實施背景處理**
   - 使用 pg_cron 或外部調度器
   - 分階段處理 (解析 → 圖片 → 存儲)

4. **添加狀態查詢 API**
   - 允許前端查詢處理進度
   - 提供詳細的處理統計

### 階段 3: 監控和優化 (持續)

#### 目標
建立完善的監控和自動優化機制

#### 任務
1. **性能監控**
   - 添加詳細的執行時間記錄
   - 監控內存使用情況
   - 追蹤成功率和錯誤率

2. **自動調優**
   - 根據歷史數據調整批次大小
   - 動態調整超時時間
   - 自動重試失敗的任務

3. **告警機制**
   - 處理失敗告警
   - 性能異常告警
   - 數據質量監控

---

## 總結

### 關鍵限制
1. **時間限制**: 400秒 wall clock (付費計劃)
2. **內存限制**: 256MB
3. **CPU 限制**: 2秒實際 CPU 時間
4. **網絡限制**: 某些端口和功能受限

### 推薦方案
**階段性實施方案 3 (背景任務 + 輕量觸發器)**，原因：
- 徹底解決超時問題
- 更好的可擴展性
- 符合 Edge Functions 的設計理念
- 實施複雜度適中

### 立即行動項目
1. 實施分批處理 (緊急)
2. 優化圖片獲取策略 (緊急)
3. 改進錯誤處理 (重要)
4. 規劃背景任務架構 (長期)

通過這些改進，RSS Ingestion 功能將更加穩定、高效，並能更好地利用 Supabase Edge Functions 的優勢。
