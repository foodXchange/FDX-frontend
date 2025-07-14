import React, { Component, ReactNode, Suspense } from 'react';
import { logger } from '@/services/logger';
import { SkeletonLoader } from '@components/ui/SkeletonLoader';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  level?: 'page' | 'section' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
}

export class AsyncErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: NodeJS.Timeout | null = null;
  private previousResetKeys: Array<string | number> = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
    this.previousResetKeys = props.resetKeys || [];
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError, level = 'component' } = this.props;
    const { errorCount } = this.state;

    // Log the error
    logger.error(`${level} Error Boundary caught error`, {
      error: error.message,
      componentStack: errorInfo.componentStack,
      errorCount: errorCount + 1,
      level,
    });

    // Call custom error handler
    onError?.(error, errorInfo);

    // Update state
    this.setState({
      errorInfo,
      errorCount: errorCount + 1,
    });

    // Auto-retry after delay for transient errors
    if (errorCount < 3 && this.shouldAutoRetry(error)) {
      this.scheduleReset(1000 * (errorCount + 1)); // Exponential backoff
    }
  }

  componentDidUpdate(prevProps: Props) {
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
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private hasResetKeysChanged(resetKeys: Array<string | number>): boolean {
    if (resetKeys.length !== this.previousResetKeys.length) {
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

  private shouldAutoRetry(error: Error): boolean {
    // Retry on network errors or chunk load errors
    const retryableErrors = [
      'ChunkLoadError',
      'NetworkError',
      'TimeoutError',
    ];
    
    return retryableErrors.some(errorType => 
      error.name.includes(errorType) || error.message.includes(errorType)
    );
  }

  private scheduleReset(delay: number) {
    this.resetTimeoutId = setTimeout(() => {
      logger.info('Auto-retrying after error', { delay });
      this.resetErrorBoundary();
    }, delay);
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    });
  };

  render() {
    const { hasError, error, errorCount } = this.state;
    const { children, fallback, isolate, level = 'component' } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return <>{fallback}</>;
      }

      // Default fallback based on level
      return (
        <div className={`error-boundary-fallback ${level}`}>
          {level === 'page' ? (
            <PageErrorFallback
              error={error}
              resetError={this.resetErrorBoundary}
              errorCount={errorCount}
            />
          ) : level === 'section' ? (
            <SectionErrorFallback
              error={error}
              resetError={this.resetErrorBoundary}
              errorCount={errorCount}
            />
          ) : (
            <ComponentErrorFallback
              error={error}
              resetError={this.resetErrorBoundary}
              errorCount={errorCount}
              isolate={isolate}
            />
          )}
        </div>
      );
    }

    // Wrap children in Suspense for lazy-loaded components
    return (
      <Suspense fallback={<LoadingFallback level={level} />}>
        {children}
      </Suspense>
    );
  }
}

// Fallback components
const PageErrorFallback: React.FC<{
  error: Error;
  resetError: () => void;
  errorCount: number;
}> = ({ error, resetError, errorCount }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Something went wrong
      </h1>
      <p className="text-gray-600 mb-6">
        We're having trouble loading this page. Please try again.
      </p>
      {errorCount > 2 && (
        <p className="text-sm text-red-600 mb-4">
          Multiple errors detected. You may need to refresh the page.
        </p>
      )}
      <button
        onClick={resetError}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  </div>
);

const SectionErrorFallback: React.FC<{
  error: Error;
  resetError: () => void;
  errorCount: number;
}> = ({ error, resetError, errorCount }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
    <h2 className="text-lg font-semibold text-red-800 mb-2">
      Section Error
    </h2>
    <p className="text-red-600 mb-4">
      This section couldn't be loaded properly.
    </p>
    <button
      onClick={resetError}
      className="text-red-600 underline hover:text-red-800"
    >
      Retry
    </button>
  </div>
);

const ComponentErrorFallback: React.FC<{
  error: Error;
  resetError: () => void;
  errorCount: number;
  isolate?: boolean;
}> = ({ error, resetError, errorCount, isolate }) => {
  if (isolate) {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded p-4 text-center">
        <p className="text-sm text-gray-600">Component unavailable</p>
        <button
          onClick={resetError}
          className="text-xs text-blue-600 underline mt-2"
        >
          Retry
        </button>
      </div>
    );
  }

  return null; // Silent failure for non-isolated components
};

const LoadingFallback: React.FC<{ level: string }> = ({ level }) => {
  if (level === 'page') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SkeletonLoader className="w-32 h-32" />
      </div>
    );
  }

  if (level === 'section') {
    return <SkeletonLoader className="w-full h-64 m-4" />;
  }

  return <SkeletonLoader className="w-full h-20" />;
};