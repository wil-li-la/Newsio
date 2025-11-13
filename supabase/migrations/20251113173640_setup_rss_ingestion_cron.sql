-- ==========================================
-- 查詢現有的 Cron Jobs
-- ==========================================

-- 1. 查看所有 cron jobs
SELECT 
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active,
  jobname
FROM cron.job
ORDER BY jobid;

-- 2. 查看與 rss 或 ingestion 相關的 cron jobs
SELECT 
  jobid,
  schedule,
  command,
  active,
  jobname
FROM cron.job
WHERE 
  jobname ILIKE '%rss%' 
  OR jobname ILIKE '%ingestion%'
  OR command ILIKE '%rss%'
  OR command ILIKE '%ingestion%';

-- 3. 查看最近的 cron job 執行歷史
SELECT 
  j.jobname,
  r.runid,
  r.job_pid,
  r.database,
  r.username,
  r.command,
  r.status,
  r.return_message,
  r.start_time,
  r.end_time
FROM cron.job_run_details r
JOIN cron.job j ON r.jobid = j.jobid
WHERE j.jobname ILIKE '%rss%' OR j.jobname ILIKE '%ingestion%'
ORDER BY r.start_time DESC
LIMIT 20;

-- 4. 查看所有 cron job 的最近執行記錄
SELECT 
  j.jobname,
  j.schedule,
  r.status,
  r.start_time,
  r.end_time,
  r.return_message
FROM cron.job_run_details r
JOIN cron.job j ON r.jobid = j.jobid
ORDER BY r.start_time DESC
LIMIT 10;
