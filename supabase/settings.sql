-- Settings table for admin-configurable values (bKash number, etc.)
-- Apply this in Supabase SQL editor.

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text not null,
  description text,
  updated_at timestamptz not null default now()
);

-- Insert default bKash number
insert into public.settings (key, value, description)
values ('bkash_number', '01700000000', 'bKash payment number for token purchases')
on conflict (key) do nothing;

-- Create index
create index if not exists settings_key_idx on public.settings (key);

-- Enable RLS (only service role can write, anon can read)
alter table public.settings enable row level security;

-- Allow read access for everyone (for public display)
create policy "Settings are viewable by everyone" on public.settings
  for select using (true);

-- Only service role can update (via API with service role key)
-- Updates will be done via API with SUPABASE_SERVICE_ROLE_KEY
