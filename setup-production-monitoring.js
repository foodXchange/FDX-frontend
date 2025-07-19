const fs = require('fs');
const path = require('path');

console.log('📊 PHASE 3: Setting up production monitoring infrastructure...');

// Create comprehensive monitoring configuration
function createMonitoringConfig() {
  console.log('⚙️ Creating monitoring configuration...');
  
  const monitoringConfig = `export interface MonitoringConfig {
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
};`;
  
  if (!fs.existsSync('./src/config')) {
    fs.mkdirSync('./src/config', { recursive: true });
  }
  
  fs.writeFileSync('./src/config/monitoring.config.ts', monitoringConfig);
  console.log('✅ Created monitoring configuration');
}

// Create OpenTelemetry instrumentation
function createOTelInstrumentation() {
  console.log('🔍 Creating OpenTelemetry instrumentation...');
  
  const otelSetup = `import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { monitoringConfig } from '../config/monitoring.config';

let isInitialized = false;

export function initializeMonitoring() {
  if (isInitialized || !monitoringConfig.enableAPM) {
    return;
  }

  const provider = new WebTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: monitoringConfig.serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.REACT_APP_VERSION || '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: monitoringConfig.environment,
    }),
  });

  const exporter = new OTLPTraceExporter({
    url: \`\${monitoringConfig.apiEndpoint}/v1/traces\`,
  });

  provider.addSpanProcessor(new BatchSpanProcessor(exporter));
  provider.register();

  registerInstrumentations({
    instrumentations: [
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-fetch': {
          propagateTraceHeaderCorsUrls: /.*/,
          clearTimingResources: true,
        },
        '@opentelemetry/instrumentation-xml-http-request': {
          propagateTraceHeaderCorsUrls: /.*/,
          clearTimingResources: true,
        },
      }),
    ],
  });

  isInitialized = true;
  console.log('📊 OpenTelemetry monitoring initialized');
}

export function createSpan(name: string, attributes?: Record<string, any>) {
  if (!isInitialized) return null;
  
  const tracer = provider.getTracer(monitoringConfig.serviceName);
  return tracer.startSpan(name, { attributes });
}`;
  
  if (!fs.existsSync('./src/monitoring')) {
    fs.mkdirSync('./src/monitoring', { recursive: true });
  }
  
  fs.writeFileSync('./src/monitoring/telemetry.ts', otelSetup);
  console.log('✅ Created OpenTelemetry instrumentation');
}

// Create Real User Monitoring (RUM)
function createRUMMonitoring() {
  console.log('👥 Creating Real User Monitoring...');
  
  const rumSetup = `import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';
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
    fetch(\`\${monitoringConfig.apiEndpoint}/metrics\`, {
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
}`;
  
  fs.writeFileSync('./src/monitoring/rum.ts', rumSetup);
  console.log('✅ Created RUM monitoring');
}

// Create Error Tracking
function createErrorTracking() {
  console.log('🚨 Creating error tracking...');
  
  const errorTracking = `import { monitoringConfig } from '../config/monitoring.config';
import { rumMonitor } from './rum';

export interface ErrorReport {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId: string;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class ErrorTracker {
  private sessionId: string;
  private userId?: string;
  private errorQueue: ErrorReport[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    
    if (monitoringConfig.enableErrorTracking) {
      this.initializeErrorHandlers();
    }
  }

  private generateSessionId(): string {
    return \`\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
  }

  private initializeErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        severity: 'high'
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: \`Unhandled Promise Rejection: \${event.reason}\`,
        stack: event.reason?.stack,
        severity: 'critical'
      });
    });

    // React error boundary integration
    this.setupReactErrorHandler();
  }

  private setupReactErrorHandler() {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('React') || message.includes('component')) {
        this.captureError({
          message,
          severity: 'medium',
          context: { type: 'react-error' }
        });
      }
      originalConsoleError.apply(console, args);
    };
  }

  captureError(error: Partial<ErrorReport>) {
    const errorReport: ErrorReport = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      filename: error.filename,
      lineno: error.lineno,
      colno: error.colno,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.userId,
      sessionId: this.sessionId,
      context: error.context,
      severity: error.severity || 'medium'
    };

    this.errorQueue.push(errorReport);
    this.sendErrorReport(errorReport);
    
    // Also track in RUM
    rumMonitor.trackError(new Error(errorReport.message), {
      severity: errorReport.severity,
      ...errorReport.context
    });
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  addContext(context: Record<string, any>) {
    // Add global context that will be included in all future error reports
    this.globalContext = { ...this.globalContext, ...context };
  }

  private globalContext: Record<string, any> = {};

  private sendErrorReport(error: ErrorReport) {
    const payload = {
      ...error,
      context: { ...this.globalContext, ...error.context }
    };

    fetch(\`\${monitoringConfig.apiEndpoint}/errors\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(console.error);
  }

  getErrors() {
    return this.errorQueue;
  }

  clearErrors() {
    this.errorQueue = [];
  }
}

export const errorTracker = new ErrorTracker();

// React hook for error tracking
export function useErrorTracker() {
  return {
    captureError: errorTracker.captureError.bind(errorTracker),
    setUserId: errorTracker.setUserId.bind(errorTracker),
    addContext: errorTracker.addContext.bind(errorTracker),
    getErrors: errorTracker.getErrors.bind(errorTracker)
  };
}`;
  
  fs.writeFileSync('./src/monitoring/errorTracking.ts', errorTracking);
  console.log('✅ Created error tracking');
}

// Create Performance Monitor Component
function createPerformanceMonitorComponent() {
  console.log('📈 Creating performance monitor component...');
  
  const perfComponent = `import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, LinearProgress, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMoreIcon } from '@mui/icons-material';
import { useRUMMonitor } from '../monitoring/rum';
import { useErrorTracker } from '../monitoring/errorTracking';
import { metricsConfig } from '../config/monitoring.config';

interface PerformanceStats {
  vitals: {
    fcp: number;
    lcp: number;
    fid: number;
    cls: number;
  };
  errors: number;
  apiCalls: number;
  avgResponseTime: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const rumMonitor = useRUMMonitor();
  const errorTracker = useErrorTracker();

  useEffect(() => {
    // Only show in development or when explicitly enabled
    const showMonitor = process.env.NODE_ENV === 'development' || 
                       localStorage.getItem('show-perf-monitor') === 'true';
    setIsVisible(showMonitor);

    if (showMonitor) {
      const interval = setInterval(() => {
        const metrics = rumMonitor.getMetrics();
        const errors = errorTracker.getErrors();
        
        const vitals = metrics.vitals.reduce((acc, vital) => ({
          ...acc,
          [vital.name.toLowerCase()]: vital.value
        }), { fcp: 0, lcp: 0, fid: 0, cls: 0 });

        const apiCalls = metrics.custom.filter(m => m.name === 'api_call');
        const avgResponseTime = apiCalls.length > 0 
          ? apiCalls.reduce((sum, call) => sum + call.value, 0) / apiCalls.length 
          : 0;

        setStats({
          vitals,
          errors: errors.length,
          apiCalls: apiCalls.length,
          avgResponseTime
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, []);

  if (!isVisible || !stats) return null;

  const getVitalStatus = (vital: keyof typeof stats.vitals, value: number) => {
    const thresholds = {
      fcp: metricsConfig.FCP_THRESHOLD,
      lcp: metricsConfig.LCP_THRESHOLD,
      fid: metricsConfig.FID_THRESHOLD,
      cls: metricsConfig.CLS_THRESHOLD
    };

    const threshold = thresholds[vital];
    if (vital === 'cls') {
      return value <= threshold ? 'good' : value <= threshold * 2 ? 'needs-improvement' : 'poor';
    }
    return value <= threshold ? 'good' : value <= threshold * 1.5 ? 'needs-improvement' : 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'success';
      case 'needs-improvement': return 'warning';
      case 'poor': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        maxWidth: 400,
        bgcolor: 'background.paper',
        boxShadow: 3,
        borderRadius: 2,
        zIndex: 9999
      }}
    >
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Performance Monitor</Typography>
          <Chip 
            label={\`\${stats.errors} errors\`} 
            size="small" 
            color={stats.errors > 0 ? 'error' : 'success'}
            sx={{ ml: 1 }}
          />
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Core Web Vitals</Typography>
            
            {Object.entries(stats.vitals).map(([vital, value]) => {
              const status = getVitalStatus(vital as keyof typeof stats.vitals, value);
              return (
                <Box key={vital} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption">{vital.toUpperCase()}</Typography>
                    <Chip 
                      label={\`\${Math.round(value)}ms\`}
                      size="small"
                      color={getStatusColor(status) as any}
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min((value / (vital === 'cls' ? 0.25 : 3000)) * 100, 100)}
                    color={getStatusColor(status) as any}
                  />
                </Box>
              );
            })}

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>API Performance</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">Calls: {stats.apiCalls}</Typography>
                <Typography variant="caption">
                  Avg: {Math.round(stats.avgResponseTime)}ms
                </Typography>
              </Box>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};`;
  
  fs.writeFileSync('./src/components/PerformanceMonitor.tsx', perfComponent);
  console.log('✅ Created performance monitor component');
}

// Create monitoring dashboard
function createMonitoringDashboard() {
  console.log('📊 Creating monitoring dashboard...');
  
  const dashboard = `import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress
} from '@mui/material';
import { useRUMMonitor } from '../monitoring/rum';
import { useErrorTracker } from '../monitoring/errorTracking';

export const MonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const rumMonitor = useRUMMonitor();
  const errorTracker = useErrorTracker();

  useEffect(() => {
    const fetchMetrics = () => {
      const rumMetrics = rumMonitor.getMetrics();
      const errors = errorTracker.getErrors();
      
      setMetrics({
        vitals: rumMetrics.vitals,
        custom: rumMetrics.custom,
        errors
      });
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics) {
    return <LinearProgress />;
  }

  const recentErrors = metrics.errors.slice(-10);
  const apiCalls = metrics.custom.filter((m: any) => m.name === 'api_call');
  const userActions = metrics.custom.filter((m: any) => m.name === 'user_action');

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Production Monitoring Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Core Web Vitals */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Core Web Vitals</Typography>
              {metrics.vitals.map((vital: any) => (
                <Box key={vital.id} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{vital.name}</Typography>
                    <Chip 
                      label={\`\${Math.round(vital.value)}ms\`}
                      color={vital.rating === 'good' ? 'success' : vital.rating === 'needs-improvement' ? 'warning' : 'error'}
                      size="small"
                    />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Error Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Error Summary</Typography>
              <Typography variant="h3" color="error">{metrics.errors.length}</Typography>
              <Typography variant="body2" color="text.secondary">Total Errors</Typography>
              
              <Box sx={{ mt: 2 }}>
                {['critical', 'high', 'medium', 'low'].map(severity => {
                  const count = metrics.errors.filter((e: any) => e.severity === severity).length;
                  return (
                    <Box key={severity} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption">{severity}</Typography>
                      <Chip label={count} size="small" />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* API Performance */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>API Performance</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Endpoint</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Duration (ms)</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Timestamp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {apiCalls.slice(-10).map((call: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{call.attributes?.endpoint}</TableCell>
                        <TableCell>{call.attributes?.method}</TableCell>
                        <TableCell>{Math.round(call.value)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={call.attributes?.status}
                            color={call.attributes?.success ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(call.timestamp).toLocaleTimeString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Errors */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Errors</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Message</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>File</TableCell>
                      <TableCell>Timestamp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentErrors.map((error: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell sx={{ maxWidth: 300 }}>
                          <Typography variant="body2" noWrap>
                            {error.message}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={error.severity}
                            color={error.severity === 'critical' ? 'error' : error.severity === 'high' ? 'warning' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{error.filename || 'Unknown'}</TableCell>
                        <TableCell>
                          {new Date(error.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};`;
  
  if (!fs.existsSync('./src/pages')) {
    fs.mkdirSync('./src/pages', { recursive: true });
  }
  
  fs.writeFileSync('./src/pages/MonitoringDashboard.tsx', dashboard);
  console.log('✅ Created monitoring dashboard');
}

// Update package.json with monitoring dependencies
function updatePackageJsonForMonitoring() {
  console.log('📦 Updating package.json for monitoring...');
  
  const packagePath = './package.json';
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Add monitoring dependencies
    packageJson.dependencies = {
      ...packageJson.dependencies,
      '@opentelemetry/api': '^1.7.0',
      '@opentelemetry/sdk-trace-web': '^1.17.0',
      '@opentelemetry/auto-instrumentations-web': '^0.34.0',
      '@opentelemetry/exporter-otlp-http': '^0.45.0',
      '@opentelemetry/resources': '^1.17.0',
      '@opentelemetry/semantic-conventions': '^1.17.0',
      'web-vitals': '^3.5.0'
    };
    
    // Add monitoring scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      'monitor:dev': 'cross-env REACT_APP_ENABLE_MONITORING=true npm start',
      'monitor:build': 'cross-env REACT_APP_ENABLE_MONITORING=true npm run build',
      'analyze:bundle': 'npm run build && npx bundle-analyzer build/static/js/*.js'
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json for monitoring');
  }
}

// Create initialization file
function createMonitoringInit() {
  console.log('🚀 Creating monitoring initialization...');
  
  const initFile = `import { initializeMonitoring } from './telemetry';
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
export * from './errorTracking';`;
  
  fs.writeFileSync('./src/monitoring/index.ts', initFile);
  console.log('✅ Created monitoring initialization');
}

// Run all monitoring setup
async function setupProductionMonitoring() {
  try {
    createMonitoringConfig();
    createOTelInstrumentation();
    createRUMMonitoring();
    createErrorTracking();
    createPerformanceMonitorComponent();
    createMonitoringDashboard();
    updatePackageJsonForMonitoring();
    createMonitoringInit();
    
    console.log('🎉 PHASE 3 COMPLETE: Production monitoring infrastructure setup!');
    console.log('📊 Features added:');
    console.log('  • OpenTelemetry APM integration');
    console.log('  • Real User Monitoring (RUM)');
    console.log('  • Error tracking and reporting');
    console.log('  • Core Web Vitals monitoring');
    console.log('  • Performance dashboard');
    console.log('  • Custom metrics tracking');
    console.log('📋 Next: npm install && add monitoring initialization to index.tsx');
    
  } catch (error) {
    console.error('❌ Error setting up monitoring:', error);
  }
}

setupProductionMonitoring();