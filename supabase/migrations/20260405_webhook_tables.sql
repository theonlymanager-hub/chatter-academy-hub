-- OF API webhook tables

CREATE TABLE IF NOT EXISTS of_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text,
  account_id text,
  data jsonb,
  received_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id text,
  username text,
  account_id text,
  price numeric,
  subscribed_at timestamptz,
  renewed_at timestamptz
);

CREATE TABLE IF NOT EXISTS ppv_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  account_id text,
  amount numeric,
  message_id text,
  unlocked_at timestamptz
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id text,
  account_id text,
  text text,
  received_at timestamptz
);

-- RLS policies (allow all for service role)
ALTER TABLE of_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppv_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON of_events FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON subscriptions FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON ppv_sales FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON messages FOR ALL USING (true);
