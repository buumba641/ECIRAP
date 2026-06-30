import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import { sales_deals, leads, users } from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.ts';

const router = Router();

// GET all deals for user's branch
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    let query = db.select().from(sales_deals);

    if (req.user.role === 'Sales') {
      query = db.select().from(sales_deals).where(eq(sales_deals.closer_agent_id, req.user.user_id));
    } else if (req.user.role === 'Manager') {
      query = db.select().from(sales_deals).where(eq(sales_deals.branch_id, req.user.branch_id || 0));
    } else if (req.user.role !== 'CEO') {
      return res.status(403).json({ error: 'Deals access not available for this role' });
    }

    const deals = await query;
    res.json(deals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET single deal
router.get('/:dealId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const dealId = parseInt(req.params.dealId);
    const deal = await db.select().from(sales_deals).where(eq(sales_deals.deal_id, dealId)).limit(1);

    if (!deal.length) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    if (req.user.role !== 'CEO' && deal[0].branch_id !== req.user.branch_id) {
      return res.status(403).json({ error: 'Forbidden: Cannot access this deal' });
    }

    res.json(deal[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Create deal from lead
router.post('/', requireRole(['Sales', 'Manager', 'CEO']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.branch_id) {
      return res.status(400).json({ error: 'User must be assigned to a branch' });
    }

    const { lead_id, cashier_id, is_split_commission } = req.body;

    if (!lead_id) {
      return res.status(400).json({ error: 'lead_id is required' });
    }

    // Verify lead exists and belongs to same branch
    const lead = await db.select().from(leads).where(eq(leads.lead_id, lead_id)).limit(1);
    if (!lead.length) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const newDeal = await db
      .insert(sales_deals)
      .values({
        lead_id,
        branch_id: req.user.branch_id,
        closer_agent_id: req.user.user_id,
        cashier_id: cashier_id || null,
        is_split_commission: is_split_commission || false,
        payment_status: 'Pending',
      })
      .returning();

    res.status(201).json(newDeal[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH - Update deal payment status
router.patch('/:dealId', requireRole(['Sales', 'Manager', 'Cashier', 'CEO']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const dealId = parseInt(req.params.dealId);
    const { payment_status, cashier_id } = req.body;

    const deal = await db.select().from(sales_deals).where(eq(sales_deals.deal_id, dealId)).limit(1);
    if (!deal.length) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    if (req.user.role !== 'CEO' && deal[0].branch_id !== req.user.branch_id) {
      return res.status(403).json({ error: 'Forbidden: Cannot update this deal' });
    }

    const updated = await db
      .update(sales_deals)
      .set({
        payment_status: payment_status || deal[0].payment_status,
        cashier_id: cashier_id !== undefined ? cashier_id : deal[0].cashier_id,
        updated_at: new Date(),
      })
      .where(eq(sales_deals.deal_id, dealId))
      .returning();

    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
