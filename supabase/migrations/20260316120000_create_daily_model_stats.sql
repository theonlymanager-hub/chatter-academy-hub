-- Daily model revenue statistics table
CREATE TABLE IF NOT EXISTS public.daily_model_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  model_name text NOT NULL,
  total_revenue numeric DEFAULT 0,
  subscription_revenue numeric DEFAULT 0,
  message_revenue numeric DEFAULT 0,
  tip_revenue numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(date, model_name)
);

-- Enable RLS
ALTER TABLE public.daily_model_stats ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read
CREATE POLICY "Anyone can read daily_model_stats"
  ON public.daily_model_stats FOR SELECT
  USING (true);

-- Allow anon to insert/update (for cron script)
CREATE POLICY "Anon can insert daily_model_stats"
  ON public.daily_model_stats FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anon can update daily_model_stats"
  ON public.daily_model_stats FOR UPDATE
  USING (true);
