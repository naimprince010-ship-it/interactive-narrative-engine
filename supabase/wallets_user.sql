-- Apply this if wallets.sql was already executed and you need auth-based wallets.

alter table public.user_wallets
  add column if not exists user_id text,
  alter column device_id drop not null;

alter table public.token_purchases
  add column if not exists user_id text,
  alter column device_id drop not null;

create unique index if not exists user_wallets_user_id_key on public.user_wallets (user_id);
create index if not exists token_purchases_user_id_idx on public.token_purchases (user_id);
