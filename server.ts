import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import { authMiddleware, requireBranchAccess } from './src/middleware/auth.ts';
import { errorHandler } from './src/middleware/errorHandler.ts';
import { logger } from './src/utils/logger.ts';
import leadsRouter from './src/api/leads.ts';
import dealsRouter from './src/api/deals.ts';
import invoicesRouter from './src/api/invoices.ts';
import disbursementsRouter from './src/api/disbursements.ts';
import usersRouter from './src/api/users.ts';
import auditsRouter, { auditMiddleware } from './src/api/audits.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Request logging middleware
  app.use((req: Request, res: Response, next: any) => {
    const start = Date.now();
    const originalJson = res.json;

    res.json = function (data: any) {
      const duration = Date.now() - start;
      const userId = (req as any).user?.user_id;
      logger.trackApiCall(req.method, req.path, res.statusCode, duration, userId);
      return originalJson.call(this, data);
    };

    next();
  });

  // Health check (no auth required)
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Apply authentication middleware to all /api routes
  app.use('/api/', authMiddleware);
  app.use('/api/', auditMiddleware);

  // API Routes
  app.use('/api/leads', leadsRouter);
  app.use('/api/deals', dealsRouter);
  app.use('/api/invoices', invoicesRouter);
  app.use('/api/disbursements', disbursementsRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/audits', auditsRouter);

  // 404 handler
  app.use((req: Request, res: Response) => {
    logger.warn('404 Not Found', { path: req.path, method: req.method });
    res.status(404).json({ error: 'Not Found', code: 'NOT_FOUND' });
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  // Vite Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server running on http://0.0.0.0:${PORT}`, {
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
    });
  });
}

startServer().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
