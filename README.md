# ECIRAP - Enterprise Commercial Intelligence & Revenue Assurance Platform

A comprehensive commercial intelligence platform designed to manage campaigns, leads, opportunities, contracts, and revenue tracking. Built with [Next.js](https://nextjs.org), [Supabase](https://supabase.com), and deployed on [Vercel](https://vercel.com).

## Live Demo

**Production Deployment:** https://ecirap.vercel.app

**Alternative URL:** https://ecirap-bk3zswqmb-buumbachinjila-6022s-projects.vercel.app

## Features

### User Roles & Authentication
- **8 Role-Based Dashboards**: CEO, Manager, Sales, Cashier, Analyst, Accountant, User, HR
- **Role-Specific UI**: Each role has dedicated modules and metrics tailored to their responsibilities
- **HR Admin Panel** (`/hr-admin`): Create, edit, and delete user accounts with role assignment
- **Login System** (`/login`): Click-to-login demo with user avatar selection by role
- **Session Management**: Persistent authentication with role-based access control

### Core Modules
- **Dashboard** - Role-specific executive overviews with KPIs, revenue charts, pipeline metrics, and real-time alerts
- **Campaign Management** - Track campaigns with timeline milestones, revenue graphs by period, and ROI metrics
- **Lead Management** - Manage leads with status tracking, qualification scores, and ownership assignment
- **Sales Pipeline** - Kanban-style pipeline with weighted forecasting and opportunity grading
- **Revenue Intelligence** - ROI attribution by campaign, region, and salesperson with revenue forecasting

### Strategic Modules
- **Strategic Accounts** - Manage customer relationships, decision makers, account health, and revenue contribution
- **Contract Management** - Monitor contract lifecycle, signed agreements, and renewal tracking
- **Community Engagements** - Track community events, activations, and measure engagement impact
- **Commercial Intelligence** - Advanced analytics with revenue by region, pipeline distribution, and conversion trends
- **Employee Performance** - Track sales team productivity, conversion rates, and deal quality metrics

### Campaign Analytics
- **Campaign Timeline** - Visual milestones showing campaign phases (Launch, Mid-Review, Final Sprint)
- **Revenue by Period** - Bar charts showing daily revenue during campaign timeline
- **Cumulative Growth** - Line charts showing total revenue accumulation from campaign start to present
- **Period Metrics** - Daily average, peak revenue, and total campaign revenue calculations

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Node.js with Server Actions
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel
- **Built with:** v0 AI

## Database Schema

The platform uses 13 interconnected tables:

- `organizations` - Company information and industry classification
- `campaigns` - Marketing and sales campaigns with budget and ROI tracking
- `leads` - Lead records with qualification scores and ownership
- `opportunities` - Sales opportunities with probability and value
- `contracts` - Signed contracts linked to opportunities
- `revenue_transactions` - Revenue records with transaction history
- `community_engagements` - Community and event engagement tracking
- `profiles` - User profiles linked to organizations
- `user_roles` - Role definitions (CEO, Manager, Sales, Cashier, Analyst, Accountant, User, HR)
- `auth_users` - User authentication with role assignment and permissions
- `campaign_milestones` - Campaign phases and timeline tracking
- `daily_revenue` - Daily revenue tracking for campaign analytics

## Getting Started

### Local Development

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Environment Variables

The following environment variables are required:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

These are automatically configured in the Vercel deployment.

## Pages

### Authentication
- `/login` - User role selection and login page with avatar click-to-login
- `/dashboard` - Role-specific dashboard routing to appropriate user interface

### User Management
- `/hr-admin` - HR admin panel for creating, editing, and deleting user accounts

### Operations
- `/` - Dashboard with KPI overview and analytics
- `/campaigns` - Campaign list and management
- `/campaigns/[id]` - Campaign detail with timeline milestones and revenue graphs
- `/leads` - Lead management and tracking
- `/pipeline` - Sales pipeline with opportunity stages

### Strategic Management
- `/accounts` - Strategic account portfolio with customer relationships
- `/contracts` - Contract lifecycle management and tracking
- `/community` - Community engagement events and impact measurement
- `/intelligence` - Advanced commercial intelligence and analytics
- `/performance` - Employee and team performance metrics
- `/revenue` - Revenue intelligence and ROI forecasting

### API Endpoints
- `POST /api/auth/login` - User authentication endpoint
- `GET /api/users` - Retrieve all users
- `POST /api/users` - Create new user (HR admin only)
- `PUT /api/users/[id]` - Update user details (HR admin only)
- `DELETE /api/users/[id]` - Delete user (HR admin only)

## Development

To continue developing:

1. Edit files in the `app/` and `components/` directories
2. Changes are reflected automatically with hot module replacement
3. Commit changes to the `enterprise-commercial-intelligence-platform` branch
4. Push to deploy automatically

## Built with v0

This repository is linked to a [v0](https://v0.app) project for AI-assisted development.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [v0 Documentation](https://v0.app/docs)
