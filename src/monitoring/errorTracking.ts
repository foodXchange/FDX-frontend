import { monitoringConfig } from '../config/monitoring.config';
import { rumMonitor } from './rum';

export interface ErrorReport {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId: string;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class ErrorTracker {
  private sessionId: string;
  private userId?: string;
  private errorQueue: ErrorReport[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    
    if (monitoringConfig.enableErrorTracking) {
      this.initializeErrorHandlers();
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        severity: 'high'
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        severity: 'critical'
      });
    });

    // React error boundary integration
    this.setupReactErrorHandler();
  }

  private setupReactErrorHandler() {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('React') || message.includes('component')) {
        this.captureError({
          message,
          severity: 'medium',
          context: { type: 'react-error' }
        });
      }
      originalConsoleError.apply(console, args);
    };
  }

  captureError(error: Partial<ErrorReport>) {
    const errorReport: ErrorReport = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      filename: error.filename,
      lineno: error.lineno,
      colno: error.colno,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.userId,
      sessionId: this.sessionId,
      context: error.context,
      severity: error.severity || 'medium'
    };

    this.errorQueue.push(errorReport);
    this.sendErrorReport(errorReport);
    
    // Also track in RUM
    rumMonitor.trackError(new Error(errorReport.message), {
      severity: errorReport.severity,
      ...errorReport.context
    });
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  addContext(context: Record<string, any>) {
    // Add global context that will be included in all future error reports
    this.globalContext = { ...this.globalContext, ...context };
  }

  private globalContext: Record<string, any> = {};

  private sendErrorReport(error: ErrorReport) {
    const payload = {
      ...error,
      context: { ...this.globalContext, ...error.context }
    };

    fetch(`${monitoringConfig.apiEndpoint}/errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(console.error);
  }

  getErrors() {
    return this.errorQueue;
  }

  clearErrors() {
    this.errorQueue = [];
  }
}

export const errorTracker = new ErrorTracker();

// React hook for error tracking
export function useErrorTracker() {
  return {
    captureError: errorTracker.captureError.bind(errorTracker),
    setUserId: errorTracker.setUserId.bind(errorTracker),
    addContext: errorTracker.addContext.bind(errorTracker),
    getErrors: errorTracker.getErrors.bind(errorTracker)
  };
}