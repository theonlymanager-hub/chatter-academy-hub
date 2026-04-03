-- Create mass_messages table for scheduling
CREATE TABLE IF NOT EXISTS mass_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('mass', 'ppv', 'prompt')),
  message_text TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE mass_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all for authenticated users
CREATE POLICY "Allow all for authenticated users" ON mass_messages
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Index for efficient queries
CREATE INDEX idx_mass_messages_account_date ON mass_messages(account_id, scheduled_date, scheduled_time);
CREATE INDEX idx_mass_messages_status ON mass_messages(status, scheduled_date);
