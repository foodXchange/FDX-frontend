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
 * Memoization helper for expensive calculations
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

/**
 * Memory-efficient state for large lists
 */
export function useLazyState<T>(
  initialValue: T | (() => T),
  shouldUpdate: (oldValue: T, newValue: T) => boolean = (old, newVal) => old !== newVal
) {
  const [state, setState] = useState(initialValue);
  
  const setOptimizedState = useCallback((newValue: T | ((prev: T) => T)) => {
    setState(prevState => {
      const nextState = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prevState) 
        : newValue;
        
      return shouldUpdate(prevState, nextState) ? nextState : prevState;
    });
  }, [shouldUpdate]);

  return [state, setOptimizedState] as const;
}

/**
 * Performance measurement utilities
 */
export class PerformanceMonitor {
  private measurements: Map<string, number> = new Map();
  
  start(label: string): void {
    this.measurements.set(label, performance.now());
  }
  
  end(label: string): number {
    const startTime = this.measurements.get(label);
    if (!startTime) {
      console.warn(`Performance measurement not found: ${label}`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.measurements.delete(label);
    
    if (duration > 16) { // More than one frame (60fps)
      console.warn(`${label} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }
  
  measure<T>(label: string, fn: () => T): T {
    this.start(label);
    const result = fn();
    this.end(label);
    return result;
  }
  
  async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    const result = await fn();
    this.end(label);
    return result;
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * HOC for measuring component render performance
 */
export function withPerformanceMonitor<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const name = componentName || Component.displayName || Component.name || 'Component';
  
  return React.memo((props: P) => {
    const renderStart = useRef<number>(performance.now());
    
    useEffect(() => {
      const renderTime = performance.now() - renderStart.current;
      if (renderTime > 16) { // More than one frame (60fps)
        console.warn(`${name} took ${renderTime.toFixed(2)}ms to render`);
      }
    });

    return React.createElement(Component, props);
  });
}

/**
 * Batch updates for better performance
 */
export function batchUpdates<T extends (...args: any[]) => void>(
  fn: T
): T {
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
  overscan = 3,
}: VirtualScrollOptions) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    itemCount - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = useMemo(() => {
    const items = [];
    for (let i = startIndex; i <= endIndex; i++) {
      items.push({
        index: i,
        style: {
          position: 'absolute' as const,
          top: i * itemHeight,
          height: itemHeight,
          width: '100%',
        },
      });
    }
    return items;
  }, [startIndex, endIndex, itemHeight]);

  const totalHeight = itemCount * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    startIndex,
    endIndex,
  };
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefCallback<Element>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [element, setElement] = useState<Element | null>(null);

  const observer = useMemo(() => {
    if (!element) return null;
    
    return new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    );
  }, [element, options]);

  useEffect(() => {
    if (!observer || !element) return;
    
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [observer, element]);

  const ref = useCallback((node: Element | null) => {
    setElement(node);
  }, []);

  return [ref, isIntersecting];
}

/**
 * Image lazy loading hook
 */
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });

  useEffect(() => {
    if (!isIntersecting) return;

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };
    
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, isIntersecting]);

  return {
    ref,
    src: imageSrc,
    isLoading,
    hasError,
    isIntersecting,
  };
}

/**
 * FPS monitoring
 */
export function useFPSMonitor(): number {
  const [fps, setFps] = useState(60);
  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);

  useEffect(() => {
    const updateFPS = () => {
      const now = performance.now();
      frameCountRef.current++;

      if (now - lastTimeRef.current >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current)));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      frameRef.current = requestAnimationFrame(updateFPS);
    };

    frameRef.current = requestAnimationFrame(updateFPS);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return fps;
}

/**
 * Bundle size analyzer
 */
export const bundleAnalytics = {
  measureBundleSize: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      return {
        transferSize: navigation.transferSize,
        encodedBodySize: navigation.encodedBodySize,
        decodedBodySize: navigation.decodedBodySize,
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      };
    }
    
    return null;
  },

  logPerformanceMetrics: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const metrics = bundleAnalytics.measureBundleSize();
      if (metrics) {
        console.table(metrics);
      }
    }
  },
};

export default {
  useDebounce,
  useThrottle,
  useMemoizedCallback,
  useLazyState,
  PerformanceMonitor,
  performanceMonitor,
  withPerformanceMonitor,
  batchUpdates,
  useVirtualScroll,
  useIntersectionObserver,
  useLazyImage,
  useFPSMonitor,
  bundleAnalytics,
};