# ECIRAP — Enterprise Commercial Intelligence & Revenue Assurance Platform

ECIRAP is a comprehensive B2B CRM and Revenue Assurance platform built for Infratel Zambia. It provides 360° visibility into strategic accounts, pipeline management, proactive detection of revenue leakage, and robust Role-Based Access Control (RBAC).

## Live Demo

Access the live application at: [https://ecirap.vercel.app/](https://ecirap.vercel.app/)

### Demo Login Credentials

This is a restricted B2B platform. Public signup is disabled. Use the following credentials to access the platform. Each account provides access to different role-based views and features:

| Role | Email | Password | Allowed Access |
| :--- | :--- | :--- | :--- |
| **CEO** | `ceo@ecirap.com` | `1234` | Full access to all modules, including User Management. |
| **Manager** | `manager@ecirap.com` | `1234` | All business modules, except User Management. |
| **HR** | `hr@ecirap.com` | `1234` | Dashboard, Accounts, Products, User Management. |
| **Analyst** | `analyst@ecirap.com` | `1234` | Campaigns, Pipeline, Revenue, Assurance. |
| **Marketing** | `marketing@ecirap.com` | `1234` | Campaigns, Leads. |
| **Sales** | `sales@ecirap.com` | `1234` | Leads, Pipeline, Quotations. |
| **Accountant** | `accountant@ecirap.com` | `1234` | Quotations, Invoices, Revenue. |
| **Cashier** | `cashier@ecirap.com` | `1234` | (Limited to generic routes by default) |

*(Note: These credentials require the database to be seeded and users created first, see instructions below)*

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database & Auth:** Supabase (PostgreSQL, employee auth table with Supabase Auth fallback)
- **Styling:** Tailwind CSS + UI Components
- **Charts:** Recharts
- **Icons:** Lucide React

## Core Features

- **Strategic Account Management:** 360° view of Platinum, Gold, Silver, and Bronze accounts with health scores, contacts, and activity tracking.
- **Pipeline & Opportunities:** Manage sales stages, expected revenue, and quotations.
- **Revenue Assurance:** Automated alerts for expiring contracts, stalled opportunities, unassigned leads, and overdue invoices to prevent revenue leakage.
- **Strict Role-Based Access Control (RBAC):** Route-level protection via Next.js Middleware. Users are restricted to modules relevant to their job function.
- **HR Admin Panel:** Dedicated UI for HR and CEO to provision, update, and revoke employee access.

## Setup Instructions

### 1. Database Setup (Supabase)

You need to run the SQL scripts in the Supabase SQL Editor in the following order:

1. `scripts/setup-tables.sql` (Base tables)
2. `scripts/setup-auth.sql` (Auth triggers & Profiles table)
3. `scripts/setup-full-schema.sql` (Extended CRM schema for accounts, invoices, etc.)
4. `scripts/seed-data.sql` (Mock data for the demo)

*Alternatively, you can run `node scripts/run-sql.mjs` if you have configured the DB connection string in the script.*

### 2. Local Environment Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the root directory with your Supabase credentials. **You must include the Service Role Key** to enable user creation via the Admin API:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```
   *(Get these from your Supabase Dashboard → Settings → API)*

### 3. Create Demo Users

Because this app uses Supabase Auth properly with secure password hashing, you cannot simply insert users into the `auth.users` table with raw SQL.

Run the user creation script which uses the Supabase Admin API and provisions the Supabase Auth demo users:
```bash
node scripts/create-users.mjs
```
This script will provision the 8 role-based employee accounts listed in the credentials table above, setting their initial password to `1234`.

### 4. Run the Application

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You will be redirected to the login page.
