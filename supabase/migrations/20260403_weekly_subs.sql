-- Create weekly_subs table for LTV tracking
CREATE TABLE IF NOT EXISTS weekly_subs (
  id BIGSERIAL PRIMARY KEY,
  account_id TEXT NOT NULL,
  week_start DATE NOT NULL,
  new_subs_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(account_id, week_start)
);

-- Enable RLS
ALTER TABLE weekly_subs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations (dashboard-only access)
CREATE POLICY "Allow all for authenticated users" ON weekly_subs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to increment weekly subs (called by webhook)
CREATE OR REPLACE FUNCTION increment_weekly_subs(
  p_account_id TEXT,
  p_week_start DATE
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO weekly_subs (account_id, week_start, new_subs_count)
  VALUES (p_account_id, p_week_start, 1)
  ON CONFLICT (account_id, week_start)
  DO UPDATE SET
    new_subs_count = weekly_subs.new_subs_count + 1,
    updated_at = timezone('utc'::text, now());
END;
$$;
