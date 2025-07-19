import React from 'react';
import { motion } from 'framer-motion';
import { Box, Card, CardContent, Typography, Button, Stack, Grid, Avatar, CircularProgress, Paper } from '@mui/material';
import {  } from '@mui/icons-material';
import { ChartBarIcon } from '@heroicons/react/24/outline';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  onClick?: () => void;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color,
  onClick,
  delay = 0,
}) => {
  const colorMap = {
    blue: { primary: 'primary.main', secondary: 'primary.dark' },
    green: { primary: 'success.main', secondary: 'success.dark' },
    yellow: { primary: 'warning.main', secondary: 'warning.dark' },
    purple: { primary: 'secondary.main', secondary: 'secondary.dark' },
  };

  const isPositive = change && change > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      sx={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Card sx={{ height: '100%', boxShadow: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ color: 'grey.600', mb: 1 }}>
                {title}
              </Typography>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
              >
                <Typography variant="h4" sx={{ color: 'grey.900', fontWeight: 'bold' }}>
                  {value}
                </Typography>
              </motion.div>
              
              {change !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {isPositive ? (
                    <ArrowUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                  ) : (
                    <ArrowDownIcon sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
                  )}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 'medium',
                      color: isPositive ? 'success.main' : 'error.main',
                      mr: 1
                    }}
                  >
                    {Math.abs(change)}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.500' }}>
                    vs last month
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: `linear-gradient(135deg, ${colorMap[color].primary}, ${colorMap[color].secondary})`,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)'
                }
              }}
            >
              <Icon sx={{ color: 'white' }} />
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface ActivityItem {
  id: string;
  type: 'rfq' | 'order' | 'compliance' | 'supplier';
  title: string;
  description: string;
  time: string;
  status?: 'success' | 'warning' | 'error';
}

const ActivityFeed: React.FC<{ activities: ActivityItem[] }> = ({ activities }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'success.main';
      case 'warning':
        return 'warning.main';
      case 'error':
        return 'error.main';
      default:
        return 'grey.500';
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ color: 'grey.900' }}>
            Recent Activity
          </Typography>
          <BellIcon sx={{ fontSize: 20, color: 'grey.400' }} />
        </Box>
        
        <Stack spacing={3}>
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Box sx={{ display: 'flex', gap: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ mt: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 20, color: getStatusColor(activity.status) }} />
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: 'grey.900', fontWeight: 'medium' }}>
                    {activity.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.600', mt: 0.5 }}>
                    {activity.description}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'grey.400', mt: 0.5, display: 'block' }}>
                    {activity.time}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          ))}
        </Stack>
        
        <Button variant="text" sx={{ mt: 2, width: '100%' }}>
          View All Activity
        </Button>
      </CardContent>
    </Card>
  );
};

const ComplianceOverview: React.FC = () => {
  const complianceScore = 98;
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ color: 'grey.900', mb: 3 }}>
          Compliance Overview
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={complianceScore}
              size={80}
              thickness={4}
              sx={{ color: 'success.main' }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" component="div" sx={{ color: 'grey.900', fontWeight: 'bold' }}>
                {complianceScore}%
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: 'grey.600' }}>FDA Compliance</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'success.main' }}>100%</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: 'grey.600' }}>HACCP Standards</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'success.main' }}>98%</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: 'grey.600' }}>Organic Certification</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'warning.main' }}>95%</Typography>
          </Box>
        </Stack>
        
        <Button variant="outlined" sx={{ mt: 3, width: '100%' }}>
          View Compliance Report
        </Button>
      </CardContent>
    </Card>
  );
};

const QuickActions: React.FC = () => {
  const actions = [
    { label: 'Create RFQ', icon: DocumentDuplicateIcon, color: 'primary.main' },
    { label: 'Invite Supplier', icon: UserGroupIcon, color: 'success.main' },
    { label: 'Import Data', icon: ArrowTrendingUpIcon, color: 'secondary.main' },
    { label: 'Run Compliance Check', icon: CheckCircleIcon, color: 'warning.main' },
  ];

  return (
    <Card sx={{ backdropFilter: 'blur(10px)', bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ color: 'grey.900', mb: 3 }}>
          Quick Actions
        </Typography>
        
        <Grid container spacing={2}>
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Grid item xs={6} key={action.label}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outlined"
                    sx={{
                      height: 80,
                      width: '100%',
                      flexDirection: 'column',
                      gap: 1,
                      border: 1,
                      borderColor: 'grey.200',
                      bgcolor: 'grey.50',
                      '&:hover': {
                        bgcolor: 'grey.100',
                        borderColor: action.color
                      }
                    }}
                  >
                    <Avatar sx={{ bgcolor: action.color, width: 32, height: 32 }}>
                      <Icon sx={{ color: 'white', fontSize: 20 }} />
                    </Avatar>
                    <Typography variant="caption" sx={{ color: 'grey.700', textAlign: 'center' }}>
                      {action.label}
                    </Typography>
                  </Button>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};

export const EnhancedDashboard: React.FC = () => {
  const stats = [
    { title: 'Active RFQs', value: 12, change: 15, icon: DocumentDuplicateIcon, color: 'blue' as const },
    { title: 'Verified Suppliers', value: 85, change: 8, icon: UserGroupIcon, color: 'green' as const },
    { title: 'Pending Orders', value: 28, change: -5, icon: ChartBarIcon, color: 'yellow' as const },
    { title: 'Compliance Rate', value: '98%', icon: CheckCircleIcon, color: 'purple' as const },
  ];

  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'rfq',
      title: 'New RFQ Response',
      description: 'Global Foods Ltd. submitted a proposal for Organic Quinoa',
      time: '5 minutes ago',
      status: 'success',
    },
    {
      id: '2',
      type: 'compliance',
      title: 'Compliance Alert',
      description: 'Product specification update required for Almond Milk',
      time: '1 hour ago',
      status: 'warning',
    },
    {
      id: '3',
      type: 'order',
      title: 'Order Shipped',
      description: 'Order #12345 has been shipped via DHL Express',
      time: '3 hours ago',
      status: 'success',
    },
  ];

  return (
    <Stack spacing={4} sx={{ p: 3 }}>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Paper 
          sx={{ 
            p: 4, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 2
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
            Good morning! 👋
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Here's what's happening with your business today.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button 
              variant="contained" 
              sx={{ 
                bgcolor: 'warning.main',
                '&:hover': { bgcolor: 'warning.dark' },
                fontWeight: 'bold'
              }}
            >
              View Today's Opportunities
            </Button>
            <Button 
              variant="outlined" 
              sx={{ 
                borderColor: 'white',
                color: 'white',
                '&:hover': { 
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)' 
                }
              }}
            >
              Schedule Demo
            </Button>
          </Stack>
        </Paper>
      </motion.div>

      {/* Stats Grid */}
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <StatCard {...stat} delay={index * 0.1} />
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Stack spacing={4}>
            <ActivityFeed activities={activities} />
            <QuickActions />
          </Stack>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Stack spacing={4}>
            <ComplianceOverview />
            
            {/* Performance Chart Placeholder */}
            <Card sx={{ backdropFilter: 'blur(10px)', bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ color: 'grey.900', mb: 3 }}>
                  Performance Trends
                </Typography>
                <Box 
                  sx={{ 
                    height: 150,
                    bgcolor: 'grey.50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 2
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ChartBarIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                  </motion.div>
                </Box>
                <Typography variant="body2" sx={{ mt: 2, color: 'grey.600', textAlign: 'center' }}>
                  Chart visualization coming soon
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};