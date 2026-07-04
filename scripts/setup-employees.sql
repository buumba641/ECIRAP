-- ECIRAP Employees Table — Run in Supabase SQL Editor
-- Self-contained employee auth table (replaces Supabase Auth dependency)
-- ============================================================================

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  full_name text not null default '',
  role text not null default 'Sales'
    check (role in ('CEO', 'Manager', 'HR', 'Analyst', 'Marketing', 'Cashier', 'Sales', 'Accountant')),
  branch text not null default 'Lusaka HQ',
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast email lookups during login
create index if not exists idx_employees_email on employees (email);

-- RLS: allow all operations via anon key (auth is enforced at app layer)
alter table employees enable row level security;

create policy "Allow read on employees" on employees for select using (true);
create policy "Allow insert on employees" on employees for insert with check (true);
create policy "Allow update on employees" on employees for update using (true);
create policy "Allow delete on employees" on employees for delete using (true);
