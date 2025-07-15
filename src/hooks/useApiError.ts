import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// import { Toast } from '@components/ui/Toast'; // Uncomment when needed
import { ApiError } from '@/services/api-client';

interface ApiErrorHandlerOptions {
  showToast?: boolean;
  redirectOn401?: boolean;
  redirectOn403?: boolean;
  onError?: (error: ApiError) => void;
}

export const useApiError = (options: ApiErrorHandlerOptions = {}) => {
  const navigate = useNavigate();
  const {
    showToast = true,
    redirectOn401 = true,
    redirectOn403 = true,
    onError,
  } = options;

  const handleApiError = useCallback((error: ApiError) => {
    // Custom error handler
    onError?.(error);

    // Show toast notification
    if (showToast) {
      const message = error.message || 'An error occurred';
      // You might want to use a global toast system here
      console.error(message);
    }

    // Handle specific status codes
    switch (error.statusCode) {
      case 401:
        if (redirectOn401) {
          navigate('/login');
        }
        break;
      case 403:
        if (redirectOn403) {
          navigate('/unauthorized');
        }
        break;
      case 404:
        navigate('/404');
        break;
    }
  }, [navigate, showToast, redirectOn401, redirectOn403, onError]);

  // Listen for global API error events
  useEffect(() => {
    const handleForbidden = (event: CustomEvent) => {
      handleApiError({
        ...event.detail,
        statusCode: 403,
      });
    };

    const handleRateLimited = (event: CustomEvent) => {
      const { retryAfter, message } = event.detail;
      handleApiError({
        success: false,
        message: message || `Rate limited. Try again in ${retryAfter} seconds.`,
        errors: ['Rate limit exceeded'],
        statusCode: 429,
        requestId: '',
      });
    };

    const handleServerError = (event: CustomEvent) => {
      handleApiError({
        ...event.detail,
        statusCode: 500,
      });
    };

    window.addEventListener('api:forbidden', handleForbidden as EventListener);
    window.addEventListener('api:rate-limited', handleRateLimited as EventListener);
    window.addEventListener('api:server-error', handleServerError as EventListener);

    return () => {
      window.removeEventListener('api:forbidden', handleForbidden as EventListener);
      window.removeEventListener('api:rate-limited', handleRateLimited as EventListener);
      window.removeEventListener('api:server-error', handleServerError as EventListener);
    };
  }, [handleApiError]);

  return { handleApiError };
};