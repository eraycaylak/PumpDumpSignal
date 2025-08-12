# 🚀 Crypto Pump/Dump Signal Bot

Binance Futures piyasasını takip eden ve %3+ değişim gösteren coinleri Telegram kanalına bildiren otomatik bot sistemi.

## 🌟 Özellikler

- ⚡ **Anlık Takip**: Her 10 saniyede Binance Futures API kontrolü
- 📊 **%3+ Değişim Tespiti**: Pump ve dump sinyallerini otomatik tespit
- 📱 **Telegram Bildirimleri**: Anında kanal bildirimleri
- 🔄 **Duplicate Önleme**: 1 dakika içinde aynı sinyali tekrar göndermez
- 🛡️ **Serverless Yapı**: Supabase Edge Functions ile güvenilir çalışma
- 📈 **Monitoring Dashboard**: Web tabanlı izleme paneli
- 🔍 **Detaylı Logging**: Sistem logları ve hata takibi

## 📋 Sistem Gereksinimleri

- Node.js 16+
- Supabase CLI
- Telegram Bot Token
- Binance API erişimi (ücretsiz)

## 🚀 Hızlı Kurulum

### 1. Projeyi İndirin
```bash
git clone https://github.com/your-username/crypto-pump-dump-bot.git
cd crypto-pump-dump-bot
```

### 2. Environment Ayarları
```bash
cp .env.example .env
# .env dosyasını düzenleyin
```

### 3. Otomatik Deployment
```bash
chmod +x deploy.sh
./deploy.sh
```

## ⚙️ Manuel Kurulum

### 1. Supabase Kurulumu
```bash
# Supabase CLI kurulumu
npm install -g supabase

# Projeye bağlanma
supabase login
supabase link --project-ref YOUR_PROJECT_ID
```

### 2. Veritabanı Migration
```bash
supabase db push
```

### 3. Edge Functions Deploy
```bash
# Environment variables ayarla
supabase secrets set SUPABASE_URL="your-url"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-key"
supabase secrets set TELEGRAM_BOT_TOKEN="your-token"
supabase secrets set TELEGRAM_CHANNEL_ID="your-channel-id"

# Functions deploy et
supabase functions deploy price-monitor
supabase functions deploy scheduler
```

## 🧪 Test Etme

### Binance API Testi
```bash
node test/binance-api-test.js
```

### Telegram Bot Testi
```bash
node test/telegram-test.js
```

### Tüm Testler
```bash
npm test
```

## 📊 Monitoring

### Web Dashboard
Monitoring dashboard'a erişim:
```
file://path/to/crypto-pump-dump-bot/monitoring/dashboard.html
```

### Supabase Dashboard
- **Functions**: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/functions
- **Database**: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/editor
- **Logs**: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/logs

### CLI Monitoring
```bash
# Function logları
npm run logs

# Scheduler logları
npm run logs:scheduler
```

## 🔧 Konfigürasyon

### Environment Variables

| Variable | Açıklama | Örnek |
|----------|----------|-------|
| `SUPABASE_URL` | Supabase proje URL'i | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role anahtarı | `eyJhbGciOiJIUzI1NiIs...` |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | `123456:ABC-DEF...` |
| `TELEGRAM_CHANNEL_ID` | Kanal ID'si | `-1001234567890` |
| `PRICE_CHANGE_THRESHOLD` | Sinyal eşiği (%) | `3.0` |
| `CHECK_INTERVAL_SECONDS` | Kontrol sıklığı | `10` |

### Sistem Parametreleri

- **Kontrol Sıklığı**: Her 10 saniye
- **Sinyal Eşiği**: ±3.0% değişim
- **Duplicate Kontrolü**: 1 dakika
- **API Rate Limit**: 1200 req/dakika (güvenli: 6 req/dakika)
- **Desteklenen Çiftler**: Tüm USDT futures çiftleri

## 📱 Telegram Kanal Kurulumu

### 1. Bot Oluşturma
1. [@BotFather](https://t.me/botfather) ile konuşun
2. `/newbot` komutu ile bot oluşturun
3. Bot token'ını alın

### 2. Kanal Kurulumu
1. Telegram kanalı oluşturun
2. Bot'u kanala admin olarak ekleyin
3. Kanal ID'sini alın

### 3. Kanal ID Bulma
```bash
# Bot'u kanala ekledikten sonra
curl "https://api.telegram.org/bot<TOKEN>/getUpdates"
```

## 🔍 Sinyal Formatı

Bot aşağıdaki formatta sinyaller gönderir:

```
🚀 BTCUSDT PUMP! %5.67↗️ | Fiyat: $45,230.50 | Volume: 15.2M
📉 ETHUSDT DUMP! %3.21↘️ | Fiyat: $2,850.75 | Volume: 8.7M
```

### Sinyal Açıklaması
- **🚀/📉**: Pump/Dump göstergesi
- **SYMBOL**: Coin çifti (örn: BTCUSDT)
- **%X.XX**: Değişim yüzdesi
- **↗️/↘️**: Yön göstergesi
- **Fiyat**: Anlık fiyat
- **Volume**: 24 saatlik işlem hacmi

## 🛠️ Geliştirme

### Proje Yapısı
```
crypto-pump-dump-bot/
├── supabase/
│   ├── functions/
│   │   ├── price-monitor/    # Ana monitoring fonksiyonu
│   │   └── scheduler/        # Cron job scheduler
│   ├── migrations/           # Veritabanı şemaları
│   └── config.toml          # Supabase konfigürasyonu
├── test/                    # Test scriptleri
├── monitoring/              # Web dashboard
├── deploy.sh               # Deployment scripti
└── README.md
```

### Veritabanı Şeması

#### `coin_data`
- Coin fiyat ve volume verileri
- Anlık güncellenen veriler

#### `notifications`
- Gönderilen sinyal geçmişi
- Duplicate kontrolü için

#### `system_logs`
- Sistem logları
- Hata takibi

#### `cron_jobs`
- Scheduled job yönetimi
- 10 saniye interval kontrolü

## 🚨 Sorun Giderme

### Yaygın Sorunlar

#### Bot mesaj gönderemiyor
```bash
# Bot'un kanal admin'i olduğunu kontrol edin
curl "https://api.telegram.org/bot<TOKEN>/getChatMember?chat_id=<CHANNEL_ID>&user_id=<BOT_ID>"
```

#### Binance API hatası
```bash
# API erişimini test edin
curl "https://fapi.binance.com/fapi/v1/ticker/24hr"
```

#### Supabase bağlantı hatası
```bash
# Proje bağlantısını kontrol edin
supabase status
```

### Log Kontrolü
```bash
# Function logları
supabase functions logs price-monitor --follow

# Veritabanı logları
supabase logs --type database
```

## 📈 Performans

### Sistem Metrikleri
- **Latency**: ~2-3 saniye (API + processing)
- **Memory**: ~50MB (Edge Function)
- **CPU**: Minimal (serverless)
- **Storage**: ~1GB/ay (loglar dahil)

### Rate Limits
- **Binance API**: 1200 req/dakita
- **Telegram API**: 30 mesaj/saniye
- **Supabase**: 500,000 req/ay (ücretsiz plan)

## 🔐 Güvenlik

- ✅ Environment variables ile güvenli konfigürasyon
- ✅ Supabase RLS (Row Level Security)
- ✅ API key'lerin şifrelenmesi
- ✅ Rate limiting koruması
- ✅ Error handling ve logging

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 Destek

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/your-username/crypto-pump-dump-bot/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/your-username/crypto-pump-dump-bot/discussions)
- 📧 **Email**: your-email@example.com

## ⚠️ Yasal Uyarı

Bu bot sadece bilgilendirme amaçlıdır. Finansal tavsiye değildir. Kripto para yatırımları risklidir ve kendi araştırmanızı yapmalısınız.

---

**🚀 Happy Trading! 📈**