-- Jalankan script ini di Supabase SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(), title text not null check (char_length(title) between 1 and 100),
  author text not null default 'Anonymous', description text not null default '', created_at timestamptz not null default now()
);
create table if not exists public.post_files (
  id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade,
  file_name text not null, mime_type text not null default 'application/octet-stream', file_size bigint not null default 0,
  storage_path text not null, public_url text not null, created_at timestamptz not null default now()
);
alter table public.posts enable row level security; alter table public.post_files enable row level security;
create policy "public can read posts" on public.posts for select using (true);
create policy "public can create posts" on public.posts for insert with check (true);
create policy "public can read files" on public.post_files for select using (true);
create policy "public can create files" on public.post_files for insert with check (true);
insert into storage.buckets (id,name,public) values ('mod-files','mod-files',true) on conflict (id) do update set public=true;
create policy "public can upload mod files" on storage.objects for insert with check (bucket_id='mod-files');
create policy "public can read mod files" on storage.objects for select using (bucket_id='mod-files');
