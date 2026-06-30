-- ECIRAP Database Setup — Run this in Supabase SQL Editor
-- Creates all tables for the Infratel Zambia ISP CRM

-- Campaigns
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'Digital',
  channel text,
  budget numeric not null default 0,
  start_date timestamptz,
  end_date timestamptz,
  status text not null default 'Active',
  objective text,
  region text,
  branch text,
  created_at timestamptz not null default now()
);

-- Leads
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete set null,
  name text not null,
  company text,
  email text,
  phone text,
  source text,
  status text not null default 'New',
  score integer not null default 50,
  owner text,
  created_at timestamptz not null default now()
);

-- Opportunities
create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  campaign_id uuid references campaigns(id) on delete set null,
  name text not null,
  value numeric not null default 0,
  stage text not null default 'Qualified',
  probability integer not null default 50,
  grade text not null default 'Silver',
  owner text,
  expected_close_date timestamptz,
  created_at timestamptz not null default now()
);

-- Contracts
create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references opportunities(id) on delete set null,
  campaign_id uuid references campaigns(id) on delete set null,
  name text not null,
  amount numeric not null default 0,
  status text not null default 'Signed',
  signed_date timestamptz,
  created_at timestamptz not null default now()
);

-- Products (ISP routers & accessories)
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null default 'Router',
  price numeric not null default 0,
  sku text unique,
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);

-- Disable RLS for demo (enable in production with proper policies)
alter table campaigns enable row level security;
alter table leads enable row level security;
alter table opportunities enable row level security;
alter table contracts enable row level security;
alter table products enable row level security;

create policy "Allow all on campaigns" on campaigns for all using (true) with check (true);
create policy "Allow all on leads" on leads for all using (true) with check (true);
create policy "Allow all on opportunities" on opportunities for all using (true) with check (true);
create policy "Allow all on contracts" on contracts for all using (true) with check (true);
create policy "Allow all on products" on products for all using (true) with check (true);
