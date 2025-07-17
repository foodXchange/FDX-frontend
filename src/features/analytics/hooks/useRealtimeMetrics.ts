import { useState, useEffect, useCallback, useRef } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { RealtimeMetric, MetricSubscription } from '../types';
import { useAuth } from '../../../hooks/useAuth';
import { useNotification } from '../../../hooks/useNotification';

interface UseRealtimeMetricsOptions {
  metrics: string[];
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  interval?: number;
  filters?: Record<string, any>;
  onUpdate?: (metrics: RealtimeMetric[]) => void;
  onError?: (error: Error) => void;
}

export const useRealtimeMetrics = (options: UseRealtimeMetricsOptions) => {
  const { token } = useAuth();
  const { showNotification } = useNotification();
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [metrics, setMetrics] = useState<Record<string, RealtimeMetric>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const subscriptionsRef = useRef<Map<string, MetricSubscription>>(new Map());

  // Initialize SignalR connection
  useEffect(() => {
    if (!token) return;

    const hubConnection = new HubConnectionBuilder()
      .withUrl(`${process.env.REACT_APP_API_URL}/hubs/metrics`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          if (retryContext.elapsedMilliseconds < 60000) {
            // Reconnect quickly in the first minute
            return Math.min(retryContext.previousRetryCount * 2000, 10000);
          } else {
            // Then slow down
            return 30000;
          }
        },
      })
      .configureLogging(LogLevel.Information)
      .build();

    // Connection event handlers
    hubConnection.onreconnecting(() => {
      setIsReconnecting(true);
      showNotification('Reconnecting to real-time metrics...', 'info');
    });

    hubConnection.onreconnected(() => {
      setIsReconnecting(false);
      setIsConnected(true);
      showNotification('Reconnected to real-time metrics', 'success');
      
      // Re-subscribe to all metrics
      subscriptionsRef.current.forEach((subscription) => {
        hubConnection.invoke('Subscribe', subscription);
      });
    });

    hubConnection.onclose(() => {
      setIsConnected(false);
      setIsReconnecting(false);
    });

    // Metric update handler
    hubConnection.on('MetricUpdate', (metric: RealtimeMetric) => {
      setMetrics(prev => ({
        ...prev,
        [metric.metric]: metric,
      }));

      if (options.onUpdate) {
        options.onUpdate([metric]);
      }
    });

    // Batch metric update handler
    hubConnection.on('MetricBatchUpdate', (batch: RealtimeMetric[]) => {
      const updates: Record<string, RealtimeMetric> = {};
      batch.forEach(metric => {
        updates[metric.metric] = metric;
      });

      setMetrics(prev => ({
        ...prev,
        ...updates,
      }));

      if (options.onUpdate) {
        options.onUpdate(batch);
      }
    });

    // Error handler
    hubConnection.on('Error', (error: { message: string; code: string }) => {
      console.error('SignalR error:', error);
      if (options.onError) {
        options.onError(new Error(error.message));
      }
    });

    setConnection(hubConnection);

    // Start connection
    hubConnection
      .start()
      .then(() => {
        setIsConnected(true);
        console.log('Connected to metrics hub');
      })
      .catch(err => {
        console.error('Failed to connect to metrics hub:', err);
        showNotification('Failed to connect to real-time metrics', 'error');
        if (options.onError) {
          options.onError(err);
        }
      });

    return () => {
      hubConnection.stop();
    };
  }, [token, showNotification, options]);

  // Subscribe to metrics
  useEffect(() => {
    if (!connection || !isConnected || options.metrics.length === 0) return;

    const subscription: MetricSubscription = {
      id: `sub_${Date.now()}`,
      metrics: options.metrics,
      filters: options.filters,
      aggregation: options.aggregation,
      interval: options.interval,
      callback: () => {}, // Handled by SignalR events
    };

    connection
      .invoke('Subscribe', subscription)
      .then(() => {
        subscriptionsRef.current.set(subscription.id, subscription);
        console.log('Subscribed to metrics:', options.metrics);
      })
      .catch(err => {
        console.error('Failed to subscribe to metrics:', err);
        if (options.onError) {
          options.onError(err);
        }
      });

    return () => {
      if (connection.state === 'Connected') {
        connection
          .invoke('Unsubscribe', subscription.id)
          .then(() => {
            subscriptionsRef.current.delete(subscription.id);
          })
          .catch(console.error);
      }
    };
  }, [connection, isConnected, options]);

  // Public methods
  const getMetric = useCallback((metricName: string): RealtimeMetric | undefined => {
    return metrics[metricName];
  }, [metrics]);

  const getAllMetrics = useCallback((): RealtimeMetric[] => {
    return Object.values(metrics);
  }, [metrics]);

  const getMetricHistory = useCallback(async (
    metricName: string,
    duration: number
  ): Promise<RealtimeMetric[]> => {
    if (!connection || connection.state !== 'Connected') {
      throw new Error('Not connected to metrics hub');
    }

    try {
      const history = await connection.invoke<RealtimeMetric[]>(
        'GetMetricHistory',
        metricName,
        duration
      );
      return history;
    } catch (error) {
      console.error('Failed to get metric history:', error);
      throw error;
    }
  }, [connection]);

  const sendCustomMetric = useCallback(async (
    metric: Omit<RealtimeMetric, 'id' | 'timestamp'>
  ): Promise<void> => {
    if (!connection || connection.state !== 'Connected') {
      throw new Error('Not connected to metrics hub');
    }

    try {
      await connection.invoke('SendMetric', metric);
    } catch (error) {
      console.error('Failed to send custom metric:', error);
      throw error;
    }
  }, [connection]);

  const queryMetrics = useCallback(async (
    query: string
  ): Promise<RealtimeMetric[]> => {
    if (!connection || connection.state !== 'Connected') {
      throw new Error('Not connected to metrics hub');
    }

    try {
      const results = await connection.invoke<RealtimeMetric[]>('QueryMetrics', query);
      return results;
    } catch (error) {
      console.error('Failed to query metrics:', error);
      throw error;
    }
  }, [connection]);

  return {
    // State
    metrics,
    isConnected,
    isReconnecting,
    
    // Methods
    getMetric,
    getAllMetrics,
    getMetricHistory,
    sendCustomMetric,
    queryMetrics,
  };
};

// Hook for tracking specific metric with history
export const useMetricTracker = (metricName: string, options?: {
  historySize?: number;
  updateInterval?: number;
}) => {
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const [history, setHistory] = useState<Array<{ timestamp: string; value: number }>>([]);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const historySize = options?.historySize || 100;

  const { getMetric } = useRealtimeMetrics({
    metrics: [metricName],
    interval: options?.updateInterval,
    onUpdate: (metrics) => {
      const metric = metrics.find(m => m.metric === metricName);
      if (metric) {
        setCurrentValue(metric.value);
        
        setHistory(prev => {
          const newHistory = [...prev, { timestamp: metric.timestamp, value: metric.value }];
          if (newHistory.length > historySize) {
            newHistory.shift();
          }
          
          // Calculate trend
          if (newHistory.length >= 2) {
            const recent = newHistory.slice(-10);
            const avgRecent = recent.reduce((sum, p) => sum + p.value, 0) / recent.length;
            const older = newHistory.slice(-20, -10);
            const avgOlder = older.length > 0 
              ? older.reduce((sum, p) => sum + p.value, 0) / older.length
              : avgRecent;
            
            if (avgRecent > avgOlder * 1.05) {
              setTrend('up');
            } else if (avgRecent < avgOlder * 0.95) {
              setTrend('down');
            } else {
              setTrend('stable');
            }
          }
          
          return newHistory;
        });
      }
    },
  });

  const getStats = useCallback(() => {
    if (history.length === 0) return null;

    const values = history.map(h => h.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const latest = values[values.length - 1];
    const previous = values[values.length - 2] || latest;
    const change = previous !== 0 ? ((latest - previous) / previous) * 100 : 0;

    return {
      min,
      max,
      avg,
      latest,
      change,
      count: values.length,
    };
  }, [history]);

  return {
    value: currentValue,
    history,
    trend,
    stats: getStats(),
  };
};