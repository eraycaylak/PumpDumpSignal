// Binance Futures API test scripti
// Node.js ile çalıştırın: node test/binance-api-test.js

const https = require('https');

async function testBinanceAPI() {
    console.log('🔍 Binance Futures API Test Başlıyor...\n');
    
    try {
        // 24hr ticker statistics endpoint'ini test et
        const url = 'https://fapi.binance.com/fapi/v1/ticker/24hr';
        
        console.log(`📡 API Endpoint: ${url}`);
        console.log('⏳ Veri çekiliyor...\n');
        
        const data = await fetchData(url);
        
        if (!Array.isArray(data)) {
            throw new Error('API response is not an array');
        }
        
        console.log(`✅ Toplam ${data.length} futures çifti bulundu`);
        
        // USDT çiftlerini filtrele
        const usdtPairs = data.filter(ticker => 
            ticker.symbol.endsWith('USDT') && 
            !ticker.symbol.includes('_') &&
            parseFloat(ticker.volume) > 0
        );
        
        console.log(`💰 USDT çiftleri: ${usdtPairs.length}`);
        
        // %3+ değişim gösterenleri bul
        const significantChanges = usdtPairs.filter(ticker => 
            Math.abs(parseFloat(ticker.priceChangePercent)) >= 3.0
        );
        
        console.log(`📈 %3+ değişim gösteren coinler: ${significantChanges.length}\n`);
        
        // İlk 5 önemli değişimi göster
        console.log('🔥 Örnek Sinyaller:');
        console.log('==================');
        
        significantChanges.slice(0, 5).forEach(ticker => {
            const changePercent = parseFloat(ticker.priceChangePercent);
            const price = parseFloat(ticker.lastPrice);
            const volume = parseFloat(ticker.volume);
            const signalType = changePercent > 0 ? 'PUMP' : 'DUMP';
            const emoji = changePercent > 0 ? '🚀' : '📉';
            const arrow = changePercent > 0 ? '↗️' : '↘️';
            
            // Volume formatla
            const formatVolume = (vol) => {
                if (vol >= 1000000000) return `${(vol / 1000000000).toFixed(1)}B`;
                if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
                if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
                return vol.toFixed(0);
            };
            
            // Fiyat formatla
            const formatPrice = (p) => {
                if (p >= 1) return `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
                return `$${p.toFixed(6)}`;
            };
            
            console.log(`${emoji} ${ticker.symbol} ${signalType}! %${Math.abs(changePercent).toFixed(2)}${arrow} | Fiyat: ${formatPrice(price)} | Volume: ${formatVolume(volume)}`);
        });
        
        console.log('\n✅ Test başarıyla tamamlandı!');
        
        // API rate limit bilgisi
        console.log('\n📊 API Bilgileri:');
        console.log('Rate Limit: 1200 request/dakika');
        console.log('Interval: Her 10 saniye = 6 request/dakika (Güvenli)');
        
    } catch (error) {
        console.error('❌ Test başarısız:', error.message);
        process.exit(1);
    }
}

function fetchData(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (error) {
                    reject(new Error(`JSON parse error: ${error.message}`));
                }
            });
        }).on('error', (error) => {
            reject(new Error(`HTTP request error: ${error.message}`));
        });
    });
}

// Test'i çalıştır
testBinanceAPI();