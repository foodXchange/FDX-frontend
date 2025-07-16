import { useEffect, useCallback, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  memoryUsage: number;
  bundleSize: number;
  networkRequests: number;
  cacheHitRate: number;
}

interface PerformanceConfig {
  enableRenderTimeTracking?: boolean;
  enableMemoryTracking?: boolean;
  enableNetworkTracking?: boolean;
  enableBundleAnalysis?: boolean;
  reportingInterval?: number;
  thresholds?: {
    renderTime?: number;
    memoryUsage?: number;
    bundleSize?: number;
  };
}

interface PerformanceReport {
  componentName: string;
  metrics: PerformanceMetrics;
  timestamp: string;
  url: string;
  userAgent: string;
}

export function usePerformanceMonitor(
  componentName: string,
  config: PerformanceConfig = {}
) {
  const {
    enableRenderTimeTracking = true,
    enableMemoryTracking = true,
    enableNetworkTracking = true,
    enableBundleAnalysis = false,
    reportingInterval = 30000, // 30 seconds
    thresholds = {
      renderTime: 16, // 60fps
      memoryUsage: 50 * 1024 * 1024, // 50MB
      bundleSize: 5 * 1024 * 1024, // 5MB
    },
  } = config;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentCount: 0,
    memoryUsage: 0,
    bundleSize: 0,
    networkRequests: 0,
    cacheHitRate: 0,
  });

  const [alerts, setAlerts] = useState<string[]>([]);
  const renderStartTime = useRef<number>(0);
  const observerRef = useRef<PerformanceObserver | null>(null);
  const reportingIntervalRef = useRef<NodeJS.Timeout>();

  // Measure render performance
  const startRenderMeasurement = useCallback(() => {
    if (!enableRenderTimeTracking) return;
    renderStartTime.current = performance.now();
  }, [enableRenderTimeTracking]);

  const endRenderMeasurement = useCallback(() => {
    if (!enableRenderTimeTracking || renderStartTime.current === 0) return;
    
    const renderTime = performance.now() - renderStartTime.current;
    renderStartTime.current = 0;

    setMetrics(prev => ({ ...prev, renderTime }));

    // Check threshold
    if (thresholds.renderTime && renderTime > thresholds.renderTime) {
      setAlerts(prev => [...prev, `Slow render detected: ${renderTime.toFixed(2)}ms`]);
      console.warn(`${componentName}: Slow render time ${renderTime.toFixed(2)}ms`);
    }
  }, [enableRenderTimeTracking, componentName, thresholds.renderTime]);

  // Memory usage tracking
  const measureMemoryUsage = useCallback(() => {
    if (!enableMemoryTracking || !('memory' in performance)) return;

    const memory = (performance as any).memory;
    const memoryUsage = memory.usedJSHeapSize;

    setMetrics(prev => ({ ...prev, memoryUsage }));

    // Check threshold
    if (thresholds.memoryUsage && memoryUsage > thresholds.memoryUsage) {
      setAlerts(prev => [...prev, `High memory usage: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`]);
      console.warn(`${componentName}: High memory usage ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }
  }, [enableMemoryTracking, componentName, thresholds.memoryUsage]);

  // Network performance tracking
  const trackNetworkPerformance = useCallback(() => {
    if (!enableNetworkTracking) return;

    const networkEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    const networkRequests = resourceEntries.length;
    
    // Calculate cache hit rate
    const cachedRequests = resourceEntries.filter(entry => 
      entry.transferSize === 0 && entry.decodedBodySize > 0
    ).length;
    
    const cacheHitRate = networkRequests > 0 ? (cachedRequests / networkRequests) * 100 : 0;

    setMetrics(prev => ({
      ...prev,
      networkRequests,
      cacheHitRate,
    }));
  }, [enableNetworkTracking]);

  // Bundle size analysis
  const analyzeBundleSize = useCallback(async () => {
    if (!enableBundleAnalysis) return;

    try {
      // In a real implementation, this would analyze the actual bundle
      // For now, we'll estimate based on loaded resources
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const jsResources = resourceEntries.filter(entry => 
        entry.name.includes('.js') || entry.name.includes('javascript')
      );
      
      const bundleSize = jsResources.reduce((total, resource) => 
        total + (resource.transferSize || 0), 0
      );

      setMetrics(prev => ({ ...prev, bundleSize }));

      // Check threshold
      if (thresholds.bundleSize && bundleSize > thresholds.bundleSize) {
        setAlerts(prev => [...prev, `Large bundle size: ${(bundleSize / 1024 / 1024).toFixed(2)}MB`]);
        console.warn(`${componentName}: Large bundle size ${(bundleSize / 1024 / 1024).toFixed(2)}MB`);
      }
    } catch (error) {
      console.error('Bundle size analysis failed:', error);
    }
  }, [enableBundleAnalysis, componentName, thresholds.bundleSize]);

  // Performance observer for detailed metrics
  useEffect(() => {
    if (!window.PerformanceObserver) return;

    try {
      observerRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'measure' && entry.name.includes(componentName)) {
            console.log(`Performance measure for ${componentName}:`, entry.duration);
          }
          
          if (entry.entryType === 'longtask') {
            setAlerts(prev => [...prev, `Long task detected: ${entry.duration.toFixed(2)}ms`]);
            console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
          }
        });
      });

      observerRef.current.observe({ entryTypes: ['measure', 'longtask', 'largest-contentful-paint'] });
    } catch (error) {
      console.error('Performance observer setup failed:', error);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [componentName]);

  // Periodic performance reporting
  useEffect(() => {
    if (reportingInterval <= 0) return;

    reportingIntervalRef.current = setInterval(() => {
      measureMemoryUsage();
      trackNetworkPerformance();
      analyzeBundleSize();

      // Send performance report
      sendPerformanceReport();
    }, reportingInterval);

    return () => {
      if (reportingIntervalRef.current) {
        clearInterval(reportingIntervalRef.current);
      }
    };
  }, [reportingInterval, measureMemoryUsage, trackNetworkPerformance, analyzeBundleSize]);

  // Send performance report to monitoring service
  const sendPerformanceReport = useCallback(async () => {
    const report: PerformanceReport = {
      componentName,
      metrics,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    try {
      // In production, send to your monitoring service
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/performance/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(report),
        });
      } else {
        console.log('Performance Report:', report);
      }
    } catch (error) {
      console.error('Failed to send performance report:', error);
    }
  }, [componentName, metrics]);

  // Performance optimization suggestions
  const getOptimizationSuggestions = useCallback((): string[] => {
    const suggestions: string[] = [];

    if (metrics.renderTime > 16) {
      suggestions.push('Consider using React.memo() to prevent unnecessary re-renders');
      suggestions.push('Implement virtualization for large lists');
      suggestions.push('Use useMemo() and useCallback() for expensive computations');
    }

    if (metrics.memoryUsage > 50 * 1024 * 1024) {
      suggestions.push('Check for memory leaks in event listeners and timers');
      suggestions.push('Implement proper cleanup in useEffect hooks');
      suggestions.push('Consider lazy loading of components');
    }

    if (metrics.cacheHitRate < 50) {
      suggestions.push('Implement better caching strategies');
      suggestions.push('Use service workers for offline caching');
      suggestions.push('Enable HTTP caching headers');
    }

    if (metrics.bundleSize > 5 * 1024 * 1024) {
      suggestions.push('Implement code splitting with React.lazy()');
      suggestions.push('Remove unused dependencies');
      suggestions.push('Use tree shaking to eliminate dead code');
    }

    return suggestions;
  }, [metrics]);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Manual performance measurement
  const measurePerformance = useCallback((label: string, fn: () => void | Promise<void>) => {
    return async () => {
      const start = performance.now();
      performance.mark(`${componentName}-${label}-start`);
      
      try {
        await fn();
      } finally {
        performance.mark(`${componentName}-${label}-end`);
        performance.measure(
          `${componentName}-${label}`,
          `${componentName}-${label}-start`,
          `${componentName}-${label}-end`
        );
        
        const end = performance.now();
        const duration = end - start;
        
        console.log(`${componentName} ${label}: ${duration.toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  return {
    metrics,
    alerts,
    startRenderMeasurement,
    endRenderMeasurement,
    measurePerformance,
    getOptimizationSuggestions,
    clearAlerts,
    sendPerformanceReport,
  };
}

// HOC for automatic performance monitoring
export function withPerformanceMonitor<P extends object>(
  Component: React.ComponentType<P>,
  config?: PerformanceConfig
) {
  return function PerformanceMonitoredComponent(props: P) {
    const componentName = Component.displayName || Component.name || 'UnknownComponent';
    const { startRenderMeasurement, endRenderMeasurement } = usePerformanceMonitor(componentName, config);

    React.useEffect(() => {
      startRenderMeasurement();
      return () => {
        endRenderMeasurement();
      };
    });

    return <Component {...props} />;
  };
}

// Bundle analyzer utility
export class BundleAnalyzer {
  private static instance: BundleAnalyzer;
  private loadedModules: Map<string, number> = new Map();

  static getInstance(): BundleAnalyzer {
    if (!BundleAnalyzer.instance) {
      BundleAnalyzer.instance = new BundleAnalyzer();
    }
    return BundleAnalyzer.instance;
  }

  trackModule(moduleName: string, size: number): void {
    this.loadedModules.set(moduleName, size);
  }

  getModuleReport(): Array<{ name: string; size: number; percentage: number }> {
    const totalSize = Array.from(this.loadedModules.values()).reduce((sum, size) => sum + size, 0);
    
    return Array.from(this.loadedModules.entries())
      .map(([name, size]) => ({
        name,
        size,
        percentage: totalSize > 0 ? (size / totalSize) * 100 : 0,
      }))
      .sort((a, b) => b.size - a.size);
  }

  getLargestModules(count: number = 10): Array<{ name: string; size: number }> {
    return this.getModuleReport()
      .slice(0, count)
      .map(({ name, size }) => ({ name, size }));
  }

  getTotalBundleSize(): number {
    return Array.from(this.loadedModules.values()).reduce((sum, size) => sum + size, 0);
  }
}

export const bundleAnalyzer = BundleAnalyzer.getInstance();

export default usePerformanceMonitor;