-- Quiz results table for training quiz scores
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  score integer NOT NULL,
  total integer NOT NULL,
  percentage integer NOT NULL,
  category_scores jsonb DEFAULT '{}'::jsonb,
  quiz_name text DEFAULT 'Training Quiz',
  completed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated (anon) operations
CREATE POLICY "Allow all operations on quiz_results" ON public.quiz_results
  FOR ALL USING (true) WITH CHECK (true);
