import { useState, useEffect, useCallback } from 'react';
import { websocket } from '../services/websocket';

export interface MetricUpdate {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  timestamp: Date;
}

export interface DashboardMetrics {
  activeSamples: MetricUpdate;
  pendingOrders: MetricUpdate;
  deliveredToday: MetricUpdate;
  temperatureAlerts: MetricUpdate;
  onTimeDelivery: MetricUpdate;
  avgTransitTime: MetricUpdate;
  conversionRate: MetricUpdate;
  urgentActions: MetricUpdate;
}

export interface AIInsightUpdate {
  id: string;
  type: 'info' | 'warning' | 'success';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  action?: {
    label: string;
    actionType: string;
    actionData?: any;
  };
}

interface UseDashboardMetricsOptions {
  autoConnect?: boolean;
  reconnectOnError?: boolean;
  refreshInterval?: number; // in milliseconds
}

export const useDashboardMetrics = (options: UseDashboardMetricsOptions = {}) => {
  const { autoConnect = true, reconnectOnError = true, refreshInterval = 30000 } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState<Partial<DashboardMetrics>>({});
  const [aiInsights, setAIInsights] = useState<AIInsightUpdate[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Handle metrics updates from WebSocket
  const handleMetricsUpdate = useCallback((data: { metrics: Partial<DashboardMetrics> }) => {
    setMetrics(prev => ({
      ...prev,
      ...data.metrics
    }));
    setLastUpdateTime(new Date());
  }, []);

  // Handle individual metric updates
  const handleMetricUpdate = useCallback((data: { metricName: keyof DashboardMetrics; metric: MetricUpdate }) => {
    setMetrics(prev => ({
      ...prev,
      [data.metricName]: data.metric
    }));
    setLastUpdateTime(new Date());
  }, []);

  // Handle AI insights updates
  const handleAIInsightUpdate = useCallback((data: AIInsightUpdate) => {
    setAIInsights(prev => {
      // Remove existing insight with same ID if exists
      const filtered = prev.filter(insight => insight.id !== data.id);
      // Add new insight and sort by priority and timestamp
      return [...filtered, data].sort((a, b) => {
        // Sort by priority first (high > medium > low)
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by timestamp (newest first)
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
    });
  }, []);

  // Handle insights removal
  const handleAIInsightRemoval = useCallback((data: { insightId: string }) => {
    setAIInsights(prev => prev.filter(insight => insight.id !== data.insightId));
  }, []);

  // Handle system alerts
  const handleSystemAlert = useCallback((data: {
    type: 'temperature' | 'delivery' | 'system';
    message: string;
    severity: 'low' | 'medium' | 'high';
    data?: any;
  }) => {
    // Convert system alerts to AI insights
    const insight: AIInsightUpdate = {
      id: `alert_${Date.now()}_${Math.random()}`,
      type: data.severity === 'high' ? 'warning' : 'info',
      title: `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} Alert`,
      description: data.message,
      priority: data.severity,
      timestamp: new Date(),
    };
    
    handleAIInsightUpdate(insight);
  }, [handleAIInsightUpdate]);

  // Request metrics refresh
  const refreshMetrics = useCallback(() => {
    if (isConnected) {
      websocket.send('request_metrics_update', { timestamp: new Date().toISOString() });
    }
  }, [isConnected]);

  // Request AI insights refresh
  const refreshAIInsights = useCallback(() => {
    if (isConnected) {
      websocket.send('request_ai_insights', { timestamp: new Date().toISOString() });
    }
  }, [isConnected]);

  // Dismiss AI insight
  const dismissAIInsight = useCallback((insightId: string) => {
    setAIInsights(prev => prev.filter(insight => insight.id !== insightId));
    if (isConnected) {
      websocket.send('dismiss_ai_insight', { insightId });
    }
  }, [isConnected]);

  // Execute AI insight action
  const executeAIInsightAction = useCallback((insightId: string) => {
    const insight = aiInsights.find(i => i.id === insightId);
    if (insight?.action && isConnected) {
      websocket.send('execute_ai_action', {
        insightId,
        actionType: insight.action.actionType,
        actionData: insight.action.actionData
      });
    }
  }, [aiInsights, isConnected]);

  // Get metric by name
  const getMetric = useCallback((metricName: keyof DashboardMetrics): MetricUpdate | null => {
    return metrics[metricName] || null;
  }, [metrics]);

  // Get insights by type
  const getInsightsByType = useCallback((type: AIInsightUpdate['type']): AIInsightUpdate[] => {
    return aiInsights.filter(insight => insight.type === type);
  }, [aiInsights]);

  // Get insights by priority
  const getInsightsByPriority = useCallback((priority: AIInsightUpdate['priority']): AIInsightUpdate[] => {
    return aiInsights.filter(insight => insight.priority === priority);
  }, [aiInsights]);

  // Clear old insights (older than specified hours)
  const clearOldInsights = useCallback((hoursOld: number = 24) => {
    const cutoffTime = new Date(Date.now() - (hoursOld * 60 * 60 * 1000));
    setAIInsights(prev => prev.filter(insight => insight.timestamp > cutoffTime));
  }, []);

  useEffect(() => {
    if (!autoConnect) return;

    // Connection event handlers
    const handleConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
      // Request initial data on connection
      refreshMetrics();
      refreshAIInsights();
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleError = (error: any) => {
      setConnectionError(error?.message || 'WebSocket connection error');
      if (reconnectOnError) {
        setTimeout(() => {
          websocket.connect();
        }, 3000);
      }
    };

    // Register event listeners
    websocket.on('connected', handleConnect);
    websocket.on('disconnected', handleDisconnect);
    websocket.on('error', handleError);
    
    // Dashboard metrics specific events
    websocket.on('metrics_update', handleMetricsUpdate);
    websocket.on('metric_update', handleMetricUpdate);
    websocket.on('ai_insight_update', handleAIInsightUpdate);
    websocket.on('ai_insight_removal', handleAIInsightRemoval);
    websocket.on('system_alert', handleSystemAlert);

    // Connect if not already connected
    websocket.connect();

    // Set up auto-refresh interval
    let refreshTimer: NodeJS.Timeout | null = null;
    if (refreshInterval > 0) {
      refreshTimer = setInterval(() => {
        if (isConnected) {
          refreshMetrics();
        }
      }, refreshInterval);
    }

    // Cleanup on unmount
    return () => {
      websocket.off('connected', handleConnect);
      websocket.off('disconnected', handleDisconnect);
      websocket.off('error', handleError);
      websocket.off('metrics_update', handleMetricsUpdate);
      websocket.off('metric_update', handleMetricUpdate);
      websocket.off('ai_insight_update', handleAIInsightUpdate);
      websocket.off('ai_insight_removal', handleAIInsightRemoval);
      websocket.off('system_alert', handleSystemAlert);
      
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, [
    autoConnect, 
    reconnectOnError, 
    refreshInterval,
    isConnected,
    handleMetricsUpdate, 
    handleMetricUpdate, 
    handleAIInsightUpdate, 
    handleAIInsightRemoval,
    handleSystemAlert,
    refreshMetrics,
    refreshAIInsights
  ]);

  return {
    isConnected,
    connectionError,
    metrics,
    aiInsights,
    lastUpdateTime,
    refreshMetrics,
    refreshAIInsights,
    dismissAIInsight,
    executeAIInsightAction,
    getMetric,
    getInsightsByType,
    getInsightsByPriority,
    clearOldInsights,
    // Connection control
    connect: () => websocket.connect(),
    disconnect: () => websocket.disconnect(),
  };
};