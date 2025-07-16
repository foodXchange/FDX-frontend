import { useEffect, useCallback } from 'react';
import { useErrorReporting } from '../components/utils/ErrorBoundary';

interface GlobalErrorConfig {
  enableConsoleOverride?: boolean;
  enableUnhandledRejectionCapture?: boolean;
  enableResourceErrorCapture?: boolean;
  reportToService?: boolean;
}

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  additionalData?: Record<string, any>;
}

export function useGlobalErrorHandler(config: GlobalErrorConfig = {}) {
  const { reportError } = useErrorReporting();
  
  const {
    enableConsoleOverride = true,
    enableUnhandledRejectionCapture = true,
    enableResourceErrorCapture = true,
    reportToService = true,
  } = config;

  const handleError = useCallback((
    error: Error,
    context: ErrorContext = {}
  ) => {
    const errorId = reportError(error, context);
    
    // Additional error handling logic
    if (reportToService) {
      // Send to external monitoring service
      sendToMonitoringService(error, context, errorId);
    }
    
    return errorId;
  }, [reportError, reportToService]);

  const handleAsyncError = useCallback((
    error: Error,
    context: ErrorContext = {}
  ) => {
    console.error('Async Error:', error);
    return handleError(error, { ...context, type: 'async' });
  }, [handleError]);

  const handleAPIError = useCallback((
    error: Error,
    endpoint: string,
    method: string,
    context: ErrorContext = {}
  ) => {
    const apiContext = {
      ...context,
      type: 'api',
      endpoint,
      method,
      timestamp: new Date().toISOString(),
    };
    
    return handleError(error, apiContext);
  }, [handleError]);

  // Global error event listeners
  useEffect(() => {
    // Capture unhandled JavaScript errors
    const handleGlobalError = (event: ErrorEvent) => {
      const error = new Error(event.message);
      error.stack = `${event.filename}:${event.lineno}:${event.colno}`;
      
      handleError(error, {
        type: 'global',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    // Capture unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (enableUnhandledRejectionCapture) {
        const error = event.reason instanceof Error 
          ? event.reason 
          : new Error(String(event.reason));
        
        handleError(error, {
          type: 'unhandled_promise_rejection',
        });
      }
    };

    // Capture resource loading errors
    const handleResourceError = (event: Event) => {
      if (enableResourceErrorCapture) {
        const target = event.target as HTMLElement;
        const error = new Error(`Failed to load resource: ${target.tagName}`);
        
        handleError(error, {
          type: 'resource',
          tagName: target.tagName,
          src: (target as any).src || (target as any).href,
        });
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    document.addEventListener('error', handleResourceError, true);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      document.removeEventListener('error', handleResourceError, true);
    };
  }, [handleError, enableUnhandledRejectionCapture, enableResourceErrorCapture]);

  // Console override for capturing console errors
  useEffect(() => {
    if (!enableConsoleOverride) return;

    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.error = (...args: any[]) => {
      // Call original console.error
      originalConsoleError.apply(console, args);
      
      // Create error from console message
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      const error = new Error(message);
      handleError(error, {
        type: 'console_error',
        args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)),
      });
    };

    console.warn = (...args: any[]) => {
      // Call original console.warn
      originalConsoleWarn.apply(console, args);
      
      // Optionally handle warnings as well
      if (process.env.NODE_ENV === 'development') {
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        
        console.log('Warning captured:', message);
      }
    };

    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, [enableConsoleOverride, handleError]);

  return {
    handleError,
    handleAsyncError,
    handleAPIError,
  };
}

// Helper function to send errors to monitoring service
async function sendToMonitoringService(
  error: Error,
  context: ErrorContext,
  errorId: string
) {
  try {
    // Example integration with monitoring services
    const payload = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      buildVersion: process.env.REACT_APP_VERSION,
    };

    // Send to your monitoring service (Sentry, LogRocket, etc.)
    if (process.env.REACT_APP_SENTRY_DSN) {
      // Example Sentry integration
      await fetch(`${process.env.REACT_APP_SENTRY_DSN}/api/errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SENTRY_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });
    }

    // Send to internal logging service
    await fetch('/api/v1/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

  } catch (monitoringError) {
    console.error('Failed to send error to monitoring service:', monitoringError);
  }
}

// Hook for API-specific error handling
export function useAPIErrorHandler() {
  const { handleAPIError } = useGlobalErrorHandler();

  const wrapAPICall = useCallback(
    <T>(
      apiCall: () => Promise<T>,
      endpoint: string,
      method: string = 'GET',
      context: ErrorContext = {}
    ): Promise<T> => {
      return apiCall().catch((error) => {
        const errorId = handleAPIError(error, endpoint, method, context);
        
        // Re-throw with additional context
        const enhancedError = new Error(error.message);
        (enhancedError as any).errorId = errorId;
        (enhancedError as any).endpoint = endpoint;
        (enhancedError as any).method = method;
        
        throw enhancedError;
      });
    },
    [handleAPIError]
  );

  return { wrapAPICall };
}

// Hook for component-specific error handling
export function useComponentErrorHandler(componentName: string) {
  const { handleError } = useGlobalErrorHandler();

  const handleComponentError = useCallback((
    error: Error,
    action?: string,
    additionalData?: Record<string, any>
  ) => {
    return handleError(error, {
      component: componentName,
      action,
      additionalData,
    });
  }, [handleError, componentName]);

  const wrapAction = useCallback(
    <T>(
      action: () => T | Promise<T>,
      actionName: string,
      additionalData?: Record<string, any>
    ): Promise<T> => {
      try {
        const result = action();
        
        if (result instanceof Promise) {
          return result.catch((error) => {
            handleComponentError(error, actionName, additionalData);
            throw error;
          });
        }
        
        return Promise.resolve(result);
      } catch (error) {
        handleComponentError(error as Error, actionName, additionalData);
        throw error;
      }
    },
    [handleComponentError]
  );

  return {
    handleComponentError,
    wrapAction,
  };
}

export default useGlobalErrorHandler;