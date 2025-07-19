import { initializeMonitoring } from './telemetry';
import { rumMonitor } from './rum';
import { errorTracker } from './errorTracking';
import { monitoringConfig } from '../config/monitoring.config';

export function initializeAllMonitoring() {
  // Initialize OpenTelemetry
  initializeMonitoring();
  
  // Set up global context
  errorTracker.addContext({
    version: process.env.REACT_APP_VERSION || '1.0.0',
    buildTime: process.env.REACT_APP_BUILD_TIME || new Date().toISOString(),
    environment: monitoringConfig.environment
  });
  
  // Track initial page load
  rumMonitor.trackMetric('app_initialization', performance.now());
  
  console.log('📊 All monitoring systems initialized');
}

// Export all monitoring utilities
export { rumMonitor, errorTracker };
export * from './telemetry';
export * from './rum';
export * from './errorTracking';