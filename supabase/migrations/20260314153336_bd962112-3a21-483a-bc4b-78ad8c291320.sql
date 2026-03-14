-- Drop test table
DROP TABLE IF EXISTS public.test_table;

-- 1. Attendance
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatter_name text,
  discord_username text,
  login_time timestamptz,
  logout_time timestamptz,
  shift text,
  date date,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Allow insert on attendance" ON public.attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on attendance" ON public.attendance FOR UPDATE USING (true);

-- 2. Customs
CREATE TABLE public.customs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_username text,
  model_name text,
  description text,
  price numeric,
  deadline date,
  status text DEFAULT 'pending',
  assigned_to text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.customs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on customs" ON public.customs FOR SELECT USING (true);
CREATE POLICY "Allow insert on customs" ON public.customs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on customs" ON public.customs FOR UPDATE USING (true);

-- 3. Sales Screenshots
CREATE TABLE public.sales_screenshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatter_name text,
  model_name text,
  image_url text,
  amount numeric,
  date date,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.sales_screenshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on sales_screenshots" ON public.sales_screenshots FOR SELECT USING (true);
CREATE POLICY "Allow insert on sales_screenshots" ON public.sales_screenshots FOR INSERT WITH CHECK (true);

-- 4. Chat Feed
CREATE TABLE public.chat_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_name text,
  author text,
  message_text text,
  discord_message_id text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.chat_feed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on chat_feed" ON public.chat_feed FOR SELECT USING (true);
CREATE POLICY "Allow insert on chat_feed" ON public.chat_feed FOR INSERT WITH CHECK (true);

-- 5. Shifts
CREATE TABLE public.shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatter_name text,
  shift_type text,
  models text[],
  date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on shifts" ON public.shifts FOR SELECT USING (true);
CREATE POLICY "Allow insert on shifts" ON public.shifts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on shifts" ON public.shifts FOR UPDATE USING (true);

-- 6. Fan Profiles
CREATE TABLE public.fan_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  model_name text,
  of_username text,
  dob date,
  location text,
  relationship_status text,
  hobbies text,
  payday text,
  notes text,
  last_messaged timestamptz,
  is_whale boolean DEFAULT false,
  total_spent numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.fan_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on fan_profiles" ON public.fan_profiles FOR SELECT USING (true);
CREATE POLICY "Allow insert on fan_profiles" ON public.fan_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on fan_profiles" ON public.fan_profiles FOR UPDATE USING (true);

-- 7. Whale Tracking
CREATE TABLE public.whale_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_profile_id uuid REFERENCES public.fan_profiles(id),
  model_name text,
  last_contact timestamptz,
  status text DEFAULT 'active',
  priority text DEFAULT 'medium',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.whale_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on whale_tracking" ON public.whale_tracking FOR SELECT USING (true);
CREATE POLICY "Allow insert on whale_tracking" ON public.whale_tracking FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on whale_tracking" ON public.whale_tracking FOR UPDATE USING (true);

-- 8. Quality Scores
CREATE TABLE public.quality_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatter_name text,
  shift_date date,
  response_time_score numeric,
  personalisation_score numeric,
  conversation_flow_score numeric,
  ppv_timing_score numeric,
  energy_tone_score numeric,
  overall_score numeric,
  notes text,
  reviewed_by text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.quality_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on quality_scores" ON public.quality_scores FOR SELECT USING (true);
CREATE POLICY "Allow insert on quality_scores" ON public.quality_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on quality_scores" ON public.quality_scores FOR UPDATE USING (true);