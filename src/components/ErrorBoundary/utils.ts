import { ERROR_MESSAGES } from '@/constants';
import { ErrorCategory } from './types';

// Error categorization utilities
export function categorizeError(error: Error): ErrorCategory {
  const errorMessage = error.message.toLowerCase();
  const errorName = error.name.toLowerCase();
  const errorStack = error.stack?.toLowerCase() || '';

  // Network errors
  if (
    errorName.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('network') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('xhr') ||
    errorMessage.includes('cors') ||
    errorMessage.includes('connection') ||
    error.name === 'NetworkError' ||
    error.name === 'TimeoutError'
  ) {
    return 'network';
  }

  // Business logic errors
  if (
    errorMessage.includes('validation') ||
    errorMessage.includes('business') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('forbidden') ||
    errorMessage.includes('permission') ||
    errorMessage.includes('access denied') ||
    error.name === 'ValidationError' ||
    error.name === 'BusinessError'
  ) {
    return 'business';
  }

  // Rendering errors
  if (
    errorStack.includes('react') ||
    errorMessage.includes('render') ||
    errorMessage.includes('component') ||
    errorMessage.includes('element') ||
    errorMessage.includes('jsx') ||
    error.name === 'RenderError'
  ) {
    return 'rendering';
  }

  // Async errors
  if (
    errorMessage.includes('promise') ||
    errorMessage.includes('async') ||
    errorMessage.includes('await') ||
    errorMessage.includes('chunk') ||
    errorName === 'chunkloaderror' ||
    error.name === 'ChunkLoadError'
  ) {
    return 'async';
  }

  return 'unknown';
}

// Get user-friendly error message based on error type
export function getUserFriendlyMessage(error: Error, category: ErrorCategory): string {
  // Check for specific error patterns first
  if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
    return 'Application resources failed to load. Please refresh the page.';
  }

  if (error.message.includes('ResizeObserver')) {
    return 'A display error occurred. This has been logged and will be fixed.';
  }

  // Use category-based messages
  switch (category) {
    case 'network':
      return ERROR_MESSAGES.network;
    case 'business':
      if (error.message.includes('unauthorized')) {
        return ERROR_MESSAGES.unauthorized;
      }
      if (error.message.includes('forbidden')) {
        return ERROR_MESSAGES.forbidden;
      }
      if (error.message.includes('not found')) {
        return ERROR_MESSAGES.notFound;
      }
      return ERROR_MESSAGES.validation;
    case 'rendering':
      return 'A display error occurred. Our team has been notified.';
    case 'async':
      return 'Failed to load application resources. Please try again.';
    default:
      return ERROR_MESSAGES.generic;
  }
}

// Check if error is recoverable
export function isRecoverableError(error: Error, category: ErrorCategory): boolean {
  // Network errors are often recoverable
  if (category === 'network') {
    return true;
  }

  // Chunk load errors are recoverable
  if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
    return true;
  }

  // Some async errors are recoverable
  if (category === 'async' && !error.message.includes('infinite')) {
    return true;
  }

  // ResizeObserver errors are benign and recoverable
  if (error.message.includes('ResizeObserver')) {
    return true;
  }

  // Business errors are generally not recoverable without user action
  if (category === 'business') {
    return false;
  }

  // Rendering errors might be recoverable
  if (category === 'rendering') {
    return !error.message.includes('maximum update depth');
  }

  return false;
}

// Generate error ID for tracking
export function generateErrorId(): string {
  return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Check if error should be reported
export function shouldReportError(error: Error, category: ErrorCategory): boolean {
  // Don't report ResizeObserver errors (browser quirk)
  if (error.message.includes('ResizeObserver')) {
    return false;
  }

  // Don't report canceled requests
  if (error.name === 'AbortError' || error.message.includes('aborted')) {
    return false;
  }

  // Don't report network errors in development
  if (category === 'network' && process.env.NODE_ENV === 'development') {
    return false;
  }

  // Report all other errors
  return true;
}

// Get retry delay with exponential backoff
export function getRetryDelay(retryCount: number, baseDelay: number = 1000): number {
  return Math.min(baseDelay * Math.pow(2, retryCount), 30000); // Max 30 seconds
}

// Format error stack for display
export function formatErrorStack(stack?: string): string {
  if (!stack) return '';
  
  // Remove internal React frames in production
  if (process.env.NODE_ENV === 'production') {
    return stack
      .split('\n')
      .filter(line => !line.includes('node_modules/react'))
      .slice(0, 5)
      .join('\n');
  }
  
  return stack;
}

// Create error context for reporting
export function createErrorContext(error: Error, errorInfo?: { componentStack?: string }): Record<string, any> {
  return {
    errorName: error.name,
    errorMessage: error.message,
    errorStack: formatErrorStack(error.stack),
    componentStack: errorInfo?.componentStack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    screen: {
      width: window.screen.width,
      height: window.screen.height,
    },
    memory: (performance as any).memory ? {
      usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
      totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
    } : undefined,
  };
}

// Get error message (alias for getUserFriendlyMessage)
export function getErrorMessage(error: Error): string {
  const category = categorizeError(error);
  return getUserFriendlyMessage(error, category);
}

// Report error to monitoring service
export function reportError(error: Error, context?: Record<string, any>): void {
  const category = categorizeError(error);
  
  if (!shouldReportError(error, category)) {
    return;
  }

  const errorContext = createErrorContext(error, context);
  
  // Console logging for development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error reported:', error, errorContext);
  }
  
  // In production, report to monitoring service
  if (process.env.NODE_ENV === 'production') {
    try {
      // Add your error reporting service here
      // e.g., Sentry, LogRocket, etc.
      console.error('Production error:', error, errorContext);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }
}