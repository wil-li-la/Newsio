# RSS Scheduler 快速設定指南

## ✅ 已完成的步驟

1. ✅ **Edge Function 已部署**: `rss-scheduler` 已成功部署到 Supabase
2. ✅ **配置檔案已建立**: Migration SQL 已準備好
3. ✅ **文件已建立**: 完整的設定和管理文件

## 🚀 最後一步：啟用排程

由於 CLI 的限制，請按照以下步驟在 Supabase Dashboard 中手動執行 SQL：

### 步驟 1: 開啟 SQL Editor

1. 前往 [Supabase Dashboard](https://supabase.com/dashboard/project/ezvapnedjdaezynpafjb)
2. 點擊左側選單的 **SQL Editor**
3. 點擊 **New query**

### 步驟 2: 執行設定 SQL

複製並執行以下 SQL（或使用 `supabase/manual_setup_scheduler.sql` 檔案的內容）：

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create the scheduler function
CREATE OR REPLACE FUNCTION invoke_rss_scheduler()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id bigint;
  project_url text;
  service_key text;
BEGIN
  -- Replace with your actual Supabase project URL
  project_url := 'https://YOUR_PROJECT_REF.supabase.co';
  
  -- Replace with your actual Supabase anon key
  service_key := 'YOUR_SUPABASE_ANON_KEY';
  
  SELECT net.http_post(
    url := project_url || '/functions/v1/rss-scheduler',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || service_key,
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) INTO request_id;
  
  RAISE NOTICE 'RSS scheduler invoked with request_id: %', request_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to invoke RSS scheduler: %', SQLERRM;
END;
$$;

-- Schedule the function to run every 3 hours
SELECT cron.schedule(
  'rss-ingestion-every-3-hours',
  '0 */3 * * *',
  $$SELECT invoke_rss_scheduler();$$
);

-- Grant permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA cron TO postgres;
```

### 步驟 3: 驗證設定

執行以下 SQL 來確認排程已建立：

```sql
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job 
WHERE jobname = 'rss-ingestion-every-3-hours';
```

你應該會看到類似這樣的結果：
```
jobid | jobname                      | schedule    | active | command
------|------------------------------|-------------|--------|---------------------------
1     | rss-ingestion-every-3-hours  | 0 */3 * * * | true   | SELECT invoke_rss_scheduler();
```

### 步驟 4: 測試執行（可選）

手動觸發一次來測試：

```sql
SELECT invoke_rss_scheduler();
```

然後查看結果：

```sql
-- 查看 HTTP 請求狀態
SELECT 
  id,
  status_code,
  content::text,
  created
FROM net._http_response 
ORDER BY created DESC 
LIMIT 3;
```

## 📊 監控與管理

### 查看排程狀態

```sql
-- 查看所有排程任務
SELECT * FROM cron.job;

-- 查看執行歷史
SELECT 
  runid,
  jobid,
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'rss-ingestion-every-3-hours')
ORDER BY start_time DESC 
LIMIT 10;
```

### 停用排程

如果需要暫時停用：

```sql
SELECT cron.unschedule('rss-ingestion-every-3-hours');
```

### 重新啟用排程

```sql
SELECT cron.schedule(
  'rss-ingestion-every-3-hours',
  '0 */3 * * *',
  $$SELECT invoke_rss_scheduler();$$
);
```

## 🎯 執行時間表

目前設定為每 3 小時執行一次：
- 00:00 (午夜)
- 03:00 (凌晨 3 點)
- 06:00 (早上 6 點)
- 09:00 (早上 9 點)
- 12:00 (中午)
- 15:00 (下午 3 點)
- 18:00 (下午 6 點)
- 21:00 (晚上 9 點)

## 📁 相關檔案

- **Edge Function**: `supabase/functions/rss-scheduler/index.ts`
- **Migration**: `supabase/migrations/20251109_setup_rss_scheduler.sql`
- **手動設定 SQL**: `supabase/manual_setup_scheduler.sql`
- **完整文件**: `docs/RSS_SCHEDULER_SETUP.md`

## 🔗 相關連結

- [Supabase Dashboard](https://supabase.com/dashboard/project/ezvapnedjdaezynpafjb)
- [Edge Functions](https://supabase.com/dashboard/project/ezvapnedjdaezynpafjb/functions)
- [SQL Editor](https://supabase.com/dashboard/project/ezvapnedjdaezynpafjb/sql)

## ⚠️ 注意事項

1. 確保 `rss-ingestion` edge function 也已部署
2. 排程會在 Supabase 伺服器時區（UTC）執行
3. 每次執行會消耗 Edge Function 配額
4. 建議定期檢查執行日誌確保正常運作

## 🎉 完成！

一旦在 SQL Editor 中執行上述 SQL，你的 RSS 排程系統就會開始運作，每 3 小時自動抓取新聞！
