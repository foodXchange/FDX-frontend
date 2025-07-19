import React, { lazy, Suspense, ComponentType } from 'react';
import { CircularProgress, Box } from '@mui/material';

// Enhanced lazy loading with error boundaries and loading states
export const createOptimizedLazy = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense
      fallback={
        fallback || (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 200
            }}
          >
            <CircularProgress />
          </Box>
        )
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Preload components for better UX
export const preloadComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  // Start loading the component
  importFunc().catch(() => {
    // Ignore preload errors
  });
};

// Route-based code splitting
export const createRouteComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  preload = false
) => {
  if (preload) {
    // Preload on hover/focus for better UX
    setTimeout(() => preloadComponent(importFunc), 100);
  }
  
  return createOptimizedLazy(importFunc);
};

export default { createOptimizedLazy, preloadComponent, createRouteComponent };
