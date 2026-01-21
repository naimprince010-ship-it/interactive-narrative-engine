-- Token wallet schema for manual payment flow.
-- Apply this in Supabase SQL editor.

create table if not exists public.user_wallets (
  id uuid primary key default gen_random_uuid(),
  device_id text not null unique,
  balance integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.token_purchases (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  package_id text not null,
  amount_bdt integer not null,
  tokens integer not null,
  trx_id text,
  created_at timestamptz not null default now()
);

create index if not exists token_purchases_device_id_idx on public.token_purchases (device_id);
create index if not exists token_purchases_package_id_idx on public.token_purchases (package_id);

alter table public.user_wallets enable row level security;
alter table public.token_purchases enable row level security;
