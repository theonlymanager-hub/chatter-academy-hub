CREATE TABLE public.test_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.test_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select" ON public.test_table
  FOR SELECT USING (true);