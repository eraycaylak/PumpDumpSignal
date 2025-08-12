-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage on cron schema to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;

-- Create a function to call our edge function
CREATE OR REPLACE FUNCTION call_full_monitor()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Call the edge function using http extension
  PERFORM
    net.http_post(
      url := 'https://adqefqexeludyhrlwklz.supabase.co/functions/v1/full-monitor',
      headers := jsonb_build_object(
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcWVmcWV4ZWx1ZHlocmx3a2x6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk5NzI3NiwiZXhwIjoyMDcwNTczMjc2fQ.MCE_KOqMt92EgeRAlmbWlE4BnZODCL_hAbRsnMv24XM',
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
END;
$$;

-- Schedule the function to run every minute
SELECT cron.schedule(
  'crypto-monitor',
  '* * * * *',
  'SELECT call_full_monitor();'
);