import React from 'react';
import { logger } from '@/services/logger';

interface ErrorReport {
  message: string;
  stack?: string;
  type: 'error' | 'unhandledRejection' | 'componentError';
  url: string;
  userAgent: string;
  timestamp: string;
  metadata?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  browserInfo: {
    language: string;
    platform: string;
    cookieEnabled: boolean;
    onLine: boolean;
    screenResolution: string;
  };
}

class ErrorReporter {
  private queue: ErrorReport[] = [];
  private isReporting = false;
  private maxRetries = 3;
  private batchSize = 10;
  private reportInterval = 30000; // 30 seconds

  constructor() {
    this.setupGlobalHandlers();
    this.startBatchReporting();
  }

  private setupGlobalHandlers(): void {
    // Handle unhandled errors
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      this.reportError({
        message: typeof message === 'string' ? message : 'Unknown error',
        stack: error?.stack,
        type: 'error',
        metadata: {
          source,
          lineno,
          colno,
        },
      });

      // Call original handler if exists
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return true;
    };

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        type: 'unhandledRejection',
        metadata: {
          reason: event.reason,
        },
      });
    });
  }

  private startBatchReporting(): void {
    setInterval(() => {
      if (this.queue.length > 0 && !this.isReporting) {
        this.flushQueue();
      }
    }, this.reportInterval);

    // Also flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flushQueue(true);
    });
  }

  private async flushQueue(immediate = false): Promise<void> {
    if (this.queue.length === 0 || this.isReporting) return;

    this.isReporting = true;
    const reports = this.queue.splice(0, this.batchSize);

    try {
      await this.sendReports(reports, immediate);
    } catch (error) {
      // Put reports back in queue for retry
      this.queue.unshift(...reports);
      logger.error('Failed to send error reports', error as Error);
    } finally {
      this.isReporting = false;
    }
  }

  private async sendReports(reports: ErrorReport[], immediate = false): Promise<void> {
    const endpoint = process.env.REACT_APP_ERROR_REPORTING_ENDPOINT;
    if (!endpoint) {
      logger.debug('Error reporting endpoint not configured');
      return;
    }

    const payload = {
      reports,
      environment: process.env.NODE_ENV,
      version: process.env.REACT_APP_VERSION,
    };

    // Use sendBeacon for immediate reporting (page unload)
    if (immediate && 'sendBeacon' in navigator) {
      const blob = new Blob([JSON.stringify(payload)], {
        type: 'application/json',
      });
      navigator.sendBeacon(endpoint, blob);
      return;
    }

    // Normal fetch with retries
    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Error reporting failed: ${response.status}`);
        }

        return;
      } catch (error) {
        retries++;
        if (retries === this.maxRetries) {
          throw error;
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
      }
    }
  }

  reportError(error: Partial<ErrorReport>): void {
    const report: ErrorReport = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      type: error.type || 'error',
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      metadata: error.metadata,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      browserInfo: {
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
      },
    };

    this.queue.push(report);

    // Immediate flush for critical errors
    if (this.isCriticalError(report)) {
      this.flushQueue();
    }
  }

  private isCriticalError(report: ErrorReport): boolean {
    const criticalPatterns = [
      'SecurityError',
      'TypeError: Cannot read',
      'ReferenceError',
      'Out of memory',
      'Maximum call stack',
    ];

    return criticalPatterns.some(pattern => 
      report.message.includes(pattern) || report.stack?.includes(pattern)
    );
  }

  private getUserId(): string | undefined {
    try {
      const authData = localStorage.getItem('auth-store');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.user?.id;
      }
    } catch {
      // Ignore errors
    }
    return undefined;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('error-reporter-session-id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('error-reporter-session-id', sessionId);
    }
    return sessionId;
  }

  // Public API
  captureException(error: Error, metadata?: Record<string, any>): void {
    this.reportError({
      message: error.message,
      stack: error.stack,
      type: 'componentError',
      metadata,
    });
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (level === 'error') {
      this.reportError({
        message,
        type: 'error',
      });
    } else if (level === 'warning') {
      logger.warn(message);
    } else {
      logger.info(message);
    }
  }

  setUser(userId: string, metadata?: Record<string, any>): void {
    // Store user context for future error reports
    localStorage.setItem('error-reporter-user', JSON.stringify({ userId, metadata }));
  }

  clearUser(): void {
    localStorage.removeItem('error-reporter-user');
  }
}

// Create singleton instance
export const errorReporter = new ErrorReporter();

// Integration with React Error Boundaries
export function logErrorToService(error: Error, errorInfo: React.ErrorInfo): void {
  errorReporter.captureException(error, {
    componentStack: errorInfo.componentStack,
    errorBoundary: true,
  });
}