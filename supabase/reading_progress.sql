-- Reading progress table for tracking user story reading progress.
-- Apply this in Supabase SQL editor.

create table if not exists public.reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id text, -- Supabase auth user ID
  device_id text, -- For anonymous users
  story_id text not null,
  current_chapter_id text not null,
  unlocked_chapters text[] not null default array[]::text[],
  last_read_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique constraints: one progress per user/device per story
-- Note: PostgreSQL doesn't support multiple unique constraints with WHERE clause easily
-- We'll handle uniqueness in the application layer via upsert with onConflict

-- Indexes for faster queries
create index if not exists reading_progress_user_id_idx on public.reading_progress (user_id);
create index if not exists reading_progress_device_id_idx on public.reading_progress (device_id);
create index if not exists reading_progress_story_id_idx on public.reading_progress (story_id);

-- Enable RLS
alter table public.reading_progress enable row level security;

-- RLS Policy: Users can only see their own progress
-- This will be handled by the API using service role key for writes
-- For reads, we'll use service role or allow based on user_id/device_id matching
