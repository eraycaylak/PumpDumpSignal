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
    // Basit test
    const response = {
      success: true,
      message: "Test function çalışıyor!",
      timestamp: new Date().toISOString(),
      env_check: {
        telegram_token: Deno.env.get('TELEGRAM_BOT_TOKEN') ? 'Mevcut' : 'Yok',
        telegram_channel: Deno.env.get('TELEGRAM_CHANNEL_ID') ? 'Mevcut' : 'Yok'
      }
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})