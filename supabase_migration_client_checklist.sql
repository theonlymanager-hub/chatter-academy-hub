-- Migration: Create client_checklist table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/teekywdpkhquacjmvlnw/sql/new

-- Create the table
CREATE TABLE IF NOT EXISTS public.client_checklist (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  model_name text NOT NULL,
  week_start date NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(model_name, week_start)
);

-- Enable Row Level Security
ALTER TABLE public.client_checklist ENABLE ROW LEVEL SECURITY;

-- Allow public read/write (anyone with the link can view and update)
CREATE POLICY "Allow public read/write"
  ON public.client_checklist
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_client_checklist_model_week 
  ON public.client_checklist (model_name, week_start);
