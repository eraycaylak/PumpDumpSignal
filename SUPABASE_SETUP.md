# 🚀 Supabase Cron Job Kurulumu

## Adım 1: Database Migration'ları Çalıştır

Supabase Dashboard'a git: https://supabase.com/dashboard/project/adqefqexeludyhrlwklz

**SQL Editor** sekmesine tıkla ve aşağıdaki SQL'i çalıştır:

```sql
-- HTTP extension'ını aktifleştir
CREATE EXTENSION IF NOT EXISTS http;

-- Heartbeat tablosu oluştur
CREATE TABLE IF NOT EXISTS heartbeat (
  id SERIAL PRIMARY KEY,
  last_ping TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İlk kayıt ekle
INSERT INTO heartbeat (last_ping) VALUES (NOW()) ON CONFLICT DO NOTHING;

-- Heartbeat güncellendiğinde full-monitor'u çağıran function
CREATE OR REPLACE FUNCTION trigger_full_monitor()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  response record;
BEGIN
  -- Edge function'ı çağır
  SELECT INTO response
    net.http_post(
      url := 'https://adqefqexeludyhrlwklz.supabase.co/functions/v1/full-monitor',
      headers := jsonb_build_object(
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcWVmcWV4ZWx1ZHlocmx3a2x6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk5NzI3NiwiZXhwIjoyMDcwNTczMjc2fQ.MCE_KOqMt92EgeRAlmbWlE4BnZODCL_hAbRsnMv24XM',
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
  
  RETURN NEW;
END;
$$;

-- Trigger oluştur
DROP TRIGGER IF EXISTS heartbeat_trigger ON heartbeat;
CREATE TRIGGER heartbeat_trigger
  AFTER UPDATE ON heartbeat
  FOR EACH ROW
  EXECUTE FUNCTION trigger_full_monitor();
```

## Adım 2: Edge Functions Deploy Et

Terminal'de şu komutları çalıştır:

```bash
cd crypto-pump-dump-bot
supabase functions deploy heartbeat
```

## Adım 3: Test Et

Heartbeat function'ını test et:

```bash
curl -X POST "https://adqefqexeludyhrlwklz.supabase.co/functions/v1/heartbeat" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcWVmcWV4ZWx1ZHlocmx3a2x6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk5NzI3NiwiZXhwIjoyMDcwNTczMjc2fQ.MCE_KOqMt92EgeRAlmbWlE4BnZODCL_hAbRsnMv24XM" \
  -H "Content-Type: application/json"
```

## Adım 4: GitHub Actions Otomatik Çalışacak

GitHub repository'ye push ettikten sonra GitHub Actions her dakika heartbeat function'ını çağıracak, bu da database trigger ile full-monitor'u tetikleyecek.

## 📊 Sistem Akışı:

1. **GitHub Actions** (her dakika) → **heartbeat function** çağırır
2. **heartbeat function** → **heartbeat tablosunu** günceller  
3. **Database trigger** → **full-monitor function** çağırır
4. **full-monitor** → **467 coin tarar** ve **Telegram'a sinyal gönderir**

## 🔧 Monitoring:

- **Telegram**: @pumpdumpsignalx
- **Supabase Logs**: Edge Functions > full-monitor > Logs
- **GitHub Actions**: https://github.com/eraycaylak/PumpDumpSignal/actions