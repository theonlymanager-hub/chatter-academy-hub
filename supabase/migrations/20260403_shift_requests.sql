-- Create shift_requests table
CREATE TABLE IF NOT EXISTS shift_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatter_name TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('time-off', 'shift-swap', 'schedule-change')),
  request_date DATE NOT NULL,
  shift TEXT NOT NULL CHECK (shift IN ('morning', 'afternoon', 'night')),
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT,
  notes TEXT
);

-- Enable RLS
ALTER TABLE shift_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all for authenticated users
CREATE POLICY "Allow all for authenticated users" ON shift_requests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Index for efficient queries
CREATE INDEX idx_shift_requests_status ON shift_requests(status, submitted_at DESC);
CREATE INDEX idx_shift_requests_chatter ON shift_requests(chatter_name, submitted_at DESC);
