#!/bin/bash

echo "🔍 Crypto Pump/Dump Signal Bot Test Scripti"
echo "============================================"

# Test heartbeat function
echo "📡 Heartbeat function test ediliyor..."
RESPONSE=$(curl -s -X POST "https://adqefqexeludyhrlwklz.supabase.co/functions/v1/heartbeat" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcWVmcWV4ZWx1ZHlocmx3a2x6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk5NzI3NiwiZXhwIjoyMDcwNTczMjc2fQ.MCE_KOqMt92EgeRAlmbWlE4BnZODCL_hAbRsnMv24XM" \
  -H "Content-Type: application/json")

echo "📊 Sonuç:"
echo "$RESPONSE" | jq '.'

# Parse response
SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
TOTAL_PAIRS=$(echo "$RESPONSE" | jq -r '.fullMonitorResult.total_pairs')
PROCESSED=$(echo "$RESPONSE" | jq -r '.fullMonitorResult.processed')
SIGNALS_FOUND=$(echo "$RESPONSE" | jq -r '.fullMonitorResult.signals_found')

echo ""
echo "📈 Sistem Durumu:"
if [ "$SUCCESS" = "true" ]; then
    echo "✅ Sistem ÇALIŞIYOR"
    echo "🔢 Toplam Coin: $TOTAL_PAIRS"
    echo "⚡ İşlenen: $PROCESSED"
    echo "🚨 Bulunan Sinyal: $SIGNALS_FOUND"
else
    echo "❌ Sistem HATALI"
fi

echo ""
echo "📱 Telegram Kanalı: @pumpdumpsignalx"
echo "🔗 GitHub Actions: https://github.com/eraycaylak/PumpDumpSignal/actions"
echo "🎛️ Supabase Dashboard: https://supabase.com/dashboard/project/adqefqexeludyhrlwklz"