-- Add sprints array to projects so sprint names are managed per-project
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS sprints TEXT[] NOT NULL DEFAULT '{"Sprint 1","Sprint 2","Sprint 3","Sprint 4"}';
