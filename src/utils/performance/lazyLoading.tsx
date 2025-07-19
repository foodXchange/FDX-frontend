import React, { Suspense, ComponentType, lazy } from 'react';
import { CircularProgress, Box } from '@mui/material';

// Enhanced lazy loading with retry logic
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): T {
  const LazyComponent = lazy(() => {
    return importFunc().catch((error) => {
      console.error('Failed to load component:', error);
      // Retry once after a delay
      return new Promise((resolve) => {
        setTimeout(() => {
          importFunc().then(resolve).catch(() => {
            // Return error component if retry fails
            resolve({
              default: (() => (
                <Box p={3} textAlign="center">
                  <p>Failed to load component. Please refresh the page.</p>
                </Box>
              )) as T,
            });
          });
        }, 1000);
      });
    });
  });

  const WrappedComponent = (props: any) => (
    <Suspense
      fallback={
        fallback || (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <CircularProgress />
          </Box>
        )
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  );

  return WrappedComponent as T;
}

// Preload components based on user interaction
export function preloadComponent(importFunc: () => Promise<any>) {
  return importFunc();
}

// Intersection Observer based lazy loading
export function createIntersectionLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: IntersectionObserverInit = {}
): T {
  const LazyComponent = lazy(importFunc);
  
  const IntersectionWrapper = (props: any) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1, ...options }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => observer.disconnect();
    }, []);

    return (
      <div ref={ref}>
        {isVisible ? (
          <Suspense fallback={<CircularProgress />}>
            <LazyComponent {...props} />
          </Suspense>
        ) : (
          <Box minHeight="200px" display="flex" alignItems="center" justifyContent="center">
            <CircularProgress />
          </Box>
        )}
      </div>
    );
  };

  return IntersectionWrapper as T;
}

// Route-based code splitting with preloading
export function createRouteComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  preloadRoutes: string[] = []
): T {
  const LazyComponent = lazy(importFunc);
  
  // Preload on route hover/focus
  React.useEffect(() => {
    const preloadOnInteraction = (event: Event) => {
      const target = event.target as HTMLElement;
      const href = target.getAttribute('href') || target.closest('a')?.getAttribute('href');
      
      if (href && preloadRoutes.some(route => href.includes(route))) {
        preloadComponent(importFunc);
      }
    };

    document.addEventListener('mouseover', preloadOnInteraction);
    document.addEventListener('focusin', preloadOnInteraction);

    return () => {
      document.removeEventListener('mouseover', preloadOnInteraction);
      document.removeEventListener('focusin', preloadOnInteraction);
    };
  }, []);

  const RouteWrapper = (props: any) => (
    <Suspense
      fallback={
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress size={60} />
        </Box>
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  );

  return RouteWrapper as T;
}

// Image lazy loading with placeholder
export interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  className,
  style,
  onLoad,
  onError,
}) => {
  const [imageSrc, setImageSrc] = React.useState(placeholder);
  const [isLoading, setIsLoading] = React.useState(true);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = new Image();
          img.onload = () => {
            setImageSrc(src);
            setIsLoading(false);
            onLoad?.();
          };
          img.onerror = () => {
            setIsLoading(false);
            onError?.();
          };
          img.src = src;
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, onLoad, onError]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      style={{
        ...style,
        opacity: isLoading ? 0.7 : 1,
        transition: 'opacity 0.3s ease',
      }}
    />
  );
};