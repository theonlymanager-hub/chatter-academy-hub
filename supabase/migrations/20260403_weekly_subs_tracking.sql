-- Weekly subscriber tracking for LTV calculation
-- Tracks NEW subscribers per account per week (resets Monday)

CREATE TABLE IF NOT EXISTS weekly_subs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id TEXT NOT NULL,  -- e.g., 'ashley', 'izzie', 'willow'
  week_start DATE NOT NULL,  -- Monday of the week (YYYY-MM-DD)
  new_subs_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, week_start)
);

-- Enable RLS
ALTER TABLE weekly_subs ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read
CREATE POLICY "Authenticated users can read weekly subs"
  ON weekly_subs FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Admin and supervisor can insert/update
CREATE POLICY "Admin and supervisor can insert weekly subs"
  ON weekly_subs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'supervisor')
  );

CREATE POLICY "Admin and supervisor can update weekly subs"
  ON weekly_subs FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'supervisor')
  );

-- Index for faster lookups
CREATE INDEX idx_weekly_subs_account_week ON weekly_subs(account_id, week_start);

-- Function to get current week's Monday
CREATE OR REPLACE FUNCTION get_week_start(input_date DATE DEFAULT CURRENT_DATE)
RETURNS DATE AS $$
BEGIN
  -- Calculate Monday of the week containing input_date
  RETURN input_date - EXTRACT(DOW FROM input_date)::INTEGER + 
         CASE WHEN EXTRACT(DOW FROM input_date) = 0 THEN -6 ELSE 1 END;
END;
$$ LANGUAGE plpgsql;

-- Function to increment weekly sub count (called by webhook)
CREATE OR REPLACE FUNCTION increment_weekly_subs(
  p_account_id TEXT,
  p_count INTEGER DEFAULT 1
)
RETURNS void AS $$
DECLARE
  v_week_start DATE;
BEGIN
  v_week_start := get_week_start(CURRENT_DATE);
  
  INSERT INTO weekly_subs (account_id, week_start, new_subs_count)
  VALUES (p_account_id, v_week_start, p_count)
  ON CONFLICT (account_id, week_start)
  DO UPDATE SET 
    new_subs_count = weekly_subs.new_subs_count + p_count,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
