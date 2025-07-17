import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MetricData } from '../types';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../../../hooks/useAuth';

interface UseDashboardMetricsOptions {
  role?: string;
  refreshInterval?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export const useDashboardMetrics = (options: UseDashboardMetricsOptions = {}) => {
  const { user } = useAuth();
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  
  const dateRange = options.dateRange || {
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date(),
  };

  const { data: metrics, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-metrics', options.role || user?.role, dateRange],
    queryFn: () => analyticsService.getMetrics({
      dateRange,
      role: options.role || user?.role,
    }),
    refetchInterval: options.refreshInterval || 60000, // Default 1 minute
  });

  // Calculate aggregated metrics
  const aggregatedMetrics = useMemo(() => {
    if (!metrics) return null;

    const totalRevenue = metrics
      .filter(m => m.id.includes('revenue'))
      .reduce((sum, m) => sum + m.value, 0);

    const avgPerformance = metrics
      .filter(m => m.id.includes('performance'))
      .reduce((sum, m, _, arr) => sum + m.value / arr.length, 0);

    const activeOrders = metrics.find(m => m.id === 'active_orders')?.value || 0;
    const pendingApprovals = metrics.find(m => m.id === 'pending_approvals')?.value || 0;

    return {
      totalRevenue,
      avgPerformance,
      activeOrders,
      pendingApprovals,
    };
  }, [metrics]);

  // Get specific metric by ID
  const getMetric = (metricId: string): MetricData | undefined => {
    return metrics?.find(m => m.id === metricId);
  };

  // Get metrics by category
  const getMetricsByCategory = (category: string): MetricData[] => {
    return metrics?.filter(m => m.id.includes(category)) || [];
  };

  // Toggle metric selection for comparison
  const toggleMetricSelection = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  return {
    metrics,
    aggregatedMetrics,
    selectedMetrics,
    isLoading,
    error,
    refetch,
    getMetric,
    getMetricsByCategory,
    toggleMetricSelection,
  };
};