-- Add missing columns to customs
ALTER TABLE public.customs ADD COLUMN IF NOT EXISTS fan_name text;
ALTER TABLE public.customs ADD COLUMN IF NOT EXISTS detailed_description text;

-- Add missing columns to fan_profiles
ALTER TABLE public.fan_profiles ADD COLUMN IF NOT EXISTS tier text DEFAULT 'regular';
ALTER TABLE public.fan_profiles ADD COLUMN IF NOT EXISTS preferences text[];
ALTER TABLE public.fan_profiles ADD COLUMN IF NOT EXISTS personality text;
ALTER TABLE public.fan_profiles ADD COLUMN IF NOT EXISTS active_time text;
ALTER TABLE public.fan_profiles ADD COLUMN IF NOT EXISTS job text;
ALTER TABLE public.fan_profiles ADD COLUMN IF NOT EXISTS interests text;
ALTER TABLE public.fan_profiles ADD COLUMN IF NOT EXISTS last_active text;