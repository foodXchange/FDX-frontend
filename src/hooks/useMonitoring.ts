import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  trackEvent,
  trackException,
  trackMetric,
  trackPageView,
  trackBusinessEvent
} from '../services/monitoring/appInsights';

interface UseMonitoringOptions {
  componentName?: string;
  enablePageTracking?: boolean;
}

export const useMonitoring = (options: UseMonitoringOptions = {}) => {
  const location = useLocation();
  const { componentName, enablePageTracking = true } = options;

  // Track page views on route change
  useEffect(() => {
    if (enablePageTracking) {
      trackPageView(location.pathname, {
        component: componentName,
        referrer: document.referrer,
        userAgent: navigator.userAgent
      });
    }
  }, [location.pathname, componentName, enablePageTracking]);

  // Track component events
  const logEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    trackEvent(eventName, {
      component: componentName,
      path: location.pathname,
      ...properties
    });
  }, [componentName, location.pathname]);

  // Track component errors
  const logError = useCallback((error: Error, properties?: Record<string, any>) => {
    trackException(error, 3);
    console.error(`[${componentName}] Error:`, error, properties);
  }, [componentName]);

  // Track performance metrics
  const logMetric = useCallback((metricName: string, value: number, properties?: Record<string, any>) => {
    trackMetric(metricName, value, {
      component: componentName,
      path: location.pathname,
      ...properties
    });
  }, [componentName, location.pathname]);

  // Track business events
  const logBusinessEvent = useCallback((eventType: string, data: Record<string, any>) => {
    trackBusinessEvent(eventType, {
      component: componentName,
      path: location.pathname,
      ...data
    });
  }, [componentName, location.pathname]);

  // Track user interactions
  const trackInteraction = useCallback((action: string, target: string, value?: any) => {
    logEvent('User Interaction', {
      action,
      target,
      value,
      timestamp: new Date().toISOString()
    });
  }, [logEvent]);

  // Track API calls
  const trackApiCall = useCallback((endpoint: string, method: string, duration: number, success: boolean, statusCode?: number) => {
    logEvent('API Call', {
      endpoint,
      method,
      duration,
      success,
      statusCode
    });
    
    logMetric('api_call_duration', duration, {
      endpoint,
      method,
      success: success.toString()
    });
  }, [logEvent, logMetric]);

  // Track form submissions
  const trackFormSubmission = useCallback((formName: string, success: boolean, validationErrors?: string[]) => {
    logEvent('Form Submission', {
      formName,
      success,
      hasErrors: validationErrors && validationErrors.length > 0,
      errorCount: validationErrors?.length || 0,
      errors: validationErrors
    });
  }, [logEvent]);

  return {
    logEvent,
    logError,
    logMetric,
    logBusinessEvent,
    trackInteraction,
    trackApiCall,
    trackFormSubmission
  };
};

// Performance monitoring hook
export const usePerformanceMonitoring = (componentName: string) => {
  const { logMetric } = useMonitoring({ componentName });
  
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      logMetric('component_render_time', renderTime, {
        component: componentName
      });
    };
  }, [componentName, logMetric]);
};