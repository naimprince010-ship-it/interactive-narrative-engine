-- Apply this if wallets.sql was already executed.

alter table public.token_purchases
  add column if not exists verified boolean not null default false,
  add column if not exists verified_at timestamptz;
