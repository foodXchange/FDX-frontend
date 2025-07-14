import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider as ReactRouterProvider } from 'react-router-dom';
import { routes } from './routes';
import { SkeletonLoader } from '@components/ui/SkeletonLoader';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Create router instance
const router = createBrowserRouter(routes, {
  future: {
    v7_normalizeFormMethod: true,
  },
});

// Loading component
const RouterLoading: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <SkeletonLoader className="w-32 h-32 mx-auto mb-4" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Error component
const RouterError: React.FC<{ error: Error }> = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Route Error</h1>
      <p className="text-gray-700 mb-2">An error occurred while loading this page.</p>
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-gray-500">Error details</summary>
        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
          {error.message}
        </pre>
      </details>
      <button
        onClick={() => window.location.href = '/'}
        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
      >
        Go to Home
      </button>
    </div>
  </div>
);

export const AppRouterProvider: React.FC = () => {
  return (
    <ErrorBoundary fallback={<RouterError error={new Error('Router failed to load')} />}>
      <Suspense fallback={<RouterLoading />}>
        <ReactRouterProvider router={router} />
      </Suspense>
    </ErrorBoundary>
  );
};