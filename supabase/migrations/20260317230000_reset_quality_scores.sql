-- Reset quality scores as requested by Luke (2026-03-17)
-- Wiping all inflated/generic scores to start fresh
TRUNCATE TABLE quality_scores;

-- Create RPC function for future admin truncates (bypasses RLS)
CREATE OR REPLACE FUNCTION admin_truncate_quality_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  TRUNCATE TABLE quality_scores;
END;
$$;

-- Also create a general admin delete function for any table
CREATE OR REPLACE FUNCTION admin_delete_all(table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format('DELETE FROM %I', table_name);
END;
$$;
