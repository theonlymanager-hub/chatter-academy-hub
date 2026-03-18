-- Daily top chatter and top model tracking
CREATE TABLE IF NOT EXISTS public.daily_winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  top_chatter_name text,
  top_chatter_revenue numeric DEFAULT 0,
  top_model_name text,
  top_model_revenue numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(date)
);

ALTER TABLE public.daily_winners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read daily_winners" ON public.daily_winners FOR SELECT USING (true);
CREATE POLICY "Anyone can insert daily_winners" ON public.daily_winners FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update daily_winners" ON public.daily_winners FOR UPDATE USING (true);
