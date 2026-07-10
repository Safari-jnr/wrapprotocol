-- ─── Mork Airdrop — Supabase Schema ─────────────────────────────────────────
-- Run this in the Supabase SQL editor (or via supabase db push).
-- Safari owns this — service-role key stays with Safari only.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── users ────────────────────────────────────────────────────────────────────
-- Mirrors auth.users — we store only what the app UI needs.
-- Inserted automatically via trigger on auth.users insert.
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.handle_user_updated()
returns trigger language plpgsql security definer as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_user_updated on public.users;
create trigger on_user_updated
  before update on public.users
  for each row execute function public.handle_user_updated();

-- Mirror new auth.users into public.users
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── linked_wallets ───────────────────────────────────────────────────────────
-- An email-authed user can link one or more wallet addresses.
create type if not exists public.chain_type as enum ('evm', 'solana');

create table if not exists public.linked_wallets (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.users(id) on delete cascade,
  wallet_address text not null,
  chain          public.chain_type not null,
  linked_at      timestamptz not null default now(),
  unique (user_id, wallet_address)
);

create index if not exists linked_wallets_user_id_idx on public.linked_wallets(user_id);
create index if not exists linked_wallets_address_idx on public.linked_wallets(wallet_address);

-- ─── claims ───────────────────────────────────────────────────────────────────
-- Mirror of on-chain claim events. NOT the source of truth — contract is.
-- Written by the indexer (B5) and/or the /api/claims route handler.
create table if not exists public.claims (
  id             uuid primary key default uuid_generate_v4(),
  wallet_address text not null,
  chain          public.chain_type not null,
  tx_hash        text not null unique,         -- enforces one row per tx
  token_amount   text not null,                -- stored as string (avoids bigint issues)
  payment_amount text not null,
  claimed_at     timestamptz not null default now(),
  block_number   bigint
);

create index if not exists claims_wallet_idx  on public.claims(wallet_address);
create index if not exists claims_chain_idx   on public.claims(chain);
create index if not exists claims_claimed_at  on public.claims(claimed_at desc);

-- ─── sale_stats ───────────────────────────────────────────────────────────────
-- Single-row aggregate table. Updated by the stats cron (B5).
create table if not exists public.sale_stats (
  id                   int primary key default 1,      -- always 1
  total_claimed_evm    int not null default 0,
  total_claimed_solana int not null default 0,
  total_raised_eth     text not null default '0',
  total_raised_sol     text not null default '0',
  updated_at           timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- Seed the single stats row
insert into public.sale_stats (id) values (1) on conflict (id) do nothing;

-- ─── Row Level Security ───────────────────────────────────────────────────────

-- users: each user sees only their own row
alter table public.users enable row level security;
create policy "users: own row" on public.users
  for all using (auth.uid() = id);

-- linked_wallets: user sees only their own
alter table public.linked_wallets enable row level security;
create policy "linked_wallets: own rows" on public.linked_wallets
  for all using (auth.uid() = user_id);

-- claims: public read (transparency), write only via service role (indexer/API)
alter table public.claims enable row level security;
create policy "claims: public read" on public.claims
  for select using (true);
-- INSERT/UPDATE requires service role key (bypasses RLS by default in Supabase)

-- sale_stats: public read
alter table public.sale_stats enable row level security;
create policy "sale_stats: public read" on public.sale_stats
  for select using (true);
