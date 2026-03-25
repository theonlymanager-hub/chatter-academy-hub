-- Dashboard activity table for tracking chatter logins and page visits
CREATE TABLE IF NOT EXISTS public.dashboard_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  date text NOT NULL,
  pages_visited jsonb DEFAULT '[]'::jsonb,
  login_time timestamptz DEFAULT now(),
  last_sync timestamptz DEFAULT now(),
  UNIQUE(username, date)
);

-- Enable RLS
ALTER TABLE public.dashboard_activity ENABLE ROW LEVEL SECURITY;

-- Allow all operations
CREATE POLICY "Allow all operations on dashboard_activity" ON public.dashboard_activity
  FOR ALL USING (true) WITH CHECK (true);
