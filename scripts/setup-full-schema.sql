-- ECIRAP Full Schema — Run in Supabase SQL Editor
-- Extends setup-tables.sql + setup-auth.sql with strategic account management,
-- contacts, quotations, invoices, services, activities, and revenue assurance.
-- ============================================================================

-- ─── Industries / Sectors ────────────────────────────────────────────────────
create table if not exists industries (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz not null default now()
);
insert into industries (name) values
  ('Mining'),('Telecommunications'),('Banking & Finance'),('Agriculture'),
  ('Manufacturing'),('Hospitality & Tourism'),('Retail'),('Education'),
  ('Healthcare'),('Government'),('NGO'),('Real Estate'),('Transport & Logistics'),
  ('Energy'),('Construction')
on conflict (name) do nothing;

-- ─── Branches ────────────────────────────────────────────────────────────────
create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  province text not null,
  created_at timestamptz not null default now()
);
insert into branches (name, province) values
  ('Lusaka HQ', 'Lusaka'),
  ('Kitwe Branch', 'Copperbelt'),
  ('Ndola Branch', 'Copperbelt'),
  ('Livingstone Branch', 'Southern'),
  ('Chipata Branch', 'Eastern'),
  ('Solwezi Branch', 'North-Western'),
  ('Kasama Branch', 'Northern')
on conflict (name) do nothing;

-- ─── Strategic Accounts (Customer Orgs) ──────────────────────────────────────
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry_id uuid references industries(id) on delete set null,
  tier text not null default 'Silver'
    check (tier in ('Platinum','Gold','Silver','Bronze')),
  health_score integer not null default 70
    check (health_score >= 0 and health_score <= 100),
  annual_revenue numeric not null default 0,
  website text,
  phone text,
  email text,
  address text,
  province text,
  branch_id uuid references branches(id) on delete set null,
  owner_id uuid references profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Contacts (People within Accounts) ───────────────────────────────────────
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  job_title text,
  role text not null default 'Technical'
    check (role in ('Decision Maker','Influencer','Technical','End User','Champion')),
  email text,
  phone text,
  is_primary boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

-- ─── Add account_id to existing tables ───────────────────────────────────────
-- Leads
alter table leads add column if not exists account_id uuid references accounts(id) on delete set null;

-- Opportunities
alter table opportunities add column if not exists account_id uuid references accounts(id) on delete set null;

-- Contracts — add more fields
alter table contracts add column if not exists account_id uuid references accounts(id) on delete set null;
alter table contracts add column if not exists start_date timestamptz;
alter table contracts add column if not exists end_date timestamptz;
alter table contracts add column if not exists renewal_date timestamptz;

-- ─── Quotations ──────────────────────────────────────────────────────────────
create table if not exists quotations (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references opportunities(id) on delete set null,
  account_id uuid references accounts(id) on delete set null,
  name text not null,
  total_amount numeric not null default 0,
  status text not null default 'Draft'
    check (status in ('Draft','Sent','Accepted','Rejected','Expired')),
  valid_until timestamptz,
  notes text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ─── Quotation Line Items ────────────────────────────────────────────────────
create table if not exists quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid references quotations(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  service_id uuid, -- will reference services table below
  description text not null,
  quantity integer not null default 1,
  unit_price numeric not null default 0,
  total numeric not null default 0,
  created_at timestamptz not null default now()
);

-- ─── Invoices ────────────────────────────────────────────────────────────────
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid references contracts(id) on delete set null,
  account_id uuid references accounts(id) on delete set null,
  invoice_number text unique,
  amount numeric not null default 0,
  paid_amount numeric not null default 0,
  status text not null default 'Pending'
    check (status in ('Pending','Partial','Paid','Overdue','Cancelled')),
  due_date timestamptz,
  paid_date timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

-- ─── Services (bandwidth plans, SLAs, managed services) ─────────────────────
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null default 'Bandwidth'
    check (category in ('Bandwidth','SLA','Managed Service','Installation','Support')),
  monthly_price numeric not null default 0,
  setup_fee numeric not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Link quotation_items.service_id to services
alter table quotation_items
  add constraint fk_quotation_items_service
  foreign key (service_id) references services(id) on delete set null;

-- ─── Activities / Engagement Tracking ────────────────────────────────────────
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  type text not null default 'Note'
    check (type in ('Call','Email','Meeting','Note','Task','Follow-up')),
  subject text not null,
  description text,
  outcome text,
  scheduled_at timestamptz,
  completed_at timestamptz,
  owner_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ─── Revenue Assurance Alerts ────────────────────────────────────────────────
create table if not exists revenue_alerts (
  id uuid primary key default gen_random_uuid(),
  type text not null
    check (type in ('Unassigned Lead','Stalled Lead','Duplicate Lead','Expiring Contract',
                     'Unsigned Contract','Missed Renewal','Stalled Opportunity',
                     'Overdue Invoice','At-Risk Account')),
  severity text not null default 'Medium'
    check (severity in ('Low','Medium','High','Critical')),
  title text not null,
  description text,
  entity_type text, -- 'lead', 'opportunity', 'contract', 'invoice', 'account'
  entity_id uuid,
  resolved boolean not null default false,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─── RLS Policies (permissive for demo) ──────────────────────────────────────
alter table industries enable row level security;
alter table branches enable row level security;
alter table accounts enable row level security;
alter table contacts enable row level security;
alter table quotations enable row level security;
alter table quotation_items enable row level security;
alter table invoices enable row level security;
alter table services enable row level security;
alter table activities enable row level security;
alter table revenue_alerts enable row level security;

create policy "Allow all on industries" on industries for all using (true) with check (true);
create policy "Allow all on branches" on branches for all using (true) with check (true);
create policy "Allow all on accounts" on accounts for all using (true) with check (true);
create policy "Allow all on contacts" on contacts for all using (true) with check (true);
create policy "Allow all on quotations" on quotations for all using (true) with check (true);
create policy "Allow all on quotation_items" on quotation_items for all using (true) with check (true);
create policy "Allow all on invoices" on invoices for all using (true) with check (true);
create policy "Allow all on services" on services for all using (true) with check (true);
create policy "Allow all on activities" on activities for all using (true) with check (true);
create policy "Allow all on revenue_alerts" on revenue_alerts for all using (true) with check (true);
