import { apiClient } from '../../../services/api-client';
import { 
  MetricData, 
  ChartData, 
  DashboardConfig, 
  InsightData, 
  AnalyticsReport,
  SupplierMetrics,
  ComplianceMetrics,
  PredictiveAnalytics,
  ExportOptions,
  RealtimeMetric,
  MetricSubscription
} from '../types';
import { aiServiceManager } from '../../../services/ai';

class AnalyticsService {
  private baseUrl = '/api/analytics';
  private subscriptions = new Map<string, MetricSubscription>();

  // Dashboard Management
  async getDashboardConfig(dashboardId: string): Promise<DashboardConfig> {
    const response = await apiClient.get(`${this.baseUrl}/dashboards/${dashboardId}`);
    return response.data;
  }

  async saveDashboardConfig(config: DashboardConfig): Promise<DashboardConfig> {
    if (config.id) {
      const response = await apiClient.put(`${this.baseUrl}/dashboards/${config.id}`, config);
      return response.data;
    } else {
      const response = await apiClient.post(`${this.baseUrl}/dashboards`, config);
      return response.data;
    }
  }

  async deleteDashboard(dashboardId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/dashboards/${dashboardId}`);
  }

  async listDashboards(role?: string): Promise<DashboardConfig[]> {
    const response = await apiClient.get(`${this.baseUrl}/dashboards`, {
      params: { role },
    });
    return response.data;
  }

  // Metrics Data
  async getMetrics(params: {
    dateRange: { start: Date; end: Date };
    dashboardId?: string;
    role?: string;
    filters?: Record<string, any>;
  }): Promise<MetricData[]> {
    const response = await apiClient.get(`${this.baseUrl}/metrics`, {
      params: {
        startDate: params.dateRange.start.toISOString(),
        endDate: params.dateRange.end.toISOString(),
        dashboardId: params.dashboardId,
        role: params.role,
        ...params.filters,
      },
    });
    return response.data;
  }

  async getMetric(metricId: string): Promise<MetricData & { history: Array<{ timestamp: string; value: number }> }> {
    const response = await apiClient.get(`${this.baseUrl}/metrics/${metricId}`);
    return response.data;
  }

  // Charts Data
  async getCharts(params: {
    dateRange: { start: Date; end: Date };
    dashboardId?: string;
    widgets?: any[];
    filters?: Record<string, any>;
  }): Promise<ChartData[]> {
    const response = await apiClient.post(`${this.baseUrl}/charts`, {
      dateRange: params.dateRange,
      dashboardId: params.dashboardId,
      widgets: params.widgets,
      filters: params.filters,
    });
    return response.data;
  }

  // AI Insights
  async getInsights(params: {
    metrics?: MetricData[];
    charts?: ChartData[];
    context: {
      role?: string;
      dateRange: { start: Date; end: Date };
    };
  }): Promise<InsightData[]> {
    try {
      // Use AI service to generate insights
      const aiResponse = await aiServiceManager.generateInsights(
        {
          metrics: params.metrics,
          charts: params.charts,
          context: params.context,
        },
        'analytics_insights'
      );

      // Parse AI response into structured insights
      const insights: InsightData[] = aiResponse.insights.map((insight: any, index: number) => ({
        id: `insight_${Date.now()}_${index}`,
        type: insight.type || 'recommendation',
        severity: insight.severity || 'info',
        title: insight.title,
        message: insight.message,
        data: insight.data,
        actions: insight.actions,
        createdAt: new Date().toISOString(),
        isRead: false,
        isDismissed: false,
      }));

      return insights;
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      return [];
    }
  }

  // Natural Language Query
  async queryAnalytics(query: string, context?: any): Promise<any> {
    const response = await aiServiceManager.chatWithAI(
      query,
      context?.userId || 'analytics_user',
      context?.sessionId
    );
    return response;
  }

  // Supplier Analytics
  async getSupplierMetrics(supplierId: string, dateRange?: { start: Date; end: Date }): Promise<SupplierMetrics> {
    const response = await apiClient.get(`${this.baseUrl}/suppliers/${supplierId}/metrics`, {
      params: dateRange ? {
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
      } : undefined,
    });
    return response.data;
  }

  async compareSuppliers(supplierIds: string[], metric: string): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/suppliers/compare`, {
      supplierIds,
      metric,
    });
    return response.data;
  }

  // Compliance Analytics
  async getComplianceMetrics(params?: {
    entityId?: string;
    entityType?: 'supplier' | 'product' | 'order';
    dateRange?: { start: Date; end: Date };
  }): Promise<ComplianceMetrics> {
    const response = await apiClient.get(`${this.baseUrl}/compliance/metrics`, {
      params: params ? {
        entityId: params.entityId,
        entityType: params.entityType,
        startDate: params.dateRange?.start.toISOString(),
        endDate: params.dateRange?.end.toISOString(),
      } : undefined,
    });
    return response.data;
  }

  // Predictive Analytics
  async getPredictiveAnalytics(params: {
    type: 'demand' | 'pricing' | 'risk';
    entityIds?: string[];
    horizon?: number; // Days to predict
  }): Promise<PredictiveAnalytics> {
    const response = await apiClient.post(`${this.baseUrl}/predictive/${params.type}`, {
      entityIds: params.entityIds,
      horizon: params.horizon || 30,
    });
    return response.data;
  }

  // Reports
  async generateReport(report: Partial<AnalyticsReport>): Promise<AnalyticsReport> {
    const response = await apiClient.post(`${this.baseUrl}/reports`, report);
    return response.data;
  }

  async getReports(filters?: {
    type?: string;
    status?: string;
    createdBy?: string;
  }): Promise<AnalyticsReport[]> {
    const response = await apiClient.get(`${this.baseUrl}/reports`, {
      params: filters,
    });
    return response.data;
  }

  async runReport(reportId: string): Promise<{ url: string }> {
    const response = await apiClient.post(`${this.baseUrl}/reports/${reportId}/run`);
    return response.data;
  }

  // Export
  async exportAnalytics(options: ExportOptions & {
    dashboardId?: string;
  }): Promise<{ url: string; filename: string }> {
    const response = await apiClient.post(`${this.baseUrl}/export`, options);
    return response.data;
  }

  // Real-time Metrics
  subscribeToMetric(
    metricName: string,
    callback: (metric: RealtimeMetric) => void
  ): MetricSubscription {
    const subscription: MetricSubscription = {
      id: `sub_${Date.now()}_${Math.random()}`,
      metrics: [metricName],
      callback,
    };

    this.subscriptions.set(subscription.id, subscription);
    
    // In a real implementation, this would connect to WebSocket/SignalR
    // For now, we'll simulate with random data
    const interval = setInterval(() => {
      const metric: RealtimeMetric = {
        id: `metric_${Date.now()}`,
        metric: metricName,
        value: Math.random() * 1000,
        timestamp: new Date().toISOString(),
      };
      callback(metric);
    }, 5000);

    // Store interval for cleanup
    (subscription as any).interval = interval;

    return subscription;
  }

  unsubscribeFromMetric(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      // Clear interval if exists
      if ((subscription as any).interval) {
        clearInterval((subscription as any).interval);
      }
      this.subscriptions.delete(subscriptionId);
    }
  }

  // Comparison Analytics
  async compareEntities(params: {
    entities: string[];
    metric: string;
    dateRange: { start: Date; end: Date };
    entityType?: 'supplier' | 'product' | 'category';
  }): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/compare`, {
      ...params,
      startDate: params.dateRange.start.toISOString(),
      endDate: params.dateRange.end.toISOString(),
    });
    return response.data;
  }

  // Benchmarking
  async getBenchmarks(params: {
    metric: string;
    industry?: string;
    region?: string;
    size?: 'small' | 'medium' | 'large';
  }): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/benchmarks`, {
      params,
    });
    return response.data;
  }

  // Custom Analytics
  async runCustomQuery(query: {
    sql?: string;
    aggregations?: any[];
    filters?: any[];
    groupBy?: string[];
    orderBy?: string[];
    limit?: number;
  }): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/query`, query);
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();