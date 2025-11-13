# RSS Scheduler 設定指南

## 概述

這個系統使用 `pg_cron` 和 `pg_net` 來定期觸發 RSS ingestion edge function，每 3 小時自動抓取一次新聞。

## 架構

```
pg_cron (每3小時) 
  → invoke_rss_scheduler() (PostgreSQL function)
    → pg_net.http_post()
      → rss-scheduler (Edge Function)
        → rss-ingestion (Edge Function)
          → 抓取並儲存 RSS 文章
```

## 部署步驟

### 1. 部署 Edge Functions

```bash
# 部署 rss-scheduler function
supabase functions deploy rss-scheduler

# 確認 rss-ingestion 也已部署
supabase functions deploy rss-ingestion
```

### 2. 取得必要的資訊

前往 Supabase Dashboard:
- **Project Settings** → **API**
- 複製 `Project URL` (例如: `https://xxxxx.supabase.co`)
- 複製 `anon public` key

### 3. 更新 Migration 檔案

編輯 `supabase/migrations/20251109_setup_rss_scheduler.sql`:

```sql
-- 在第 27 行，替換 YOUR_PROJECT_REF
project_url := 'https://YOUR_PROJECT_REF.supabase.co';

-- 在第 37 行，替換 YOUR_ANON_KEY
service_key := 'YOUR_ANON_KEY';
```

### 4. 執行 Migration

```bash
# 本地測試
supabase db reset

# 或直接推送到遠端
supabase db push
```

### 5. 驗證設定

```sql
-- 查看已排程的任務
SELECT * FROM cron.job;

-- 查看執行歷史
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;

-- 手動測試觸發
SELECT invoke_rss_scheduler();

-- 查看 pg_net 請求結果
SELECT * FROM net._http_response 
ORDER BY created DESC 
LIMIT 5;
```

## 排程時間說明

目前設定為 `0 */3 * * *`，表示：
- 每天 0:00, 3:00, 6:00, 9:00, 12:00, 15:00, 18:00, 21:00 執行

### 修改執行頻率

如果要改變執行頻率，可以更新 cron expression:

```sql
-- 每小時執行
SELECT cron.schedule('rss-ingestion-every-3-hours', '0 * * * *', 
  $$SELECT invoke_rss_scheduler();$$);

-- 每 6 小時執行
SELECT cron.schedule('rss-ingestion-every-3-hours', '0 */6 * * *', 
  $$SELECT invoke_rss_scheduler();$$);

-- 每天特定時間執行 (例如: 早上 8 點和晚上 8 點)
SELECT cron.schedule('rss-ingestion-every-3-hours', '0 8,20 * * *', 
  $$SELECT invoke_rss_scheduler();$$);
```

## 管理命令

```sql
-- 停用排程
SELECT cron.unschedule('rss-ingestion-every-3-hours');

-- 重新啟用排程
SELECT cron.schedule(
  'rss-ingestion-every-3-hours',
  '0 */3 * * *',
  $$SELECT invoke_rss_scheduler();$$
);

-- 查看特定任務的執行狀態
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'rss-ingestion-every-3-hours')
ORDER BY start_time DESC;
```

## 疑難排解

### 問題 1: 排程沒有執行

檢查 pg_cron 是否啟用:
```sql
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```

### 問題 2: HTTP 請求失敗

檢查 pg_net 回應:
```sql
SELECT 
  id,
  status_code,
  content::text,
  error_msg,
  created
FROM net._http_response 
ORDER BY created DESC 
LIMIT 5;
```

### 問題 3: Edge Function 認證失敗

確認 anon key 是否正確，或考慮使用 service_role key (更高權限):
```sql
-- 更新為使用 service role key
service_key := 'YOUR_SERVICE_ROLE_KEY';
```

## 監控建議

建立一個 view 來追蹤 RSS ingestion 的執行狀況:

```sql
CREATE OR REPLACE VIEW rss_scheduler_status AS
SELECT 
  j.jobname,
  j.schedule,
  j.active,
  jrd.runid,
  jrd.start_time,
  jrd.end_time,
  jrd.status,
  jrd.return_message
FROM cron.job j
LEFT JOIN cron.job_run_details jrd ON j.jobid = jrd.jobid
WHERE j.jobname = 'rss-ingestion-every-3-hours'
ORDER BY jrd.start_time DESC
LIMIT 20;

-- 查詢
SELECT * FROM rss_scheduler_status;
```

## 注意事項

1. **執行時間**: Edge Functions 有執行時間限制，確保 RSS ingestion 能在時限內完成
2. **並發控制**: 避免同時執行多個 RSS ingestion 任務
3. **錯誤處理**: 系統會自動記錄錯誤，定期檢查執行日誌
4. **成本考量**: 每次執行都會消耗 Edge Function 的配額

## 進階配置

### 使用 Supabase Vault 儲存密鑰

```sql
-- 儲存 anon key 到 vault
SELECT vault.create_secret('YOUR_ANON_KEY', 'supabase_anon_key');

-- 在 function 中使用
service_key := vault.get_secret('supabase_anon_key');
```
