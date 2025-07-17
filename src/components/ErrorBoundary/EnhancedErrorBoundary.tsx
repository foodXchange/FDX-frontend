import React, { Component, ReactNode, ErrorInfo as ReactErrorInfo } from 'react';
import { 
  ErrorBoundaryProps, 
  ErrorBoundaryState, 
  ErrorCategory,
  ErrorInfo,
} from './types';
import {
  GlobalErrorFallback,
  PageErrorFallback,
  SectionErrorFallback,
  ComponentErrorFallback,
} from './ErrorFallbacks';
import { 
  categorizeError, 
  isRecoverableError, 
  shouldReportError,
  getRetryDelay,
  createErrorContext,
  generateErrorId,
} from './utils';
import { logger } from '@/services/logger';
import { errorReporter } from '@/utils/errorReporting';

export class EnhancedErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: NodeJS.Timeout | null = null;
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private previousResetKeys: Array<string | number> = [];
  private errorId: string | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCategory: 'unknown',
      errorCount: 0,
      retryCount: 0,
      isRetrying: false,
      showDetails: false,
    };
    this.previousResetKeys = props.resetKeys || [];
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorCategory = categorizeError(error);
    return {
      hasError: true,
      error,
      errorCategory,
      isRetrying: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ReactErrorInfo) {
    const {
      onError,
      level = 'component',
      enableReporting = true,
      enableAutoRetry = true,
      maxRetries = 3,
      retryDelay = 1000,
    } = this.props;
    const { errorCount, retryCount } = this.state;
    const errorCategory = categorizeError(error);

    // Generate unique error ID
    this.errorId = generateErrorId();

    // Create error info object
    const enhancedErrorInfo: ErrorInfo = {
      componentStack: errorInfo.componentStack || '',
      digest: this.errorId || undefined,
    };

    // Enhanced error logging
    const errorContext = createErrorContext(error, { componentStack: errorInfo.componentStack || '' });
    logger.error(`${level} Error Boundary caught error`, {
      errorId: this.errorId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: enhancedErrorInfo,
      errorCategory,
      context: {
        ...errorContext,
        level,
        errorCount: errorCount + 1,
        retryCount,
      },
    });

    // Report error to external service
    if (enableReporting && shouldReportError(error, errorCategory)) {
      errorReporter.captureException(error, {
        errorId: this.errorId,
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        level,
        category: errorCategory,
        ...errorContext,
      });
    }

    // Call custom error handler
    onError?.(error, enhancedErrorInfo, errorCategory);

    // Update state with error details
    this.setState(prevState => ({
      errorInfo: enhancedErrorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Auto-retry logic for recoverable errors
    if (
      enableAutoRetry &&
      retryCount < maxRetries &&
      isRecoverableError(error, errorCategory)
    ) {
      const delay = getRetryDelay(retryCount, retryDelay);
      this.scheduleRetry(delay);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError) {
      // Reset on prop changes if enabled
      if (resetOnPropsChange && prevProps.children !== this.props.children) {
        this.resetErrorBoundary();
      }

      // Reset on resetKeys change
      if (resetKeys && this.hasResetKeysChanged(resetKeys)) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    this.clearTimeouts();
  }

  private clearTimeouts() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }
  }

  private hasResetKeysChanged(resetKeys: Array<string | number>): boolean {
    if (resetKeys.length !== this.previousResetKeys.length) {
      this.previousResetKeys = [...resetKeys];
      return true;
    }

    for (let i = 0; i < resetKeys.length; i++) {
      if (resetKeys[i] !== this.previousResetKeys[i]) {
        this.previousResetKeys = [...resetKeys];
        return true;
      }
    }

    return false;
  }

  private scheduleRetry(delay: number) {
    this.setState({ isRetrying: true });

    logger.info('Scheduling error retry', {
      errorId: this.errorId,
      delay,
      retryCount: this.state.retryCount + 1,
      maxRetries: this.props.maxRetries || 3,
    });

    this.retryTimeoutId = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
        isRetrying: false,
      }));
    }, delay);
  }

  private resetErrorBoundary = () => {
    this.clearTimeouts();

    logger.info('Resetting error boundary', {
      errorId: this.errorId,
      level: this.props.level,
    });

    // Call custom reset handler
    this.props.onReset?.();

    // Reset state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCategory: 'unknown',
      errorCount: 0,
      retryCount: 0,
      isRetrying: false,
      showDetails: false,
    });

    this.errorId = null;
  };

  private retry = () => {
    const { retryCount } = this.state;
    const { maxRetries = 3, retryDelay = 1000 } = this.props;

    if (retryCount < maxRetries) {
      const delay = getRetryDelay(retryCount, retryDelay);
      this.scheduleRetry(delay);
    } else {
      // If max retries reached, just reset
      this.resetErrorBoundary();
    }
  };

  private toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }));
  };

  render() {
    const {
      hasError,
      error,
      errorInfo,
      errorCategory,
      errorCount,
      retryCount,
      isRetrying,
      showDetails,
    } = this.state;
    const {
      children,
      fallback,
      fallbackComponent: FallbackComponent,
      isolate = false,
      level = 'component',
      showErrorDetails: _showErrorDetails = process.env.NODE_ENV === 'development',
      maxRetries = 3,
    } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        if (typeof fallback === 'function') {
          return <>{fallback(error, errorInfo || { componentStack: '', digest: this.errorId || undefined })}</>;
        }
        return <>{fallback}</>;
      }

      // Use custom fallback component if provided
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={error}
            errorInfo={errorInfo}
            errorCategory={errorCategory}
            resetError={this.resetErrorBoundary}
            retry={this.retry}
            errorCount={errorCount}
            retryCount={retryCount}
            maxRetries={maxRetries}
            isRetrying={isRetrying}
            showDetails={showDetails}
            toggleDetails={this.toggleDetails}
            level={level}
          />
        );
      }

      // Default fallback based on level
      const fallbackProps = {
        error,
        errorInfo,
        errorCategory,
        resetError: this.resetErrorBoundary,
        retry: this.retry,
        errorCount,
        retryCount,
        maxRetries,
        isRetrying,
        showDetails,
        toggleDetails: this.toggleDetails,
        level,
      };

      switch (level) {
        case 'global':
          return <GlobalErrorFallback {...fallbackProps} />;
        case 'page':
          return <PageErrorFallback {...fallbackProps} />;
        case 'section':
          return <SectionErrorFallback {...fallbackProps} />;
        case 'component':
        default:
          return <ComponentErrorFallback {...fallbackProps} isolate={isolate} />;
      }
    }

    return children;
  }
}

// Convenience wrapper components for different error boundary levels
export const GlobalErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <EnhancedErrorBoundary level="global" enableReporting={true} enableAutoRetry={true}>
    {children}
  </EnhancedErrorBoundary>
);

export const PageErrorBoundary: React.FC<{ 
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, errorCategory: ErrorCategory) => void;
}> = ({ children, fallback, onError }) => (
  <EnhancedErrorBoundary 
    level="page" 
    fallback={fallback}
    onError={onError}
    enableReporting={true} 
    enableAutoRetry={true}
  >
    {children}
  </EnhancedErrorBoundary>
);

export const SectionErrorBoundary: React.FC<{ 
  children: ReactNode;
  fallback?: ReactNode;
  isolate?: boolean;
}> = ({ children, fallback, isolate = true }) => (
  <EnhancedErrorBoundary 
    level="section" 
    fallback={fallback}
    isolate={isolate}
    enableReporting={true} 
    enableAutoRetry={true}
  >
    {children}
  </EnhancedErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ 
  children: ReactNode;
  fallback?: ReactNode;
  isolate?: boolean;
}> = ({ children, fallback, isolate = true }) => (
  <EnhancedErrorBoundary 
    level="component" 
    fallback={fallback}
    isolate={isolate}
    enableReporting={false} 
    enableAutoRetry={true}
  >
    {children}
  </EnhancedErrorBoundary>
);