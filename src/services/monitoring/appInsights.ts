// Application Insights service for telemetry, error tracking, and performance monitoring
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import config from '../../config';

// Create React plugin instance
const reactPlugin = new ReactPlugin();

// Initialize Application Insights
const appInsights = new ApplicationInsights({
  config: {
    connectionString: config.appInsights.connectionString,
    instrumentationKey: config.appInsights.instrumentationKey,
    extensions: [reactPlugin],
    enableAutoRouteTracking: true,
    disableAjaxTracking: false,
    autoTrackPageVisitTime: true,
    enableCorsCorrelation: true,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true,
    disableFetchTracking: false,
    excludeRequestFromAutoTrackingPatterns: [
      /\/health/,
      /\/metrics/,
      /localhost/
    ],
    disableExceptionTracking: false,
    disableTelemetry: !config.monitoring.enableAnalytics,
    samplingPercentage: config.monitoring.sampleRate * 100,
    correlationHeaderExcludedDomains: ['localhost', '127.0.0.1'],
    distributedTracingMode: 2, // W3C
    enableUnhandledPromiseRejectionTracking: true
  }
});

// Initialize only if instrumentation key is provided
if (config.appInsights.instrumentationKey || config.appInsights.connectionString) {
  appInsights.loadAppInsights();
}

// Custom event tracking
export const trackEvent = (name: string, properties?: Record<string, any>) => {
  if (!config.monitoring.enableAnalytics) return;
  
  appInsights.trackEvent({
    name,
    properties: {
      ...properties,
      environment: config.environment,
      timestamp: new Date().toISOString()
    }
  });
};

// Track exceptions
export const trackException = (error: Error, severityLevel?: number) => {
  if (!config.monitoring.enableErrorTracking) return;
  
  appInsights.trackException({
    error,
    severityLevel: severityLevel || 3, // Error level
    properties: {
      environment: config.environment,
      timestamp: new Date().toISOString()
    }
  });
};

// Track metrics
export const trackMetric = (name: string, value: number, properties?: Record<string, any>) => {
  if (!config.monitoring.enableAnalytics) return;
  
  appInsights.trackMetric({
    name,
    average: value,
    properties: {
      ...properties,
      environment: config.environment
    }
  });
};

// Track page views
export const trackPageView = (name?: string, properties?: Record<string, any>) => {
  if (!config.monitoring.enableAnalytics) return;
  
  appInsights.trackPageView({
    name,
    properties: {
      ...properties,
      environment: config.environment
    }
  });
};

// Track user actions for key business events
export const trackBusinessEvent = (eventType: string, data: Record<string, any>) => {
  const businessEvents: Record<string, string> = {
    RFQ_SUBMITTED: 'RFQ Submitted',
    RFQ_VIEWED: 'RFQ Viewed',
    RFQ_RESPONDED: 'RFQ Response Submitted',
    LEAD_CREATED: 'Lead Created',
    LEAD_CONVERTED: 'Lead Converted',
    EXPERT_BOOKING: 'Expert Consultation Booked',
    EXPERT_REVIEWED: 'Expert Review Submitted',
    FILE_UPLOADED: 'File Uploaded',
    REPORT_GENERATED: 'Report Generated',
    PAYMENT_COMPLETED: 'Payment Completed'
  };
  
  if (businessEvents[eventType]) {
    trackEvent(businessEvents[eventType], {
      ...data,
      eventType,
      userId: data.userId || 'anonymous'
    });
  }
};

// Set authenticated user context
export const setAuthenticatedUserContext = (userId: string, accountId?: string) => {
  appInsights.setAuthenticatedUserContext(userId, accountId);
};

// Clear user context on logout
export const clearUserContext = () => {
  appInsights.clearAuthenticatedUserContext();
};

// Flush any pending telemetry
export const flushTelemetry = () => {
  appInsights.flush();
};

export { reactPlugin, appInsights };