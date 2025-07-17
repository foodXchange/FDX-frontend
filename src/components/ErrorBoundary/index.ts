// Main exports for error boundary system
export { EnhancedErrorBoundary } from './EnhancedErrorBoundary';
export { 
  GlobalErrorBoundary, 
  PageErrorBoundary, 
  SectionErrorBoundary, 
  ComponentErrorBoundary 
} from './EnhancedErrorBoundary';

// Async error handling
export { AsyncErrorBoundary } from './AsyncErrorBoundary';
export { 
  AsyncErrorHandler, 
  useAsyncError, 
  withAsyncErrorHandling, 
  withAsyncBoundary, 
  withTimeout, 
  withRetry 
} from './AsyncErrorHandler';

// Error context and monitoring
export { 
  ErrorProvider, 
  useErrorContext, 
  useErrorMetrics, 
  useErrorRecovery, 
  ErrorMonitoringDashboard 
} from './ErrorContext';

// Fallback components
export {
  GlobalErrorFallback,
  PageErrorFallback,
  SectionErrorFallback,
  ComponentErrorFallback,
  RFQErrorFallback,
  AgentErrorFallback,
  ExpertMarketplaceErrorFallback,
} from './ErrorFallbacks';

// Utilities
export {
  categorizeError,
  getErrorMessage,
  isRecoverableError,
  createErrorContext,
  reportError,
} from './utils';

// Types
export type {
  ErrorBoundaryProps,
  ErrorFallbackProps,
  ErrorContextType,
  ErrorCategory,
  ErrorLevel,
  ErrorMetrics,
} from './types';

// Higher-order components and utilities for route integration
export {
  withErrorBoundary,
  withPageErrorBoundary,
  withSectionErrorBoundary,
  withComponentErrorBoundary,
} from './withErrorBoundary';