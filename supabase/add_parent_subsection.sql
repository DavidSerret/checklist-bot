ALTER TABLE subsections
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES subsections(id) ON DELETE CASCADE;
