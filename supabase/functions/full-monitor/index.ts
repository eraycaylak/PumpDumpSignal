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
    const log = async (level: string, message: string, data?: any) => {
      console.log(`[${level}] ${message}`, data || '')
    }

    await log('INFO', 'Full monitor started - scanning ALL futures pairs')

    // Retry logic ile exchange info al
    let allSymbols: string[] = []
    let retryCount = 0
    const maxRetries = 3

    while (retryCount < maxRetries) {
      try {
        await log('INFO', `Attempting to get exchange info (attempt ${retryCount + 1}/${maxRetries})`)
        
        const exchangeInfoResponse = await fetch('https://fapi.binance.com/fapi/v1/exchangeInfo', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CryptoBot/1.0)'
          }
        })
        
        if (!exchangeInfoResponse.ok) {
          throw new Error(`Exchange info error: ${exchangeInfoResponse.status}`)
        }

        const exchangeInfo = await exchangeInfoResponse.json()
        allSymbols = exchangeInfo.symbols
          .filter((s: any) => s.status === 'TRADING' && s.symbol.endsWith('USDT'))
          .map((s: any) => s.symbol)

        await log('INFO', `Found ${allSymbols.length} active USDT futures pairs`)
        break // Başarılı, döngüden çık

      } catch (error) {
        retryCount++
        await log('ERROR', `Exchange info attempt ${retryCount} failed`, { error: error.message })
        
        if (retryCount >= maxRetries) {
          // Son çare: Hardcoded popüler coinler listesi
          allSymbols = [
            'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT', 'SOLUSDT', 'DOTUSDT', 'DOGEUSDT',
            'AVAXUSDT', 'SHIBUSDT', 'MATICUSDT', 'LTCUSDT', 'UNIUSDT', 'LINKUSDT', 'ATOMUSDT', 'ETCUSDT',
            'XLMUSDT', 'BCHUSDT', 'FILUSDT', 'TRXUSDT', 'EOSUSDT', 'AAVEUSDT', 'GRTUSDT', 'VETUSDT',
            'FTMUSDT', 'MANAUSDT', 'SANDUSDT', 'AXSUSDT', 'IOTAUSDT', 'ALGOUSDT', 'NEARUSDT', 'ROSEUSDT'
          ]
          await log('WARN', `Using fallback coin list with ${allSymbols.length} popular pairs`)
          break
        }
        
        // Exponential backoff: 2^retry * 1000ms
        const delay = Math.pow(2, retryCount) * 1000
        await log('INFO', `Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    const notifications = []
    let processedPairs = 0
    const batchSize = 50 // Her seferde 50 coin işle

    // Coinleri batch'lere böl (API rate limit için)
    for (let i = 0; i < allSymbols.length; i += batchSize) {
      const batch = allSymbols.slice(i, i + batchSize)
      
      // Batch içindeki her coin için kline verilerini al
      const batchPromises = batch.map(async (symbol: string) => {
        try {
          // Son 2 dakikalık 1m kline verilerini al
          const klineUrl = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=1m&limit=2`
          const klineResponse = await fetch(klineUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; CryptoBot/1.0)'
            }
          })
          
          if (!klineResponse.ok) {
            // Rate limit hatası durumunda kısa bekle ve tekrar dene
            if (klineResponse.status === 429 || klineResponse.status === 451) {
              await new Promise(resolve => setTimeout(resolve, 1000))
              const retryResponse = await fetch(klineUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (compatible; CryptoBot/1.0)'
                }
              })
              if (!retryResponse.ok) {
                return null
              }
              const retryData = await retryResponse.json()
              if (retryData.length < 2) return null
              
              // Retry data ile devam et
              const currentCandle = retryData[0]
              const previousCandle = retryData[1]
              const currentClose = parseFloat(currentCandle[4])
              const previousClose = parseFloat(previousCandle[4])
              const volume = parseFloat(currentCandle[5])
              const priceChange = ((currentClose - previousClose) / previousClose) * 100

              if (Math.abs(priceChange) >= 3.0) {
                const signalType = priceChange > 0 ? 'PUMP' : 'DUMP'
                return {
                  symbol,
                  change_percent: priceChange,
                  price: currentClose,
                  volume: volume,
                  signal_type: signalType,
                  timestamp: Date.now()
                }
              }
              return null
            }
            return null
          }

          const klineData = await klineResponse.json()
          
          if (klineData.length < 2) {
            return null
          }

          // Son tamamlanan mum (index 0) ve önceki mum (index 1)
          const currentCandle = klineData[0]
          const previousCandle = klineData[1]

          const currentClose = parseFloat(currentCandle[4])  // Close price
          const previousClose = parseFloat(previousCandle[4]) // Previous close price
          const volume = parseFloat(currentCandle[5])        // Volume

          // 1 dakikalık değişim hesapla
          const priceChange = ((currentClose - previousClose) / previousClose) * 100

          // %3+ değişim kontrolü
          if (Math.abs(priceChange) >= 3.0) {
            const signalType = priceChange > 0 ? 'PUMP' : 'DUMP'
            
            return {
              symbol,
              change_percent: priceChange,
              price: currentClose,
              volume: volume,
              signal_type: signalType,
              timestamp: Date.now()
            }
          }

          return null

        } catch (error) {
          await log('ERROR', `Error processing ${symbol}`, { error: error.message })
          return null
        }
      })

      // Batch'i paralel olarak işle
      const batchResults = await Promise.all(batchPromises)
      
      // Null olmayan sonuçları ekle
      batchResults.forEach(result => {
        if (result) {
          notifications.push(result)
        }
      })

      processedPairs += batch.length

      // Batch'ler arası kısa bekleme (rate limit için)
      if (i + batchSize < allSymbols.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    await log('INFO', `Processed ${processedPairs} pairs, found ${notifications.length} signals`)

    // TÜM bildirimleri gönder (rate limit yok)
    if (notifications.length > 0) {
      await log('INFO', `Sending ${notifications.length} signals to Telegram`)
      
      for (let i = 0; i < notifications.length; i++) {
        const notification = notifications[i]
        await sendTelegramNotification(notification, log)
        
        // Telegram rate limit için sinyaller arası 1 saniye bekle
        if (i < notifications.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        total_pairs: allSymbols.length,
        processed: processedPairs,
        signals_found: notifications.length,
        signals_sent: notifications.length,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in full-monitor:', error)
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

async function sendTelegramNotification(notification: any, log: Function) {
  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!
    const channelId = Deno.env.get('TELEGRAM_CHANNEL_ID')!

    const emoji = notification.signal_type === 'PUMP' ? '↗️' : '↘️'
    const signalEmoji = notification.signal_type === 'PUMP' ? '🚀' : '📉'
    
    // Volume formatla
    const formatVolume = (volume: number): string => {
      if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(1)}B`
      if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`
      if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`
      return volume.toFixed(0)
    }

    // Fiyat formatla
    const formatPrice = (price: number): string => {
      if (price >= 1) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`
      return `$${price.toFixed(6)}`
    }

    const message = `${signalEmoji} ${notification.symbol} ${notification.signal_type}! %${Math.abs(notification.change_percent).toFixed(2)}${emoji} | Fiyat: ${formatPrice(notification.price)} | Volume: ${formatVolume(notification.volume)}`

    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelId,
        text: message,
        parse_mode: 'HTML'
      })
    })

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.text()
      throw new Error(`Telegram API error: ${telegramResponse.status} - ${errorData}`)
    }

    await log('INFO', `Sent ${notification.signal_type} signal for ${notification.symbol}`, {
      change_percent: notification.change_percent,
      price: notification.price
    })

  } catch (error) {
    await log('ERROR', `Failed to send notification for ${notification.symbol}`, {
      error: error.message,
      notification
    })
  }
}