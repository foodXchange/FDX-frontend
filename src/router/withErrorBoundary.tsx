import React, { Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import { PageErrorBoundary, SectionErrorBoundary } from '@/components/ErrorBoundary/index';
import { CircularProgress, Box } from '@mui/material';

// Loading fallback component
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
    }}
  >
    <CircularProgress />
  </Box>
);

// HOC to wrap a component with error boundary and suspense
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    level?: 'page' | 'section';
    fallback?: React.ReactNode;
    loadingFallback?: React.ReactNode;
  }
): React.ComponentType<P> {
  const { level = 'page', fallback, loadingFallback = <LoadingFallback /> } = options || {};

  const ErrorBoundaryComponent = level === 'page' ? PageErrorBoundary : SectionErrorBoundary;

  return (props: P) => (
    <ErrorBoundaryComponent fallback={fallback}>
      <Suspense fallback={loadingFallback}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundaryComponent>
  );
}

// Utility to wrap route elements with error boundaries
export function wrapRouteElement(
  element: React.ReactNode,
  options?: {
    level?: 'page' | 'section';
    fallback?: React.ReactNode;
  }
): React.ReactNode {
  const { level = 'page', fallback } = options || {};
  const ErrorBoundaryComponent = level === 'page' ? PageErrorBoundary : SectionErrorBoundary;

  return (
    <ErrorBoundaryComponent fallback={fallback}>
      {element}
    </ErrorBoundaryComponent>
  );
}

// Utility to process route objects and add error boundaries
export function processRoutesWithErrorBoundaries(routes: RouteObject[]): RouteObject[] {
  return routes.map(route => {
    const processedRoute = { ...route };

    // Wrap route element with error boundary
    if (processedRoute.element) {
      processedRoute.element = wrapRouteElement(processedRoute.element, {
        level: 'page',
      });
    }

    // Process children recursively
    if (processedRoute.children) {
      processedRoute.children = processRoutesWithErrorBoundaries(processedRoute.children);
    }

    return processedRoute;
  });
}

// Feature-specific route wrappers
export const withRFQErrorBoundary = <P extends object>(Component: React.ComponentType<P>) =>
  withErrorBoundary(Component, { level: 'section' });

export const withAgentErrorBoundary = <P extends object>(Component: React.ComponentType<P>) =>
  withErrorBoundary(Component, { level: 'section' });

export const withExpertErrorBoundary = <P extends object>(Component: React.ComponentType<P>) =>
  withErrorBoundary(Component, { level: 'section' });