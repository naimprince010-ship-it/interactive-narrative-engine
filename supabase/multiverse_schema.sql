-- Multiverse Story System Database Schema
-- Apply this in Supabase SQL Editor

-- Stories table (base story templates)
create table if not exists public.stories (
  id text primary key,
  title text not null,
  description text,
  max_players integer not null default 3,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Character templates (available characters per story)
create table if not exists public.character_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  story_id text not null references public.stories(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(story_id, name)
);

create index if not exists character_templates_story_id_idx on public.character_templates (story_id);

-- Story instances (active multiverse timelines)
create table if not exists public.story_instances (
  id uuid primary key default gen_random_uuid(),
  story_id text not null references public.stories(id) on delete cascade,
  status text not null default 'WAITING', -- WAITING, ACTIVE, COMPLETED
  current_node_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists story_instances_story_id_status_idx on public.story_instances (story_id, status);
create index if not exists story_instances_status_idx on public.story_instances (status);

-- Character assignments (user → character mapping, SECRET)
create table if not exists public.character_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id text not null, -- Supabase auth user ID
  instance_id uuid not null references public.story_instances(id) on delete cascade,
  template_id uuid not null references public.character_templates(id) on delete cascade,
  is_revealed boolean not null default false,
  revealed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, instance_id),
  unique(instance_id, template_id)
);

create index if not exists character_assignments_user_id_idx on public.character_assignments (user_id);
create index if not exists character_assignments_instance_id_idx on public.character_assignments (instance_id);

-- Story nodes (branching story structure)
create table if not exists public.story_nodes (
  id uuid primary key default gen_random_uuid(),
  story_id text not null references public.stories(id) on delete cascade,
  node_key text not null, -- Unique key (e.g., "start", "phone_call", "ending_happy")
  title text not null,
  content text not null, -- Base story content
  choices jsonb, -- Array of choices with conditions and next nodes
  is_ending boolean not null default false,
  created_at timestamptz not null default now(),
  unique(story_id, node_key)
);

create index if not exists story_nodes_story_id_idx on public.story_nodes (story_id);

-- Character chat (anonymous messages)
create table if not exists public.character_chat (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references public.story_instances(id) on delete cascade,
  character_id uuid not null references public.character_templates(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists character_chat_instance_created_idx on public.character_chat (instance_id, created_at);

-- User choices (what each user chose)
create table if not exists public.user_choices (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references public.story_instances(id) on delete cascade,
  user_id text not null, -- Hidden from frontend
  node_id uuid not null references public.story_nodes(id) on delete cascade,
  choice_key text not null, -- Which choice option was selected
  created_at timestamptz not null default now(),
  unique(instance_id, user_id, node_id)
);

create index if not exists user_choices_instance_node_idx on public.user_choices (instance_id, node_id);

-- Story state (current state of instance)
create table if not exists public.story_state (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid unique not null references public.story_instances(id) on delete cascade,
  current_node_id text,
  state_data jsonb, -- Additional state (character positions, flags, etc.)
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.stories enable row level security;
alter table public.character_templates enable row level security;
alter table public.story_instances enable row level security;
alter table public.character_assignments enable row level security;
alter table public.story_nodes enable row level security;
alter table public.character_chat enable row level security;
alter table public.user_choices enable row level security;
alter table public.story_state enable row level security;

-- RLS Policies (basic - adjust as needed)
-- Users can read stories and nodes
create policy "Stories are viewable by everyone" on public.stories
  for select using (true);

create policy "Story nodes are viewable by everyone" on public.story_nodes
  for select using (true);

-- Users can only see their own character assignments
create policy "Users can view their own assignments" on public.character_assignments
  for select using (auth.uid()::text = user_id);

-- Users can see instances they're part of
create policy "Users can view their instances" on public.story_instances
  for select using (
    id in (
      select instance_id from public.character_assignments
      where user_id = auth.uid()::text
    )
  );

-- Users can see chat for their instances
create policy "Users can view chat for their instances" on public.character_chat
  for select using (
    instance_id in (
      select instance_id from public.character_assignments
      where user_id = auth.uid()::text
    )
  );

-- Users can see their own choices
create policy "Users can view their own choices" on public.user_choices
  for select using (auth.uid()::text = user_id);
