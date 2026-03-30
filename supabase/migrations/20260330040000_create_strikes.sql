-- Strikes table for the 3-strike warning system
CREATE TABLE IF NOT EXISTS strikes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatter_name TEXT NOT NULL,
  strike_number INTEGER NOT NULL CHECK (strike_number BETWEEN 1 AND 3),
  reason TEXT NOT NULL,
  issued_by TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'appealed'))
);

-- Index for quick lookups by chatter
CREATE INDEX IF NOT EXISTS idx_strikes_chatter_name ON strikes (chatter_name);
CREATE INDEX IF NOT EXISTS idx_strikes_status ON strikes (status);

-- RLS
ALTER TABLE strikes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users" ON strikes
  FOR ALL
  USING (true)
  WITH CHECK (true);
