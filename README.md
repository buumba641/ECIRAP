# ECIRAP — Enterprise Commercial Intelligence & Revenue Assurance Platform

ECIRAP is a comprehensive B2B CRM and Revenue Assurance platform built for Infratel Zambia. It provides 360° visibility into strategic accounts, pipeline management, and proactive detection of revenue leakage.

## Live Demo

Access the live application at: [https://ecirap.vercel.app/](https://ecirap.vercel.app/)

### Demo Login Credentials
Use the following credentials to access the pre-populated dashboard. Each account provides access to different role-based views and features:

| Role | Email | Password |
| :--- | :--- | :--- |
| **CEO** | `ceo@infratel.co.zm` | `1234@Infratel` |
| **Manager** | `manager@infratel.co.zm` | `1234@Infratel` |
| **HR** | `hr@infratel.co.zm` | `1234@Infratel` |
| **Analyst** | `analyst@infratel.co.zm` | `1234@Infratel` |
| **Marketing** | `marketing@infratel.co.zm` | `1234@Infratel` |
| **Cashier** | `cashier@infratel.co.zm` | `1234@Infratel` |
| **Sales** | `sales@infratel.co.zm` | `1234@Infratel` |
| **Accountant** | `accountant@infratel.co.zm` | `1234@Infratel` |

*(Note: These credentials require the database to be seeded and users created first, see instructions below)*

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database & Auth:** Supabase
- **Styling:** Tailwind CSS + Shadcn UI
- **Charts:** Recharts

## Setup Instructions

### 1. Database Setup (Supabase)

You need to run the SQL scripts in the Supabase SQL Editor in the following order:

1. `scripts/setup-tables.sql` (Base tables)
2. `scripts/setup-auth.sql` (Auth triggers)
3. `scripts/setup-full-schema.sql` (Extended CRM schema)
4. `scripts/seed-data.sql` (Mock data for the demo)

**Important:** After running the scripts, you must manually create the demo users in the Supabase Dashboard (Auth > Users). 

For each role (ceo, manager, hr, analyst, marketing, cashier, sales, accountant):
- Email: `[role]@infratel.co.zm` (e.g., `ceo@infratel.co.zm`)
- Password: `1234@Infratel`
- Check "Auto-confirm user"

Then, run this SQL command in the Supabase SQL Editor to correctly assign their roles and names:
```sql
UPDATE profiles SET full_name = 'Buumba (CEO)', role = 'CEO', branch = 'Lusaka HQ' WHERE id = (SELECT id FROM auth.users WHERE email = 'ceo@infratel.co.zm');
UPDATE profiles SET full_name = 'Buumba (Manager)', role = 'Manager', branch = 'Lusaka HQ' WHERE id = (SELECT id FROM auth.users WHERE email = 'manager@infratel.co.zm');
UPDATE profiles SET full_name = 'Buumba (HR)', role = 'HR', branch = 'Lusaka HQ' WHERE id = (SELECT id FROM auth.users WHERE email = 'hr@infratel.co.zm');
UPDATE profiles SET full_name = 'Buumba (Analyst)', role = 'Analyst', branch = 'Lusaka HQ' WHERE id = (SELECT id FROM auth.users WHERE email = 'analyst@infratel.co.zm');
UPDATE profiles SET full_name = 'Buumba (Marketing)', role = 'Marketing', branch = 'Lusaka HQ' WHERE id = (SELECT id FROM auth.users WHERE email = 'marketing@infratel.co.zm');
UPDATE profiles SET full_name = 'Buumba (Cashier)', role = 'Cashier', branch = 'Lusaka HQ' WHERE id = (SELECT id FROM auth.users WHERE email = 'cashier@infratel.co.zm');
UPDATE profiles SET full_name = 'Buumba (Sales)', role = 'Sales', branch = 'Lusaka HQ' WHERE id = (SELECT id FROM auth.users WHERE email = 'sales@infratel.co.zm');
UPDATE profiles SET full_name = 'Buumba (Accountant)', role = 'Accountant', branch = 'Lusaka HQ' WHERE id = (SELECT id FROM auth.users WHERE email = 'accountant@infratel.co.zm');
```

### 2. Local Environment Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env.local` file in the root directory with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Features

- **Strategic Account Management:** Track Platinum, Gold, Silver, and Bronze accounts with health scores.
- **Pipeline & Opportunities:** Manage sales stages and expected revenue.
- **Revenue Assurance:** AI-driven alerts for expiring contracts, stalled opportunities, unassigned leads, and overdue invoices.
- **Role-Based Access Control (RBAC):** Customized navigation based on user roles (CEO, Sales, Marketing, Accountant, etc.).
