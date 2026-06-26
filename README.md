# ECIRAP - Enterprise Commercial Intelligence & Revenue Assurance Platform

A comprehensive commercial intelligence platform designed to manage campaigns, leads, opportunities, contracts, and revenue tracking. Built with [Next.js](https://nextjs.org), [Supabase](https://supabase.com), and deployed on [Vercel](https://vercel.com).

## Live Demo

**Production Deployment:** https://ecirap.vercel.app

**Alternative URL:** https://ecirap-bk3zswqmb-buumbachinjila-6022s-projects.vercel.app

## Features

- **Dashboard** - Executive overview with KPIs, revenue charts, pipeline metrics, and real-time alerts
- **Campaign Management** - Track campaigns across multiple channels with budget, ROI, and performance metrics
- **Lead Management** - Manage leads with status tracking, qualification scores, and ownership assignment
- **Sales Pipeline** - Kanban-style pipeline with weighted forecasting and opportunity grading
- **Revenue Intelligence** - ROI attribution by campaign, region, and salesperson with revenue forecasting

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Node.js with Server Actions
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel
- **Built with:** v0 AI

## Database Schema

The platform uses 8 interconnected tables:

- `organizations` - Company information and industry classification
- `campaigns` - Marketing and sales campaigns with budget and ROI tracking
- `leads` - Lead records with qualification scores and ownership
- `opportunities` - Sales opportunities with probability and value
- `contracts` - Signed contracts linked to opportunities
- `revenue_transactions` - Revenue records with transaction history
- `community_engagements` - Community and event engagement tracking
- `profiles` - User profiles linked to organizations

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

- `/` - Dashboard with KPI overview and analytics
- `/campaigns` - Campaign list and management
- `/campaigns/[id]` - Campaign detail view
- `/leads` - Lead management and tracking
- `/pipeline` - Sales pipeline with opportunity stages
- `/revenue` - Revenue intelligence and forecasting

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
