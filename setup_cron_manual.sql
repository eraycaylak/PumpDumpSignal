-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. pg_cron extension'ını aktifleştir
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. HTTP extension'ını aktifleştir (net.http_post için)
CREATE EXTENSION IF NOT EXISTS http;

-- 3. Cron job'ı kur - Her dakika full-monitor function'ını çağır
SELECT cron.schedule(
  'crypto-monitor',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://adqefqexeludyhrlwklz.supabase.co/functions/v1/full-monitor',
    headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcWVmcWV4ZWx1ZHlocmx3a2x6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk5NzI3NiwiZXhwIjoyMDcwNTczMjc2fQ.MCE_KOqMt92EgeRAlmbWlE4BnZODCL_hAbRsnMv24XM", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- 4. Cron job'ların listesini kontrol et
SELECT * FROM cron.job;

-- 5. Cron job'ı silmek için (gerekirse):
-- SELECT cron.unschedule('crypto-monitor');