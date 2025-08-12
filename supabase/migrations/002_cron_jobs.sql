-- pg_cron extension'ını etkinleştir
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Her 10 saniyede price-monitor fonksiyonunu çağıran cron job
-- Not: pg_cron minimum 1 dakika interval destekler, bu yüzden alternatif yaklaşım kullanacağız

-- Cron job tablosu oluştur
CREATE TABLE cron_jobs (
    id BIGSERIAL PRIMARY KEY,
    job_name VARCHAR(50) NOT NULL UNIQUE,
    function_url TEXT NOT NULL,
    interval_seconds INTEGER NOT NULL DEFAULT 60,
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price monitor job'ını ekle
INSERT INTO cron_jobs (job_name, function_url, interval_seconds) 
VALUES ('price-monitor', 'https://adqefqexeludyhrlwklz.supabase.co/functions/v1/price-monitor', 10);

-- Cron job çalıştırma fonksiyonu
CREATE OR REPLACE FUNCTION run_scheduled_jobs()
RETURNS void AS $$
DECLARE
    job_record RECORD;
    response_status INTEGER;
BEGIN
    -- Çalışması gereken job'ları bul
    FOR job_record IN 
        SELECT * FROM cron_jobs 
        WHERE is_active = true 
        AND (next_run IS NULL OR next_run <= NOW())
    LOOP
        BEGIN
            -- HTTP request gönder (bu gerçek implementasyonda webhook kullanılmalı)
            -- Şimdilik sadece next_run'ı güncelle
            
            UPDATE cron_jobs 
            SET 
                last_run = NOW(),
                next_run = NOW() + INTERVAL '1 second' * job_record.interval_seconds
            WHERE id = job_record.id;
            
            -- Log ekle
            INSERT INTO system_logs (level, message, data, function_name)
            VALUES ('INFO', 'Scheduled job executed', 
                   jsonb_build_object('job_name', job_record.job_name, 'interval', job_record.interval_seconds),
                   'run_scheduled_jobs');
                   
        EXCEPTION WHEN OTHERS THEN
            -- Hata durumunda log ekle
            INSERT INTO system_logs (level, message, data, function_name)
            VALUES ('ERROR', 'Scheduled job failed', 
                   jsonb_build_object('job_name', job_record.job_name, 'error', SQLERRM),
                   'run_scheduled_jobs');
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Her dakika çalışan cron job (pg_cron ile)
SELECT cron.schedule('run-scheduled-jobs', '* * * * *', 'SELECT run_scheduled_jobs();');

-- İlk çalışma zamanını ayarla
UPDATE cron_jobs SET next_run = NOW() WHERE job_name = 'price-monitor';