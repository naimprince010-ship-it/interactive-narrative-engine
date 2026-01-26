-- Create payments table for bKash verification records.
-- Apply this in Supabase SQL editor.

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  payment_id text not null,
  trx_id text,
  story_id text not null,
  device_id text,
  created_at timestamptz not null default now()
);

create index if not exists payments_story_id_idx on public.payments (story_id);
create index if not exists payments_device_id_idx on public.payments (device_id);
create unique index if not exists payments_payment_id_key on public.payments (payment_id);

alter table public.payments enable row level security;
