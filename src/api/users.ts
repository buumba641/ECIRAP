import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import { users, branches } from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.ts';

const router = Router();

// GET current user info
router.get('/me', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    res.json(req.user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET all users in branch (or all for CEO)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    let query = db.select().from(users);

    if (req.user.role !== 'CEO') {
      query = db.select().from(users).where(eq(users.branch_id, req.user.branch_id || 0));
    }

    const allUsers = await query;
    res.json(allUsers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET user by ID
router.get('/:userId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const userId = parseInt(req.params.userId);
    const user = await db.select().from(users).where(eq(users.user_id, userId)).limit(1);

    if (!user.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Non-CEOs can only view users in their branch
    if (req.user.role !== 'CEO' && user[0].branch_id !== req.user.branch_id) {
      return res.status(403).json({ error: 'Forbidden: Cannot access this user' });
    }

    res.json(user[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET all branches
router.get('/branches/list', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const allBranches = await db.select().from(branches);
    res.json(allBranches);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Create new user (Manager/CEO only)
router.post('/', requireRole(['Manager', 'CEO']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { name, email, role, branch_id, base_salary } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'name, email, and role are required' });
    }

    // Non-CEOs can only create users in their branch
    const assignedBranch = branch_id || req.user.branch_id;
    if (req.user.role !== 'CEO' && assignedBranch !== req.user.branch_id) {
      return res.status(403).json({ error: 'Forbidden: Can only create users in your branch' });
    }

    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        role,
        branch_id: assignedBranch,
        base_salary: base_salary || 0,
      })
      .returning();

    res.status(201).json(newUser[0]);
  } catch (error: any) {
    if (error.message.includes('duplicate key')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PATCH - Update user
router.patch('/:userId', requireRole(['Manager', 'CEO']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const userId = parseInt(req.params.userId);
    const { name, role, base_salary } = req.body;

    const user = await db.select().from(users).where(eq(users.user_id, userId)).limit(1);
    if (!user.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Enforce branch security
    if (req.user.role !== 'CEO' && user[0].branch_id !== req.user.branch_id) {
      return res.status(403).json({ error: 'Forbidden: Cannot update this user' });
    }

    const updated = await db
      .update(users)
      .set({
        name: name || user[0].name,
        role: role || user[0].role,
        base_salary: base_salary !== undefined ? base_salary : user[0].base_salary,
        updated_at: new Date(),
      })
      .where(eq(users.user_id, userId))
      .returning();

    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
