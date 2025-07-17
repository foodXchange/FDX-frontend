import React from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  Avatar,
  Paper
} from '@mui/material';
import {  } from '@mui/icons-material';

interface StatCardData {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<any>;
  color: 'blue' | 'green' | 'orange' | 'teal' | 'purple' | 'red';
  description?: string;
}

interface RecentActivity {
  id: string;
  action: string;
  product: string;
  time: string;
  status: 'success' | 'pending' | 'warning';
}

interface DashboardCardsProps {
  stats?: StatCardData[];
  activities?: RecentActivity[];
  onViewAll?: (section: string) => void;
}

const defaultStats: StatCardData[] = [
  {
    title: 'Active RFQs',
    value: 12,
    change: '+2 this week',
    changeType: 'positive',
    icon: ClipboardDocumentListIcon,
    color: 'blue',
    description: 'Request for Quotations in progress'
  },
  {
    title: 'Verified Suppliers',
    value: 85,
    change: '+5 verified',
    changeType: 'positive',
    icon: BuildingStorefrontIcon,
    color: 'green',
    description: 'Certified food suppliers'
  },
  {
    title: 'Pending Orders',
    value: 28,
    change: '+8 pending',
    changeType: 'neutral',
    icon: ShoppingCartIcon,
    color: 'orange',
    description: 'Orders awaiting processing'
  },
  {
    title: 'Compliance Rate',
    value: '98%',
    change: 'All passed',
    changeType: 'positive',
    icon: ShieldCheckIcon,
    color: 'teal',
    description: 'Food safety compliance score'
  },
];

const defaultActivities: RecentActivity[] = [
  {
    id: '1',
    action: 'New RFQ submitted',
    product: 'Organic Cornflakes - 1000kg',
    time: '2 hours ago',
    status: 'success'
  },
  {
    id: '2',
    action: 'Supplier verified',
    product: 'Premium Foods Ltd',
    time: '4 hours ago',
    status: 'success'
  },
  {
    id: '3',
    action: 'Order shipped',
    product: 'Gluten-free Pasta - 500kg',
    time: '6 hours ago',
    status: 'success'
  },
  {
    id: '4',
    action: 'Compliance check',
    product: 'Almond Milk - Pending review',
    time: '8 hours ago',
    status: 'pending'
  },
  {
    id: '5',
    action: 'Payment processed',
    product: 'Quinoa Flour - $2,450',
    time: '1 day ago',
    status: 'success'
  },
];

const iconColorVariants = {
  blue: { color: 'primary.main', bgcolor: 'primary.light' },
  green: { color: 'success.main', bgcolor: 'success.light' },
  orange: { color: 'warning.main', bgcolor: 'warning.light' },
  teal: { color: 'info.main', bgcolor: 'info.light' },
  purple: { color: 'secondary.main', bgcolor: 'secondary.light' },
  red: { color: 'error.main', bgcolor: 'error.light' },
};

export function DashboardCards({ 
  stats = defaultStats, 
  activities = defaultActivities,
  onViewAll 
}: DashboardCardsProps) {
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const getStatusColor = (status: RecentActivity['status']) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'pending':
        return 'warning';
      case 'warning':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Stack spacing={3}>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper sx={{ p: 4, borderRadius: 2, background: 'linear-gradient(135deg, #1E4C8A 0%, #2E6BB8 100%)', color: 'white' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Welcome to FoodXchange
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
            Transform your global food sourcing with unified digital solutions
          </Typography>
          <Button
            variant="outlined"
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.1)', 
              color: 'white', 
              borderColor: 'rgba(255, 255, 255, 0.3)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                borderColor: 'rgba(255, 255, 255, 0.5)'
              }
            }}
            endIcon={<ArrowRightIcon />}
          >
            Get Started
          </Button>
        </Paper>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={3}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colorConfig = iconColorVariants[stat.color];
            return (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div variants={itemVariants}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ ...colorConfig, mr: 2 }}>
                          <Icon sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Typography variant="h6" sx={{ color: 'grey.600' }}>
                          {stat.title}
                        </Typography>
                      </Box>
                      
                      <Stack spacing={1}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'grey.800' }}>
                          {stat.value}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {stat.changeType === 'positive' && (
                            <ArrowTrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          )}
                          {stat.changeType === 'negative' && (
                            <ArrowTrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
                          )}
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: stat.changeType === 'positive' ? 'success.main' :
                                     stat.changeType === 'negative' ? 'error.main' :
                                     'grey.600'
                            }}
                          >
                            {stat.change}
                          </Typography>
                        </Box>
                      </Stack>
                      
                      {stat.description && (
                        <Typography variant="body2" sx={{ color: 'grey.700', mt: 1 }}>
                          {stat.description}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Recent Activity
              </Typography>
              <Button
                variant="text"
                size="small"
                onClick={() => onViewAll?.('activities')}
                endIcon={<ArrowRightIcon />}
              >
                View All
              </Button>
            </Box>
            
            <Stack spacing={2}>
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Box sx={{ 
                    bgcolor: 'grey.50', 
                    p: 2, 
                    borderRadius: 2, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        label={activity.status}
                        color={getStatusColor(activity.status) as any}
                        size="small"
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'grey.800' }}>
                          {activity.action}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'grey.600' }}>
                          {activity.product}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="caption" sx={{ color: 'grey.500' }}>
                      {activity.time}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </motion.div>
    </Stack>
  );
}