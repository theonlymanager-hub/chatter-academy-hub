-- Whiteboard items table
CREATE TABLE IF NOT EXISTS whiteboard_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('goal', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE whiteboard_items ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read
CREATE POLICY "Authenticated users can read whiteboard items"
  ON whiteboard_items FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Admin and supervisor can insert
CREATE POLICY "Admin and supervisor can insert whiteboard items"
  ON whiteboard_items FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'supervisor')
  );

-- Policy: Admin and supervisor can update
CREATE POLICY "Admin and supervisor can update whiteboard items"
  ON whiteboard_items FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'supervisor')
  );

-- Policy: Admin and supervisor can delete
CREATE POLICY "Admin and supervisor can delete whiteboard items"
  ON whiteboard_items FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'supervisor')
  );
