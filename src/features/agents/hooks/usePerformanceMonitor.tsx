import React, { useEffect, useCallback, useRef } from 'react';
import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  props?: Record<string, any>;
  timestamp: number;
}

export const usePerformanceMonitor = (componentName: string, props?: Record<string, any>) => {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const performanceData = useRef<PerformanceMetrics[]>([]);

  // Measure render time
  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;
    
    renderCount.current += 1;

    // Log performance data
    const metrics: PerformanceMetrics = {
      renderTime,
      componentName,
      props: props ? Object.keys(props) : undefined,
      timestamp: Date.now(),
    };

    performanceData.current.push(metrics);

    // Log to console in development
    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        event_category: 'Web Vitals',
        event_label: componentName,
        value: Math.round(renderTime),
        metric_name: 'component_render_time',
      });
    }
  });

  // Mark render start
  renderStartTime.current = performance.now();

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    const data = performanceData.current;
    if (data.length === 0) return null;

    const renderTimes = data.map(d => d.renderTime);
    const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
    const maxRenderTime = Math.max(...renderTimes);
    const minRenderTime = Math.min(...renderTimes);

    return {
      componentName,
      renderCount: renderCount.current,
      avgRenderTime,
      maxRenderTime,
      minRenderTime,
      totalRenders: data.length,
    };
  }, [componentName]);

  // Memory leak detection
  useEffect(() => {
    const checkMemoryUsage = () => {
      if ('memory' in performance && (performance as any).memory) {
        const memory = (performance as any).memory;
        const usedJSHeapSize = memory.usedJSHeapSize / 1048576; // Convert to MB
        
        if (usedJSHeapSize > 100) {
          console.warn(`[Memory] High memory usage detected: ${usedJSHeapSize.toFixed(2)}MB`);
        }
      }
    };

    const interval = setInterval(checkMemoryUsage, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return {
    getPerformanceSummary,
    renderCount: renderCount.current,
  };
};

// Hook for monitoring specific operations
export const useOperationMonitor = () => {
  const operations = useRef<Map<string, number>>(new Map());

  const startOperation = useCallback((operationName: string) => {
    operations.current.set(operationName, performance.now());
  }, []);

  const endOperation = useCallback((operationName: string, threshold = 100) => {
    const startTime = operations.current.get(operationName);
    if (!startTime) {
      console.warn(`[Performance] No start time found for operation: ${operationName}`);
      return;
    }

    const duration = performance.now() - startTime;
    operations.current.delete(operationName);

    if (duration > threshold) {
      console.warn(`[Performance] Slow operation: ${operationName} took ${duration.toFixed(2)}ms`);
    }

    // Log to analytics
    if (process.env.NODE_ENV === 'production' && (window as any).gtag) {
      (window as any).gtag('event', 'timing_complete', {
        name: operationName,
        value: Math.round(duration),
        event_category: 'Performance',
      });
    }

    return duration;
  }, []);

  return { startOperation, endOperation };
};

// Hook for monitoring network requests
export const useNetworkMonitor = () => {
  const pendingRequests = useRef<Map<string, number>>(new Map());

  const trackRequest = useCallback((url: string) => {
    const startTime = performance.now();
    pendingRequests.current.set(url, startTime);

    return () => {
      const duration = performance.now() - startTime;
      pendingRequests.current.delete(url);

      if (duration > 1000) {
        console.warn(`[Network] Slow request: ${url} took ${duration.toFixed(2)}ms`);
      }

      return duration;
    };
  }, []);

  const getPendingRequests = useCallback(() => {
    return Array.from(pendingRequests.current.keys());
  }, []);

  return { trackRequest, getPendingRequests };
};

// React Query performance wrapper
export const useOptimizedQuery = <T,>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: {
    staleTime?: number;
    cacheTime?: number;
    refetchInterval?: number;
  }
) => {
  const { startOperation, endOperation } = useOperationMonitor();

  const wrappedQueryFn = useCallback(async () => {
    startOperation(`query-${queryKey.join('-')}`);
    try {
      const result = await queryFn();
      endOperation(`query-${queryKey.join('-')}`);
      return result;
    } catch (error) {
      endOperation(`query-${queryKey.join('-')}`);
      throw error;
    }
  }, [queryKey, queryFn, startOperation, endOperation]);

  // Return wrapped query function with default optimized settings
  return {
    queryKey,
    queryFn: wrappedQueryFn,
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    cacheTime: options?.cacheTime || 10 * 60 * 1000, // 10 minutes
    refetchInterval: options?.refetchInterval,
    refetchOnWindowFocus: false,
    refetchOnReconnect: 'always',
  };
};