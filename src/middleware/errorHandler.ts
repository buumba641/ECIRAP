import { Request, Response, NextFunction } from 'express';
import { createAuditLog } from '../api/audits.ts';

export interface AppError extends Error {
  status?: number;
  code?: string;
}

// Global error handler middleware
export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';

  console.error(`[${new Date().toISOString()}] Error:`, {
    status,
    message,
    code,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  // Log to audit trail
  createAuditLog(
    'ERROR',
    null,
    `${req.method} ${req.path}: ${message} (${status})`
  ).catch(console.error);

  res.status(status).json({
    error: message,
    code,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Async handler wrapper to catch errors in async route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error classes
export class ValidationError extends Error implements AppError {
  status = 400;
  code = 'VALIDATION_ERROR';
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthError extends Error implements AppError {
  status = 401;
  code = 'AUTH_ERROR';
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'AuthError';
  }
}

export class ForbiddenError extends Error implements AppError {
  status = 403;
  code = 'FORBIDDEN';
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error implements AppError {
  status = 404;
  code = 'NOT_FOUND';
  constructor(message: string = 'Not Found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error implements AppError {
  status = 409;
  code = 'CONFLICT';
  constructor(message: string = 'Conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}
