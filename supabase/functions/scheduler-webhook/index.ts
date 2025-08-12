import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Scheduler webhook triggered, calling full-monitor...')
    
    // Call the full-monitor function
    const response = await fetch('https://adqefqexeludyhrlwklz.supabase.co/functions/v1/full-monitor', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcWVmcWV4ZWx1ZHlocmx3a2x6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk5NzI3NiwiZXhwIjoyMDcwNTczMjc2fQ.MCE_KOqMt92EgeRAlmbWlE4BnZODCL_hAbRsnMv24XM',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    const result = await response.json()
    console.log('Full-monitor response:', result)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Scheduler executed successfully',
        fullMonitorResult: result,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Scheduler error:', error)
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