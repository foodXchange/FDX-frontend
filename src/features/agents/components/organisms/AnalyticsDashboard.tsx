import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Analytics,
  TrendingUp,
  TrendingDown,
  Visibility,
  Mouse,
  Timer,
  People,
  Assignment,
  ExitToApp,
  Error,
  Warning,
  CheckCircle,
  MoreVert,
  Refresh,
  Download,
  Settings,
  Timeline,
  Assessment,
  Speed,
  Person,
} from '@mui/icons-material';
import useAnalytics from '../../hooks/useAnalytics';

interface AnalyticsDashboardProps {
  showDebugInfo?: boolean;
  enableRealTimeUpdates?: boolean;
}

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  averageSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  topPages: Array<{ page: string; views: number }>;
  userJourneys: Array<{
    sessionId: string;
    events: number;
    duration: number;
    converted: boolean;
  }>;
  realTimeEvents: Array<{
    timestamp: number;
    event: string;
    page: string;
    userId?: string;
  }>;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  showDebugInfo = false,
  enableRealTimeUpdates = true,
}) => {
  const analytics = useAnalytics({
    enableAutoTracking: true,
    enableDebug: showDebugInfo,
  });

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    pageViews: 0,
    uniqueVisitors: 0,
    averageSessionDuration: 0,
    bounceRate: 0,
    conversionRate: 0,
    topPages: [],
    userJourneys: [],
    realTimeEvents: [],
  });

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [showRealTime, setShowRealTime] = useState(enableRealTimeUpdates);

  // Fetch analytics data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics/dashboard');
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      }
    };

    fetchData();
    
    // Set up real-time updates
    let interval: NodeJS.Timeout;
    if (showRealTime) {
      interval = setInterval(fetchData, 5000); // Update every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showRealTime]);

  const insights = analytics.getInsights();

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getEngagementLevel = (score: number): { level: string; color: string } => {
    if (score >= 80) return { level: 'High', color: 'success' };
    if (score >= 50) return { level: 'Medium', color: 'warning' };
    return { level: 'Low', color: 'error' };
  };

  const MetricCard = ({ 
    title, 
    value, 
    icon, 
    trend, 
    subtitle,
    color = 'primary' 
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: number;
    subtitle?: string;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box display="flex" flexDirection="column" alignItems="center">
            {React.cloneElement(icon as React.ReactElement, { 
              color, 
              sx: { fontSize: 40 } 
            })}
            {trend !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                {trend >= 0 ? (
                  <TrendingUp color="success" fontSize="small" />
                ) : (
                  <TrendingDown color="error" fontSize="small" />
                )}
                <Typography variant="caption" color={trend >= 0 ? 'success.main' : 'error.main'}>
                  {Math.abs(trend).toFixed(1)}%
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    handleMenuClose();
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Analytics fontSize="large" color="primary" />
          <Typography variant="h4">Analytics Dashboard</Typography>
          {showRealTime && (
            <Chip 
              label="Live" 
              color="success" 
              size="small" 
              icon={<Timeline />}
            />
          )}
        </Box>
        
        <Box>
          <IconButton onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => window.location.reload()}>
              <Refresh sx={{ mr: 1 }} />
              Refresh
            </MenuItem>
            <MenuItem onClick={exportData}>
              <Download sx={{ mr: 1 }} />
              Export Data
            </MenuItem>
            <MenuItem>
              <Settings sx={{ mr: 1 }} />
              Settings
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Current Session Info */}
      {analytics.currentJourney && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Person />
            <Typography variant="body2">
              Current session: {formatDuration(Date.now() - analytics.currentJourney.startTime)} • 
              {analytics.currentJourney.pages.length} pages • 
              {analytics.currentJourney.actions.length} actions
            </Typography>
            {insights && (
              <Chip 
                label={`${insights.engagementScore.toFixed(0)}% engaged`}
                size="small"
                color={getEngagementLevel(insights.engagementScore).color as any}
              />
            )}
          </Box>
        </Alert>
      )}

      {/* Key Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Page Views"
            value={analyticsData.pageViews.toLocaleString()}
            icon={<Visibility />}
            trend={12.5}
            subtitle="Today"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Unique Visitors"
            value={analyticsData.uniqueVisitors.toLocaleString()}
            icon={<People />}
            trend={8.3}
            subtitle="Today"
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Avg. Session"
            value={formatDuration(analyticsData.averageSessionDuration)}
            icon={<Timer />}
            trend={-2.1}
            subtitle="Duration"
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Conversion Rate"
            value={formatPercentage(analyticsData.conversionRate)}
            icon={<Assessment />}
            trend={15.7}
            subtitle="This week"
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Real-time Events */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Real-time Activity</Typography>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={showRealTime}
                      onChange={(e) => setShowRealTime(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Live updates"
                />
              </Box>
              
              <List dense>
                {analyticsData.realTimeEvents.slice(0, 10).map((event, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {event.event === 'page_view' && <Visibility fontSize="small" />}
                      {event.event === 'click' && <Mouse fontSize="small" />}
                      {event.event === 'conversion' && <CheckCircle fontSize="small" />}
                      {event.event === 'error' && <Error fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={event.event.replace('_', ' ')}
                      secondary={
                        <Box>
                          <Typography variant="caption">
                            {event.page} • {new Date(event.timestamp).toLocaleTimeString()}
                          </Typography>
                          {event.userId && (
                            <Typography variant="caption" display="block">
                              User: {event.userId}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Pages */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Pages
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Page</TableCell>
                      <TableCell align="right">Views</TableCell>
                      <TableCell align="right">%</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analyticsData.topPages.map((page, index) => (
                      <TableRow key={index}>
                        <TableCell>{page.page}</TableCell>
                        <TableCell align="right">{page.views}</TableCell>
                        <TableCell align="right">
                          {((page.views / analyticsData.pageViews) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* User Journeys */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent User Journeys
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Session ID</TableCell>
                      <TableCell align="right">Events</TableCell>
                      <TableCell align="right">Duration</TableCell>
                      <TableCell align="center">Converted</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analyticsData.userJourneys.map((journey, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {journey.sessionId.substring(0, 12)}...
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{journey.events}</TableCell>
                        <TableCell align="right">{formatDuration(journey.duration)}</TableCell>
                        <TableCell align="center">
                          {journey.converted ? (
                            <CheckCircle color="success" />
                          ) : (
                            <ExitToApp color="action" />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={journey.converted ? 'Converted' : 'Exited'}
                            color={journey.converted ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Debug Information */}
        {showDebugInfo && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Debug Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Analytics State</Typography>
                    <Box component="pre" sx={{ fontSize: '0.75rem', overflow: 'auto' }}>
                      {JSON.stringify({
                        sessionId: analytics.sessionId,
                        userId: analytics.userId,
                        isTracking: analytics.isTracking,
                        eventsQueued: analytics.eventsQueued,
                        lastFlush: new Date(analytics.lastFlush).toLocaleTimeString(),
                      }, null, 2)}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Current Insights</Typography>
                    <Box component="pre" sx={{ fontSize: '0.75rem', overflow: 'auto' }}>
                      {JSON.stringify(insights, null, 2)}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;