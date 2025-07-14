import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import { logger } from '@/services/logger';
import { ExclamationTriangleIcon, HomeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError() as Error;
  const navigate = useNavigate();

  React.useEffect(() => {
    logger.error('Route error boundary triggered', {
      error: error?.message,
      stack: error?.stack,
      pathname: window.location.pathname,
    });
  }, [error]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Page Error
          </h1>
          
          <p className="mt-2 text-gray-600">
            Sorry, an error occurred while loading this page.
          </p>

          {process.env.NODE_ENV === 'development' && error && (
            <div className="mt-4 text-left">
              <details className="bg-gray-100 rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                  Error Details
                </summary>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-red-600 font-mono">
                    {error.message || 'Unknown error'}
                  </p>
                  {error.stack && (
                    <pre className="text-xs text-gray-600 overflow-auto max-h-40">
                      {error.stack}
                    </pre>
                  )}
                </div>
              </details>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <Button
              variant="default"
              className="w-full"
              onClick={handleGoHome}
            >
              <HomeIcon className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={handleReload}
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};