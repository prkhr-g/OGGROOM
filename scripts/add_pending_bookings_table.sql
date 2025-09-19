CREATE TABLE IF NOT EXISTS pending_bookings (
    order_id TEXT PRIMARY KEY,
    shop_id UUID NOT NULL REFERENCES shops(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    barber_id BIGINT NOT NULL,
    service_ids BIGINT[] NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TEXT NOT NULL,
    total_price NUMERIC NOT NULL,
    total_duration INTEGER NOT NULL,
    customer_notes TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pending_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow customer to insert their own pending bookings" 
ON pending_bookings FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Allow customer to read their own pending bookings" 
ON pending_bookings FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Allow service role to access all pending bookings" 
ON pending_bookings FOR ALL 
USING (get_my_claim('role') = 'service_role');
