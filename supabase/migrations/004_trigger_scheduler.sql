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

-- HTTP extension'ını aktifleştir
CREATE EXTENSION IF NOT EXISTS http;