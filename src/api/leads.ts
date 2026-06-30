import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import { leads, users, branches } from '../db/schema.ts';
import { eq, and, or } from 'drizzle-orm';
import { AuthenticatedRequest, requireRole, enforceBranchSecurity } from '../middleware/auth.ts';

const router = Router();

// GET all leads for agent/manager (filtered by branch)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    let query = db.select().from(leads);

    // Sales agents only see their own leads
    if (req.user.role === 'Sales') {
      query = db
        .select()
        .from(leads)
        .where(
          and(
            eq(leads.creator_agent_id, req.user.user_id),
            eq(leads.branch_id, req.user.branch_id || 0)
          )
        );
    } 
    // Managers see branch leads, CEO sees all
    else if (req.user.role === 'Manager') {
      query = db.select().from(leads).where(eq(leads.branch_id, req.user.branch_id || 0));
    }
    // CEO sees everything
    else if (req.user.role !== 'CEO') {
      return res.status(403).json({ error: 'Leads access not available for this role' });
    }

    const allLeads = await query;
    res.json(allLeads);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET single lead
router.get('/:leadId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const leadId = parseInt(req.params.leadId);
    const lead = await db.select().from(leads).where(eq(leads.lead_id, leadId)).limit(1);

    if (!lead.length) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Enforce branch security
    if (req.user.role !== 'CEO' && lead[0].branch_id !== req.user.branch_id) {
      return res.status(403).json({ error: 'Forbidden: Cannot access this lead' });
    }

    res.json(lead[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Create new lead (Sales only)
router.post('/', requireRole(['Sales', 'Manager', 'CEO']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.branch_id) {
      return res.status(400).json({ error: 'User must be assigned to a branch' });
    }

    const { phone_number, email_address, client_name, ai_summary_raw } = req.body;

    if (!phone_number || !client_name) {
      return res.status(400).json({ error: 'phone_number and client_name are required' });
    }

    const newLead = await db
      .insert(leads)
      .values({
        branch_id: req.user.branch_id,
        creator_agent_id: req.user.user_id,
        phone_number,
        email_address,
        client_name,
        ai_summary_raw,
      })
      .returning();

    res.status(201).json(newLead[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH - Update lead (update AI summary)
router.patch('/:leadId', requireRole(['Sales', 'Manager', 'CEO']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const leadId = parseInt(req.params.leadId);
    const { ai_summary_edited } = req.body;

    const lead = await db.select().from(leads).where(eq(leads.lead_id, leadId)).limit(1);

    if (!lead.length) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Enforce branch security
    if (req.user.role !== 'CEO' && lead[0].branch_id !== req.user.branch_id) {
      return res.status(403).json({ error: 'Forbidden: Cannot update this lead' });
    }

    const updated = await db
      .update(leads)
      .set({ ai_summary_edited, updated_at: new Date() })
      .where(eq(leads.lead_id, leadId))
      .returning();

    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Convert lead to deal
router.post('/:leadId/convert', requireRole(['Sales', 'Manager', 'CEO']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const leadId = parseInt(req.params.leadId);
    const lead = await db.select().from(leads).where(eq(leads.lead_id, leadId)).limit(1);

    if (!lead.length) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Mark conversion timestamp
    const converted = await db
      .update(leads)
      .set({ conversion_timestamp: new Date(), updated_at: new Date() })
      .where(eq(leads.lead_id, leadId))
      .returning();

    res.json({ message: 'Lead converted to deal', lead: converted[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
