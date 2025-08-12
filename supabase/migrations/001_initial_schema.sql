-- Coin verileri tablosu
CREATE TABLE coin_data (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL UNIQUE,
    current_price DECIMAL(20, 8) NOT NULL,
    price_change_percent DECIMAL(10, 4) NOT NULL,
    volume DECIMAL(20, 8) NOT NULL,
    quote_volume DECIMAL(20, 8) NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bildirim geçmişi tablosu
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    change_percent DECIMAL(10, 4) NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    volume DECIMAL(20, 8) NOT NULL,
    signal_type VARCHAR(10) NOT NULL CHECK (signal_type IN ('PUMP', 'DUMP')),
    telegram_message_id BIGINT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sistem logları tablosu
CREATE TABLE system_logs (
    id BIGSERIAL PRIMARY KEY,
    level VARCHAR(10) NOT NULL CHECK (level IN ('INFO', 'WARN', 'ERROR')),
    message TEXT NOT NULL,
    data JSONB,
    function_name VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX idx_coin_data_symbol ON coin_data(symbol);
CREATE INDEX idx_coin_data_last_updated ON coin_data(last_updated);
CREATE INDEX idx_notifications_symbol ON notifications(symbol);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at);
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);

-- RLS (Row Level Security) politikaları
ALTER TABLE coin_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Anon kullanıcılar için okuma izni
CREATE POLICY "Allow anon read access" ON coin_data FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON notifications FOR SELECT TO anon USING (true);

-- Service role için tam erişim
CREATE POLICY "Allow service role full access" ON coin_data FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role full access" ON notifications FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role full access" ON system_logs FOR ALL TO service_role USING (true);

-- Fonksiyonlar
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger
CREATE TRIGGER update_coin_data_last_updated 
    BEFORE UPDATE ON coin_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_last_updated_column();

-- Duplicate bildirim kontrolü için fonksiyon
CREATE OR REPLACE FUNCTION check_duplicate_notification(
    p_symbol VARCHAR(20),
    p_signal_type VARCHAR(10),
    p_minutes INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM notifications 
        WHERE symbol = p_symbol 
        AND signal_type = p_signal_type 
        AND sent_at > NOW() - INTERVAL '1 minute' * p_minutes
    );
END;
$$ LANGUAGE plpgsql;