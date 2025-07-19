export interface MonitoringConfig {
  enableAPM: boolean;
  enableRUM: boolean;
  enableErrorTracking: boolean;
  enablePerformanceTracking: boolean;
  samplingRate: number;
  apiEndpoint: string;
  serviceName: string;
  environment: string;
}

export const monitoringConfig: MonitoringConfig = {
  enableAPM: process.env.NODE_ENV === 'production',
  enableRUM: process.env.NODE_ENV === 'production',
  enableErrorTracking: true,
  enablePerformanceTracking: true,
  samplingRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  apiEndpoint: process.env.REACT_APP_MONITORING_ENDPOINT || 'http://localhost:4318',
  serviceName: 'fdx-frontend',
  environment: process.env.NODE_ENV || 'development'
};

export const metricsConfig = {
  // Core Web Vitals thresholds
  FCP_THRESHOLD: 1800, // First Contentful Paint
  LCP_THRESHOLD: 2500, // Largest Contentful Paint
  FID_THRESHOLD: 100,  // First Input Delay
  CLS_THRESHOLD: 0.1,  // Cumulative Layout Shift
  
  // Custom business metrics
  API_RESPONSE_THRESHOLD: 1000,
  SEARCH_RESPONSE_THRESHOLD: 500,
  LOGIN_THRESHOLD: 2000,
  
  // Error tracking
  ERROR_SAMPLING_RATE: 1.0,
  PERFORMANCE_SAMPLING_RATE: 0.1
};