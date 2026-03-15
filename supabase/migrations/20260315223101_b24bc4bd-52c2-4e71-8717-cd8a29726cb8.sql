CREATE TABLE IF NOT EXISTS chat_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tab TEXT NOT NULL CHECK (tab IN ('bad', 'good')),
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  chatter_name TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE chat_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read chat_feedback" ON chat_feedback FOR SELECT USING (true);
CREATE POLICY "Anyone can insert chat_feedback" ON chat_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete chat_feedback" ON chat_feedback FOR DELETE USING (true);
CREATE POLICY "Anyone can update chat_feedback" ON chat_feedback FOR UPDATE USING (true);