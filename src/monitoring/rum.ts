import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';
import { monitoringConfig, metricsConfig } from '../config/monitoring.config';

interface VitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  entries: any[];
}

interface CustomMetric {
  name: string;
  value: number;
  timestamp: number;
  attributes?: Record<string, any>;
}

class RUMMonitor {
  private metrics: CustomMetric[] = [];
  private vitals: VitalsMetric[] = [];

  constructor() {
    if (monitoringConfig.enableRUM) {
      this.initializeWebVitals();
      this.initializeCustomMetrics();
    }
  }

  private initializeWebVitals() {
    const sendMetric = (metric: VitalsMetric) => {
      this.vitals.push(metric);
      this.sendToCollector('web-vital', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        timestamp: Date.now()
      });
    };

    getCLS(sendMetric);
    getFCP(sendMetric);
    getFID(sendMetric);
    getLCP(sendMetric);
    getTTFB(sendMetric);
  }

  private initializeCustomMetrics() {
    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      this.trackMetric('page_load_time', loadTime);
    });

    // Track route changes
    let currentPath = window.location.pathname;
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentPath) {
        this.trackMetric('route_change', 1, { 
          from: currentPath, 
          to: window.location.pathname 
        });
        currentPath = window.location.pathname;
      }
    });
    
    observer.observe(document.body, { subtree: true, childList: true });
  }

  trackMetric(name: string, value: number, attributes?: Record<string, any>) {
    const metric: CustomMetric = {
      name,
      value,
      timestamp: Date.now(),
      attributes
    };
    
    this.metrics.push(metric);
    this.sendToCollector('custom-metric', metric);
  }

  trackUserAction(action: string, target?: string, value?: number) {
    this.trackMetric('user_action', value || 1, { action, target });
  }

  trackAPICall(endpoint: string, method: string, duration: number, status: number) {
    this.trackMetric('api_call', duration, { 
      endpoint, 
      method, 
      status,
      success: status >= 200 && status < 400 
    });
  }

  trackError(error: Error, context?: Record<string, any>) {
    this.trackMetric('error', 1, {
      message: error.message,
      stack: error.stack,
      ...context
    });
  }

  private sendToCollector(type: string, data: any) {
    if (Math.random() > metricsConfig.PERFORMANCE_SAMPLING_RATE) {
      return; // Skip based on sampling rate
    }

    // Send to monitoring backend
    fetch(`${monitoringConfig.apiEndpoint}/metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        data,
        timestamp: Date.now(),
        service: monitoringConfig.serviceName,
        environment: monitoringConfig.environment
      })
    }).catch(console.error);
  }

  getMetrics() {
    return {
      vitals: this.vitals,
      custom: this.metrics
    };
  }
}

export const rumMonitor = new RUMMonitor();

// Helper hooks for React components
export function useRUMMonitor() {
  return {
    trackMetric: rumMonitor.trackMetric.bind(rumMonitor),
    trackUserAction: rumMonitor.trackUserAction.bind(rumMonitor),
    trackAPICall: rumMonitor.trackAPICall.bind(rumMonitor),
    trackError: rumMonitor.trackError.bind(rumMonitor),
    getMetrics: rumMonitor.getMetrics.bind(rumMonitor)
  };
}