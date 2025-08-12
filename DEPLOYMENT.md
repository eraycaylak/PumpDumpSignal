# 🚀 Otomatik Çalıştırma Talimatları

## GitHub Actions ile Otomatik Çalıştırma (ÜCRETSİZ)

### 1. GitHub Repository Oluştur
1. GitHub'da yeni repository oluştur: `crypto-pump-dump-bot`
2. Bu klasörü GitHub'a push et:

```bash
cd crypto-pump-dump-bot
git remote add origin https://github.com/KULLANICI_ADINIZ/crypto-pump-dump-bot.git
git branch -M main
git push -u origin main
```

### 2. GitHub Actions Otomatik Başlayacak
- Repository'ye push ettikten sonra GitHub Actions otomatik olarak her dakika çalışmaya başlayacak
- Actions sekmesinden çalışma durumunu kontrol edebilirsiniz

## Alternatif Çözümler

### Uptime Robot (ÜCRETSİZ)
1. https://uptimerobot.com/ adresine git
2. "Add New Monitor" tıkla
3. Monitor Type: HTTP(s)
4. URL: `https://adqefqexeludyhrlwklz.supabase.co/functions/v1/full-monitor`
5. Monitoring Interval: 1 minute
6. HTTP Method: POST
7. HTTP Headers ekle:
   - `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcWVmcWV4ZWx1ZHlocmx3a2x6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk5NzI3NiwiZXhwIjoyMDcwNTczMjc2fQ.MCE_KOqMt92EgeRAlmbWlE4BnZODCL_hAbRsnMv24XM`
   - `Content-Type: application/json`

### Cron Job (VPS/Server)
```bash
# Her dakika çalıştır
* * * * * curl -X POST "https://adqefqexeludyhrlwklz.supabase.co/functions/v1/full-monitor" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcWVmcWV4ZWx1ZHlocmx3a2x6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk5NzI3NiwiZXhwIjoyMDcwNTczMjc2fQ.MCE_KOqMt92EgeRAlmbWlE4BnZODCL_hAbRsnMv24XM" -H "Content-Type: application/json"
```

## 📊 Monitoring
- Telegram kanalı: @pumpdumpsignalx
- Supabase Dashboard: https://supabase.com/dashboard/project/adqefqexeludyhrlwklz
- Function Logs: Edge Functions > full-monitor > Logs

## ⚡ Sistem Özellikleri
- ✅ 467 USDT futures çifti taranıyor
- ✅ 1 dakikalık mum analizi
- ✅ %3+ değişim tespiti
- ✅ Rate limit yok
- ✅ Otomatik Telegram bildirimi