-- Add DELETE policies to all tables that are missing them
CREATE POLICY "Allow delete on customs" ON public.customs FOR DELETE USING (true);
CREATE POLICY "Allow delete on fan_profiles" ON public.fan_profiles FOR DELETE USING (true);
CREATE POLICY "Allow delete on attendance" ON public.attendance FOR DELETE USING (true);
CREATE POLICY "Allow delete on quality_scores" ON public.quality_scores FOR DELETE USING (true);
CREATE POLICY "Allow delete on whale_tracking" ON public.whale_tracking FOR DELETE USING (true);
CREATE POLICY "Allow delete on shifts" ON public.shifts FOR DELETE USING (true);
CREATE POLICY "Allow delete on sales_screenshots" ON public.sales_screenshots FOR DELETE USING (true);
CREATE POLICY "Allow delete on chat_feed" ON public.chat_feed FOR DELETE USING (true);
