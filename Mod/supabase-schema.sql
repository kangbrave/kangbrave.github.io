-- Mod public sharing schema for Supabase.
-- Run this script in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 100),
  author text not null default 'Anonymous' check (char_length(author) between 1 and 40),
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.post_files (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  file_name text not null,
  mime_type text not null default 'application/octet-stream',
  file_size bigint not null default 0 check (file_size >= 0),
  storage_path text not null unique,
  public_url text not null,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;
alter table public.post_files enable row level security;

-- Make this script safe to run more than once.
drop policy if exists "public can read posts" on public.posts;
drop policy if exists "public can create posts" on public.posts;
drop policy if exists "public can read files" on public.post_files;
drop policy if exists "public can create files" on public.post_files;
drop policy if exists "public can upload mod files" on storage.objects;
drop policy if exists "public can read mod files" on storage.objects;

create policy "public can read posts"
  on public.posts for select to anon, authenticated using (true);

create policy "public can create posts"
  on public.posts for insert to anon, authenticated with check (true);

create policy "public can read files"
  on public.post_files for select to anon, authenticated using (true);

create policy "public can create files"
  on public.post_files for insert to anon, authenticated with check (true);

insert into storage.buckets (id, name, public)
values ('mod-files', 'mod-files', true)
on conflict (id) do update set public = excluded.public;

create policy "public can upload mod files"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'mod-files');

create policy "public can read mod files"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'mod-files');

-- Optional cleanup policies: allow public users to remove nothing.
-- Deletion should be handled later by an authenticated admin/backend.
