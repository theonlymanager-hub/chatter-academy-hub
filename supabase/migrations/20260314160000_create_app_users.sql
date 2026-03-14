-- Create app_users table for dashboard authentication
CREATE TABLE IF NOT EXISTS public.app_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  display_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'supervisor', 'data_entry', 'chatter')),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Allow anonymous reads for login verification (anon key used by the frontend)
CREATE POLICY "Allow anon select for login" ON public.app_users
  FOR SELECT TO anon USING (true);

-- Seed users with SHA-256 hex hashes of their passwords
-- Hashes generated via: SELECT encode(digest('<password>', 'sha256'), 'hex')
INSERT INTO public.app_users (username, password_hash, display_name, role) VALUES
  ('luke',    encode(digest('Boss2026!',  'sha256'), 'hex'), 'Luke',    'admin'),
  ('zar',     encode(digest('Zar$uper9',  'sha256'), 'hex'), 'Zar',     'supervisor'),
  ('mark',    encode(digest('M4rkExec!',  'sha256'), 'hex'), 'Mark',    'supervisor'),
  ('elle',    encode(digest('Elle#Data5', 'sha256'), 'hex'), 'Elle',    'data_entry'),
  ('doug',    encode(digest('Doug@Admin1','sha256'), 'hex'), 'Doug',    'admin'),
  ('marc',    encode(digest('Ch4tMarc!',  'sha256'), 'hex'), 'Marc',    'chatter'),
  ('jd',      encode(digest('JDshift#7',  'sha256'), 'hex'), 'JD',      'chatter'),
  ('jemimah', encode(digest('Jem!mah22',  'sha256'), 'hex'), 'Jemimah', 'chatter'),
  ('kc',      encode(digest('KCwork$8',   'sha256'), 'hex'), 'KC',      'chatter'),
  ('jane',    encode(digest('Jan3shift!', 'sha256'), 'hex'), 'Jane',    'chatter')
ON CONFLICT (username) DO NOTHING;
