import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider as ReactRouterProvider } from 'react-router-dom';
import { routes } from './routes';
import { SkeletonLoader } from '@components/ui/SkeletonLoader';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Box, Typography, Button } from '@mui/material';

// Create router instance
const router = createBrowserRouter(routes);

// Loading component
const RouterLoading: React.FC = () => (
  <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
    <Box sx={{ textAlign: 'center' }}>
      <SkeletonLoader sx={{ width: '8rem', height: '8rem', mx: 'auto', mb: 4 }} />
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>Loading...</Typography>
    </Box>
  </Box>
);

// Error component
const RouterError: React.FC<{ error: Error }> = ({ error }) => (
  <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
    <Box sx={{ maxWidth: '28rem', width: '100%', bgcolor: 'white', borderRadius: 2, boxShadow: 3, p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main', mb: 2 }}>Route Error</Typography>
      <Typography variant="body1" sx={{ color: 'text.primary', mb: 1 }}>An error occurred while loading this page.</Typography>
      <details style={{ marginTop: '1rem' }}>
        <summary style={{ cursor: 'pointer', fontSize: '0.875rem', color: 'text.secondary' }}>Error details</summary>
        <pre style={{ marginTop: '0.5rem', fontSize: '0.75rem', backgroundColor: '#f5f5f5', padding: '0.5rem', borderRadius: '4px', overflow: 'auto' }}>
          {error.message}
        </pre>
      </details>
      <Button
        onClick={() => window.location.href = '/'}
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
      >
        Go to Home
      </Button>
    </Box>
  </Box>
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