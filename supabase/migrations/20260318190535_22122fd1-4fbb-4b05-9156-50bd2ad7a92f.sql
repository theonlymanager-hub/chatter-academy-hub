CREATE TABLE IF NOT EXISTS public.daily_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  item_id text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  checked boolean NOT NULL DEFAULT false,
  checked_at timestamptz,
  UNIQUE(username, item_id, date)
);

ALTER TABLE public.daily_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all reads on daily_checklist_items" ON public.daily_checklist_items FOR SELECT USING (true);
CREATE POLICY "Allow all inserts on daily_checklist_items" ON public.daily_checklist_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates on daily_checklist_items" ON public.daily_checklist_items FOR UPDATE USING (true);
CREATE POLICY "Allow all deletes on daily_checklist_items" ON public.daily_checklist_items FOR DELETE USING (true);