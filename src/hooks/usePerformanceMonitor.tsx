import React, { useEffect, useRef, useState, useCallback } from 'react';

// Performance metrics interface
interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  memoryUsage: number;
  bundleSize: number;
  networkRequests: number;
  cacheHitRate: number;
  errorRate: number;
  userInteractionLatency: number;
  pageLoadTime: number;
  timeToFirstByte: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

// Web Vitals tracking
interface WebVitals {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
}

// Performance observer hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentCount: 0,
    memoryUsage: 0,
    bundleSize: 0,
    networkRequests: 0,
    cacheHitRate: 0,
    errorRate: 0,
    userInteractionLatency: 0,
    pageLoadTime: 0,
    timeToFirstByte: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
  });

  const [webVitals, setWebVitals] = useState<WebVitals>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  });

  const renderStartTime = useRef<number>(0);
  const componentCountRef = useRef<number>(0);
  const networkRequestsRef = useRef<number>(0);
  const errorCountRef = useRef<number>(0);
  const totalInteractionsRef = useRef<number>(0);

  // Web Vitals measurement
  const measureWebVitals = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        setWebVitals(prev => ({ ...prev, ttfb }));
      }

      const fcpEntry = paint.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        setWebVitals(prev => ({ ...prev, fcp: fcpEntry.startTime }));
      }

      // Use Performance Observer for LCP, FID, CLS if available
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            setWebVitals(prev => ({ ...prev, lcp: lastEntry.startTime }));
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.processingStart && entry.startTime) {
              const fid = entry.processingStart - entry.startTime;
              setWebVitals(prev => ({ ...prev, fid }));
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          setWebVitals(prev => ({ ...prev, cls: clsValue }));
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Clean up observers
        return () => {
          lcpObserver.disconnect();
          fidObserver.disconnect();
          clsObserver.disconnect();
        };
      }
    }
    return webVitals;
  }, [webVitals]);

  // Memory usage tracking
  const measureMemoryUsage = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (performance as any)) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
      setMetrics(prev => ({ ...prev, memoryUsage }));
    }
  }, []);

  // Network requests tracking
  const trackNetworkRequests = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const resources = performance.getEntriesByType('resource');
      const requests = resources.filter(resource => 
        resource.name.includes('api') || resource.name.includes('fetch')
      );
      networkRequestsRef.current = requests.length;
      setMetrics(prev => ({ ...prev, networkRequests: requests.length }));
    }
  }, []);

  // Bundle size estimation
  const estimateBundleSize = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const resources = performance.getEntriesByType('resource');
      const jsResources = resources.filter(resource => 
        resource.name.endsWith('.js') || resource.name.endsWith('.jsx') || 
        resource.name.endsWith('.ts') || resource.name.endsWith('.tsx')
      );
      
      const totalSize = jsResources.reduce((sum, resource) => {
        const size = (resource as any).transferSize || (resource as any).encodedBodySize || 0;
        return sum + size;
      }, 0);
      
      const bundleSize = totalSize / (1024 * 1024); // Convert to MB
      setMetrics(prev => ({ ...prev, bundleSize }));
    }
  }, []);

  // Component render tracking
  const trackComponentRender = useCallback(() => {
    renderStartTime.current = performance.now();
    componentCountRef.current += 1;
  }, []);

  const finishComponentRender = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;
    setMetrics(prev => ({ 
      ...prev, 
      renderTime: renderTime,
      componentCount: componentCountRef.current 
    }));
  }, []);

  // User interaction tracking
  const trackUserInteraction = useCallback((_interactionType: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const latency = endTime - startTime;
      totalInteractionsRef.current += 1;
      
      setMetrics(prev => ({ 
        ...prev, 
        userInteractionLatency: latency 
      }));
    };
  }, []);

  // Error tracking
  const trackError = useCallback((error: Error) => {
    errorCountRef.current += 1;
    const errorRate = (errorCountRef.current / totalInteractionsRef.current) * 100;
    setMetrics(prev => ({ ...prev, errorRate }));
    
    // Log error details for debugging
    console.error('Performance Monitor - Error tracked:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      metrics: metrics,
    });
  }, [metrics]);

  // Cache hit rate calculation
  const calculateCacheHitRate = useCallback(() => {
    if (typeof window !== 'undefined' && 'caches' in window) {
      // This is a simplified cache hit rate calculation
      // In a real implementation, you'd track cache hits vs misses
      const cacheHitRate = Math.random() * 100; // Placeholder
      setMetrics(prev => ({ ...prev, cacheHitRate }));
    }
  }, []);

  // Performance score calculation
  const calculatePerformanceScore = useCallback(() => {
    const { fcp, lcp, fid, cls } = webVitals;
    
    if (!fcp || !lcp || !fid || !cls) return 0;
    
    // Scoring based on Web Vitals thresholds
    const fcpScore = fcp <= 1800 ? 100 : fcp <= 3000 ? 75 : 50;
    const lcpScore = lcp <= 2500 ? 100 : lcp <= 4000 ? 75 : 50;
    const fidScore = fid <= 100 ? 100 : fid <= 300 ? 75 : 50;
    const clsScore = cls <= 0.1 ? 100 : cls <= 0.25 ? 75 : 50;
    
    const totalScore = (fcpScore + lcpScore + fidScore + clsScore) / 4;
    return Math.round(totalScore);
  }, [webVitals]);

  // Get performance recommendations
  const getPerformanceRecommendations = useCallback(() => {
    const recommendations: string[] = [];
    
    if (metrics.renderTime > 16) {
      recommendations.push('Consider optimizing component render times');
    }
    
    if (metrics.memoryUsage > 50) {
      recommendations.push('Memory usage is high - consider lazy loading');
    }
    
    if (metrics.bundleSize > 1) {
      recommendations.push('Bundle size is large - consider code splitting');
    }
    
    if (metrics.networkRequests > 10) {
      recommendations.push('Too many network requests - consider request batching');
    }
    
    if (metrics.errorRate > 5) {
      recommendations.push('Error rate is high - review error handling');
    }
    
    if (webVitals.fcp && webVitals.fcp > 3000) {
      recommendations.push('First Contentful Paint is slow - optimize critical resources');
    }
    
    if (webVitals.lcp && webVitals.lcp > 4000) {
      recommendations.push('Largest Contentful Paint is slow - optimize main content loading');
    }
    
    if (webVitals.fid && webVitals.fid > 300) {
      recommendations.push('First Input Delay is high - reduce JavaScript execution time');
    }
    
    if (webVitals.cls && webVitals.cls > 0.25) {
      recommendations.push('Cumulative Layout Shift is high - reserve space for dynamic content');
    }
    
    return recommendations;
  }, [metrics, webVitals]);

  // Initialize performance monitoring
  useEffect(() => {
    measureWebVitals();
    measureMemoryUsage();
    trackNetworkRequests();
    estimateBundleSize();
    calculateCacheHitRate();
    
    // Set up periodic measurements
    const interval = setInterval(() => {
      measureMemoryUsage();
      trackNetworkRequests();
      calculateCacheHitRate();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [
    measureWebVitals,
    measureMemoryUsage,
    trackNetworkRequests,
    estimateBundleSize,
    calculateCacheHitRate,
  ]);

  // Export performance monitoring utilities
  return {
    metrics,
    webVitals,
    performanceScore: calculatePerformanceScore(),
    recommendations: getPerformanceRecommendations(),
    trackComponentRender,
    finishComponentRender,
    trackUserInteraction,
    trackError,
    measureMemoryUsage,
    trackNetworkRequests,
    estimateBundleSize,
  };
};

// Performance monitoring context
export const PerformanceContext = React.createContext<ReturnType<typeof usePerformanceMonitor> | null>(null);

// Performance provider component
export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const performanceData = usePerformanceMonitor();
  
  return (
    <PerformanceContext.Provider value={performanceData}>
      {children}
    </PerformanceContext.Provider>
  );
};

// Hook to use performance context
export const usePerformance = () => {
  const context = React.useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

export default usePerformanceMonitor;