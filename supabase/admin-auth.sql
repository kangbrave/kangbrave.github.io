-- Run in Supabase SQL Editor.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
drop policy if exists "Admins can read their own authorization" on public.admin_users;
create policy "Admins can read their own authorization"
on public.admin_users for select to authenticated
using (auth.uid() = user_id);

-- After creating the user in Supabase Auth, replace USER_UUID with that user's UUID:
-- insert into public.admin_users (user_id) values ('USER_UUID');
