-- Run this once in Supabase SQL Editor

create table if not exists users (
  id bigint generated always as identity primary key,
  username text unique not null,
  password_hash text not null
);

create table if not exists accounts (
  id bigint generated always as identity primary key,
  user_id bigint references users(id) on delete cascade,
  type text not null check (type in ('spend', 'save', 'share')),
  account_number text not null,
  balance numeric(12, 2) not null default 0
);

create table if not exists transactions (
  id bigint generated always as identity primary key,
  account_id bigint references accounts(id) on delete cascade,
  txn_date text not null,
  description text not null,
  reference text not null,
  type text not null check (type in ('credit', 'debit')),
  amount numeric(12, 2) not null
);

-- Disable RLS so the service role key can read/write freely
alter table users       disable row level security;
alter table accounts    disable row level security;
alter table transactions disable row level security;
