import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProgressIndicator } from '../../components/ui/ProgressIndicator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Package,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Clock,
  Thermometer,
  Activity,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from 'lucide-react';
import { SampleTracker } from '../tracking';
import { OrderLinesTable } from '../orders';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';

interface DashboardMetric {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}

export const TrackingDashboard: React.FC = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // WebSocket integration for real-time metrics
  const {
    isConnected,
    metrics,
    aiInsights,
    connectionError,
    refreshMetrics,
    dismissAIInsight,
    executeAIInsightAction,
    lastUpdateTime
  } = useDashboardMetrics({ refreshInterval: 30000 });

  // Convert WebSocket metrics to display format
  const dashboardMetrics: DashboardMetric[] = [
    {
      title: 'Active Samples',
      value: metrics.activeSamples?.value || 12,
      change: metrics.activeSamples?.change || 20,
      changeType: metrics.activeSamples?.changeType || 'increase',
      icon: Package,
      color: 'text-blue-600',
      subtitle: 'In transit',
    },
    {
      title: 'Pending Orders',
      value: metrics.pendingOrders?.value || 24,
      change: metrics.pendingOrders?.change || -5,
      changeType: metrics.pendingOrders?.changeType || 'decrease',
      icon: Clock,
      color: 'text-yellow-600',
      subtitle: 'Awaiting fulfillment',
    },
    {
      title: 'Delivered Today',
      value: metrics.deliveredToday?.value || 8,
      change: metrics.deliveredToday?.change || 15,
      changeType: metrics.deliveredToday?.changeType || 'increase',
      icon: CheckCircle,
      color: 'text-green-600',
      subtitle: 'Successfully completed',
    },
    {
      title: 'Temperature Alerts',
      value: metrics.temperatureAlerts?.value || 3,
      change: metrics.temperatureAlerts?.change || 50,
      changeType: metrics.temperatureAlerts?.changeType || 'increase',
      icon: Thermometer,
      color: 'text-red-600',
      subtitle: 'Require attention',
    },
  ];

  const handleRefresh = async () => {
    refreshMetrics();
    setLastUpdate(new Date());
  };

  const getChangeIcon = (changeType?: 'increase' | 'decrease') => {
    if (!changeType) return null;
    return changeType === 'increase' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'success':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'info':
        return <Activity className="h-5 w-5 text-blue-600" />;
      default:
        return <Activity className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tracking Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time overview of samples and orders
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? "Live data" : "Offline"}
            </span>
            {connectionError && (
              <span className="text-sm text-red-600">
                ({connectionError})
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Last updated: {(lastUpdateTime || lastUpdate).toLocaleTimeString()}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                {metric.subtitle && (
                  <p className="text-xs text-muted-foreground">
                    {metric.subtitle}
                  </p>
                )}
                {metric.change !== undefined && (
                  <div
                    className={`flex items-center gap-1 text-xs mt-2 ${metric.changeType === 'increase' ? "text-green-600" : "text-red-600"}`}
                  >
                    {getChangeIcon(metric.changeType)}
                    <span>{Math.abs(metric.change)}%</span>
                    <span className="text-muted-foreground">from last week</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Insights Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              AI Insights & Recommendations
              {isConnected && (
                <Badge variant="success" className="ml-2">
                  Live
                </Badge>
              )}
            </CardTitle>
            {aiInsights.length > 0 && (
              <Badge variant="default">
                {aiInsights.length} insights
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiInsights.length > 0 ? (
              aiInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="flex items-start gap-3 p-4 rounded-lg border bg-muted/50"
                >
                  {getInsightIcon(insight.type)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">{insight.title}</h4>
                      <Badge 
                        variant={insight.priority === 'high' ? 'warning' : 'default'}
                        size="sm"
                      >
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                    {insight.timestamp && (
                      <p className="text-xs text-muted-foreground">
                        {insight.timestamp.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {insight.action && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => executeAIInsightAction(insight.id)}
                      >
                        {insight.action.label}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAIInsight(insight.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No insights available</p>
                <p className="text-xs">Check back for AI-powered recommendations</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="samples" className="space-y-4">
        <TabsList>
          <TabsTrigger value="samples">Active Samples</TabsTrigger>
          <TabsTrigger value="orders">Order Lines</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="samples" className="space-y-4">
          <SampleTracker />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <OrderLinesTable />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sample Conversion Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { product: 'Coffee Beans', rate: 85, samples: 20 },
                    { product: 'Wheat Flour', rate: 72, samples: 15 },
                    { product: 'Olive Oil', rate: 68, samples: 12 },
                    { product: 'Frozen Berries', rate: 45, samples: 8 },
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.product}</span>
                        <span className="text-muted-foreground">
                          {item.rate}% ({item.samples} samples)
                        </span>
                      </div>
                      <ProgressIndicator value={item.rate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">On-Time Delivery</p>
                      <p className="text-2xl font-bold text-green-600">
                        {metrics.onTimeDelivery?.value || '92%'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Avg. Transit Time</p>
                      <p className="text-2xl font-bold">
                        {metrics.avgTransitTime?.value || '3.2 days'}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Same Day</span>
                      <Badge variant="default">12%</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>1-2 Days</span>
                      <Badge variant="default">45%</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>3-5 Days</span>
                      <Badge variant="default">38%</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>&gt;5 Days</span>
                      <Badge variant="default">5%</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};