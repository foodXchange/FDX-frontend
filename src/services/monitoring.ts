import { logger } from './logger';

interface PerformanceMetrics {
  navigationTiming: {
    dnsLookup: number;
    tcpConnection: number;
    request: number;
    response: number;
    domProcessing: number;
    domContentLoaded: number;
    loadComplete: number;
    totalTime: number;
  };
  resourceTiming: Array<{
    name: string;
    duration: number;
    size: number;
    type: string;
  }>;
  customMetrics: Record<string, number>;
}

interface UserInteraction {
  type: 'click' | 'scroll' | 'input' | 'navigation';
  target: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics['customMetrics'] = {};
  private interactions: UserInteraction[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    this.setupPerformanceObservers();
    this.setupInteractionTracking();
  }

  private setupPerformanceObservers(): void {
    // Long Task Observer
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            logger.warn('Long task detected', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
            });
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.set('longtask', longTaskObserver);
      } catch (error) {
        logger.debug('Long task observer not supported');
      }

      // Layout Shift Observer
      try {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          let clsScore = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsScore += (entry as any).value;
            }
          }
          if (clsScore > 0.1) {
            logger.warn('High layout shift detected', { cls: clsScore });
          }
        });
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('layout-shift', layoutShiftObserver);
      } catch (error) {
        logger.debug('Layout shift observer not supported');
      }

      // Largest Contentful Paint Observer
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          logger.info('Largest Contentful Paint', {
            lcp: lastEntry.startTime,
            element: (lastEntry as any).element?.tagName,
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (error) {
        logger.debug('LCP observer not supported');
      }
    }
  }

  private setupInteractionTracking(): void {
    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      this.trackInteraction({
        type: 'click',
        target: this.getElementSelector(target),
        timestamp: Date.now(),
        metadata: {
          tagName: target.tagName,
          text: target.textContent?.substring(0, 50),
        },
      });
    });

    // Track significant scrolls
    let scrollTimeout: NodeJS.Timeout;
    let lastScrollPosition = 0;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const currentPosition = window.scrollY;
        const scrollDistance = Math.abs(currentPosition - lastScrollPosition);
        
        if (scrollDistance > 500) {
          this.trackInteraction({
            type: 'scroll',
            target: 'window',
            timestamp: Date.now(),
            metadata: {
              from: lastScrollPosition,
              to: currentPosition,
              distance: scrollDistance,
            },
          });
          lastScrollPosition = currentPosition;
        }
      }, 150);
    });
  }

  private getElementSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  private trackInteraction(interaction: UserInteraction): void {
    this.interactions.push(interaction);
    // Keep only last 100 interactions
    if (this.interactions.length > 100) {
      this.interactions = this.interactions.slice(-100);
    }
  }

  // Public API
  startMeasure(name: string): void {
    performance.mark(`${name}-start`);
  }

  endMeasure(name: string): number {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name, 'measure')[0];
    const duration = measure?.duration || 0;
    
    this.metrics[name] = duration;
    logger.debug(`Performance measure [${name}]`, { duration: `${duration.toFixed(2)}ms` });
    
    return duration;
  }

  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startMeasure(name);
    return fn().finally(() => {
      this.endMeasure(name);
    });
  }

  getNavigationMetrics(): PerformanceMetrics['navigationTiming'] | null {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!navigation) return null;

    return {
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcpConnection: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      domProcessing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
      loadComplete: navigation.loadEventEnd - navigation.navigationStart,
      totalTime: navigation.loadEventEnd - navigation.fetchStart,
    };
  }

  getResourceMetrics(): PerformanceMetrics['resourceTiming'] {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    return resources
      .filter(resource => resource.duration > 0)
      .map(resource => ({
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize || 0,
        type: resource.initiatorType,
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 20); // Top 20 slowest resources
  }

  getWebVitals(): Record<string, number> {
    const metrics: Record<string, number> = {};

    // First Input Delay (FID)
    const fidEntry = performance.getEntriesByType('first-input')[0] as any;
    if (fidEntry) {
      metrics.fid = fidEntry.processingStart - fidEntry.startTime;
    }

    // Cumulative Layout Shift (CLS)
    let clsScore = 0;
    const layoutShiftEntries = performance.getEntriesByType('layout-shift') as any[];
    layoutShiftEntries.forEach(entry => {
      if (!entry.hadRecentInput) {
        clsScore += entry.value;
      }
    });
    metrics.cls = clsScore;

    // Time to First Byte (TTFB)
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      metrics.ttfb = navigationEntry.responseStart - navigationEntry.fetchStart;
    }

    return metrics;
  }

  reportMetrics(): void {
    const report = {
      navigation: this.getNavigationMetrics(),
      resources: this.getResourceMetrics(),
      webVitals: this.getWebVitals(),
      custom: this.metrics,
      interactions: this.interactions.slice(-20), // Last 20 interactions
    };

    logger.info('Performance report', report);

    // Send to monitoring service
    if (process.env.REACT_APP_MONITORING_ENDPOINT) {
      fetch(process.env.REACT_APP_MONITORING_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...report,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      }).catch(error => {
        logger.error('Failed to send performance metrics', error);
      });
    }
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-report metrics on page unload
window.addEventListener('beforeunload', () => {
  performanceMonitor.reportMetrics();
});

// Report metrics after page load
window.addEventListener('load', () => {
  // Wait for everything to settle
  setTimeout(() => {
    performanceMonitor.reportMetrics();
  }, 2000);
});