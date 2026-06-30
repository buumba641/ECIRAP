# Starlink CRM - System Architecture

## Overview

This is an Enterprise CRM and ERP system built with **Vite + React 19** (frontend) and **Express.js + Node.js** (backend), backed by **Neon PostgreSQL** with **Drizzle ORM**.

## Stack

- **Frontend**: React 19, Vite 6, Tailwind CSS v4, Motion (animations)
- **Backend**: Express.js, Node.js with TypeScript
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **Authentication**: Custom middleware with role-based access control (RBAC)
- **Logging**: Custom logger with audit trail support

## Project Structure

```
/src
  /api              - API route handlers
    - leads.ts      - Lead management endpoints
    - deals.ts      - Sales deal endpoints
    - invoices.ts   - Invoice and lease payment endpoints
    - disbursements.ts - Financial disbursement workflows
    - users.ts      - User and branch management
    - audits.ts     - Audit logging
  /db
    - schema.ts     - Database schema and enums
    - index.ts      - Drizzle client initialization
  /middleware
    - auth.ts       - Authentication and RBAC
    - errorHandler.ts - Global error handling
  /context
    - ApiContext.tsx - React Context for API state
  /utils
    - logger.ts     - Centralized logging utility
  /App.tsx          - Main React component
  /main.tsx         - React entry point
  /index.css        - Tailwind styles

/server.ts          - Express server setup
/package.json       - Dependencies
/vite.config.ts     - Vite configuration
/tsconfig.json      - TypeScript config
```

## Database Schema

### Core Tables

- **users** - System users with roles and salary info
- **branches** - Physical business branches
- **leads** - Sales leads from agents
- **sales_deals** - Converted leads with deal info
- **invoices** - Payment invoices for deals
- **lease_payments** - Monthly lease payment tracking
- **financial_disbursements** - Payroll and commission disbursements
- **audits** - Comprehensive activity audit trail

### Enums

- **user_role**: Sales, HR, Analyst, Cashier, Marketing, Manager, CEO
- **payment_type**: Full_Pay, Lease
- **invoice_status**: Pending, Closed_Approved, Shortage
- **lease_status**: Pending, Paid
- **disbursement_status**: Requested, Manager_Approved, Released

## Authentication & Authorization

### How It Works

1. **Request Flow**: Client sends `x-user-id` header with API requests
2. **Middleware**: `authMiddleware` validates user and attaches to `req.user`
3. **RBAC**: `requireRole()` middleware enforces role-based access
4. **Row-Level Security**: `enforceBranchSecurity()` restricts non-CEO users to their branch

### Role Permissions

- **CEO**: Global access to all branches and operations
- **Manager**: Branch-scoped access, can approve disbursements
- **Sales**: Can create/view only their own leads
- **Cashier**: Can mark invoices as paid
- **Accountant**: Can request disbursements
- **HR/Analyst/Marketing**: Read-only access to relevant areas

## API Endpoints

### Leads
- `GET /api/leads` - List leads (filtered by role/branch)
- `GET /api/leads/:leadId` - Get single lead
- `POST /api/leads` - Create new lead
- `PATCH /api/leads/:leadId` - Update lead summary
- `POST /api/leads/:leadId/convert` - Mark lead as converted

### Deals
- `GET /api/deals` - List deals
- `GET /api/deals/:dealId` - Get single deal
- `POST /api/deals` - Create deal from lead
- `PATCH /api/deals/:dealId` - Update deal status

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:invoiceId/lease-payments` - Get lease schedule
- `PATCH /api/invoices/:invoiceId/lease-payments/:paymentId` - Mark payment

### Disbursements
- `GET /api/disbursements` - List disbursements
- `GET /api/disbursements/status/:status` - Filter by status
- `POST /api/disbursements` - Request new disbursement
- `PATCH /api/disbursements/:id/approve` - Manager approves
- `PATCH /api/disbursements/:id/release` - Manager releases funds

### Users
- `GET /api/users/me` - Current user info
- `GET /api/users` - List branch users
- `GET /api/users/:userId` - Get single user
- `POST /api/users` - Create user
- `PATCH /api/users/:userId` - Update user

### Audits
- `GET /api/audits` - List audit logs (Manager/CEO only)
- `GET /api/audits/action/:actionType` - Filter by action

## Running Locally

### Development

```bash
# Install dependencies
npm install

# Start development server (runs Vite + Express concurrently)
npm run dev

# Server runs on http://localhost:3000
```

### Build & Production

```bash
# Build frontend and backend
npm run build

# Start production server
npm run start
```

## Testing the System

### Impersonating Users

Since authentication uses `x-user-id` headers (for development), you can test different roles:

```bash
# Test as Sales Agent (user_id = 1)
curl -H "x-user-id: 1" http://localhost:3000/api/leads

# Test as Manager (user_id = 2)
curl -H "x-user-id: 2" http://localhost:3000/api/disbursements/status/Requested

# Test as CEO (user_id = 3)
curl -H "x-user-id: 3" http://localhost:3000/api/leads
```

Or set `localStorage.setItem('userId', '1')` in the browser console.

## Logging & Auditing

### Logger Utility

All operations are logged to console with:
- Timestamp, log level (DEBUG/INFO/WARN/ERROR)
- Contextual information
- Automatic API performance tracking

### Audit Trail

Business operations automatically create audit log entries:
- Lead creation/conversion
- Deal status changes
- Invoice payment updates
- Disbursement approvals
- User management actions

## Error Handling

### Global Error Handler

All errors are caught and logged:
- HTTP status codes
- Error messages and codes
- Stack traces (in development)
- User ID and action context
- Automatic audit logging

### Custom Error Classes

- `ValidationError` (400)
- `AuthError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)

## Security Features

1. **Role-Based Access Control**: Enforced at middleware level
2. **Branch-Level Isolation**: Non-CEOs confined to their branch
3. **Row-Level Security**: Sales agents only see their own leads
4. **Comprehensive Audit Trail**: All actions logged with user context
5. **Error Logging**: Security events logged for monitoring

## Future Enhancements

- JWT token-based authentication (replace x-user-id headers)
- Permission matrix for fine-grained control
- Real-time updates with WebSockets
- Analytics dashboard
- Email notifications
- Integration with external systems
