// Real User Monitoring (RUM) stub implementation

export class RUMMonitor {
  constructor() {
    // Initialize RUM monitoring
  }

  track(metric: string, value: number, metadata?: any) {
    // Log metric for monitoring
    console.debug('RUM metric:', metric, value, metadata);
  }

  trackError(error: Error, context?: any) {
    console.error('RUM error:', error, context);
  }

  trackPageView(page: string, metadata?: any) {
    console.debug('RUM page view:', page, metadata);
  }

  trackUserAction(action: string, metadata?: any) {
    console.debug('RUM user action:', action, metadata);
  }
}

export const rumMonitor = new RUMMonitor();