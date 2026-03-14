

## Plan: Create test_table in database

**What**: Create a single table `test_table` with 3 columns and a permissive RLS select policy.

**SQL Migration**:
```sql
CREATE TABLE public.test_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.test_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select" ON public.test_table
  FOR SELECT USING (true);
```

No code changes needed — this is a schema-only operation to verify the migration tool works.

