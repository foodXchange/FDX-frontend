import React, { useCallback } from 'react';
import { AxiosError } from 'axios';
import { ARMApiError } from '../services/armApi';

interface RetryOptions {
  maxRetries: number;
  delay: number;
  backoff: 'fixed' | 'exponential' | 'linear';
  retryCondition?: (error: any) => boolean;
}

interface ErrorLogEntry {
  timestamp: string;
  error: any;
  context?: string;
  userId?: string;
  agentId?: string;
  action?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class ErrorHandler {
  private errorLog: ErrorLogEntry[] = [];
  private maxLogSize = 100;
  // private retryQueue: Map<string, number> = new Map(); // Not used currently

  // Default retry options
  private defaultRetryOptions: RetryOptions = {
    maxRetries: 3,
    delay: 1000,
    backoff: 'exponential',
    retryCondition: (error) => this.isRetryableError(error),
  };

  // Categorize errors
  categorizeError(error: any): {
    type: 'network' | 'auth' | 'validation' | 'server' | 'client' | 'unknown';
    severity: 'low' | 'medium' | 'high' | 'critical';
    isRetryable: boolean;
  } {
    if (error instanceof ARMApiError) {
      if (error.statusCode === 401) {
        return { type: 'auth', severity: 'high', isRetryable: false };
      }
      if (error.statusCode === 403) {
        return { type: 'auth', severity: 'medium', isRetryable: false };
      }
      if (error.statusCode >= 400 && error.statusCode < 500) {
        return { type: 'client', severity: 'medium', isRetryable: false };
      }
      if (error.statusCode >= 500) {
        return { type: 'server', severity: 'high', isRetryable: true };
      }
    }

    if (error instanceof AxiosError) {
      if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
        return { type: 'network', severity: 'medium', isRetryable: true };
      }
      if (error.code === 'ECONNREFUSED') {
        return { type: 'network', severity: 'high', isRetryable: true };
      }
    }

    if (error.name === 'ValidationError') {
      return { type: 'validation', severity: 'low', isRetryable: false };
    }

    return { type: 'unknown', severity: 'medium', isRetryable: false };
  }

  // Check if error is retryable
  private isRetryableError(error: any): boolean {
    const category = this.categorizeError(error);
    return category.isRetryable;
  }

  // Log error with context
  logError(error: any, context?: {
    action?: string;
    userId?: string;
    agentId?: string;
    additionalContext?: string;
  }): void {
    const category = this.categorizeError(error);
    
    const logEntry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      error: this.serializeError(error),
      context: context?.additionalContext,
      userId: context?.userId,
      agentId: context?.agentId,
      action: context?.action,
      severity: category.severity,
    };

    this.errorLog.push(logEntry);

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ARM Error:', logEntry);
    }

    // Send to external logging service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(logEntry);
    }

    // Show user notification for critical errors
    if (category.severity === 'critical') {
      this.showCriticalErrorNotification(error);
    }
  }

  // Retry mechanism with exponential backoff
  async withRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const finalOptions = { ...this.defaultRetryOptions, ...options };
    let lastError: any;
    let attempt = 0;

    while (attempt <= finalOptions.maxRetries) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        attempt++;

        // Check if we should retry
        if (
          attempt > finalOptions.maxRetries ||
          !finalOptions.retryCondition!(error)
        ) {
          break;
        }

        // Calculate delay based on backoff strategy
        const delay = this.calculateDelay(attempt, finalOptions);
        
        // Log retry attempt
        this.logError(error, {
          action: `retry_attempt_${attempt}`,
          additionalContext: `Retrying in ${delay}ms`,
        });

        await this.sleep(delay);
      }
    }

    // All retries failed
    this.logError(lastError, {
      action: 'retry_failed',
      additionalContext: `Failed after ${finalOptions.maxRetries} retries`,
    });

    throw lastError;
  }

  // Calculate delay based on backoff strategy
  private calculateDelay(attempt: number, options: RetryOptions): number {
    switch (options.backoff) {
      case 'fixed':
        return options.delay;
      case 'linear':
        return options.delay * attempt;
      case 'exponential':
        return options.delay * Math.pow(2, attempt - 1);
      default:
        return options.delay;
    }
  }

  // Sleep utility
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Serialize error for logging
  private serializeError(error: any): any {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error instanceof ARMApiError && {
          statusCode: error.statusCode,
          response: error.response,
        }),
      };
    }
    return error;
  }

  // Send to external logging service
  private async sendToLoggingService(logEntry: ErrorLogEntry): Promise<void> {
    try {
      // Send to your logging service (e.g., Sentry, LogRocket, etc.)
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: logEntry.error.message,
          fatal: logEntry.severity === 'critical',
          custom_map: {
            context: logEntry.context,
            action: logEntry.action,
            severity: logEntry.severity,
          },
        });
      }

      // Send to custom logging endpoint
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      }).catch(() => {
        // Fail silently for logging errors
      });
    } catch (error) {
      // Don't log errors about logging
      console.warn('Failed to send error to logging service:', error);
    }
  }

  // Show critical error notification
  private showCriticalErrorNotification(_error: any): void {
    // This would integrate with your notification system
    // For now, we'll just show a browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Critical Error', {
        body: 'A critical error occurred. Please contact support.',
        icon: '/favicon.ico',
      });
    }
  }

  // Get error logs (for debugging)
  getErrorLogs(): ErrorLogEntry[] {
    return [...this.errorLog];
  }

  // Clear error logs
  clearErrorLogs(): void {
    this.errorLog = [];
  }

  // Get error statistics
  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recentErrors: ErrorLogEntry[];
  } {
    const totalErrors = this.errorLog.length;
    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};

    this.errorLog.forEach(entry => {
      const category = this.categorizeError(entry.error);
      
      errorsByType[category.type] = (errorsByType[category.type] || 0) + 1;
      errorsBySeverity[entry.severity] = (errorsBySeverity[entry.severity] || 0) + 1;
    });

    // Get recent errors (last 10)
    const recentErrors = this.errorLog.slice(-10);

    return {
      totalErrors,
      errorsByType,
      errorsBySeverity,
      recentErrors,
    };
  }

  // Circuit breaker pattern
  private circuitBreakers: Map<string, {
    failures: number;
    lastFailure: number;
    isOpen: boolean;
  }> = new Map();

  async withCircuitBreaker<T>(
    operation: () => Promise<T>,
    circuitKey: string,
    options: {
      failureThreshold: number;
      timeout: number;
      resetTimeout: number;
    } = {
      failureThreshold: 5,
      timeout: 10000,
      resetTimeout: 60000,
    }
  ): Promise<T> {
    const circuit = this.circuitBreakers.get(circuitKey) || {
      failures: 0,
      lastFailure: 0,
      isOpen: false,
    };

    // Check if circuit is open
    if (circuit.isOpen) {
      const now = Date.now();
      if (now - circuit.lastFailure < options.resetTimeout) {
        throw new Error(`Circuit breaker is open for ${circuitKey}`);
      } else {
        // Reset circuit
        circuit.isOpen = false;
        circuit.failures = 0;
      }
    }

    try {
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Operation timeout')), options.timeout);
        }),
      ]);

      // Reset failure count on success
      circuit.failures = 0;
      this.circuitBreakers.set(circuitKey, circuit);

      return result;
    } catch (error) {
      circuit.failures++;
      circuit.lastFailure = Date.now();

      // Open circuit if threshold is reached
      if (circuit.failures >= options.failureThreshold) {
        circuit.isOpen = true;
        this.logError(error, {
          action: 'circuit_breaker_opened',
          additionalContext: `Circuit breaker opened for ${circuitKey}`,
        });
      }

      this.circuitBreakers.set(circuitKey, circuit);
      throw error;
    }
  }
}

// Create singleton instance
export const errorHandler = new ErrorHandler();

// Utility functions
export const withRetry = errorHandler.withRetry.bind(errorHandler);
export const withCircuitBreaker = errorHandler.withCircuitBreaker.bind(errorHandler);
export const logError = errorHandler.logError.bind(errorHandler);

// React hook for error handling
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: any, context?: any) => {
    errorHandler.logError(error, context);
  }, []);

  const retryOperation = React.useCallback(
    (operation: () => Promise<any>, options?: Partial<RetryOptions>) => {
      return errorHandler.withRetry(operation, options);
    },
    []
  );

  return {
    handleError,
    retryOperation,
    getErrorStats: errorHandler.getErrorStats.bind(errorHandler),
    clearErrorLogs: errorHandler.clearErrorLogs.bind(errorHandler),
  };
};

// Error boundary for React components
export class ARMErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    errorHandler.logError(error, {
      action: 'react_error_boundary',
      additionalContext: JSON.stringify(errorInfo),
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Something went wrong</h2>
            <p>We're sorry, but something went wrong. Please try refreshing the page.</p>
            <button onClick={() => window.location.reload()}>
              Refresh Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}