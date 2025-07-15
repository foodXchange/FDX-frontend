import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/services/logger';
import { notify } from '@/store/useNotificationStore';

interface ErrorHandlerOptions {
  logError?: boolean;
  showNotification?: boolean;
  notificationMessage?: string;
  redirectTo?: string;
  onError?: (error: Error) => void;
  retryAction?: () => Promise<void>;
  fallbackAction?: () => void;
}

export const useErrorHandler = () => {
  const navigate = useNavigate();

  const handleError = useCallback(
    async (error: Error | unknown, options: ErrorHandlerOptions = {}) => {
      const {
        logError = true,
        showNotification = true,
        notificationMessage,
        redirectTo,
        onError,
        retryAction,
        fallbackAction,
      } = options;

      // Ensure we have an Error object
      const errorObj = error instanceof Error ? error : new Error(String(error));

      // Log the error
      if (logError) {
        logger.error('Error handled by useErrorHandler', {
          error: errorObj.message,
          stack: errorObj.stack,
          options,
        });
      }

      // Show notification
      if (showNotification) {
        const message = notificationMessage || getErrorMessage(errorObj);
        notify.error('Error', message);
      }

      // Custom error handler
      if (onError) {
        try {
          onError(errorObj);
        } catch (handlerError) {
          logger.error('Error in custom error handler', handlerError as Error);
        }
      }

      // Retry action if provided
      if (retryAction) {
        try {
          await retryAction();
          notify.success('Success', 'Action completed successfully after retry');
          return;
        } catch (retryError) {
          logger.error('Retry failed', retryError as Error);
        }
      }

      // Fallback action
      if (fallbackAction) {
        try {
          fallbackAction();
        } catch (fallbackError) {
          logger.error('Fallback action failed', fallbackError as Error);
        }
      }

      // Redirect if specified
      if (redirectTo) {
        navigate(redirectTo);
      }
    },
    [navigate]
  );

  const handleAsyncError = useCallback(
    (asyncFn: () => Promise<void>, options?: ErrorHandlerOptions) => {
      return async () => {
        try {
          await asyncFn();
        } catch (error) {
          handleError(error, options);
        }
      };
    },
    [handleError]
  );

  const createErrorHandler = useCallback(
    (options: ErrorHandlerOptions = {}) => {
      return (error: Error | unknown) => handleError(error, options);
    },
    [handleError]
  );

  return {
    handleError,
    handleAsyncError,
    createErrorHandler,
  };
};

// Helper function to get user-friendly error messages
function getErrorMessage(error: Error): string {
  // Network errors
  if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Timeout errors
  if (error.message.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  // Permission errors
  if (error.message.includes('Permission') || error.message.includes('Forbidden')) {
    return 'You do not have permission to perform this action.';
  }

  // Authentication errors
  if (error.message.includes('Unauthorized') || error.message.includes('401')) {
    return 'Authentication required. Please log in and try again.';
  }

  // Validation errors
  if (error.message.includes('Validation') || error.message.includes('Invalid')) {
    return error.message; // Show the actual validation message
  }

  // Default message
  return 'An unexpected error occurred. Please try again.';
}

// Error recovery strategies
export const errorRecoveryStrategies = {
  reload: () => window.location.reload(),
  
  goHome: (navigate: ReturnType<typeof useNavigate>) => navigate('/'),
  
  clearCacheAndReload: () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  },
  
  reportError: async (error: Error) => {
    try {
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (reportError) {
      logger.error('Failed to report error', reportError as Error);
    }
  },
};