-- ECIRAP Auth Setup — Run this in Supabase SQL Editor AFTER setup-tables.sql
-- Creates a profiles table linked to Supabase Auth

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'Sales',
  branch text default 'Lusaka HQ',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_role check (role in ('CEO', 'Manager', 'HR', 'Analyst', 'Marketing', 'Cashier', 'Sales', 'Accountant'))
);

-- RLS policies for profiles
alter table profiles enable row level security;

-- Users can read all profiles (needed for displaying names)
create policy "Profiles are viewable by authenticated users"
  on profiles for select
  to authenticated
  using (true);

-- Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

-- Allow insert for the trigger
create policy "Allow insert for auth trigger"
  on profiles for insert
  with check (true);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'Sales')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists then recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
