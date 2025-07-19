// Standard error types for consistent handling
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface StandardError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  code?: string;
  originalError?: Error;
  context?: Record<string, any>;
  timestamp: Date;
  retryable: boolean;
  userMessage: string;
}

export interface ErrorHandlingConfig {
  enableReporting?: boolean;
  enableLogging?: boolean;
  enableUserNotification?: boolean;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  fallbackAction?: () => void;
  onError?: (error: StandardError) => void;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  backoffMultiplier: number;
  maxDelay: number;
  retryCondition?: (error: StandardError) => boolean;
}

// Error classification utility
export function classifyError(error: Error | any): StandardError {
  const timestamp = new Date();

  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('fetch')) {
    return {
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      message: error.message || 'Network connection failed',
      code: error.code,
      originalError: error,
      timestamp,
      retryable: true,
      userMessage: 'Unable to connect to the server. Please check your internet connection and try again.'
    };
  }

  // Authentication errors
  if (error.status === 401 || error.code === 'UNAUTHORIZED') {
    return {
      type: ErrorType.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      message: error.message || 'Authentication failed',
      code: error.code,
      originalError: error,
      timestamp,
      retryable: false,
      userMessage: 'Your session has expired. Please log in again.'
    };
  }

  // Authorization errors
  if (error.status === 403 || error.code === 'FORBIDDEN') {
    return {
      type: ErrorType.AUTHORIZATION,
      severity: ErrorSeverity.HIGH,
      message: error.message || 'Access denied',
      code: error.code,
      originalError: error,
      timestamp,
      retryable: false,
      userMessage: 'You do not have permission to perform this action.'
    };
  }

  // Not found errors
  if (error.status === 404 || error.code === 'NOT_FOUND') {
    return {
      type: ErrorType.NOT_FOUND,
      severity: ErrorSeverity.MEDIUM,
      message: error.message || 'Resource not found',
      code: error.code,
      originalError: error,
      timestamp,
      retryable: false,
      userMessage: 'The requested resource could not be found.'
    };
  }

  // Validation errors
  if (error.status === 422 || error.code === 'VALIDATION_ERROR') {
    return {
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.LOW,
      message: error.message || 'Validation failed',
      code: error.code,
      originalError: error,
      timestamp,
      retryable: false,
      userMessage: error.message || 'Please check your input and try again.'
    };
  }

  // Rate limit errors
  if (error.status === 429 || error.code === 'RATE_LIMIT') {
    return {
      type: ErrorType.RATE_LIMIT,
      severity: ErrorSeverity.MEDIUM,
      message: error.message || 'Rate limit exceeded',
      code: error.code,
      originalError: error,
      timestamp,
      retryable: true,
      userMessage: 'Too many requests. Please wait a moment and try again.'
    };
  }

  // Server errors
  if (error.status >= 500 || error.code === 'SERVER_ERROR') {
    return {
      type: ErrorType.SERVER_ERROR,
      severity: ErrorSeverity.HIGH,
      message: error.message || 'Internal server error',
      code: error.code,
      originalError: error,
      timestamp,
      retryable: true,
      userMessage: 'A server error occurred. Please try again later.'
    };
  }

  // Timeout errors
  if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
    return {
      type: ErrorType.TIMEOUT,
      severity: ErrorSeverity.MEDIUM,
      message: error.message || 'Request timeout',
      code: error.code,
      originalError: error,
      timestamp,
      retryable: true,
      userMessage: 'The request took too long to complete. Please try again.'
    };
  }

  // Default to unknown error
  return {
    type: ErrorType.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
    message: error.message || 'An unexpected error occurred',
    code: error.code,
    originalError: error,
    timestamp,
    retryable: false,
    userMessage: 'An unexpected error occurred. Please try again or contact support if the problem persists.'
  };
}

// Error handler class
export class ErrorHandler {
  private config: ErrorHandlingConfig;

  constructor(config: ErrorHandlingConfig = {}) {
    this.config = {
      enableReporting: true,
      enableLogging: true,
      enableUserNotification: true,
      enableRetry: false,
      maxRetries: 3,
      retryDelay: 1000,
      ...config
    };
  }

  handle(error: Error | any, context?: Record<string, any>): StandardError {
    const standardError = classifyError(error);
    
    if (context) {
      standardError.context = { ...standardError.context, ...context };
    }

    // Log error
    if (this.config.enableLogging) {
      this.logError(standardError);
    }

    // Report error to external service
    if (this.config.enableReporting && standardError.severity !== ErrorSeverity.LOW) {
      this.reportError(standardError);
    }

    // Execute custom error handler
    if (this.config.onError) {
      this.config.onError(standardError);
    }

    return standardError;
  }

  private logError(error: StandardError): void {
    const logLevel = this.getLogLevel(error.severity);
    const logMessage = `[${error.type}] ${error.message}`;
    const logData = {
      code: error.code,
      context: error.context,
      timestamp: error.timestamp,
      originalError: error.originalError
    };

    console[logLevel](logMessage, logData);
  }

  private getLogLevel(severity: ErrorSeverity): 'error' | 'warn' | 'info' {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.LOW:
        return 'info';
      default:
        return 'error';
    }
  }

  private reportError(error: StandardError): void {
    // In a real application, this would send to an error reporting service
    // like Sentry, Rollbar, or Bugsnag
    console.error('Error reported:', {
      type: error.type,
      severity: error.severity,
      message: error.message,
      code: error.code,
      timestamp: error.timestamp,
      context: error.context
    });
  }
}

// Retry utility function
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  let lastError: StandardError | null = null;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = classifyError(error);
      
      // Don't retry if it's the last attempt or if retry condition fails
      if (attempt === config.maxRetries || 
          (config.retryCondition && !config.retryCondition(lastError))) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.initialDelay * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelay
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Default error handler instance
export const errorHandler = new ErrorHandler();