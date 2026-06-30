import { createAuditLog } from '../api/audits.ts';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: number;
  action?: string;
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development';

  private formatLog(level: LogLevel, message: string, context?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }

  debug(message: string, context?: Record<string, any>) {
    if (this.isDev) {
      console.log(this.formatLog(LogLevel.DEBUG, message, context));
    }
  }

  info(message: string, context?: Record<string, any>) {
    console.log(this.formatLog(LogLevel.INFO, message, context));
  }

  warn(message: string, context?: Record<string, any>) {
    console.warn(this.formatLog(LogLevel.WARN, message, context));
  }

  error(message: string, context?: Record<string, any> | Error) {
    const ctx = context instanceof Error ? { error: context.message, stack: context.stack } : context;
    console.error(this.formatLog(LogLevel.ERROR, message, ctx));
  }

  // Audit log for business operations
  async audit(
    action: string,
    userId: number | null,
    description: string,
    details?: Record<string, any>
  ) {
    try {
      await createAuditLog(
        action,
        userId,
        description
      );

      if (this.isDev) {
        this.debug(`Audit: ${action}`, { userId, description, details });
      }
    } catch (error) {
      this.error('Failed to create audit log', error as Error);
    }
  }

  // Track API operations
  trackApiCall(method: string, path: string, status: number, duration: number, userId?: number) {
    const context = {
      method,
      path,
      status,
      duration: `${duration}ms`,
      userId,
    };

    if (status >= 500) {
      this.error('API Error', context);
    } else if (status >= 400) {
      this.warn('API Warning', context);
    } else if (duration > 1000) {
      this.warn('Slow API Call', context);
    } else {
      this.debug('API Call', context);
    }
  }

  // Track database operations
  trackDbOperation(operation: string, table: string, duration: number, success: boolean) {
    const context = {
      operation,
      table,
      duration: `${duration}ms`,
      success,
    };

    if (!success) {
      this.error('Database Operation Failed', context);
    } else if (duration > 500) {
      this.warn('Slow Database Operation', context);
    } else {
      this.debug('Database Operation', context);
    }
  }
}

export const logger = new Logger();
