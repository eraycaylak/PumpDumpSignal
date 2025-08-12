import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Enable pg_cron extension
    const { error: extensionError } = await supabase.rpc('sql', {
      query: 'CREATE EXTENSION IF NOT EXISTS pg_cron;'
    })

    if (extensionError) {
      console.error('Extension error:', extensionError)
    }

    // Create function to call edge function
    const createFunctionQuery = `
      CREATE OR REPLACE FUNCTION call_full_monitor()
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        response record;
      BEGIN
        SELECT INTO response
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
    `

    const { error: functionError } = await supabase.rpc('sql', {
      query: createFunctionQuery
    })

    if (functionError) {
      console.error('Function error:', functionError)
    }

    // Schedule cron job
    const scheduleQuery = `
      SELECT cron.schedule(
        'crypto-monitor',
        '* * * * *',
        'SELECT call_full_monitor();'
      );
    `

    const { error: cronError } = await supabase.rpc('sql', {
      query: scheduleQuery
    })

    if (cronError) {
      console.error('Cron error:', cronError)
    }

    // List existing cron jobs
    const { data: cronJobs, error: listError } = await supabase.rpc('sql', {
      query: 'SELECT * FROM cron.job;'
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cron job setup completed',
        extensionError,
        functionError,
        cronError,
        cronJobs,
        listError
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Setup error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})