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
    
    // Doğrudan full-monitor function'ını çağır
    console.log('Calling full-monitor function...')
    
    const response = await fetch('https://adqefqexeludyhrlwklz.supabase.co/functions/v1/full-monitor', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcWVmcWV4ZWx1ZHlocmx3a2x6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk5NzI3NiwiZXhwIjoyMDcwNTczMjc2fQ.MCE_KOqMt92EgeRAlmbWlE4BnZODCL_hAbRsnMv24XM',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    const fullMonitorResult = await response.json()
    console.log('Full-monitor response:', fullMonitorResult)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Heartbeat triggered full-monitor successfully',
        timestamp: new Date().toISOString(),
        fullMonitorResult
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Heartbeat function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})