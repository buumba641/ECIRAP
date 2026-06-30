import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import { audits } from '../db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.ts';

const router = Router();

// GET all audit logs (Manager/CEO only)
router.get('/', requireRole(['Manager', 'CEO']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const allAudits = await db
      .select()
      .from(audits)
      .orderBy(desc(audits.created_at))
      .limit(limit);

    res.json(allAudits);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET audit logs by action type
router.get('/action/:actionType', requireRole(['Manager', 'CEO']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { actionType } = req.params;
    const allAudits = await db
      .select()
      .from(audits)
      .where(eq(audits.action_type, actionType))
      .orderBy(desc(audits.created_at))
      .limit(100);

    res.json(allAudits);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Create audit log entry (internal use)
export const createAuditLog = async (
  action_type: string,
  user_involved: number | null,
  description: string
) => {
  try {
    await db.insert(audits).values({
      action_type,
      user_involved,
      description,
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

// Middleware to automatically log actions
export const auditMiddleware = async (req: AuthenticatedRequest, res: Response, next: any) => {
  const originalJson = res.json;

  res.json = function (data: any) {
    if (req.user && req.method !== 'GET') {
      const action = `${req.method} ${req.baseUrl}${req.url}`;
      createAuditLog(action, req.user.user_id, JSON.stringify(data).substring(0, 500));
    }
    return originalJson.call(this, data);
  };

  next();
};

export default router;
