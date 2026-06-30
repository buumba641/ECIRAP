import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import { financial_disbursements } from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.ts';

const router = Router();

// GET all disbursements
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    let query = db.select().from(financial_disbursements);

    // Only Accountants, Managers, and CEO can view disbursements
    if (!['Accountant', 'Manager', 'CEO'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Disbursements access not available for this role' });
    }

    const disbursements = await query;
    res.json(disbursements);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET disbursements by status
router.get('/status/:status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    if (!['Accountant', 'Manager', 'CEO'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Disbursements access not available for this role' });
    }

    const { status } = req.params;
    const disbursements = await db
      .select()
      .from(financial_disbursements)
      .where(eq(financial_disbursements.status, status));

    res.json(disbursements);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Request disbursement (Accountant only)
router.post('/', requireRole(['Accountant']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { payee_user_id, amount, description } = req.body;

    if (!payee_user_id || !amount) {
      return res.status(400).json({ error: 'payee_user_id and amount are required' });
    }

    const newDisbursement = await db
      .insert(financial_disbursements)
      .values({
        accountant_id: req.user.user_id,
        payee_user_id,
        amount,
        status: 'Requested',
        request_timestamp: new Date(),
      })
      .returning();

    res.status(201).json(newDisbursement[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH - Approve disbursement (Manager only)
router.patch('/:disbursementId/approve', requireRole(['Manager', 'CEO']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const disbursementId = parseInt(req.params.disbursementId);
    const disbursement = await db
      .select()
      .from(financial_disbursements)
      .where(eq(financial_disbursements.disbursement_id, disbursementId))
      .limit(1);

    if (!disbursement.length) {
      return res.status(404).json({ error: 'Disbursement not found' });
    }

    if (disbursement[0].status !== 'Requested') {
      return res.status(400).json({ error: 'Disbursement must be in Requested status to approve' });
    }

    const updated = await db
      .update(financial_disbursements)
      .set({
        status: 'Manager_Approved',
        manager_id: req.user.user_id,
        approval_timestamp: new Date(),
        updated_at: new Date(),
      })
      .where(eq(financial_disbursements.disbursement_id, disbursementId))
      .returning();

    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH - Release disbursement (Manager only)
router.patch('/:disbursementId/release', requireRole(['Manager', 'CEO']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const disbursementId = parseInt(req.params.disbursementId);
    const disbursement = await db
      .select()
      .from(financial_disbursements)
      .where(eq(financial_disbursements.disbursement_id, disbursementId))
      .limit(1);

    if (!disbursement.length) {
      return res.status(404).json({ error: 'Disbursement not found' });
    }

    if (disbursement[0].status !== 'Manager_Approved') {
      return res.status(400).json({ error: 'Disbursement must be Manager_Approved to release' });
    }

    const updated = await db
      .update(financial_disbursements)
      .set({
        status: 'Released',
        release_timestamp: new Date(),
        updated_at: new Date(),
      })
      .where(eq(financial_disbursements.disbursement_id, disbursementId))
      .returning();

    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
