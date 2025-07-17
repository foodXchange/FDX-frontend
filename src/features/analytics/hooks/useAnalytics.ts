import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';
import { MetricData, ChartData, DashboardConfig, InsightData, ExportOptions } from '../types';
import { useAuth } from '../../../hooks/useAuth';
import { useNotification } from '../../../hooks/useNotification';

interface UseAnalyticsOptions {
  dashboardId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableInsights?: boolean;
}

export const useAnalytics = (options: UseAnalyticsOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date(),
  });

  // Fetch dashboard configuration
  const { data: dashboardConfig, isLoading: configLoading } = useQuery({
    queryKey: ['dashboard-config', options.dashboardId, user?.role],
    queryFn: () => analyticsService.getDashboardConfig(options.dashboardId || user?.role || 'default'),
    enabled: !!user,
  });

  // Fetch metrics data
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['analytics-metrics', selectedDateRange, dashboardConfig?.id],
    queryFn: () => analyticsService.getMetrics({
      dateRange: selectedDateRange,
      dashboardId: dashboardConfig?.id,
      role: user?.role,
    }),
    enabled: !!dashboardConfig,
    refetchInterval: options.autoRefresh ? (options.refreshInterval || 30000) : false,
  });

  // Fetch chart data
  const { data: charts, isLoading: chartsLoading, refetch: refetchCharts } = useQuery({
    queryKey: ['analytics-charts', selectedDateRange, dashboardConfig?.id],
    queryFn: () => analyticsService.getCharts({
      dateRange: selectedDateRange,
      dashboardId: dashboardConfig?.id,
      widgets: dashboardConfig?.widgets,
    }),
    enabled: !!dashboardConfig,
  });

  // Fetch AI insights
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['analytics-insights', metrics, charts],
    queryFn: () => analyticsService.getInsights({
      metrics,
      charts,
      context: {
        role: user?.role,
        dateRange: selectedDateRange,
      },
    }),
    enabled: options.enableInsights && !!metrics && !!charts,
  });

  // Export analytics mutation
  const exportMutation = useMutation({
    mutationFn: (exportOptions: ExportOptions) => 
      analyticsService.exportAnalytics({
        ...exportOptions,
        dashboardId: dashboardConfig?.id,
        dateRange: exportOptions.dateRange || selectedDateRange,
      }),
    onSuccess: (data) => {
      showNotification('Analytics exported successfully', 'success');
      // Handle file download
      if (data.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      showNotification('Failed to export analytics', 'error');
      console.error('Export error:', error);
    },
  });

  // Save dashboard configuration
  const saveDashboardMutation = useMutation({
    mutationFn: (config: Partial<DashboardConfig>) =>
      analyticsService.saveDashboardConfig({
        ...dashboardConfig,
        ...config,
      } as DashboardConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-config'] });
      showNotification('Dashboard saved successfully', 'success');
    },
  });

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (!metrics) return null;

    const totalRevenue = metrics
      .filter(m => m.name === 'revenue')
      .reduce((sum, m) => sum + m.value, 0);

    const avgPerformance = metrics
      .filter(m => m.name.includes('performance'))
      .reduce((sum, m, _, arr) => sum + m.value / arr.length, 0);

    const criticalAlerts = insights?.filter(i => i.severity === 'error').length || 0;
    const warnings = insights?.filter(i => i.severity === 'warning').length || 0;

    return {
      totalRevenue,
      avgPerformance,
      criticalAlerts,
      warnings,
      lastUpdated: new Date().toISOString(),
    };
  }, [metrics, insights]);

  // Handlers
  const handleDateRangeChange = useCallback((start: Date, end: Date) => {
    setSelectedDateRange({ start, end });
  }, []);

  const handleMetricClick = useCallback((metric: MetricData) => {
    // Navigate to detailed view or show drill-down
    console.log('Metric clicked:', metric);
  }, []);

  const handleInsightAction = useCallback((insight: InsightData, action: string) => {
    // Handle insight actions
    console.log('Insight action:', insight, action);
  }, []);

  const refreshData = useCallback(() => {
    refetchMetrics();
    refetchCharts();
    queryClient.invalidateQueries({ queryKey: ['analytics-insights'] });
  }, [refetchMetrics, refetchCharts, queryClient]);

  const exportAnalytics = useCallback((options: ExportOptions) => {
    exportMutation.mutate(options);
  }, [exportMutation]);

  const updateDashboard = useCallback((updates: Partial<DashboardConfig>) => {
    saveDashboardMutation.mutate(updates);
  }, [saveDashboardMutation]);

  // Auto-refresh effect
  useEffect(() => {
    if (options.autoRefresh && options.refreshInterval) {
      const interval = setInterval(refreshData, options.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [options.autoRefresh, options.refreshInterval, refreshData]);

  return {
    // Data
    dashboardConfig,
    metrics,
    charts,
    insights,
    summary,
    
    // State
    selectedDateRange,
    isLoading: configLoading || metricsLoading || chartsLoading || (options.enableInsights && insightsLoading),
    isExporting: exportMutation.isPending,
    isSaving: saveDashboardMutation.isPending,
    
    // Actions
    handleDateRangeChange,
    handleMetricClick,
    handleInsightAction,
    refreshData,
    exportAnalytics,
    updateDashboard,
  };
};

// Hook for specific metric tracking
export const useMetric = (metricId: string, options?: { realtime?: boolean }) => {
  const [value, setValue] = useState<number | null>(null);
  const [history, setHistory] = useState<Array<{ timestamp: string; value: number }>>([]);

  useEffect(() => {
    if (options?.realtime) {
      const subscription = analyticsService.subscribeToMetric(metricId, (data) => {
        setValue(data.value);
        setHistory(prev => [...prev.slice(-99), { timestamp: data.timestamp, value: data.value }]);
      });

      return () => {
        analyticsService.unsubscribeFromMetric(subscription.id);
      };
    }
  }, [metricId, options?.realtime]);

  const { data, isLoading } = useQuery({
    queryKey: ['metric', metricId],
    queryFn: () => analyticsService.getMetric(metricId),
    enabled: !options?.realtime,
  });

  return {
    value: options?.realtime ? value : data?.value,
    history: options?.realtime ? history : data?.history,
    isLoading,
    trend: data?.trend,
    metadata: data?.metadata,
  };
};

// Hook for comparative analytics
export const useComparison = (
  entities: string[],
  metric: string,
  dateRange: { start: Date; end: Date }
) => {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-comparison', entities, metric, dateRange],
    queryFn: () => analyticsService.compareEntities({
      entities,
      metric,
      dateRange,
    }),
  });

  return {
    data,
    isLoading,
    winner: data?.winner,
    insights: data?.insights,
  };
};