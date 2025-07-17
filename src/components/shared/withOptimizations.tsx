import React, { ComponentType, memo, Suspense, lazy } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';
import { Skeleton, Box } from '@mui/material';

interface WithOptimizationsOptions {
  memoize?: boolean;
  errorFallback?: React.ComponentType<{ error: Error }>;
  loadingFallback?: React.ReactNode;
  preload?: boolean;
  profileRender?: boolean;
}

/**
 * HOC that adds common performance optimizations to components
 */
export function withOptimizations<P extends object>(
  Component: ComponentType<P>,
  options: WithOptimizationsOptions = {}
) {
  const {
    memoize = true,
    errorFallback,
    loadingFallback = <DefaultLoadingFallback />,
    preload = false,
    profileRender = process.env.NODE_ENV === 'development',
  } = options;

  // Memoize the component
  const MemoizedComponent = memoize ? memo(Component) : Component;

  // Wrap with error boundary and suspense
  const OptimizedComponent = (props: P) => {
    return (
      <ErrorBoundary fallback={errorFallback ? <errorFallback error={new Error('Component error')} /> : undefined}>
        <Suspense fallback={loadingFallback}>
          {profileRender ? (
            <React.Profiler
              id={Component.displayName || Component.name || 'Unknown'}
              onRender={(id, phase, actualDuration) => {
                if (actualDuration > 16) {
                  console.warn(`${id} (${phase}) took ${actualDuration.toFixed(2)}ms`);
                }
              }}
            >
              <MemoizedComponent {...props} />
            </React.Profiler>
          ) : (
            <MemoizedComponent {...props} />
          )}
        </Suspense>
      </ErrorBoundary>
    );
  };

  // Copy display name
  OptimizedComponent.displayName = `withOptimizations(${Component.displayName || Component.name || 'Component'})`;

  // Preload if requested
  if (preload && typeof window !== 'undefined') {
    // Trigger component loading
    Promise.resolve().then(() => {
      const div = document.createElement('div');
      div.style.display = 'none';
      document.body.appendChild(div);
      // This will trigger the component to load
      // ReactDOM.render(<OptimizedComponent {...({} as P)} />, div);
      setTimeout(() => {
        document.body.removeChild(div);
      }, 0);
    });
  }

  return OptimizedComponent;
}

/**
 * Default loading fallback component
 */
function DefaultLoadingFallback() {
  return (
    <Box sx={{ width: '100%', height: '100%', minHeight: 200 }}>
      <Skeleton variant="rectangular" width="100%" height="100%" />
    </Box>
  );
}

/**
 * Lazy load with optimizations
 */
export function lazyWithOptimizations<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: WithOptimizationsOptions
) {
  const LazyComponent = lazy(importFn);
  return withOptimizations(LazyComponent as T, options);
}

/**
 * Batch optimize multiple components
 */
export function optimizeComponents<T extends Record<string, ComponentType<any>>>(
  components: T,
  options?: WithOptimizationsOptions
): T {
  const optimized: any = {};
  
  for (const [key, component] of Object.entries(components)) {
    optimized[key] = withOptimizations(component, options);
  }
  
  return optimized as T;
}