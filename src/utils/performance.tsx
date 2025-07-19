import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

/**
 * Custom hook for debouncing values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Custom hook for throttling functions
 */
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  const lastCall = useRef<number>(0);
  const timeout = useRef<NodeJS.Timeout>();
  
  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCall.current;
      
      if (timeSinceLastCall >= delay) {
        lastCall.current = now;
        fn(...args);
      } else {
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
          lastCall.current = Date.now();
          fn(...args);
        }, delay - timeSinceLastCall);
      }
    },
    [fn, delay]
  ) as T;
}

/**
 * Custom hook for intersection observer
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [ref, options]);
  
  return isIntersecting;
}

/**
 * Custom hook for lazy loading components
 */
export function useLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): T | null {
  const [Component, setComponent] = useState<T | null>(null);
  
  useEffect(() => {
    importFn().then((module) => {
      setComponent(() => module.default);
    });
  }, [importFn]);
  
  return Component;
}

/**
 * Memoized event handler creator
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps) as T;
}

/**
 * Deep comparison hook for complex objects
 */
export function useDeepCompareMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  const ref = useRef<React.DependencyList>();
  const signalRef = useRef<number>(0);
  
  if (!deepEqual(ref.current, deps)) {
    ref.current = deps;
    signalRef.current += 1;
  }
  
  return useMemo(factory, [signalRef.current]);
}

/**
 * Deep equality comparison
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (Object.keys(a).length !== Object.keys(b).length) return false;
    
    for (const key in a) {
      if (!deepEqual(a[key], b[key])) return false;
    }
    
    return true;
  }
  
  return false;
}

/**
 * Performance monitoring HOC
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> {
  return React.memo((props: P) => {
    const renderStart = useRef<number>(performance.now());
    
    useEffect(() => {
      const renderTime = performance.now() - renderStart.current;
      if (renderTime > 16) {
        // More than one frame (60fps)
        console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
      }
    });
    
    return <Component {...props} />;
  });
}

/**
 * Batch updates for better performance
 */
export function batchUpdates<T extends (...args: any[]) => void>(fn: T): T {
  return ((...args: Parameters<T>) => {
    ReactDOM.unstable_batchedUpdates(() => {
      fn(...args);
    });
  }) as T;
}

/**
 * Virtual scrolling helper
 */
export interface VirtualScrollOptions {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function useVirtualScroll({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 3
}: VirtualScrollOptions) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    itemCount - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = endIndex - startIndex + 1;
  const totalHeight = itemCount * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  return {
    startIndex,
    endIndex,
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e: React.UIEvent<HTMLElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }
  };
}

/**
 * Request animation frame hook
 */
export function useAnimationFrame(callback: (deltaTime: number) => void) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  
  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [callback]);
  
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate]);
}

/**
 * Media query hook
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    
    return () => media.removeListener(listener);
  }, [matches, query]);
  
  return matches;
}

/**
 * Window size hook
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return size;
}

/**
 * Local storage hook
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };
  
  return [storedValue, setValue];
}

/**
 * Async hook for handling async operations
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const execute = useCallback(() => {
    setStatus('pending');
    setValue(null);
    setError(null);
    
    return asyncFunction()
      .then((response) => {
        setValue(response);
        setStatus('success');
      })
      .catch((error) => {
        setError(error);
        setStatus('error');
      });
  }, [asyncFunction]);
  
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);
  
  return { execute, status, value, error };
}

/**
 * Previous value hook
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

/**
 * Click outside hook
 */
export function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}