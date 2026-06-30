import { Request, Response, NextFunction } from 'express';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export interface AuthenticatedRequest extends Request {
  user?: {
    user_id: number;
    name: string;
    email: string;
    role: string;
    branch_id: number | null;
  };
}

// Mock authentication middleware - in production, use JWT tokens
export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Get user ID from headers (for development/testing)
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: No user ID provided' });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.user_id, parseInt(userId as string)))
      .limit(1);

    if (!user.length) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    req.user = {
      user_id: user[0].user_id,
      name: user[0].name,
      email: user[0].email,
      role: user[0].role,
      branch_id: user[0].branch_id,
    };

    next();
  } catch (error: any) {
    res.status(500).json({ error: 'Authentication error: ' + error.message });
  }
};

// Role-based access control middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: This action requires one of these roles: ${allowedRoles.join(', ')}` });
    }

    next();
  };
};

// Branch access control - non-CEOs are restricted to their branch
export const requireBranchAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // CEO has global access
  if (req.user.role === 'CEO') {
    return next();
  }

  // All other roles are branch-restricted
  if (!req.user.branch_id) {
    return res.status(403).json({ error: 'Forbidden: User has no branch assignment' });
  }

  next();
};

// Enforce row-level security for agent data
export const enforceBranchSecurity = (branchId: number) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // CEO can access any branch
    if (req.user.role === 'CEO') {
      return next();
    }

    // Agents and staff can only access their own branch
    if (req.user.branch_id !== branchId) {
      return res.status(403).json({ error: 'Forbidden: You can only access your assigned branch' });
    }

    next();
  };
};
