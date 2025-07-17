import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  IconButton,
  Grid,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  Stack,
  Alert,
  AlertTitle,
  Paper,
  Divider
} from '@mui/material';
import { TrendingUp, Refresh as RefreshCw, CheckCircle, Close } from '@mui/icons-material';
import { SampleTracker } from '../tracking';
import { OrderLinesTable } from '../orders';
// import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';

interface DashboardMetric {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ComponentType<any>;
  color: string;
  subtitle?: string;
}

export const TrackingDashboard: React.FC = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Mock data for now - WebSocket integration placeholder
  const isConnected = false;
  const metrics = {
    activeSamples: { value: 12, change: 20, changeType: 'increase' as const },
    pendingOrders: { value: 24, change: -5, changeType: 'decrease' as const },
    deliveredToday: { value: 8, change: 15, changeType: 'increase' as const },
    temperatureAlerts: { value: 3, change: 50, changeType: 'increase' as const },
    onTimeDelivery: { value: '92%' },
    avgTransitTime: { value: '3.2 days' }
  };
  const aiInsights: any[] = [];
  const connectionError: string | null = null;
  const refreshMetrics = () => {};
  const dismissAIInsight = (_id: string) => {};
  const executeAIInsightAction = (_id: string) => {};
  const lastUpdateTime = null;

  // Convert WebSocket metrics to display format
  const dashboardMetrics: DashboardMetric[] = [
    {
      title: 'Active Samples',
      value: metrics.activeSamples?.value || 12,
      change: metrics.activeSamples?.change || 20,
      changeType: metrics.activeSamples?.changeType || 'increase',
      icon: Package,
      color: 'primary',
      subtitle: 'In transit',
    },
    {
      title: 'Pending Orders',
      value: metrics.pendingOrders?.value || 24,
      change: metrics.pendingOrders?.change || -5,
      changeType: metrics.pendingOrders?.changeType || 'decrease',
      icon: Clock,
      color: 'warning',
      subtitle: 'Awaiting fulfillment',
    },
    {
      title: 'Delivered Today',
      value: metrics.deliveredToday?.value || 8,
      change: metrics.deliveredToday?.change || 15,
      changeType: metrics.deliveredToday?.changeType || 'increase',
      icon: CheckCircle,
      color: 'success',
      subtitle: 'Successfully completed',
    },
    {
      title: 'Temperature Alerts',
      value: metrics.temperatureAlerts?.value || 3,
      change: metrics.temperatureAlerts?.change || 50,
      changeType: metrics.temperatureAlerts?.changeType || 'increase',
      icon: Thermometer,
      color: 'error',
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
      <ArrowUp sx={{ fontSize: 16 }} />
    ) : (
      <ArrowDown sx={{ fontSize: 16 }} />
    );
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle sx={{ fontSize: 20, color: 'warning.main' }} />;
      case 'success':
        return <TrendingUp sx={{ fontSize: 20, color: 'success.main' }} />;
      case 'info':
        return <Activity sx={{ fontSize: 20, color: 'primary.main' }} />;
      default:
        return <Activity sx={{ fontSize: 20, color: 'primary.main' }} />;
    }
  };

  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Tracking Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time overview of samples and orders
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Connection Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: isConnected ? 'success.main' : 'error.main'
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {isConnected ? "Live data" : "Offline"}
            </Typography>
            {connectionError && (
              <Typography variant="caption" color="error">
                ({connectionError})
              </Typography>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary">
            Last updated: {(lastUpdateTime || lastUpdate).toLocaleTimeString()}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleRefresh}
            startIcon={<RefreshCw />}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {dashboardMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardHeader
                  title={metric.title}
                  titleTypographyProps={{ variant: 'body2' }}
                  avatar={<Icon color={metric.color as any} />}
                />
                <CardContent>
                  <Typography variant="h4" component="div">
                    {metric.value}
                  </Typography>
                  {metric.subtitle && (
                    <Typography variant="caption" color="text.secondary">
                      {metric.subtitle}
                    </Typography>
                  )}
                  {metric.change !== undefined && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mt: 1,
                        color: metric.changeType === 'increase' ? 'success.main' : 'error.main'
                      }}
                    >
                      {getChangeIcon(metric.changeType)}
                      <Typography variant="caption">
                        {Math.abs(metric.change)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        from last week
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* AI Insights Panel */}
      <Card>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Activity />
              <Typography variant="h6">AI Insights & Recommendations</Typography>
              {isConnected && (
                <Chip
                  label="Live"
                  color="success"
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          }
          action={
            aiInsights.length > 0 && (
              <Chip
                label={`${aiInsights.length} insights`}
                size="small"
              />
            )
          }
        />
        <CardContent>
          <Stack spacing={2}>
            {aiInsights.length > 0 ? (
              aiInsights.map((insight) => (
                <Alert
                  key={insight.id}
                  severity={insight.type === 'warning' ? 'warning' : insight.type === 'success' ? 'success' : 'info'}
                  icon={getInsightIcon(insight.type)}
                  action={
                    <Stack direction="row" spacing={1}>
                      {insight.action && (
                        <Button
                          size="small"
                          onClick={() => executeAIInsightAction(insight.id)}
                        >
                          {insight.action.label}
                        </Button>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => dismissAIInsight(insight.id)}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Stack>
                  }
                >
                  <AlertTitle>
                    {insight.title}
                    {insight.priority === 'high' && (
                      <Chip
                        label="High Priority"
                        color="warning"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </AlertTitle>
                  <Typography variant="body2">
                    {insight.description}
                  </Typography>
                  {insight.timestamp && (
                    <Typography variant="caption" color="text.secondary">
                      {insight.timestamp.toLocaleString()}
                    </Typography>
                  )}
                </Alert>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Activity sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
                <Typography color="text.secondary">
                  No insights available
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Check back for AI-powered recommendations
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab label="Active Samples" />
          <Tab label="Order Lines" />
          <Tab label="Analytics" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <SampleTracker />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <OrderLinesTable />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Sample Conversion Rates" />
                <CardContent>
                  <Stack spacing={3}>
                    {[
                      { product: 'Coffee Beans', rate: 85, samples: 20 },
                      { product: 'Wheat Flour', rate: 72, samples: 15 },
                      { product: 'Olive Oil', rate: 68, samples: 12 },
                      { product: 'Frozen Berries', rate: 45, samples: 8 },
                    ].map((item, index) => (
                      <Box key={index}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{item.product}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.rate}% ({item.samples} samples)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={item.rate}
                          sx={{ height: 8, borderRadius: 1 }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Delivery Performance" />
                <CardContent>
                  <Stack spacing={3}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          On-Time Delivery
                        </Typography>
                        <Typography variant="h4" color="success.main">
                          {metrics.onTimeDelivery?.value || '92%'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Avg. Transit Time
                        </Typography>
                        <Typography variant="h4">
                          {metrics.avgTransitTime?.value || '3.2 days'}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Divider />
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Same Day</Typography>
                        <Chip label="12%" size="small" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">1-2 Days</Typography>
                        <Chip label="45%" size="small" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">3-5 Days</Typography>
                        <Chip label="38%" size="small" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">&gt;5 Days</Typography>
                        <Chip label="5%" size="small" />
                      </Box>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};