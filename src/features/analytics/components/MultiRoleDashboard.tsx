import React, { useState, useEffect, useMemo } from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent, CardHeader, Avatar, Chip, Button, Tab, Tabs, Badge, Stack, IconButton, Menu, Divider, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent, Tooltip, LinearProgress, Alert, useTheme, alpha, Skeleton,  } from '@mui/material';
import { Dashboard, ShoppingCart, Store, SwapHoriz, TrendingUp, Assignment, CheckCircle, Warning, Notifications, MoreVert, AttachMoney, VerifiedUser, EmojiEvents, WorkspacePremium, Groups, Inventory, Analytics, ChatBubble, CalendarToday, Flag,  } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../../hooks/useAuth';
import { useAnalytics } from '../hooks/useAnalytics';
import { UserRole } from '../types';
import { formatCurrency, formatNumber } from '../../../utils/format';

// Glassmorphism card style
const glassmorphCard = {
  background: (theme: any) => alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  borderRadius: 2,
  border: (theme: any) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: (theme: any) => `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: (theme: any) => `0 12px 48px 0 ${alpha(theme.palette.common.black, 0.15)}`,
  },
};

// Verification Badge Component
const VerificationBadge: React.FC<{ tier: 'bronze' | 'silver' | 'gold' }> = ({ tier }) => {
  const theme = useTheme();
  
  const config = {
    bronze: {
      color: '#CD7F32',
      icon: <WorkspacePremium />,
      label: 'Bronze Verified',
    },
    silver: {
      color: '#C0C0C0',
      icon: <WorkspacePremium />,
      label: 'Silver Verified',
    },
    gold: {
      color: '#FFD700',
      icon: <EmojiEvents />,
      label: 'Gold Verified',
    },
  };

  const { color, icon, label } = config[tier];

  return (
    <Tooltip title={label}>
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          <Avatar
            sx={{
              width: 24,
              height: 24,
              bgcolor: color,
              border: `2px solid ${theme.palette.background.paper}`,
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: 16 } })}
          </Avatar>
        }
      >
        <VerifiedUser sx={{ color }} />
      </Badge>
    </Tooltip>
  );
};

// Activity Feed Item
const ActivityFeedItem: React.FC<{
  activity: {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    severity: 'info' | 'success' | 'warning' | 'error';
    icon?: React.ReactNode;
  };
}> = ({ activity }) => {
  const theme = useTheme();
  
  const severityColors = {
    info: theme.palette.info.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
  };

  return (
    <TimelineItem>
      <TimelineOppositeContent sx={{ flex: 0.3 }} color="text.secondary">
        <Typography variant="caption">
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </Typography>
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot sx={{ bgcolor: severityColors[activity.severity] }}>
          {activity.icon || <Flag />}
        </TimelineDot>
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent>
        <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(severityColors[activity.severity], 0.05) }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {activity.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activity.description}
          </Typography>
        </Paper>
      </TimelineContent>
    </TimelineItem>
  );
};

// Role-specific Dashboard Components
const BuyerDashboard: React.FC = () => {
  const theme = useTheme();
  
  const metrics = [
    { label: 'Active Orders', value: 24, change: 12, icon: <ShoppingCart /> },
    { label: 'Pending Approvals', value: 7, change: -3, icon: <Assignment /> },
    { label: 'Total Spend MTD', value: 128500, change: 8.5, icon: <AttachMoney />, format: 'currency' },
    { label: 'Suppliers', value: 42, change: 2, icon: <Store /> },
  ];

  const recentOrders = [
    { id: 'ORD-001', supplier: 'Fresh Farms Ltd', amount: 12500, status: 'pending', dueDate: '2024-01-20' },
    { id: 'ORD-002', supplier: 'Ocean Harvest Co', amount: 8900, status: 'confirmed', dueDate: '2024-01-22' },
    { id: 'ORD-003', supplier: 'Green Valley Dairy', amount: 15600, status: 'delivered', dueDate: '2024-01-19' },
  ];

  return (
    <Grid container spacing={3}>
      {/* Metrics */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {metrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card sx={glassmorphCard}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography color="text.secondary" gutterBottom variant="caption">
                          {metric.label}
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                          {metric.format === 'currency' 
                            ? formatCurrency(metric.value as number)
                            : formatNumber(metric.value as number)
                          }
                        </Typography>
                        <Box display="flex" alignItems="center" mt={1}>
                          <TrendingUp 
                            sx={{ 
                              fontSize: 16, 
                              color: metric.change > 0 ? 'success.main' : 'error.main' 
                            }} 
                          />
                          <Typography 
                            variant="caption" 
                            color={metric.change > 0 ? 'success.main' : 'error.main'}
                            ml={0.5}
                          >
                            {Math.abs(metric.change)}%
                          </Typography>
                        </Box>
                      </Box>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                        {metric.icon}
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Recent Orders */}
      <Grid item xs={12} md={8}>
        <Card sx={glassmorphCard}>
          <CardHeader
            title="Recent Orders"
            action={
              <Button size="small" endIcon={<MoreVert />}>
                View All
              </Button>
            }
          />
          <CardContent>
            <List>
              {recentOrders.map((order, index) => (
                <ListItem key={order.id} divider={index < recentOrders.length - 1}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <ShoppingCart />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={order.id}
                    secondary={order.supplier}
                  />
                  <Box textAlign="right" mr={2}>
                    <Typography variant="subtitle2">
                      {formatCurrency(order.amount)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Due: {order.dueDate}
                    </Typography>
                  </Box>
                  <ListItemSecondaryAction>
                    <Chip
                      label={order.status}
                      size="small"
                      color={
                        order.status === 'delivered' ? 'success' :
                        order.status === 'confirmed' ? 'info' : 'warning'
                      }
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Quick Actions */}
      <Grid item xs={12} md={4}>
        <Card sx={glassmorphCard}>
          <CardHeader title="Quick Actions" />
          <CardContent>
            <Stack spacing={2}>
              <Button fullWidth variant="contained" startIcon={<ShoppingCart />}>
                Create New Order
              </Button>
              <Button fullWidth variant="outlined" startIcon={<Store />}>
                Browse Suppliers
              </Button>
              <Button fullWidth variant="outlined" startIcon={<Assignment />}>
                View RFQs
              </Button>
              <Button fullWidth variant="outlined" startIcon={<Analytics />}>
                Generate Report
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

const SupplierDashboard: React.FC = () => {
  const theme = useTheme();
  
  const metrics = [
    { label: 'Active Listings', value: 156, change: 5, icon: <Inventory /> },
    { label: 'Orders This Month', value: 89, change: 15, icon: <Assignment /> },
    { label: 'Revenue MTD', value: 235600, change: 12.3, icon: <AttachMoney />, format: 'currency' },
    { label: 'Performance Score', value: 92, change: 3, icon: <Speed /> },
  ];

  const pendingOrders = [
    { id: 'ORD-101', buyer: 'Metro Foods Inc', amount: 18500, products: 12, status: 'pending' },
    { id: 'ORD-102', buyer: 'City Restaurants', amount: 9200, products: 8, status: 'pending' },
    { id: 'ORD-103', buyer: 'Fresh Market Chain', amount: 25600, products: 15, status: 'review' },
  ];

  return (
    <Grid container spacing={3}>
      {/* Verification Status */}
      <Grid item xs={12}>
        <Alert 
          severity="success" 
          icon={<VerificationBadge tier="gold" />}
          action={
            <Button color="inherit" size="small">
              Upgrade
            </Button>
          }
        >
          Gold Tier Supplier - Your products receive priority placement and enhanced visibility
        </Alert>
      </Grid>

      {/* Metrics */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {metrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card sx={glassmorphCard}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography color="text.secondary" gutterBottom variant="caption">
                          {metric.label}
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                          {metric.format === 'currency' 
                            ? formatCurrency(metric.value as number)
                            : formatNumber(metric.value as number)
                          }
                        </Typography>
                        <Box display="flex" alignItems="center" mt={1}>
                          <TrendingUp 
                            sx={{ 
                              fontSize: 16, 
                              color: metric.change > 0 ? 'success.main' : 'error.main' 
                            }} 
                          />
                          <Typography 
                            variant="caption" 
                            color={metric.change > 0 ? 'success.main' : 'error.main'}
                            ml={0.5}
                          >
                            {Math.abs(metric.change)}%
                          </Typography>
                        </Box>
                      </Box>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                        {metric.icon}
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Pending Orders */}
      <Grid item xs={12} md={7}>
        <Card sx={glassmorphCard}>
          <CardHeader
            title="Pending Orders"
            subheader="Requires your action"
            action={
              <IconButton>
                <MoreVert />
              </IconButton>
            }
          />
          <CardContent>
            <Stack spacing={2}>
              {pendingOrders.map((order) => (
                <Paper
                  key={order.id}
                  sx={{
                    p: 2,
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                    bgcolor: alpha(theme.palette.warning.main, 0.05),
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {order.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.buyer} • {order.products} products
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="h6" color="primary">
                        {formatCurrency(order.amount)}
                      </Typography>
                      <Box mt={1}>
                        <Button size="small" variant="contained" sx={{ mr: 1 }}>
                          Accept
                        </Button>
                        <Button size="small" variant="outlined">
                          Review
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Performance Overview */}
      <Grid item xs={12} md={5}>
        <Card sx={glassmorphCard}>
          <CardHeader title="Performance Overview" />
          <CardContent>
            <Stack spacing={3}>
              {[
                { label: 'On-time Delivery', value: 98, color: 'success' },
                { label: 'Order Accuracy', value: 99.5, color: 'success' },
                { label: 'Response Time', value: 85, color: 'warning' },
                { label: 'Customer Satisfaction', value: 94, color: 'info' },
              ].map((metric) => (
                <Box key={metric.label}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">{metric.label}</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {metric.value}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={metric.value} 
                    color={metric.color as any}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

const BrokerDashboard: React.FC = () => {
  const theme = useTheme();
  
  const metrics = [
    { label: 'Active Deals', value: 18, change: 20, icon: <SwapHoriz /> },
    { label: 'Commission MTD', value: 45600, change: 25, icon: <AttachMoney />, format: 'currency' },
    { label: 'Connected Parties', value: 124, change: 5, icon: <Groups /> },
    { label: 'Success Rate', value: 78, change: 8, icon: <CheckCircle /> },
  ];

  const activeDeals = [
    { 
      id: 'DEAL-001', 
      buyer: 'Global Foods Ltd', 
      supplier: 'Farm Fresh Co', 
      value: 125000, 
      commission: 3750,
      status: 'negotiation',
      progress: 65
    },
    { 
      id: 'DEAL-002', 
      buyer: 'City Markets', 
      supplier: 'Ocean Traders', 
      value: 89000, 
      commission: 2670,
      status: 'contract',
      progress: 85
    },
  ];

  return (
    <Grid container spacing={3}>
      {/* Metrics */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {metrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card sx={glassmorphCard}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography color="text.secondary" gutterBottom variant="caption">
                          {metric.label}
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                          {metric.format === 'currency' 
                            ? formatCurrency(metric.value as number)
                            : formatNumber(metric.value as number)
                          }
                        </Typography>
                        <Box display="flex" alignItems="center" mt={1}>
                          <TrendingUp 
                            sx={{ 
                              fontSize: 16, 
                              color: metric.change > 0 ? 'success.main' : 'error.main' 
                            }} 
                          />
                          <Typography 
                            variant="caption" 
                            color={metric.change > 0 ? 'success.main' : 'error.main'}
                            ml={0.5}
                          >
                            {Math.abs(metric.change)}%
                          </Typography>
                        </Box>
                      </Box>
                      <Avatar sx={{ bgcolor: alpha('#FF9800', 0.1) }}>
                        {metric.icon}
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Active Deals */}
      <Grid item xs={12}>
        <Card sx={glassmorphCard}>
          <CardHeader
            title="Active Deals"
            subheader="Currently managing"
            action={
              <Button size="small" variant="contained" startIcon={<SwapHoriz />}>
                New Deal
              </Button>
            }
          />
          <CardContent>
            <Stack spacing={3}>
              {activeDeals.map((deal) => (
                <Paper key={deal.id} sx={{ p: 3, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {deal.id}
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Chip label={deal.buyer} size="small" />
                        <SwapHoriz color="action" />
                        <Chip label={deal.supplier} size="small" />
                      </Stack>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="h5" color="primary">
                        {formatCurrency(deal.value)}
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        Commission: {formatCurrency(deal.commission)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Deal Progress</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {deal.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={deal.progress} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip 
                      label={deal.status} 
                      size="small" 
                      color={deal.status === 'contract' ? 'success' : 'warning'}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button size="small" startIcon={<ChatBubble />}>
                        Messages
                      </Button>
                      <Button size="small" variant="contained">
                        View Details
                      </Button>
                    </Stack>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Main Multi-Role Dashboard Component
export const MultiRoleDashboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'buyer');
  const [activityMenuAnchor, setActivityMenuAnchor] = useState<null | HTMLElement>(null);

  const { 
    metrics, 
    insights, 
    isLoading,
    refreshData 
  } = useAnalytics({
    dashboardId: `${selectedRole}_dashboard`,
    autoRefresh: true,
    refreshInterval: 30000,
    enableInsights: true,
  });

  // Mock activity feed data
  const activities = [
    {
      id: '1',
      type: 'order',
      title: 'New Order Received',
      description: 'Order #ORD-2024-001 from Metro Foods Inc',
      timestamp: new Date().toISOString(),
      severity: 'info' as const,
      icon: <ShoppingCart />,
    },
    {
      id: '2',
      type: 'compliance',
      title: 'Certification Expiring Soon',
      description: 'HACCP certification expires in 15 days',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      severity: 'warning' as const,
      icon: <Warning />,
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Performance Milestone',
      description: 'Achieved 98% on-time delivery rate',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      severity: 'success' as const,
      icon: <EmojiEvents />,
    },
  ];

  const renderDashboard = () => {
    switch (selectedRole) {
      case 'buyer':
        return <BuyerDashboard />;
      case 'supplier':
        return <SupplierDashboard />;
      case 'broker':
        return <BrokerDashboard />;
      default:
        return <BuyerDashboard />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back, {user?.name || 'User'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Badge badgeContent={3} color="error">
            <IconButton onClick={(e) => setActivityMenuAnchor(e.currentTarget)}>
              <Notifications />
            </IconButton>
          </Badge>
          <Button variant="outlined" startIcon={<CalendarToday />}>
            Schedule
          </Button>
          <Button variant="contained" startIcon={<Analytics />}>
            Analytics
          </Button>
        </Stack>
      </Box>

      {/* Role Tabs */}
      {user?.role === 'admin' && (
        <Paper sx={{ ...glassmorphCard, mb: 3 }}>
          <Tabs
            value={selectedRole}
            onChange={(_, value) => setSelectedRole(value)}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab value="buyer" label="Buyer View" icon={<ShoppingCart />} iconPosition="start" />
            <Tab value="supplier" label="Supplier View" icon={<Store />} iconPosition="start" />
            <Tab value="broker" label="Broker View" icon={<SwapHoriz />} iconPosition="start" />
          </Tabs>
        </Paper>
      )}

      {/* Main Content */}
      {isLoading ? (
        <Grid container spacing={3}>
          {[...Array(4)].map((_, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRole}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderDashboard()}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Activity Feed Menu */}
      <Menu
        anchorEl={activityMenuAnchor}
        open={Boolean(activityMenuAnchor)}
        onClose={() => setActivityMenuAnchor(null)}
        PaperProps={{
          sx: {
            ...glassmorphCard,
            width: 400,
            maxHeight: 600,
          },
        }}
      >
        <Box p={2}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <Timeline>
            {activities.map((activity) => (
              <ActivityFeedItem key={activity.id} activity={activity} />
            ))}
          </Timeline>
          <Divider sx={{ my: 2 }} />
          <Button fullWidth>View All Activities</Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default MultiRoleDashboard;