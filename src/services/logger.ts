interface LogLevel {
  DEBUG: 'debug';
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
  FATAL: 'fatal';
}

const LOG_LEVELS: LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal',
};

interface LogEntry {
  timestamp: string;
  level: keyof LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

interface LoggerConfig {
  enableConsole: boolean;
  enableRemote: boolean;
  minLevel: keyof LogLevel;
  maxLogSize: number;
  remoteEndpoint?: string;
  includeStackTrace: boolean;
  sanitizers?: Array<(data: any) => any>;
}

class Logger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      enableConsole: process.env.NODE_ENV !== 'production',
      enableRemote: process.env.NODE_ENV === 'production',
      minLevel: process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG,
      maxLogSize: 1000,
      remoteEndpoint: process.env.REACT_APP_LOG_ENDPOINT,
      includeStackTrace: process.env.NODE_ENV !== 'production',
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.setupErrorHandlers();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupErrorHandlers(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.error('Uncaught error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', {
        reason: event.reason,
        promise: event.promise,
      });
    });
  }

  private shouldLog(level: keyof LogLevel): boolean {
    const levels = Object.values(LOG_LEVELS);
    const currentLevelIndex = levels.indexOf(this.config.minLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(entry: LogEntry): string {
    const { timestamp, level, message, context } = entry;
    let formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      formatted += ` | Context: ${JSON.stringify(context)}`;
    }
    
    return formatted;
  }

  private sanitizeData(data: any): any {
    if (!this.config.sanitizers) return data;
    
    let sanitized = data;
    for (const sanitizer of this.config.sanitizers) {
      sanitized = sanitizer(sanitized);
    }
    return sanitized;
  }

  private createLogEntry(
    level: keyof LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): LogEntry {
    const user = this.getCurrentUser();
    
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.sanitizeData(context),
      error,
      userId: user?.id,
      sessionId: this.sessionId,
      requestId: this.getCurrentRequestId(),
    };
  }

  private getCurrentUser(): { id: string } | null {
    // Get user from auth context or localStorage
    try {
      const authData = localStorage.getItem('auth-store');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.user;
      }
    } catch (error) {
      // Ignore parsing errors
    }
    return null;
  }

  private getCurrentRequestId(): string | undefined {
    // Get from current API request context if available
    return (window as any).__currentRequestId;
  }

  private log(entry: LogEntry): void {
    // Add to buffer
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.config.maxLogSize) {
      this.logBuffer.shift();
    }

    // Console logging
    if (this.config.enableConsole) {
      const consoleMethod = console[entry.level] || console.log;
      consoleMethod(this.formatMessage(entry), entry.context, entry.error);
    }

    // Remote logging
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.sendToRemote(entry);
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    try {
      await fetch(this.config.remoteEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...entry,
          userAgent: navigator.userAgent,
          url: window.location.href,
          environment: process.env.NODE_ENV,
        }),
      });
    } catch (error) {
      // Fail silently to avoid infinite loops
      console.error('Failed to send log to remote:', error);
    }
  }

  // Public logging methods
  debug(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      this.log(this.createLogEntry(LOG_LEVELS.DEBUG, message, context));
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      this.log(this.createLogEntry(LOG_LEVELS.INFO, message, context));
    }
  }

  warn(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LOG_LEVELS.WARN)) {
      this.log(this.createLogEntry(LOG_LEVELS.WARN, message, context));
    }
  }

  error(message: string, context?: Record<string, any> | Error): void {
    if (this.shouldLog(LOG_LEVELS.ERROR)) {
      let error: Error | undefined;
      let contextData: Record<string, any> | undefined;

      if (context instanceof Error) {
        error = context;
        contextData = {
          errorMessage: error.message,
          errorStack: this.config.includeStackTrace ? error.stack : undefined,
        };
      } else {
        contextData = context;
      }

      this.log(this.createLogEntry(LOG_LEVELS.ERROR, message, contextData, error));
    }
  }

  fatal(message: string, context?: Record<string, any> | Error): void {
    if (this.shouldLog(LOG_LEVELS.FATAL)) {
      let error: Error | undefined;
      let contextData: Record<string, any> | undefined;

      if (context instanceof Error) {
        error = context;
        contextData = {
          errorMessage: error.message,
          errorStack: error.stack,
        };
      } else {
        contextData = context;
      }

      this.log(this.createLogEntry(LOG_LEVELS.FATAL, message, contextData, error));
      
      // For fatal errors, always try to send to remote immediately
      if (this.config.enableRemote && this.config.remoteEndpoint) {
        this.sendToRemote(this.createLogEntry(LOG_LEVELS.FATAL, message, contextData, error));
      }
    }
  }

  // Utility methods
  startTimer(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.debug(`Timer [${label}]`, { duration: `${duration.toFixed(2)}ms` });
    };
  }

  trackEvent(eventName: string, properties?: Record<string, any>): void {
    this.info(`Event: ${eventName}`, properties);
  }

  trackPageView(pageName: string, properties?: Record<string, any>): void {
    this.info(`Page View: ${pageName}`, {
      ...properties,
      referrer: document.referrer,
      pathname: window.location.pathname,
    });
  }

  getLogBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  clearLogBuffer(): void {
    this.logBuffer = [];
  }

  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Default sanitizers
const defaultSanitizers = [
  // Remove sensitive data
  (data: any) => {
    if (typeof data !== 'object' || data === null) return data;
    
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
    const sanitized = { ...data };
    
    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = defaultSanitizers[0](sanitized[key]);
      }
    }
    
    return sanitized;
  },
];

// Create and export logger instance
export const logger = new Logger({
  sanitizers: defaultSanitizers,
});

// Export types
export type { LogEntry, LoggerConfig, LogLevel };