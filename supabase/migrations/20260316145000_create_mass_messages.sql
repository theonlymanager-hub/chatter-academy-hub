-- Scheduled mass messages
CREATE TABLE IF NOT EXISTS public.scheduled_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model text NOT NULL,
  date date NOT NULL,
  time text DEFAULT '',
  type text NOT NULL DEFAULT 'Mass Message',
  content text DEFAULT '',
  status text DEFAULT 'draft',
  segment text DEFAULT 'All Fans',
  price text DEFAULT '',
  variant_b text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read scheduled_messages" ON public.scheduled_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert scheduled_messages" ON public.scheduled_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update scheduled_messages" ON public.scheduled_messages FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete scheduled_messages" ON public.scheduled_messages FOR DELETE USING (true);

-- PPV Ideas
CREATE TABLE IF NOT EXISTS public.ppv_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model text NOT NULL,
  title text DEFAULT '',
  description text DEFAULT '',
  price text DEFAULT '',
  segment text DEFAULT 'All Fans',
  status text DEFAULT 'idea',
  conversion_rate text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ppv_ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read ppv_ideas" ON public.ppv_ideas FOR SELECT USING (true);
CREATE POLICY "Anyone can insert ppv_ideas" ON public.ppv_ideas FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update ppv_ideas" ON public.ppv_ideas FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete ppv_ideas" ON public.ppv_ideas FOR DELETE USING (true);
