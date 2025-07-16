import { createLogger, format, transports } from 'winston';
import path from 'path';

export interface LogContext {
  userId?: string;
  requestId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

export class LoggerService {
  private logger;
  private isProduction = process.env.NODE_ENV === 'production';

  constructor() {
    this.logger = createLogger({
      level: this.isProduction ? 'info' : 'debug',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          const logObject = {
            timestamp,
            level,
            message,
            ...meta,
          };
          return JSON.stringify(logObject);
        })
      ),
      defaultMeta: {
        service: 'fdx-agents-api',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
      transports: [
        // Console transport for development
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple(),
            format.printf(({ timestamp, level, message, ...meta }) => {
              const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : '';
              return `${timestamp} [${level}]: ${message} ${metaStr}`;
            })
          ),
        }),
        
        // File transport for errors
        new transports.File({
          filename: path.join('logs', 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        
        // File transport for combined logs
        new transports.File({
          filename: path.join('logs', 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 10,
        }),
      ],
    });

    // Add production-specific transports
    if (this.isProduction) {
      // Add external logging services in production
      this.addProductionTransports();
    }
  }

  private addProductionTransports() {
    // Add Datadog transport if configured
    if (process.env.DATADOG_API_KEY) {
      // Install: npm install winston-datadog-logs
      // const DatadogTransport = require('winston-datadog-logs');
      // this.logger.add(new DatadogTransport({
      //   apiKey: process.env.DATADOG_API_KEY,
      //   service: 'fdx-agents-api',
      //   ddsource: 'nodejs',
      //   ddtags: `env:${process.env.NODE_ENV}`,
      // }));
    }

    // Add Elasticsearch transport if configured
    if (process.env.ELASTICSEARCH_URL) {
      // Install: npm install winston-elasticsearch
      // const { ElasticsearchTransport } = require('winston-elasticsearch');
      // this.logger.add(new ElasticsearchTransport({
      //   level: 'info',
      //   clientOpts: { node: process.env.ELASTICSEARCH_URL },
      //   index: 'fdx-agents-logs',
      // }));
    }
  }

  info(message: string, context?: LogContext) {
    this.logger.info(message, context);
  }

  warn(message: string, context?: LogContext) {
    this.logger.warn(message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.logger.error(message, {
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : undefined,
      ...context,
    });
  }

  debug(message: string, context?: LogContext) {
    this.logger.debug(message, context);
  }

  // Request logging
  logRequest(req: any, res: any, duration: number) {
    const context: LogContext = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      requestId: req.id,
    };

    if (res.statusCode >= 400) {
      this.error(`HTTP ${res.statusCode}: ${req.method} ${req.url}`, undefined, context);
    } else {
      this.info(`HTTP ${res.statusCode}: ${req.method} ${req.url}`, context);
    }
  }

  // Database logging
  logDatabase(operation: string, query: string, duration: number, error?: Error) {
    const context = {
      operation,
      query: query.substring(0, 500), // Limit query length
      duration,
    };

    if (error) {
      this.error(`Database error: ${operation}`, error, context);
    } else {
      this.debug(`Database: ${operation}`, context);
    }
  }

  // Security logging
  logSecurity(event: string, context?: LogContext) {
    this.warn(`Security event: ${event}`, {
      category: 'security',
      ...context,
    });
  }

  // Performance logging
  logPerformance(operation: string, duration: number, context?: LogContext) {
    const level = duration > 5000 ? 'warn' : 'info';
    this.logger.log(level, `Performance: ${operation} took ${duration}ms`, context);
  }

  // Business logic logging
  logBusiness(event: string, context?: LogContext) {
    this.info(`Business event: ${event}`, {
      category: 'business',
      ...context,
    });
  }

  // Structured logging for metrics
  logMetric(name: string, value: number, unit: string, context?: LogContext) {
    this.info(`Metric: ${name}`, {
      category: 'metric',
      metric: {
        name,
        value,
        unit,
        timestamp: new Date().toISOString(),
      },
      ...context,
    });
  }

  // Health check logging
  logHealth(service: string, status: 'healthy' | 'unhealthy' | 'degraded', details?: any) {
    const level = status === 'healthy' ? 'info' : 'warn';
    this.logger.log(level, `Health check: ${service} is ${status}`, {
      category: 'health',
      service,
      status,
      details,
    });
  }

  // Audit logging
  logAudit(action: string, resource: string, userId: string, context?: LogContext) {
    this.info(`Audit: ${action} on ${resource}`, {
      category: 'audit',
      action,
      resource,
      userId,
      timestamp: new Date().toISOString(),
      ...context,
    });
  }

  // User activity logging
  logActivity(userId: string, action: string, resource?: string, context?: LogContext) {
    this.info(`User activity: ${action}`, {
      category: 'activity',
      userId,
      action,
      resource,
      ...context,
    });
  }

  // Create child logger with persistent context
  child(context: LogContext) {
    return {
      info: (message: string, additionalContext?: LogContext) => 
        this.info(message, { ...context, ...additionalContext }),
      warn: (message: string, additionalContext?: LogContext) => 
        this.warn(message, { ...context, ...additionalContext }),
      error: (message: string, error?: Error, additionalContext?: LogContext) => 
        this.error(message, error, { ...context, ...additionalContext }),
      debug: (message: string, additionalContext?: LogContext) => 
        this.debug(message, { ...context, ...additionalContext }),
    };
  }

  // Flush logs (useful for testing)
  async flush(): Promise<void> {
    return new Promise((resolve) => {
      this.logger.on('finish', resolve);
      this.logger.end();
    });
  }
}

// Singleton instance
export const logger = new LoggerService();

// Express middleware for request logging
export const requestLoggingMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  // Generate request ID
  req.id = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Create child logger for this request
  req.logger = logger.child({
    requestId: req.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log request start
  req.logger.info(`Request started: ${req.method} ${req.url}`);

  // Override res.end to log completion
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    const duration = Date.now() - start;
    logger.logRequest(req, res, duration);
    return originalEnd.apply(this, args);
  };

  next();
};

// Error logging middleware
export const errorLoggingMiddleware = (err: any, req: any, res: any, next: any) => {
  const context: LogContext = {
    requestId: req.id,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  };

  logger.error(`Unhandled error: ${err.message}`, err, context);
  next(err);
};