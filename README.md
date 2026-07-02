# ECIRAP — Enterprise Commercial Intelligence & Revenue Assurance Platform

ECIRAP is a comprehensive B2B CRM and Revenue Assurance platform built for Infratel Zambia. It provides 360° visibility into strategic accounts, pipeline management, and proactive detection of revenue leakage.

## Live Demo

Access the live application at: [https://ecirap.vercel.app/](https://ecirap.vercel.app/)

### Demo Login Credentials
Use the following credentials to access the pre-populated dashboard:

- **Email:** `admin@infratel.co.zm`
- **Password:** `Infratel2026!`

*(Note: These credentials require the database to be seeded first, see instructions below)*

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

**Important:** After running the scripts, you must manually create the demo user in the Supabase Dashboard (Auth > Users):
- Email: `admin@infratel.co.zm`
- Password: `Infratel2026!`
- Check "Auto-confirm user"

Then, run this SQL command to set their role to CEO:
```sql
UPDATE profiles 
SET full_name = 'Buumba Katila', role = 'CEO', branch = 'Lusaka HQ'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@infratel.co.zm');
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
