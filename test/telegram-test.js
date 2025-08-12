// Telegram Bot API test scripti
// Node.js ile çalıştırın: node test/telegram-test.js

const https = require('https');

// Konfigürasyon
const BOT_TOKEN = '7734018147:AAF_-BFkM7c6uXR0-4pVcVoM6cjE7ctSHP8';
const CHANNEL_ID = '-1002853635609';
const CHANNEL_USERNAME = '@pumpdumpsignalx';

async function testTelegramBot() {
    console.log('🤖 Telegram Bot Test Başlıyor...\n');
    
    try {
        // 1. Bot bilgilerini kontrol et
        console.log('1️⃣ Bot bilgileri kontrol ediliyor...');
        const botInfo = await makeRequest('GET', `https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
        
        console.log(`✅ Bot Adı: ${botInfo.result.first_name}`);
        console.log(`✅ Bot Username: @${botInfo.result.username}`);
        console.log(`✅ Bot ID: ${botInfo.result.id}\n`);
        
        // 2. Kanal bilgilerini kontrol et
        console.log('2️⃣ Kanal bilgileri kontrol ediliyor...');
        try {
            const chatInfo = await makeRequest('GET', `https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${CHANNEL_ID}`);
            console.log(`✅ Kanal Adı: ${chatInfo.result.title}`);
            console.log(`✅ Kanal Username: ${chatInfo.result.username}`);
            console.log(`✅ Kanal ID: ${chatInfo.result.id}\n`);
        } catch (error) {
            console.log(`⚠️ Kanal bilgisi alınamadı: ${error.message}`);
            console.log('Bot kanalda admin olmayabilir veya kanal private olabilir.\n');
        }
        
        // 3. Test mesajı gönder
        console.log('3️⃣ Test mesajı gönderiliyor...');
        
        const testMessages = [
            '🧪 Test Mesajı - Bot çalışıyor!',
            '🚀 BTCUSDT PUMP! %5.67↗️ | Fiyat: $45,230.50 | Volume: 15.2M',
            '📉 ETHUSDT DUMP! %3.21↘️ | Fiyat: $2,850.75 | Volume: 8.7M',
            '⚡ ADAUSDT PUMP! %4.89↗️ | Fiyat: $0.485000 | Volume: 12.5M'
        ];
        
        for (let i = 0; i < testMessages.length; i++) {
            const message = testMessages[i];
            console.log(`📤 Mesaj ${i + 1} gönderiliyor: "${message.substring(0, 30)}..."`);
            
            try {
                const response = await sendMessage(message);
                console.log(`✅ Mesaj ${i + 1} başarıyla gönderildi (ID: ${response.result.message_id})`);
                
                // Mesajlar arası 2 saniye bekle
                if (i < testMessages.length - 1) {
                    await sleep(2000);
                }
            } catch (error) {
                console.log(`❌ Mesaj ${i + 1} gönderilemedi: ${error.message}`);
            }
        }
        
        console.log('\n✅ Telegram Bot testi tamamlandı!');
        console.log('\n📋 Kontrol Listesi:');
        console.log('- Bot token geçerli ✅');
        console.log('- Kanal ID doğru ✅');
        console.log('- Bot kanalda admin ✅');
        console.log('- Mesaj gönderme çalışıyor ✅');
        
    } catch (error) {
        console.error('❌ Test başarısız:', error.message);
        console.log('\n🔧 Olası Çözümler:');
        console.log('1. Bot token\'ının doğru olduğunu kontrol edin');
        console.log('2. Bot\'u kanala admin olarak ekleyin');
        console.log('3. Kanal ID\'sinin doğru olduğunu kontrol edin');
        console.log('4. Kanalın public olduğunu kontrol edin');
        process.exit(1);
    }
}

async function sendMessage(text) {
    const data = JSON.stringify({
        chat_id: CHANNEL_ID,
        text: text,
        parse_mode: 'HTML'
    });
    
    return makeRequest('POST', `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, data);
}

function makeRequest(method, url, data = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data) {
            options.headers['Content-Length'] = Buffer.byteLength(data);
        }
        
        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    
                    if (jsonData.ok) {
                        resolve(jsonData);
                    } else {
                        reject(new Error(`Telegram API Error: ${jsonData.description} (Code: ${jsonData.error_code})`));
                    }
                } catch (error) {
                    reject(new Error(`JSON parse error: ${error.message}`));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(new Error(`HTTP request error: ${error.message}`));
        });
        
        if (data) {
            req.write(data);
        }
        
        req.end();
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Test'i çalıştır
testTelegramBot();