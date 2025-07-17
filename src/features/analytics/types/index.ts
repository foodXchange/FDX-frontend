// Analytics Types
export interface MetricData {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercentage?: number;
  trend: 'up' | 'down' | 'stable';
  unit?: string;
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  target?: number;
  status?: 'success' | 'warning' | 'error' | 'info';
}

export interface ChartData {
  id: string;
  type: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radar' | 'scatter' | 'heatmap';
  title: string;
  subtitle?: string;
  data: any[];
  config?: {
    xAxis?: string;
    yAxis?: string;
    series?: string[];
    colors?: string[];
    stacked?: boolean;
    curved?: boolean;
    showGrid?: boolean;
    showLegend?: boolean;
    showTooltip?: boolean;
  };
}

export interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  role: UserRole;
  layout: DashboardLayout[];
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  refreshInterval?: number;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardLayout {
  i: string; // Widget ID
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'map' | 'calendar' | 'custom';
  title: string;
  subtitle?: string;
  dataSource: string;
  refreshRate?: number;
  config: Record<string, any>;
  permissions?: string[];
}

export interface DashboardFilter {
  id: string;
  field: string;
  label: string;
  type: 'date' | 'select' | 'multiselect' | 'range' | 'search';
  options?: Array<{ value: string; label: string }>;
  defaultValue?: any;
  required?: boolean;
}

export type UserRole = 'buyer' | 'supplier' | 'broker' | 'admin' | 'analyst';

export interface AnalyticsReport {
  id: string;
  name: string;
  description?: string;
  type: 'scheduled' | 'adhoc' | 'realtime';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  schedule?: ReportSchedule;
  filters: Record<string, any>;
  recipients: string[];
  createdBy: string;
  createdAt: string;
  lastRun?: string;
  nextRun?: string;
  status: 'active' | 'paused' | 'error';
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  time?: string; // HH:mm format
  dayOfWeek?: number; // 0-6
  dayOfMonth?: number; // 1-31
  customCron?: string;
  timezone: string;
}

export interface InsightData {
  id: string;
  type: 'trend' | 'anomaly' | 'prediction' | 'recommendation' | 'alert';
  severity: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  data?: any;
  actions?: Array<{
    label: string;
    action: string;
    params?: Record<string, any>;
  }>;
  createdAt: string;
  expiresAt?: string;
  isRead: boolean;
  isDismissed: boolean;
}

export interface RealtimeMetric {
  id: string;
  metric: string;
  value: number;
  timestamp: string;
  dimensions?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface MetricSubscription {
  id: string;
  metrics: string[];
  filters?: Record<string, any>;
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  interval?: number; // milliseconds
  callback: (data: RealtimeMetric[]) => void;
}

export interface SupplierMetrics {
  supplierId: string;
  supplierName: string;
  tier: 'bronze' | 'silver' | 'gold';
  performance: {
    overall: number;
    onTimeDelivery: number;
    qualityScore: number;
    responsiveness: number;
    compliance: number;
  };
  orders: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    mtd: number; // Month to date
    ytd: number; // Year to date
    growth: number;
  };
  certifications: {
    active: number;
    expiring: number;
    expired: number;
  };
  trends: Array<{
    date: string;
    orders: number;
    revenue: number;
    performance: number;
  }>;
}

export interface ComplianceMetrics {
  overallScore: number;
  categories: Array<{
    name: string;
    score: number;
    status: 'compliant' | 'warning' | 'violation';
    issues: number;
  }>;
  certifications: {
    total: number;
    active: number;
    expiringSoon: number;
    expired: number;
  };
  audits: {
    scheduled: number;
    completed: number;
    failed: number;
    nextAudit?: string;
  };
  violations: Array<{
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    date: string;
    status: 'open' | 'resolved' | 'disputed';
  }>;
}

export interface PredictiveAnalytics {
  demand: {
    predictions: Array<{
      productId: string;
      productName: string;
      period: string;
      predictedDemand: number;
      confidence: number;
      factors: string[];
    }>;
    accuracy: number;
    lastUpdated: string;
  };
  pricing: {
    recommendations: Array<{
      productId: string;
      currentPrice: number;
      recommendedPrice: number;
      expectedImpact: {
        volume: number;
        revenue: number;
        margin: number;
      };
      confidence: number;
    }>;
  };
  risk: {
    supplierRisk: Array<{
      supplierId: string;
      riskScore: number;
      factors: Array<{
        factor: string;
        impact: 'low' | 'medium' | 'high';
        description: string;
      }>;
      mitigation: string[];
    }>;
    marketRisk: {
      overall: number;
      categories: Record<string, number>;
      trends: string[];
    };
  };
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'png';
  includeCharts: boolean;
  includeRawData: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, any>;
  customization?: {
    logo?: string;
    companyName?: string;
    reportTitle?: string;
    includeExecutiveSummary?: boolean;
    includeFootnotes?: boolean;
  };
}