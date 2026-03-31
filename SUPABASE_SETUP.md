# Supabase Setup for Client Checklist

## What Changed

The Client Checklist page now syncs to Supabase instead of only using localStorage. This means:

- ✅ Progress is shared across devices
- ✅ Anyone with the link can view and update
- ✅ Admin features (edit targets, links, tasks) still require auth
- ✅ Falls back to localStorage if Supabase is unavailable

## Required: Run the SQL Migration

**You need to run the SQL migration once** to create the `client_checklist` table.

### How to Run

1. Go to: https://supabase.com/dashboard/project/teekywdpkhquacjmvlnw/sql/new
2. Copy the SQL from `supabase_migration_client_checklist.sql`
3. Paste and run it

**OR** just paste this directly:

```sql
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
```

## New Features

### 1. Resources & Upload Links (top section)
- Google Drive folder link (admin-editable)
- Content guidelines link (admin-editable)
- Quick instructions for clients

### 2. Example Text for Each Item
Each recurring item now shows what's expected:
- **Photo Sets**: "10 different outfits — bedroom, lifestyle, lingerie. Min 5 photos per set."
- **Short Video Clips**: "30-60 sec clips. Mix of SFW (teasers) and explicit. Vertical format."
- **PPV Content Pieces**: "Exclusive content for paid messages. Solo, toys, scenarios."
- **Script Packages**: "Full scenario shoots from the scenario board. Follow the script exactly."

### 3. Supabase Sync
- Data is stored in Supabase and shared across devices
- Falls back to localStorage if Supabase fails
- Real-time updates (updates_at timestamp visible to everyone)

### 4. No Login Required
- Anyone with `?model=Name` in the URL can view and check items off
- Admin features (edit targets, add tasks, edit links) still require login

### 5. Last Updated Timestamp
- Shows when the checklist was last updated
- Visible to everyone

## How It Works

When a client visits `/client-checklist?model=Ashley`:
1. The page loads data from Supabase for model "Ashley" for the current week
2. If Supabase fails, it falls back to localStorage
3. When they tick items off, it saves to both Supabase and localStorage
4. Admin can edit targets, drive links, and add specific tasks (requires login)

## Testing

After running the migration:
1. Visit: https://chatter-academy-hub.lovable.app/client-checklist?model=Test
2. Tick some items off
3. Open in another browser/device with the same URL
4. Changes should sync automatically
