-- ECIRAP Seed Data — Paste into Supabase SQL Editor
-- Lean dataset for Infratel Zambia: enough to populate all dashboards.
-- Run AFTER setup-tables.sql, setup-auth.sql, and setup-full-schema.sql.
-- ============================================================================

-- ─── 1. Campaigns (5 rows) ──────────────────────────────────────────────────
INSERT INTO campaigns (id, name, type, channel, budget, start_date, end_date, status, objective, region, branch) VALUES
  ('c0000000-0001-4000-a000-000000000001', 'Q3 Copperbelt Fibre Push', 'Direct', 'Field Sales', 85000, '2026-04-01', '2026-06-30', 'Active', 'Drive fibre adoption in Kitwe-Ndola corridor', 'Copperbelt', 'Kitwe Branch'),
  ('c0000000-0001-4000-a000-000000000002', 'Digital SME Lead Gen', 'Digital', 'Google Ads', 32000, '2026-05-01', '2026-08-31', 'Active', 'Generate qualified SME leads via search & display', 'Lusaka', 'Lusaka HQ'),
  ('c0000000-0001-4000-a000-000000000003', 'Enterprise Cloud Bundle', 'Direct', 'Email', 45000, '2026-03-01', '2026-07-15', 'Active', 'Upsell cloud bundles to existing enterprise accounts', 'National', 'Lusaka HQ'),
  ('c0000000-0001-4000-a000-000000000004', 'Southern Region Expansion', 'Event', 'Roadshow', 28000, '2026-06-01', '2026-09-30', 'Active', 'Establish presence in Livingstone & surrounding areas', 'Southern', 'Livingstone Branch'),
  ('c0000000-0001-4000-a000-000000000005', 'Year-End Retention Blitz', 'Direct', 'Phone', 15000, '2026-01-01', '2026-03-31', 'Completed', 'Retain expiring contracts through proactive outreach', 'National', 'Lusaka HQ');

-- ─── 2. Accounts (6 rows) ───────────────────────────────────────────────────
INSERT INTO accounts (id, name, tier, health_score, annual_revenue, email, phone, province, notes) VALUES
  ('a0000000-0001-4000-a000-000000000001', 'Konkola Copper Mines', 'Platinum', 92, 420000, 'it@kcm.co.zm', '+260-212-123456', 'Copperbelt', 'Largest account. 3-year WAN contract.'),
  ('a0000000-0001-4000-a000-000000000002', 'Madison General Insurance', 'Gold', 78, 185000, 'procurement@madison.co.zm', '+260-211-234567', 'Lusaka', 'Key financial services client.'),
  ('a0000000-0001-4000-a000-000000000003', 'Zambeef Products PLC', 'Gold', 65, 120000, 'operations@zambeef.co.zm', '+260-211-345678', 'Lusaka', 'Multi-site connectivity. Health score declining.'),
  ('a0000000-0001-4000-a000-000000000004', 'Mopani Copper Mines', 'Silver', 55, 95000, 'it@mopani.com.zm', '+260-212-456789', 'Copperbelt', 'Contract renewal pending.'),
  ('a0000000-0001-4000-a000-000000000005', 'ZANACO Bank', 'Platinum', 88, 310000, 'infrastructure@zanaco.co.zm', '+260-211-567890', 'Lusaka', 'Branch connectivity across 50+ locations.'),
  ('a0000000-0001-4000-a000-000000000006', 'Sun International Zambia', 'Bronze', 42, 35000, 'admin@suninternational.co.zm', '+260-213-678901', 'Southern', 'New client — Livingstone hotels.');

-- ─── 3. Contacts (6 rows — 1 per account) ──────────────────────────────────
INSERT INTO contacts (account_id, first_name, last_name, job_title, role, email, phone, is_primary) VALUES
  ('a0000000-0001-4000-a000-000000000001', 'Bwalya', 'Mulenga', 'IT Director', 'Decision Maker', 'bwalya.m@kcm.co.zm', '+260-977-111111', true),
  ('a0000000-0001-4000-a000-000000000002', 'Grace', 'Tembo', 'Head of Procurement', 'Decision Maker', 'grace.t@madison.co.zm', '+260-977-222222', true),
  ('a0000000-0001-4000-a000-000000000003', 'Joseph', 'Banda', 'Operations Manager', 'Influencer', 'joseph.b@zambeef.co.zm', '+260-977-333333', true),
  ('a0000000-0001-4000-a000-000000000004', 'Chilufya', 'Kapoma', 'Network Engineer', 'Technical', 'chilufya.k@mopani.com.zm', '+260-977-444444', true),
  ('a0000000-0001-4000-a000-000000000005', 'Mutale', 'Chisanga', 'CIO', 'Decision Maker', 'mutale.c@zanaco.co.zm', '+260-977-555555', true),
  ('a0000000-0001-4000-a000-000000000006', 'Natasha', 'Phiri', 'Hotel Manager', 'End User', 'natasha.p@suninternational.co.zm', '+260-977-666666', true);

-- ─── 4. Leads (8 rows — mix of statuses) ────────────────────────────────────
INSERT INTO leads (campaign_id, account_id, name, company, email, source, status, score, owner, created_at) VALUES
  ('c0000000-0001-4000-a000-000000000001', NULL, 'John Mwanza', 'Chibuluma Mines', 'john@chibuluma.co.zm', 'Field Sales', 'New', 85, 'Mwape Kasonde', '2026-06-15'),
  ('c0000000-0001-4000-a000-000000000002', NULL, 'Sarah Lungu', 'TechHub Zambia', 'sarah@techhub.zm', 'Google Ads', 'Qualified', 72, 'Mwape Kasonde', '2026-05-20'),
  ('c0000000-0001-4000-a000-000000000002', NULL, 'Peter Zulu', 'GreenLeaf Agri', 'peter@greenleaf.co.zm', 'Google Ads', 'Converted', 91, 'Thandiwe Mumba', '2026-04-10'),
  ('c0000000-0001-4000-a000-000000000003', 'a0000000-0001-4000-a000-000000000003', 'Zambeef Upgrade', 'Zambeef Products', 'joseph.b@zambeef.co.zm', 'Email', 'Qualified', 68, 'Thandiwe Mumba', '2026-05-01'),
  ('c0000000-0001-4000-a000-000000000004', NULL, 'David Moyo', 'Royal Livingstone Hotel', 'david@royalliv.co.zm', 'Roadshow', 'New', 55, NULL, '2026-06-12'),
  ('c0000000-0001-4000-a000-000000000001', NULL, 'Alice Chilekwa', 'Lumwana Mining', 'alice@lumwana.co.zm', 'Field Sales', 'New', 60, NULL, '2026-05-05'),
  ('c0000000-0001-4000-a000-000000000005', NULL, 'Michael Sata Jr', 'Kafue Steel', 'msata@kafuesteel.com', 'Referral', 'Converted', 95, 'Mwape Kasonde', '2026-02-14'),
  ('c0000000-0001-4000-a000-000000000002', NULL, 'Esther Ng''andu', 'PrintPro Zambia', 'esther@printpro.zm', 'Google Ads', 'New', 45, 'Thandiwe Mumba', '2026-06-28');

-- ─── 5. Opportunities (7 rows — across stages) ─────────────────────────────
INSERT INTO opportunities (id, campaign_id, account_id, name, value, stage, probability, grade, owner, expected_close_date, created_at) VALUES
  ('b0000000-0001-4000-a000-000000000001', 'c0000000-0001-4000-a000-000000000001', 'a0000000-0001-4000-a000-000000000001', 'KCM WAN Expansion Phase 2', 280000, 'Negotiation', 75, 'Gold', 'Mwape Kasonde', '2026-08-15', '2026-05-10'),
  ('b0000000-0001-4000-a000-000000000002', 'c0000000-0001-4000-a000-000000000003', 'a0000000-0001-4000-a000-000000000002', 'Madison Cloud Migration', 95000, 'Qualified', 45, 'Silver', 'Thandiwe Mumba', '2026-09-01', '2026-04-20'),
  ('b0000000-0001-4000-a000-000000000003', 'c0000000-0001-4000-a000-000000000002', NULL, 'TechHub 100Mbps Dedicated', 48000, 'Qualified', 60, 'Silver', 'Mwape Kasonde', '2026-07-30', '2026-06-01'),
  ('b0000000-0001-4000-a000-000000000004', 'c0000000-0001-4000-a000-000000000005', 'a0000000-0001-4000-a000-000000000005', 'ZANACO Branch Refresh', 310000, 'Closed Won', 100, 'Platinum', 'Thandiwe Mumba', '2026-03-15', '2026-01-20'),
  ('b0000000-0001-4000-a000-000000000005', 'c0000000-0001-4000-a000-000000000001', 'a0000000-0001-4000-a000-000000000004', 'Mopani Site-to-Site VPN', 62000, 'Negotiation', 70, 'Gold', 'Mwape Kasonde', '2026-08-01', '2026-05-25'),
  ('b0000000-0001-4000-a000-000000000006', 'c0000000-0001-4000-a000-000000000004', 'a0000000-0001-4000-a000-000000000006', 'Sun Hotel WiFi Overhaul', 35000, 'Qualified', 35, 'Bronze', 'Thandiwe Mumba', '2026-10-01', '2026-06-18'),
  ('b0000000-0001-4000-a000-000000000007', 'c0000000-0001-4000-a000-000000000003', 'a0000000-0001-4000-a000-000000000003', 'Zambeef MPLS Upgrade', 125000, 'Closed Won', 100, 'Gold', 'Mwape Kasonde', '2026-04-30', '2026-03-05');

-- ─── 6. Contracts (4 rows) ──────────────────────────────────────────────────
INSERT INTO contracts (id, opportunity_id, campaign_id, account_id, name, amount, status, signed_date, start_date, end_date) VALUES
  ('d0000000-0001-4000-a000-000000000001', 'b0000000-0001-4000-a000-000000000004', 'c0000000-0001-4000-a000-000000000005', 'a0000000-0001-4000-a000-000000000005', 'ZANACO Branch Connectivity 2026', 310000, 'Active', '2026-03-20', '2026-04-01', '2027-03-31'),
  ('d0000000-0001-4000-a000-000000000002', 'b0000000-0001-4000-a000-000000000007', 'c0000000-0001-4000-a000-000000000003', 'a0000000-0001-4000-a000-000000000003', 'Zambeef MPLS Service Agreement', 125000, 'Active', '2026-05-01', '2026-05-15', '2027-05-14'),
  ('d0000000-0001-4000-a000-000000000003', NULL, 'c0000000-0001-4000-a000-000000000001', 'a0000000-0001-4000-a000-000000000001', 'KCM Dedicated Fibre (Existing)', 420000, 'Active', '2025-01-15', '2025-02-01', '2026-07-31'),
  ('d0000000-0001-4000-a000-000000000004', NULL, NULL, 'a0000000-0001-4000-a000-000000000004', 'Mopani Internet Service', 45000, 'Expiring', '2025-06-01', '2025-07-01', '2026-06-30');

-- ─── 7. Products (5 rows) ───────────────────────────────────────────────────
INSERT INTO products (name, description, category, price, sku, in_stock) VALUES
  ('MikroTik CCR2004', 'Enterprise cloud core router 1G', 'Router', 1250, 'MT-CCR2004', true),
  ('Ubiquiti EdgeSwitch 24', '24-port managed PoE switch', 'Switch', 480, 'UB-ES24', true),
  ('Cambium PTP 820C', 'Licensed microwave backhaul link', 'Backhaul', 8500, 'CM-PTP820C', true),
  ('CAT6 Patch Panel 48-port', 'Rack-mount copper patch panel', 'Accessory', 95, 'CAT6-PP48', true),
  ('SFP+ 10G Transceiver', 'Single-mode 10km SFP+ module', 'Optic', 65, 'SFP10G-SM', true);

-- ─── 8. Services (4 rows) ───────────────────────────────────────────────────
INSERT INTO services (name, description, category, monthly_price, setup_fee, is_active) VALUES
  ('Dedicated Fibre 100Mbps', 'Symmetrical dedicated fibre with 99.9% SLA', 'Bandwidth', 4500, 2500, true),
  ('Managed Firewall', 'FortiGate managed security appliance', 'Managed Service', 1200, 800, true),
  ('Premium SLA', '4-hour response, 24/7 NOC monitoring', 'SLA', 2000, 0, true),
  ('Standard Installation', 'Site survey, cabling, CPE deployment', 'Installation', 0, 3500, true);

-- ─── 9. Quotations (3 rows) ─────────────────────────────────────────────────
INSERT INTO quotations (opportunity_id, account_id, name, total_amount, status, valid_until, notes) VALUES
  ('b0000000-0001-4000-a000-000000000001', 'a0000000-0001-4000-a000-000000000001', 'KCM Phase 2 — Fibre + Managed Services', 280000, 'Sent', '2026-08-31', 'Includes 3-year term discount'),
  ('b0000000-0001-4000-a000-000000000005', 'a0000000-0001-4000-a000-000000000004', 'Mopani VPN Solution Quote', 62000, 'Draft', '2026-08-15', 'Awaiting technical validation'),
  ('b0000000-0001-4000-a000-000000000006', 'a0000000-0001-4000-a000-000000000006', 'Sun Hotel WiFi Package', 35000, 'Sent', '2026-09-30', 'Includes Ubiquiti APs and installation');

-- ─── 10. Invoices (5 rows — mix of statuses for assurance) ──────────────────
INSERT INTO invoices (contract_id, account_id, invoice_number, amount, paid_amount, status, due_date, paid_date) VALUES
  ('d0000000-0001-4000-a000-000000000001', 'a0000000-0001-4000-a000-000000000005', 'INV-2026-001', 77500, 77500, 'Paid', '2026-04-30', '2026-04-28'),
  ('d0000000-0001-4000-a000-000000000001', 'a0000000-0001-4000-a000-000000000005', 'INV-2026-002', 77500, 77500, 'Paid', '2026-07-31', '2026-07-20'),
  ('d0000000-0001-4000-a000-000000000002', 'a0000000-0001-4000-a000-000000000003', 'INV-2026-003', 62500, 30000, 'Partial', '2026-06-15', NULL),
  ('d0000000-0001-4000-a000-000000000003', 'a0000000-0001-4000-a000-000000000001', 'INV-2026-004', 105000, 0, 'Pending', '2026-06-30', NULL),
  ('d0000000-0001-4000-a000-000000000004', 'a0000000-0001-4000-a000-000000000004', 'INV-2026-005', 22500, 0, 'Pending', '2026-06-15', NULL);

-- ─── 11. Activities (5 rows) ────────────────────────────────────────────────
INSERT INTO activities (account_id, type, subject, description, outcome, scheduled_at, completed_at) VALUES
  ('a0000000-0001-4000-a000-000000000001', 'Meeting', 'KCM Phase 2 Requirements Workshop', 'On-site meeting with IT team to scope WAN expansion', 'Requirements confirmed — 12 new sites', '2026-06-10', '2026-06-10'),
  ('a0000000-0001-4000-a000-000000000002', 'Call', 'Madison Quarterly Review', 'Review service performance and discuss cloud migration', 'Interested in cloud bundle — send proposal', '2026-06-20', '2026-06-20'),
  ('a0000000-0001-4000-a000-000000000003', 'Follow-up', 'Zambeef Invoice Follow-up', 'Follow up on overdue INV-2026-003', 'Finance team confirmed partial payment, balance by month-end', '2026-06-25', '2026-06-25'),
  ('a0000000-0001-4000-a000-000000000005', 'Email', 'ZANACO SLA Report Delivery', 'Sent monthly SLA compliance report', 'Acknowledged — 99.97% uptime', '2026-07-01', '2026-07-01'),
  ('a0000000-0001-4000-a000-000000000004', 'Task', 'Mopani Contract Renewal Prep', 'Prepare renewal proposal before contract expires', NULL, '2026-07-10', NULL);

-- ─── 12. Revenue Alerts (4 rows) ────────────────────────────────────────────
INSERT INTO revenue_alerts (type, severity, title, description, entity_type, resolved) VALUES
  ('Expiring Contract', 'Critical', 'KCM Fibre Contract Expiring Jul 31', 'K420,000 contract expires in less than 30 days. Renewal proposal needed urgently.', 'contract', false),
  ('Overdue Invoice', 'High', 'INV-2026-004 Overdue — KCM', 'K105,000 invoice past due date (Jun 30). No payment received.', 'invoice', false),
  ('Stalled Opportunity', 'Medium', 'Madison Cloud Migration Stalled', 'Opportunity has been at "Qualified" stage for 70+ days with no movement.', 'opportunity', false),
  ('Unassigned Lead', 'Medium', 'Two Leads Without Owners', 'David Moyo (Royal Livingstone) and Alice Chilekwa (Lumwana Mining) have no assigned sales rep.', 'lead', false);

-- Done! Your ECIRAP dashboards should now show meaningful data.
