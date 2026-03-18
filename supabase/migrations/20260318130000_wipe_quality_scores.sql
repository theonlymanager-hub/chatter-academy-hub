-- Wipe quality scores for fresh start (Luke's order 2026-03-18)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'quality_scores' AND policyname = 'Allow delete on quality_scores'
  ) THEN
    CREATE POLICY "Allow delete on quality_scores" ON public.quality_scores FOR DELETE USING (true);
  END IF;
END
$$;

TRUNCATE public.quality_scores;
