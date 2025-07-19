import { TypedWebSocket } from '../types/websocket';
import { useState, useEffect, useCallback } from 'react';
import { websocket } from '../services/websocket';
import { aiService } from '../services/ai/aiService';
import { demandForecastingService } from '../services/ai/predictions/demandForecastingService';
import { priceOptimizationService } from '../services/ai/predictions/priceOptimizationService';
import { supplierMatchingService } from '../services/ai/analytics/supplierMatchingService';
import { searchService } from '../services/ai/nlp/searchService';

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
  type: 'info' | 'warning' | 'success' | 'prediction';
  category?: 'demand' | 'pricing' | 'supplier' | 'compliance' | 'general';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  confidence?: number;
  validUntil?: string;
  action?: {
    label: string;
    actionType: string;
    actionData?: any;
  };
  data?: any;
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

  // Generate AI insights from current metrics
  const generateAIInsights = useCallback(async () => {
    try {
      const currentMetrics = {
        activeSamples: metrics.activeSamples?.value,
        pendingOrders: metrics.pendingOrders?.value,
        deliveredToday: metrics.deliveredToday?.value,
        temperatureAlerts: metrics.temperatureAlerts?.value,
        onTimeDelivery: metrics.onTimeDelivery?.value,
        avgTransitTime: metrics.avgTransitTime?.value,
        conversionRate: metrics.conversionRate?.value,
        urgentActions: metrics.urgentActions?.value,
      };

      const insights = await aiService.generateInsights(
        currentMetrics,
        'Dashboard metrics analysis for FoodXchange platform'
      );

      insights.forEach(insight => {
        handleAIInsightUpdate({
          ...insight,
          timestamp: new Date(),
        } as AIInsightUpdate);
      });
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
    }
  }, [metrics, handleAIInsightUpdate]);

  // Get demand forecast for a product
  const getDemandForecast = useCallback(async (productId: string, historicalOrders: any[]) => {
    try {
      const forecast = await demandForecastingService.forecastDemand(productId, historicalOrders);
      
      const insight: AIInsightUpdate = {
        id: `forecast-${productId}-${Date.now()}`,
        type: 'prediction',
        category: 'demand',
        title: `Demand Forecast for Product ${productId}`,
        description: `Predicted demand for next 7 days. Confidence: ${(forecast.confidence * 100).toFixed(1)}%`,
        priority: forecast.confidence > 0.8 ? 'high' : 'medium',
        timestamp: new Date(),
        confidence: forecast.confidence,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        data: forecast.prediction,
      };

      handleAIInsightUpdate(insight);
      return forecast;
    } catch (error) {
      console.error('Failed to get demand forecast:', error);
      return null;
    }
  }, [handleAIInsightUpdate]);

  // Get price optimization suggestion
  const getPriceOptimization = useCallback(async (
    productId: string,
    currentPrice: number,
    historicalData: any
  ) => {
    try {
      const optimization = await priceOptimizationService.optimizePrice(
        productId,
        currentPrice,
        historicalData
      );

      const priceChange = optimization.prediction.suggestedPrice - currentPrice;
      const changePercent = (priceChange / currentPrice * 100).toFixed(1);

      const insight: AIInsightUpdate = {
        id: `pricing-${productId}-${Date.now()}`,
        type: priceChange > 0 ? 'success' : 'info',
        category: 'pricing',
        title: `Price Optimization for Product ${productId}`,
        description: `Suggested price: $${optimization.prediction.suggestedPrice} (${parseFloat(changePercent) > 0 ? '+' : ''}${changePercent}%). Expected revenue impact: ${optimization.prediction.expectedRevenue > currentPrice ? '+' : ''}$${(optimization.prediction.expectedRevenue - currentPrice).toFixed(2)}`,
        priority: Math.abs(parseFloat(changePercent)) > 10 ? 'high' : 'medium',
        timestamp: new Date(),
        confidence: optimization.confidence,
        data: optimization.prediction,
        action: {
          label: 'Apply Price',
          actionType: 'update_price',
          actionData: {
            productId,
            newPrice: optimization.prediction.suggestedPrice,
          },
        },
      };

      handleAIInsightUpdate(insight);
      return optimization;
    } catch (error) {
      console.error('Failed to get price optimization:', error);
      return null;
    }
  }, [handleAIInsightUpdate]);

  // Find supplier matches
  const findSupplierMatches = useCallback(async (requirements: any, availableSuppliers: any[]) => {
    try {
      const matches = await supplierMatchingService.matchSuppliers(requirements, availableSuppliers);

      const topMatch = matches.prediction[0];
      if (topMatch) {
        const insight: AIInsightUpdate = {
          id: `supplier-match-${Date.now()}`,
          type: 'success',
          category: 'supplier',
          title: 'Supplier Match Found',
          description: `Found ${matches.prediction.length} matching suppliers. Top match: ${topMatch.supplierId} (${topMatch.score.toFixed(1)}% match)`,
          priority: topMatch.score > 85 ? 'high' : 'medium',
          timestamp: new Date(),
          confidence: matches.confidence,
          data: matches.prediction.slice(0, 5), // Top 5 matches
          action: {
            label: 'View Suppliers',
            actionType: 'view_suppliers',
            actionData: { matches: matches.prediction },
          },
        };

        handleAIInsightUpdate(insight);
      }

      return matches;
    } catch (error) {
      console.error('Failed to find supplier matches:', error);
      return null;
    }
  }, [handleAIInsightUpdate]);

  // Perform intelligent search
  const performIntelligentSearch = useCallback(async (query: string, filters?: any) => {
    try {
      const results = await searchService.search(query, filters);
      
      if (results.length > 0) {
        const insight: AIInsightUpdate = {
          id: `search-${Date.now()}`,
          type: 'info',
          category: 'general',
          title: 'Search Results Found',
          description: `Found ${results.length} relevant results for "${query}"`,
          priority: 'low',
          timestamp: new Date(),
          data: results.slice(0, 10), // Top 10 results
          action: {
            label: 'View Results',
            actionType: 'view_search_results',
            actionData: { query, results },
          },
        };

        handleAIInsightUpdate(insight);
      }

      return results;
    } catch (error) {
      console.error('Failed to perform intelligent search:', error);
      return [];
    }
  }, [handleAIInsightUpdate]);

  // Detect anomalies in recent data
  const detectAnomalies = useCallback(async (productId: string, recentOrders: any[]) => {
    try {
      const anomalies = await demandForecastingService.detectAnomalies(productId, recentOrders);
      
      if (anomalies.length > 0) {
        anomalies.forEach((anomaly: any) => {
          const insight: AIInsightUpdate = {
            id: `anomaly-${productId}-${Date.now()}-${Math.random()}`,
            type: 'warning',
            category: 'demand',
            title: 'Anomaly Detected',
            description: anomaly.description || 'Unusual pattern detected in recent orders',
            priority: anomaly.severity || 'medium',
            timestamp: new Date(),
            data: anomaly,
            action: {
              label: 'Investigate',
              actionType: 'investigate_anomaly',
              actionData: { productId, anomaly },
            },
          };

          handleAIInsightUpdate(insight);
        });
      }

      return anomalies;
    } catch (error) {
      console.error('Failed to detect anomalies:', error);
      return [];
    }
  }, [handleAIInsightUpdate]);

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
    // AI-powered features
    generateAIInsights,
    getDemandForecast,
    getPriceOptimization,
    findSupplierMatches,
    performIntelligentSearch,
    detectAnomalies,
    // Connection control
    connect: () => websocket.connect(),
    disconnect: () => websocket.disconnect(),
  };
};