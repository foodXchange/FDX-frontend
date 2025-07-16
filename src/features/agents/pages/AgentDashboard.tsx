import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Badge,
  useTheme,
  useMediaQuery,
  Alert,
  Skeleton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  AttachMoney,
  Notifications,
  Phone,
  WhatsApp,
  Schedule,
  MoreVert,
  Add,
  Star,
  LocationOn,
  Business,
} from '@mui/icons-material';
import { useAgentStore } from '../store';
import { agentApi } from '../services';
import { AgentDashboardData, Lead, AgentNotification, AgentTask } from '../types';

const AgentDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    currentAgent,
    dashboardData,
    setDashboardData,
    notifications,
    unreadCount,
    tasks,
    addNotification,
    addTask,
    updateLastSync,
  } = useAgentStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time connection
    agentApi.connect(handleRealtimeMessage);
    
    // Set up periodic sync
    const syncInterval = setInterval(() => {
      updateLastSync();
    }, 30000); // 30 seconds

    return () => {
      clearInterval(syncInterval);
      agentApi.disconnect();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await agentApi.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRealtimeMessage = (data: any) => {
    switch (data.type) {
      case 'new_lead':
        addNotification({
          id: Date.now().toString(),
          agentId: currentAgent?.id || '',
          type: 'new_lead',
          title: 'New Lead Available',
          message: `New lead from ${data.lead.companyName}`,
          data: data.lead,
          isRead: false,
          priority: 'high',
          createdAt: new Date().toISOString(),
        });
        break;
      
      case 'commission_earned':
        addNotification({
          id: Date.now().toString(),
          agentId: currentAgent?.id || '',
          type: 'commission_earned',
          title: 'Commission Earned',
          message: `You earned $${data.amount} commission`,
          data: data.commission,
          isRead: false,
          priority: 'medium',
          createdAt: new Date().toISOString(),
        });
        break;
      
      case 'task_reminder':
        addTask(data.task);
        break;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'info';
      case 'contacted': return 'warning';
      case 'qualified': return 'success';
      case 'closed_won': return 'success';
      case 'closed_lost': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  if (isLoading && !dashboardData) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="rectangular" height={60} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={loadDashboardData}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  const metrics = dashboardData?.metrics;
  const recentLeads = dashboardData?.recentLeads || [];
  const recentCommissions = dashboardData?.commissions || [];
  const leaderboard = dashboardData?.leaderboard || [];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            Welcome back, {currentAgent?.firstName}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's your performance overview
          </Typography>
        </Box>
        <Badge badgeContent={unreadCount} color="error">
          <IconButton>
            <Notifications />
          </IconButton>
        </Badge>
      </Box>

      <Grid container spacing={3}>
        {/* Metrics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                  <People />
                </Avatar>
                <Typography variant="h6">Active Leads</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {metrics?.activeLeads || 0}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp color="success" sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +{metrics?.thisMonthLeads || 0} this month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.success.main, mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Typography variant="h6">Conversion Rate</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {formatPercentage(metrics?.conversionRate || 0)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(metrics?.conversionRate || 0) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.warning.main, mr: 2 }}>
                  <AttachMoney />
                </Avatar>
                <Typography variant="h6">This Month</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {formatCurrency(metrics?.thisMonthRevenue || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Revenue Generated
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.info.main, mr: 2 }}>
                  <Star />
                </Avatar>
                <Typography variant="h6">Rank</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                #{metrics?.rank || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Out of all agents
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Leads */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recent Leads</Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  size="small"
                  sx={{ textTransform: 'none' }}
                >
                  Add Lead
                </Button>
              </Box>
              
              {recentLeads.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">No leads yet</Typography>
                  <Button variant="contained" sx={{ mt: 2, textTransform: 'none' }}>
                    Get Started
                  </Button>
                </Box>
              ) : (
                <List>
                  {recentLeads.slice(0, 5).map((lead: Lead, index: number) => (
                    <React.Fragment key={lead.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                            <Business />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                {lead.companyName}
                              </Typography>
                              <Chip
                                label={lead.status}
                                size="small"
                                color={getStatusColor(lead.status) as any}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {lead.contactPerson} • {formatCurrency(lead.estimatedRevenue)}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                <LocationOn sx={{ fontSize: 14 }} />
                                <Typography variant="caption">
                                  {lead.location.city}, {lead.location.state}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small">
                              <Phone />
                            </IconButton>
                            <IconButton size="small">
                              <WhatsApp />
                            </IconButton>
                            <IconButton size="small">
                              <MoreVert />
                            </IconButton>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < recentLeads.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Tasks & Notifications */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Today's Tasks
              </Typography>
              
              {tasks.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  No tasks for today
                </Typography>
              ) : (
                <List dense>
                  {tasks.slice(0, 3).map((task: AgentTask) => (
                    <ListItem key={task.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.info.light }}>
                          <Schedule />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={task.title}
                        secondary={
                          <Chip
                            label={task.priority}
                            size="small"
                            color={getPriorityColor(task.priority) as any}
                          />
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Notifications
              </Typography>
              
              {notifications.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  No new notifications
                </Typography>
              ) : (
                <List dense>
                  {notifications.slice(0, 4).map((notification: AgentNotification) => (
                    <ListItem key={notification.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.warning.light }}>
                          <Notifications />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={notification.title}
                        secondary={notification.message}
                      />
                      {!notification.isRead && (
                        <Badge color="primary" variant="dot" />
                      )}
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Performance This Month
              </Typography>
              <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                  Chart component would go here
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Leaderboard */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Top Performers
              </Typography>
              
              {leaderboard.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  Leaderboard data not available
                </Typography>
              ) : (
                <List>
                  {leaderboard.slice(0, 5).map((agent, index) => (
                    <ListItem key={agent.agentId} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'grey.400',
                          color: 'white',
                          fontWeight: 600
                        }}>
                          {agent.rank}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={agent.agentName}
                        secondary={`${agent.metrics.leadsConverted} leads • ${formatCurrency(agent.metrics.revenue)}`}
                      />
                      <Chip
                        label={agent.tier}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AgentDashboard;