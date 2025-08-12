#!/bin/bash

# Crypto Pump/Dump Bot Deployment Script
# Bu script Supabase projesini kurar ve deploy eder

set -e

echo "🚀 Crypto Pump/Dump Bot Deployment Başlıyor..."
echo "================================================"

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonksiyonlar
print_step() {
    echo -e "\n${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Gerekli araçları kontrol et
print_step "1️⃣ Gerekli araçları kontrol ediliyor..."

if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI bulunamadı!"
    echo "Kurulum için: npm install -g supabase"
    exit 1
fi
print_success "Supabase CLI bulundu"

if ! command -v node &> /dev/null; then
    print_error "Node.js bulunamadı!"
    echo "Node.js'i https://nodejs.org adresinden indirin"
    exit 1
fi
print_success "Node.js bulundu"

# 2. Environment dosyasını kontrol et
print_step "2️⃣ Environment konfigürasyonu kontrol ediliyor..."

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_warning ".env dosyası .env.example'dan oluşturuldu"
        print_warning "Lütfen .env dosyasındaki değerleri kontrol edin!"
    else
        print_error ".env.example dosyası bulunamadı!"
        exit 1
    fi
else
    print_success ".env dosyası mevcut"
fi

# 3. Supabase projesine bağlan
print_step "3️⃣ Supabase projesine bağlanılıyor..."

# .env dosyasından SUPABASE_URL'i oku
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

if [ -z "$SUPABASE_URL" ]; then
    print_error "SUPABASE_URL environment variable bulunamadı!"
    exit 1
fi

# Project ID'yi URL'den çıkar
PROJECT_ID=$(echo $SUPABASE_URL | sed 's/https:\/\/\([^.]*\).*/\1/')

print_success "Project ID: $PROJECT_ID"

# Supabase login kontrolü
if ! supabase projects list &> /dev/null; then
    print_warning "Supabase'e giriş yapmanız gerekiyor"
    supabase login
fi

# Projeye bağlan
supabase link --project-ref $PROJECT_ID
print_success "Supabase projesine bağlandı"

# 4. Veritabanı migration'larını çalıştır
print_step "4️⃣ Veritabanı migration'ları çalıştırılıyor..."

if [ -d "supabase/migrations" ]; then
    supabase db push
    print_success "Migration'lar başarıyla uygulandı"
else
    print_warning "Migration dosyaları bulunamadı"
fi

# 5. Edge Functions'ları deploy et
print_step "5️⃣ Edge Functions deploy ediliyor..."

# Environment variables'ları ayarla
print_step "Environment variables ayarlanıyor..."

supabase secrets set SUPABASE_URL="$SUPABASE_URL"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
supabase secrets set TELEGRAM_BOT_TOKEN="$TELEGRAM_BOT_TOKEN"
supabase secrets set TELEGRAM_CHANNEL_ID="$TELEGRAM_CHANNEL_ID"

print_success "Environment variables ayarlandı"

# Price monitor function'ını deploy et
if [ -d "supabase/functions/price-monitor" ]; then
    supabase functions deploy price-monitor
    print_success "price-monitor function deploy edildi"
else
    print_error "price-monitor function bulunamadı!"
fi

# Scheduler function'ını deploy et
if [ -d "supabase/functions/scheduler" ]; then
    supabase functions deploy scheduler
    print_success "scheduler function deploy edildi"
else
    print_error "scheduler function bulunamadı!"
fi

# 6. Test'leri çalıştır
print_step "6️⃣ Test'ler çalıştırılıyor..."

if [ -f "test/binance-api-test.js" ]; then
    echo "Binance API testi..."
    node test/binance-api-test.js
    print_success "Binance API testi başarılı"
fi

if [ -f "test/telegram-test.js" ]; then
    echo "Telegram Bot testi..."
    node test/telegram-test.js
    print_success "Telegram Bot testi başarılı"
fi

# 7. Cron job'ları aktifleştir
print_step "7️⃣ Cron job'lar aktifleştiriliyor..."

# Scheduler'ı manuel olarak tetikle (ilk çalıştırma)
FUNCTION_URL="$SUPABASE_URL/functions/v1/scheduler"
echo "Scheduler tetikleniyor: $FUNCTION_URL"

curl -X POST "$FUNCTION_URL" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"

print_success "Scheduler tetiklendi"

# 8. Deployment tamamlandı
print_step "🎉 Deployment Tamamlandı!"
echo "================================================"
print_success "Crypto Pump/Dump Bot başarıyla deploy edildi!"
echo ""
echo "📊 Sistem Bilgileri:"
echo "- Supabase URL: $SUPABASE_URL"
echo "- Telegram Kanal: @pumpdumpsignalx"
echo "- Kontrol Sıklığı: Her 10 saniye"
echo "- Sinyal Eşiği: %3+ değişim"
echo ""
echo "🔗 Faydalı Linkler:"
echo "- Supabase Dashboard: https://supabase.com/dashboard/project/$PROJECT_ID"
echo "- Function Logs: https://supabase.com/dashboard/project/$PROJECT_ID/functions"
echo "- Database: https://supabase.com/dashboard/project/$PROJECT_ID/editor"
echo ""
echo "📱 Telegram Kanalı:"
echo "- https://t.me/pumpdumpsignalx"
echo ""
print_warning "Sistem şimdi çalışıyor! Telegram kanalınızı kontrol edin."