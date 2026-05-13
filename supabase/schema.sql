-- Checklist Bot - Supabase Schema
-- Run this migration in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ──────────────────────────────────────────────
-- USERS
-- ──────────────────────────────────────────────
create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  discord_id  text unique not null,
  username    text not null,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- PROJECTS
-- ──────────────────────────────────────────────
create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  guild_id    text not null,
  created_by  text not null references users(discord_id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- SECTIONS
-- ──────────────────────────────────────────────
create table if not exists sections (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  name        text not null,
  description text,
  sprint      text default 'Sprint 1',
  "order"     integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- SUBSECTIONS
-- ──────────────────────────────────────────────
create table if not exists subsections (
  id          uuid primary key default gen_random_uuid(),
  section_id  uuid not null references sections(id) on delete cascade,
  name        text not null,
  description text,
  "order"     integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- TASKS
-- ──────────────────────────────────────────────
create table if not exists tasks (
  id            uuid primary key default gen_random_uuid(),
  section_id    uuid not null references sections(id) on delete cascade,
  subsection_id uuid references subsections(id) on delete set null,
  title         text not null,
  description   text,
  completed     boolean not null default false,
  assigned_to   text references users(discord_id) on delete set null,
  weight        float not null default 0,
  created_at    timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- INDEXES
-- ──────────────────────────────────────────────
create index if not exists idx_projects_guild     on projects(guild_id);
create index if not exists idx_sections_project   on sections(project_id);
create index if not exists idx_subsections_section on subsections(section_id);
create index if not exists idx_tasks_section      on tasks(section_id);
create index if not exists idx_tasks_subsection   on tasks(subsection_id);
create index if not exists idx_tasks_assigned     on tasks(assigned_to);

-- ──────────────────────────────────────────────
-- ROW LEVEL SECURITY (optional — enable per your Supabase policy needs)
-- ──────────────────────────────────────────────
-- alter table users       enable row level security;
-- alter table projects    enable row level security;
-- alter table sections    enable row level security;
-- alter table subsections enable row level security;
-- alter table tasks       enable row level security;

-- If you enable RLS, add policies here. For simplicity the API routes use
-- the service-role key which bypasses RLS.
