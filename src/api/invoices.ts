import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import { invoices, lease_payments, sales_deals, paymentTypeEnum } from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.ts';

const router = Router();

// GET all invoices
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    let allInvoices = db.select().from(invoices);

    if (req.user.role === 'Cashier') {
      // Cashiers see invoices for their branch
      allInvoices = db
        .select()
        .from(invoices)
        .innerJoin(sales_deals, eq(invoices.deal_id, sales_deals.deal_id))
        .where(eq(sales_deals.branch_id, req.user.branch_id || 0));
    } else if (req.user.role === 'Manager') {
      // Managers see branch invoices
      allInvoices = db
        .select()
        .from(invoices)
        .innerJoin(sales_deals, eq(invoices.deal_id, sales_deals.deal_id))
        .where(eq(sales_deals.branch_id, req.user.branch_id || 0));
    } else if (req.user.role !== 'CEO') {
      return res.status(403).json({ error: 'Invoices access not available for this role' });
    }

    const result = await allInvoices;
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET single invoice
router.get('/:invoiceId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const invoiceId = parseInt(req.params.invoiceId);
    const invoice = await db.select().from(invoices).where(eq(invoices.invoice_id, invoiceId)).limit(1);

    if (!invoice.length) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Create invoice for deal
router.post('/', requireRole(['Cashier', 'Manager', 'CEO']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { deal_id, payment_type, total_amount } = req.body;

    if (!deal_id || !payment_type || !total_amount) {
      return res.status(400).json({ error: 'deal_id, payment_type, and total_amount are required' });
    }

    const newInvoice = await db
      .insert(invoices)
      .values({
        deal_id,
        payment_type,
        total_amount,
      })
      .returning();

    // If lease payment, create lease payment records
    if (payment_type === 'Lease') {
      // Create 12 monthly lease payments
      const leasePayments = Array.from({ length: 12 }, (_, i) => ({
        invoice_id: newInvoice[0].invoice_id,
        payment_month: i + 1,
        status: 'Pending' as const,
        due_date: new Date(new Date().setMonth(new Date().getMonth() + i + 1)),
      }));

      await db.insert(lease_payments).values(leasePayments);
    }

    res.status(201).json(newInvoice[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET lease payments for invoice
router.get('/:invoiceId/lease-payments', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const invoiceId = parseInt(req.params.invoiceId);
    const payments = await db
      .select()
      .from(lease_payments)
      .where(eq(lease_payments.invoice_id, invoiceId));

    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH - Update lease payment status
router.patch('/:invoiceId/lease-payments/:paymentId', requireRole(['Cashier', 'Manager', 'CEO']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const paymentId = parseInt(req.params.paymentId);
    const { status } = req.body;

    const updated = await db
      .update(lease_payments)
      .set({
        status,
        payment_cleared_timestamp: status === 'Paid' ? new Date() : null,
        updated_at: new Date(),
      })
      .where(eq(lease_payments.payment_id, paymentId))
      .returning();

    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
