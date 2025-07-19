import React from 'react';
import { rumMonitor } from '../../monitoring/rum';

// Performance budget enforcement
export const performanceBudgets = {
  // Core Web Vitals thresholds
  FCP: 1800, // First Contentful Paint
  LCP: 2500, // Largest Contentful Paint
  FID: 100,  // First Input Delay
  CLS: 0.1,  // Cumulative Layout Shift
  
  // Custom metrics
  TTI: 3000, // Time to Interactive
  TBT: 300,  // Total Blocking Time
  SI: 4000,  // Speed Index
  
  // Bundle size limits
  mainBundle: 250 * 1024,    // 250KB
  vendorBundle: 500 * 1024,  // 500KB
  cssBundle: 50 * 1024,      // 50KB
};

// Performance monitoring class
class PerformanceMonitor {
  private observer: PerformanceObserver | null = null;
  private navigationEntry: PerformanceNavigationTiming | null = null;

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    // Monitor navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      this.navigationEntry = navEntries[0] || null;
    }

    // Monitor resource loading
    this.setupResourceMonitoring();
    
    // Monitor long tasks
    this.setupLongTaskMonitoring();
    
    // Monitor layout shifts
    this.setupLayoutShiftMonitoring();
  }

  private setupResourceMonitoring() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.analyzeResourcePerformance(resourceEntry);
          }
        });
      });

      this.observer.observe({ entryTypes: ['resource'] });
    }
  }

  private setupLongTaskMonitoring() {
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          rumMonitor.trackMetric('long_task', entry.duration, {
            startTime: entry.startTime,
            type: entry.entryType,
          });
        });
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long task monitoring not supported');
      }
    }
  }

  private setupLayoutShiftMonitoring() {
    if ('PerformanceObserver' in window) {
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            rumMonitor.trackMetric('layout_shift', (entry as any).value, {
              startTime: entry.startTime,
              sources: (entry as any).sources?.length || 0,
            });
          }
        });
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('Layout shift monitoring not supported');
      }
    }
  }

  private analyzeResourcePerformance(entry: PerformanceResourceTiming) {
    const { name, duration, transferSize, decodedBodySize } = entry;
    
    // Track resource load times
    rumMonitor.trackMetric('resource_load_time', duration, {
      resource: name,
      size: transferSize,
      type: this.getResourceType(name),
    });

    // Check for performance issues
    if (duration > 1000) {
      rumMonitor.trackMetric('slow_resource', duration, {
        resource: name,
        size: transferSize,
      });
    }

    // Track compression efficiency
    if (transferSize && decodedBodySize) {
      const compressionRatio = (1 - transferSize / decodedBodySize) * 100;
      rumMonitor.trackMetric('compression_ratio', compressionRatio, {
        resource: name,
      });
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  // Get current performance metrics
  getMetrics() {
    const navigation = this.navigationEntry;
    if (!navigation) return null;

    return {
      // Navigation timing
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      
      // Network timing
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcpConnect: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      
      // Processing timing
      domProcessing: navigation.domComplete - navigation.domInteractive,
      
      // Overall metrics
      pageLoad: navigation.loadEventEnd - navigation.fetchStart,
      ttfb: navigation.responseStart - navigation.fetchStart,
    };
  }

  // Performance audit
  auditPerformance() {
    const metrics = this.getMetrics();
    if (!metrics) return [];

    const issues = [];

    // Check navigation timing
    if (metrics.pageLoad > 3000) {
      issues.push({
        type: 'slow_page_load',
        value: metrics.pageLoad,
        threshold: 3000,
        severity: 'high',
      });
    }

    if (metrics.ttfb > 600) {
      issues.push({
        type: 'slow_ttfb',
        value: metrics.ttfb,
        threshold: 600,
        severity: 'medium',
      });
    }

    if (metrics.domProcessing > 1000) {
      issues.push({
        type: 'slow_dom_processing',
        value: metrics.domProcessing,
        threshold: 1000,
        severity: 'medium',
      });
    }

    return issues;
  }

  // Cleanup
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// React component performance wrapper
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return React.memo((props: P) => {
    const startTime = React.useRef<number>(0);

    React.useEffect(() => {
      startTime.current = performance.now();
      
      return () => {
        const renderTime = performance.now() - startTime.current;
        rumMonitor.trackMetric('component_render_time', renderTime, {
          component: componentName,
        });
      };
    });

    return React.createElement(Component, props);
  });
}

// Performance debugging helpers
export const performanceDebug = {
  measureFunction: <T extends (...args: any[]) => any>(fn: T, name: string): T => {
    return ((...args: any[]) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      
      console.log(`Function ${name} took ${end - start} milliseconds`);
      rumMonitor.trackMetric('function_execution_time', end - start, { function: name });
      
      return result;
    }) as T;
  },

  measureRender: (componentName: string) => {
    console.time(`Render: ${componentName}`);
    return () => console.timeEnd(`Render: ${componentName}`);
  },

  logBundleSize: () => {
    if (performance && performance.getEntriesByType) {
      const resources = performance.getEntriesByType('resource');
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const cssResources = resources.filter(r => r.name.includes('.css'));
      
      console.group('Bundle Sizes');
      jsResources.forEach(r => {
        console.log(`JS: ${r.name.split('/').pop()} - ${((r as any).transferSize / 1024).toFixed(2)}KB`);
      });
      cssResources.forEach(r => {
        console.log(`CSS: ${r.name.split('/').pop()} - ${((r as any).transferSize / 1024).toFixed(2)}KB`);
      });
      console.groupEnd();
    }
  },
};