-- Create airbnb_bookings table
CREATE TABLE IF NOT EXISTS airbnb_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL,
  booking_url TEXT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  location TEXT NOT NULL,
  price_gbp DECIMAL(10,2) DEFAULT 0,
  booking_status TEXT NOT NULL DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  shoot_type TEXT NOT NULL DEFAULT 'content' CHECK (shoot_type IN ('content', 'custom', 'collab')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE airbnb_bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all for authenticated users
CREATE POLICY "Allow all for authenticated users" ON airbnb_bookings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Indexes for efficient queries
CREATE INDEX idx_airbnb_bookings_account ON airbnb_bookings(account_id);
CREATE INDEX idx_airbnb_bookings_dates ON airbnb_bookings(check_in_date, check_out_date);
CREATE INDEX idx_airbnb_bookings_status ON airbnb_bookings(booking_status, check_in_date);
