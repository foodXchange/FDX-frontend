import React, { ReactNode } from 'react';

export type ErrorLevel = 'page' | 'section' | 'component' | 'global';
export type ErrorCategory = 'network' | 'business' | 'rendering' | 'async' | 'unknown';

export interface ErrorInfo {
  componentStack: string;
  digest?: string;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo, errorCategory: ErrorCategory) => void;
  onReset?: () => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  level?: ErrorLevel;
  showErrorDetails?: boolean;
  enableReporting?: boolean;
  enableAutoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  fallbackComponent?: React.ComponentType<ErrorFallbackProps>;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCategory: ErrorCategory;
  errorCount: number;
  retryCount: number;
  isRetrying: boolean;
  showDetails: boolean;
}

export interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  errorCategory: ErrorCategory;
  resetError: () => void;
  retry: () => void;
  errorCount: number;
  retryCount: number;
  maxRetries: number;
  isRetrying: boolean;
  showDetails: boolean;
  toggleDetails: () => void;
  level: ErrorLevel;
}

export interface ErrorContextValue {
  errorHistory: ErrorHistoryEntry[];
  reportError: (error: Error, context?: Record<string, any>) => void;
  clearErrorHistory: () => void;
}

export interface ErrorHistoryEntry {
  id: string;
  error: Error;
  errorInfo: ErrorInfo | null;
  category: ErrorCategory;
  timestamp: number;
  url: string;
  userId?: string;
  context?: Record<string, any>;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsByPage: Record<string, number>;
  recoveryRate: number;
  meanTimeToRecovery: number;
}

// Alias for ErrorContextValue to match the expected export
export type ErrorContextType = ErrorContextValue;