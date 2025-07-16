import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';

interface MetricData {
  timestamp: number;
  value: number;
  labels?: Record<string, string>;
}

interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export class MonitoringService {
  private metrics: Map<string, MetricData[]> = new Map();
  private healthChecks: Map<string, () => Promise<HealthCheck>> = new Map();
  private alerts: Array<{
    id: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: number;
    resolved: boolean;
  }> = [];

  private readonly maxMetricsPerKey = 1000;
  private readonly maxAlerts = 100;

  constructor() {
    // Start periodic cleanup
    setInterval(() => this.cleanup(), 60000); // Every minute
  }

  // Metrics collection
  recordMetric(name: string, value: number, labels?: Record<string, string>) {
    const key = this.getMetricKey(name, labels);
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    const metricsArray = this.metrics.get(key)!;
    metricsArray.push({
      timestamp: Date.now(),
      value,
      labels,
    });
    
    // Keep only recent metrics
    if (metricsArray.length > this.maxMetricsPerKey) {
      metricsArray.splice(0, metricsArray.length - this.maxMetricsPerKey);
    }
  }

  // Get aggregated metrics
  getMetrics(name: string, labels?: Record<string, string>, timeRange?: { start: number; end: number }) {
    const key = this.getMetricKey(name, labels);
    const metrics = this.metrics.get(key) || [];
    
    let filteredMetrics = metrics;
    if (timeRange) {
      filteredMetrics = metrics.filter(
        m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }
    
    if (filteredMetrics.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, sum: 0 };
    }
    
    const values = filteredMetrics.map(m => m.value);
    const sum = values.reduce((a, b) => a + b, 0);
    
    return {
      count: values.length,
      avg: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      sum,
    };
  }

  // Health checks
  registerHealthCheck(name: string, checkFn: () => Promise<HealthCheck>) {
    this.healthChecks.set(name, checkFn);
  }

  async runHealthChecks(): Promise<Record<string, HealthCheck>> {
    const results: Record<string, HealthCheck> = {};
    
    for (const [name, checkFn] of this.healthChecks.entries()) {
      try {
        const start = performance.now();
        const result = await checkFn();
        const latency = performance.now() - start;
        
        results[name] = {
          ...result,
          latency,
        };
      } catch (error) {
        results[name] = {
          name,
          status: 'unhealthy',
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
    
    return results;
  }

  // Alerts
  createAlert(message: string, severity: 'low' | 'medium' | 'high' | 'critical') {
    const alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      severity,
      timestamp: Date.now(),
      resolved: false,
    };
    
    this.alerts.unshift(alert);
    
    // Keep only recent alerts
    if (this.alerts.length > this.maxAlerts) {
      this.alerts.splice(this.maxAlerts);
    }
    
    // Log critical alerts
    if (severity === 'critical') {
      console.error(`🚨 CRITICAL ALERT: ${message}`);
    }
    
    return alert.id;
  }

  resolveAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  getAlerts(resolved: boolean = false) {
    return this.alerts.filter(a => a.resolved === resolved);
  }

  // Performance monitoring middleware
  performanceMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const start = performance.now();
      const startTime = Date.now();
      
      // Track request
      this.recordMetric('http_requests_total', 1, {
        method: req.method,
        path: req.route?.path || req.path,
      });
      
      // Override res.end to capture response metrics
      const originalEnd = res.end;
      res.end = function(...args: any[]) {
        const duration = performance.now() - start;
        const statusCode = res.statusCode.toString();
        
        // Record response time
        this.recordMetric('http_request_duration_ms', duration, {
          method: req.method,
          path: req.route?.path || req.path,
          status_code: statusCode,
        });
        
        // Record response status
        this.recordMetric('http_responses_total', 1, {
          method: req.method,
          path: req.route?.path || req.path,
          status_code: statusCode,
        });
        
        // Alert on slow requests
        if (duration > 5000) {
          this.createAlert(
            `Slow request: ${req.method} ${req.path} took ${duration.toFixed(2)}ms`,
            'medium'
          );
        }
        
        // Alert on errors
        if (res.statusCode >= 500) {
          this.createAlert(
            `Server error: ${req.method} ${req.path} returned ${res.statusCode}`,
            'high'
          );
        }
        
        return originalEnd.apply(this, args);
      }.bind(this);
      
      next();
    };
  }

  // Memory monitoring
  recordMemoryMetrics() {
    const memUsage = process.memoryUsage();
    
    this.recordMetric('memory_usage_bytes', memUsage.rss, { type: 'rss' });
    this.recordMetric('memory_usage_bytes', memUsage.heapUsed, { type: 'heap_used' });
    this.recordMetric('memory_usage_bytes', memUsage.heapTotal, { type: 'heap_total' });
    this.recordMetric('memory_usage_bytes', memUsage.external, { type: 'external' });
    
    // Alert on high memory usage
    const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    if (memoryUsagePercent > 90) {
      this.createAlert(
        `High memory usage: ${memoryUsagePercent.toFixed(1)}%`,
        'high'
      );
    }
  }

  // CPU monitoring
  recordCPUMetrics() {
    const cpuUsage = process.cpuUsage();
    
    this.recordMetric('cpu_usage_microseconds', cpuUsage.user, { type: 'user' });
    this.recordMetric('cpu_usage_microseconds', cpuUsage.system, { type: 'system' });
  }

  // System metrics
  recordSystemMetrics() {
    this.recordMemoryMetrics();
    this.recordCPUMetrics();
    
    // Process uptime
    this.recordMetric('process_uptime_seconds', process.uptime());
    
    // Event loop lag
    const start = performance.now();
    setImmediate(() => {
      const lag = performance.now() - start;
      this.recordMetric('event_loop_lag_ms', lag);
      
      // Alert on high event loop lag
      if (lag > 100) {
        this.createAlert(
          `High event loop lag: ${lag.toFixed(2)}ms`,
          'medium'
        );
      }
    });
  }

  // Start monitoring
  startMonitoring() {
    // Record system metrics every 30 seconds
    setInterval(() => {
      this.recordSystemMetrics();
    }, 30000);
    
    console.log('✅ Monitoring service started');
  }

  // Get dashboard data
  getDashboardData() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    return {
      requests: this.getMetrics('http_requests_total', undefined, { start: oneHourAgo, end: now }),
      responseTime: this.getMetrics('http_request_duration_ms', undefined, { start: oneHourAgo, end: now }),
      errors: this.getMetrics('http_responses_total', { status_code: '500' }, { start: oneHourAgo, end: now }),
      memory: this.getMetrics('memory_usage_bytes', { type: 'heap_used' }),
      eventLoopLag: this.getMetrics('event_loop_lag_ms'),
      alerts: this.getAlerts(),
      uptime: process.uptime(),
    };
  }

  // Export metrics in Prometheus format
  exportPrometheusMetrics(): string {
    const lines: string[] = [];
    
    for (const [key, metrics] of this.metrics.entries()) {
      if (metrics.length === 0) continue;
      
      const [name, labels] = this.parseMetricKey(key);
      const labelStr = labels ? Object.entries(labels)
        .map(([k, v]) => `${k}="${v}"`)
        .join(',') : '';
      
      const latest = metrics[metrics.length - 1];
      lines.push(`${name}{${labelStr}} ${latest.value} ${latest.timestamp}`);
    }
    
    return lines.join('\n');
  }

  // Private helper methods
  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels) return name;
    
    const sortedLabels = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',');
    
    return `${name}[${sortedLabels}]`;
  }

  private parseMetricKey(key: string): [string, Record<string, string> | undefined] {
    const bracketIndex = key.indexOf('[');
    if (bracketIndex === -1) {
      return [key, undefined];
    }
    
    const name = key.substring(0, bracketIndex);
    const labelsStr = key.substring(bracketIndex + 1, key.length - 1);
    
    const labels: Record<string, string> = {};
    if (labelsStr) {
      for (const pair of labelsStr.split(',')) {
        const [k, v] = pair.split(':');
        labels[k] = v;
      }
    }
    
    return [name, labels];
  }

  private cleanup() {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [key, metrics] of this.metrics.entries()) {
      const filtered = metrics.filter(m => m.timestamp > cutoff);
      this.metrics.set(key, filtered);
    }
    
    // Clean up old alerts
    this.alerts = this.alerts.filter(a => a.timestamp > cutoff || !a.resolved);
  }
}