import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/services/logger';
import { errorReporter } from '@/utils/errorReporting';
import { categorizeError, shouldReportError, createErrorContext } from './utils';
import { useToast } from '@/hooks/useToast';

interface AsyncErrorHandlerProps {
  children: React.ReactNode;
}

// Global promise rejection tracking
const unhandledPromises = new Map<Promise<any>, { reason: any; handled: boolean }>();

export const AsyncErrorHandler: React.FC<AsyncErrorHandlerProps> = ({ children }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      const category = categorizeError(error);

      // Log the error
      logger.error('Unhandled promise rejection', {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        promise: event.promise,
        category,
        ...createErrorContext(error),
      });

      // Report if necessary
      if (shouldReportError(error, category)) {
        errorReporter.captureException(error, {
          type: 'unhandledRejection',
          category,
          ...createErrorContext(error),
        });
      }

      // Track the promise
      unhandledPromises.set(event.promise, { reason: event.reason, handled: false });

      // Handle specific error types
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        showToast('Session expired. Please log in again.', 'error');
        navigate('/login');
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        showToast('Network error. Please check your connection.', 'error');
      } else if (category === 'business') {
        showToast(error.message || 'A business error occurred', 'error');
      } else if (process.env.NODE_ENV === 'development') {
        showToast(`Unhandled error: ${error.message}`, 'error');
      }

      // Prevent default browser error handling in production
      if (process.env.NODE_ENV === 'production') {
        event.preventDefault();
      }
    };

    // Handle when a previously rejected promise is handled
    const handleRejectionHandled = (event: PromiseRejectionEvent) => {
      if (unhandledPromises.has(event.promise)) {
        const promiseInfo = unhandledPromises.get(event.promise);
        if (promiseInfo) {
          promiseInfo.handled = true;
          logger.info('Previously unhandled promise rejection was handled', {
            reason: promiseInfo.reason,
          });
        }
      }
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('rejectionhandled', handleRejectionHandled as any);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('rejectionhandled', handleRejectionHandled as any);
      unhandledPromises.clear();
    };
  }, [navigate, showToast]);

  return <>{children}</>;
};

// Hook for handling async errors in components
export function useAsyncError() {
  return React.useCallback((error: Error) => {
    throw error;
  }, []);
}

// Wrapper for async operations with error handling
export async function withAsyncErrorHandling<T>(
  asyncFn: () => Promise<T>,
  options?: {
    fallbackValue?: T;
    onError?: (error: Error) => void;
    showToast?: boolean;
    toastMessage?: string;
  }
): Promise<T | undefined> {
  try {
    return await asyncFn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const category = categorizeError(err);

    // Log the error
    logger.error('Async operation failed', {
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
      category,
      ...createErrorContext(err),
    });

    // Call custom error handler
    options?.onError?.(err);

    // Show toast if requested
    if (options?.showToast) {
      const message = options.toastMessage || err.message || 'An error occurred';
      // Note: This would need to be connected to your toast system
      console.error(message);
    }

    // Return fallback value if provided
    return options?.fallbackValue;
  }
}

// Async component wrapper with error boundary
export function withAsyncBoundary<P extends object>(
  Component: React.ComponentType<P>,
  _fallback?: React.ReactNode
): React.ComponentType<P> {
  return (props: P) => {
    const throwError = useAsyncError();

    // Wrap all async operations in the component
    const wrappedProps = React.useMemo(() => {
      const newProps: any = { ...props };

      // Intercept async functions in props
      Object.keys(newProps).forEach(key => {
        if (typeof newProps[key] === 'function') {
          const originalFn = newProps[key];
          newProps[key] = async (...args: any[]) => {
            try {
              return await originalFn(...args);
            } catch (error) {
              throwError(error instanceof Error ? error : new Error(String(error)));
            }
          };
        }
      });

      return newProps;
    }, [props, throwError]);

    return <Component {...wrappedProps} />;
  };
}

// Create a promise that rejects after a timeout
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError?: Error
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(timeoutError || new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

// Retry failed async operations
export async function withRetry<T>(
  asyncFn: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    exponentialBackoff?: boolean;
    shouldRetry?: (error: Error, attempt: number) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    shouldRetry = () => true,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries || !shouldRetry(lastError, attempt)) {
        throw lastError;
      }

      const delay = exponentialBackoff
        ? retryDelay * Math.pow(2, attempt)
        : retryDelay;

      logger.debug(`Retrying operation (attempt ${attempt + 1}/${maxRetries})`, {
        error: lastError.message,
        delay,
      });

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}