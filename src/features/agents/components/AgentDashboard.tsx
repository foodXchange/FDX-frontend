import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useAgentStore } from '../store/useAgentStore';
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Avatar,
  Button,
  Stack,
  Paper,
} from '@mui/material';
import {
  AttachMoney as CurrencyDollarIcon,
  Work as BriefcaseIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as ArrowUpIcon,
  TrendingDown as ArrowDownIcon,
  Schedule as ClockIcon,
  BarChart as ChartBarIcon
} from '@mui/icons-material';
import { formatCurrency } from '@/utils/format';
import { PerformanceBadge } from './PerformanceBadge';
import { Lead } from '../types';

export const AgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    currentAgent: agent, 
    leads
  } = useAgentStore();

  const [todayEarnings] = useState(0);
  const [animatedEarnings, setAnimatedEarnings] = useState(0);

  // Mock data - replace with actual API calls
  const mockEarnings = {
    today: 345.50,
    thisWeek: 1250.00,
    thisMonth: 4580.00,
    pending: 890.00,
    lifetime: 45200.00,
    recentTransactions: [],
    totalEarnings: 45200.00,
    monthlyEarnings: 4580.00,
    pendingCommissions: 890.00,
    projectedEarnings: 5200.00,
    conversionRate: 0.68
  };

  const mockPerformance = {
    leadsGenerated: 85,
    leadsConverted: 58,
    revenue: 725000,
    commissionEarned: 18125,
    activeDays: 30,
    conversionRate: 0.68,
    averageDealSize: 12500,
    rank: 12
  };

  // Animate earnings ticker
  useEffect(() => {
    if (mockEarnings.today) {
      const duration = 2000;
      const steps = 60;
      const stepValue = mockEarnings.today / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        setAnimatedEarnings(prev => Math.min(prev + stepValue, mockEarnings.today));
        
        if (currentStep >= steps) {
          clearInterval(interval);
          setAnimatedEarnings(mockEarnings.today);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [mockEarnings.today]);

  const urgentLeads = leads.filter((lead: Lead) => lead.priority === 'urgent');
  const expiringLeads = leads.filter((lead: Lead) => {
    const hoursUntilExpiry = (new Date(lead.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursUntilExpiry < 2 && hoursUntilExpiry > 0;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Hero Section */}
        <Card sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #ed6c02 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Box sx={{ mb: { xs: 3, lg: 0 } }}>
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
                      Welcome back, {user?.name}!
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Here's your performance overview for today
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, lg: 6 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
                    {/* Earnings Ticker */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Paper sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 2,
                        p: 2,
                        color: 'white',
                        minWidth: 160
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            Today's Earnings
                          </Typography>
                          <CurrencyDollarIcon sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.6)' }} />
                        </Box>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
                          {formatCurrency(animatedEarnings)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {mockEarnings.today > todayEarnings ? (
                            <>
                              <ArrowUpIcon sx={{ fontSize: 16, color: '#4caf50', mr: 0.5 }} />
                              <Typography variant="body2" sx={{ color: '#4caf50' }}>+12% from yesterday</Typography>
                            </>
                          ) : (
                            <>
                              <ArrowDownIcon sx={{ fontSize: 16, color: '#f44336', mr: 0.5 }} />
                              <Typography variant="body2" sx={{ color: '#f44336' }}>-5% from yesterday</Typography>
                            </>
                          )}
                        </Box>
                      </Paper>
                    </motion.div>

                    {/* Active Leads */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Paper sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 2,
                        p: 2,
                        color: 'white',
                        minWidth: 160
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            Active Leads
                          </Typography>
                          <BriefcaseIcon sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.6)' }} />
                        </Box>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
                          {agent?.activeLeads || 0}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ClockIcon sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', mr: 0.5 }} />
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            {expiringLeads.length} expiring soon
                          </Typography>
                        </Box>
                      </Paper>
                    </motion.div>

                    {/* Performance Tier */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Paper sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 2,
                        p: 2,
                        color: 'white',
                        minWidth: 160
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            Your Tier
                          </Typography>
                          <TrophyIcon sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.6)' }} />
                        </Box>
                        <PerformanceBadge tier={agent?.tier || 'bronze'} size="large" />
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <ChartBarIcon sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', mr: 0.5 }} />
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            Rank #{mockPerformance.rank || '-'}
                          </Typography>
                        </Box>
                      </Paper>
                    </motion.div>
                  </Stack>
                </Grid>
              </Grid>

              {/* Quick Actions */}
              <Box sx={{ mt: 3 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      color="inherit"
                      sx={{ 
                        backgroundColor: 'white',
                        color: 'primary.main',
                        fontWeight: 'bold',
                        '&:hover': { backgroundColor: 'grey.100' },
                        borderRadius: 2,
                        px: 3,
                        py: 1.5
                      }}
                      onClick={() => window.location.href = '/agent/leads'}
                    >
                      View Available Leads ({leads.length})
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outlined"
                      sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        fontWeight: 'bold',
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' },
                        borderRadius: 2,
                        px: 3,
                        py: 1.5
                      }}
                      onClick={() => window.location.href = '/agent/earnings'}
                    >
                      Track Commissions
                    </Button>
                  </motion.div>
                </Stack>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                    <CurrencyDollarIcon sx={{ color: 'success.main' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Commission Earnings
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(mockEarnings.thisMonth || 0)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ArrowUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                  <Typography variant="body2" color="success.main">
                    +18% from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                    <BriefcaseIcon sx={{ color: 'primary.main' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Active Opportunities
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                      {agent?.activeLeads || 0}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ClockIcon sx={{ fontSize: 16, color: 'warning.main', mr: 0.5 }} />
                  <Typography variant="body2" color="warning.main">
                    {urgentLeads.length} urgent
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.light', mr: 2 }}>
                    <ChartBarIcon sx={{ color: 'secondary.main' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Conversion Rate
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                      {((mockPerformance.conversionRate || 0) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(mockPerformance.conversionRate || 0) * 100}
                  sx={{ 
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'secondary.main'
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                    <TrophyIcon sx={{ color: 'warning.main' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Performance Rank
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                      #{mockPerformance.rank || '-'}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PerformanceBadge tier={agent?.tier || 'bronze'} size="small" />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1, textTransform: 'capitalize' }}>
                    {agent?.tier || 'bronze'} tier
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts and Data */}
        <Grid container spacing={3}>
          {/* Earnings Chart */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                    Earnings Overview
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip label="7D" variant="filled" color="primary" size="small" />
                    <Chip label="30D" variant="outlined" size="small" />
                    <Chip label="90D" variant="outlined" size="small" />
                  </Stack>
                </Box>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Earnings Chart Component
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Recent Activity
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Avatar sx={{ bgcolor: 'primary.light', mr: 2, width: 32, height: 32 }}>
                      <BriefcaseIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        New lead assigned: Premium Restaurant Chain
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        2 hours ago
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Avatar sx={{ bgcolor: 'success.light', mr: 2, width: 32, height: 32 }}>
                      <CurrencyDollarIcon sx={{ fontSize: 16, color: 'success.main' }} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        Commission earned: $1,250
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        5 hours ago
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Avatar sx={{ bgcolor: 'secondary.light', mr: 2, width: 32, height: 32 }}>
                      <TrophyIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        Achieved Gold tier status
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        1 day ago
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
};

export default AgentDashboard;