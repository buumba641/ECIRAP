import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { and, eq, sql } from 'drizzle-orm';
import { db } from './src/db/index.ts';
import {
  branches,
  users,
  leads,
  sales_deals,
  invoices,
  lease_payments,
  financial_disbursements,
  audits,
} from './src/db/schema.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const num = (v: unknown) => Number(v ?? 0);

  // Resolve a branch filter from the query string. CEO/global views pass no
  // branchId and see everything; branch-scoped roles pass ?branchId=N.
  const parseBranchId = (raw: unknown): number | null => {
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  // ---------------------------------------------------------------------------
  // API Routes
  // ---------------------------------------------------------------------------
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/branches', async (_req, res) => {
    try {
      const allBranches = await db.select().from(branches).orderBy(branches.branch_id);
      res.json(allBranches);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/users', async (req, res) => {
    try {
      const branchId = parseBranchId(req.query.branchId);
      const rows = branchId
        ? await db.select().from(users).where(eq(users.branch_id, branchId))
        : await db.select().from(users);
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // CEO / global analytics: per-branch revenue + company-wide KPIs.
  app.get('/api/analytics/overview', async (_req, res) => {
    try {
      const perBranch = await db
        .select({
          branch_id: branches.branch_id,
          branch_name: branches.branch_name,
          revenue: sql<string>`coalesce(sum(${invoices.total_amount}), 0)`,
          deals: sql<string>`count(distinct ${sales_deals.deal_id})`,
        })
        .from(branches)
        .leftJoin(sales_deals, eq(sales_deals.branch_id, branches.branch_id))
        .leftJoin(invoices, eq(invoices.deal_id, sales_deals.deal_id))
        .groupBy(branches.branch_id, branches.branch_name)
        .orderBy(branches.branch_id);

      const totalRevenue = perBranch.reduce((acc, b) => acc + num(b.revenue), 0);

      const [{ active_leases }] = await db
        .select({
          active_leases: sql<string>`count(distinct ${lease_payments.invoice_id})`,
        })
        .from(lease_payments)
        .where(and(eq(lease_payments.status, 'Paid'), sql`${lease_payments.payment_month} >= 2`));

      res.json({
        totalRevenue,
        activeLeasesM2Plus: num(active_leases),
        branches: perBranch.map((b) => ({
          branchId: b.branch_id,
          branchName: b.branch_name,
          revenue: num(b.revenue),
          deals: num(b.deals),
        })),
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Sales pipeline for a branch: leads + commission buckets.
  app.get('/api/sales/pipeline', async (req, res) => {
    try {
      const branchId = parseBranchId(req.query.branchId);
      const leadWhere = branchId ? eq(leads.branch_id, branchId) : undefined;

      const leadRows = await db
        .select({
          lead_id: leads.lead_id,
          client_name: leads.client_name,
          phone_number: leads.phone_number,
          ai_summary: sql<string>`coalesce(${leads.ai_summary_edited}, ${leads.ai_summary_raw})`,
          converted: sql<boolean>`${leads.conversion_timestamp} is not null`,
        })
        .from(leads)
        .where(leadWhere)
        .orderBy(leads.created_at);

      // Commission buckets derived from invoices/lease payments for this branch.
      const dealWhere = branchId ? eq(sales_deals.branch_id, branchId) : undefined;

      const [fullPay] = await db
        .select({ total: sql<string>`coalesce(sum(${invoices.total_amount}), 0)` })
        .from(invoices)
        .innerJoin(sales_deals, eq(invoices.deal_id, sales_deals.deal_id))
        .where(and(eq(invoices.payment_type, 'Full_Pay'), dealWhere));

      const [pendingLeases] = await db
        .select({ clients: sql<string>`count(distinct ${invoices.invoice_id})` })
        .from(invoices)
        .innerJoin(sales_deals, eq(invoices.deal_id, sales_deals.deal_id))
        .innerJoin(lease_payments, eq(lease_payments.invoice_id, invoices.invoice_id))
        .where(and(eq(lease_payments.payment_month, 1), eq(lease_payments.status, 'Pending'), dealWhere));

      const [unlockedLeases] = await db
        .select({ total: sql<string>`coalesce(sum(${invoices.total_amount}), 0)` })
        .from(invoices)
        .innerJoin(sales_deals, eq(invoices.deal_id, sales_deals.deal_id))
        .innerJoin(lease_payments, eq(lease_payments.invoice_id, invoices.invoice_id))
        .where(and(sql`${lease_payments.payment_month} >= 2`, eq(lease_payments.status, 'Paid'), dealWhere));

      res.json({
        leads: leadRows,
        commissions: {
          instant: num(fullPay?.total),
          pendingLeaseClients: num(pendingLeases?.clients),
          unlockedLeases: num(unlockedLeases?.total),
        },
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Cashier shift: expected cash for a branch (sum of approved invoices).
  app.get('/api/cashier/shift', async (req, res) => {
    try {
      const branchId = parseBranchId(req.query.branchId);
      const where = branchId
        ? and(eq(sales_deals.branch_id, branchId), eq(sales_deals.payment_status, 'Closed_Approved'))
        : eq(sales_deals.payment_status, 'Closed_Approved');

      const [row] = await db
        .select({
          expected: sql<string>`coalesce(sum(${invoices.total_amount}), 0)`,
          invoice_count: sql<string>`count(${invoices.invoice_id})`,
        })
        .from(invoices)
        .innerJoin(sales_deals, eq(invoices.deal_id, sales_deals.deal_id))
        .where(where);

      res.json({
        expectedCash: num(row?.expected),
        paidInvoices: num(row?.invoice_count),
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Accountant: disbursements queue + audit trail.
  app.get('/api/finance/disbursements', async (_req, res) => {
    try {
      const rows = await db
        .select({
          disbursement_id: financial_disbursements.disbursement_id,
          amount: financial_disbursements.amount,
          status: financial_disbursements.status,
          payee: users.name,
          request_timestamp: financial_disbursements.request_timestamp,
        })
        .from(financial_disbursements)
        .leftJoin(users, eq(financial_disbursements.payee_user_id, users.user_id))
        .orderBy(financial_disbursements.request_timestamp);

      const auditRows = await db
        .select({
          audit_id: audits.audit_id,
          action_type: audits.action_type,
          description: audits.description,
          created_at: audits.created_at,
        })
        .from(audits)
        .orderBy(audits.created_at);

      res.json({
        disbursements: rows.map((r) => ({ ...r, amount: num(r.amount) })),
        audits: auditRows,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ---------------------------------------------------------------------------
  // Vite Middleware (frontend)
  // ---------------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
