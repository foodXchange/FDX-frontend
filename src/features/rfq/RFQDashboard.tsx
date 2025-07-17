import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Button, Card, CardContent, Grid, Stack, IconButton, Divider, Alert, Avatar, Skeleton, Paper } from '@mui/material';
import { Edit as PencilIcon, Delete as TrashIcon,  } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { rfqService } from '../../services/rfqService';
import { RFQ, RFQStats } from '../../shared/types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatDistanceToNow } from 'date-fns';

export const RFQDashboard: React.FC = () => {
  const [stats, setStats] = useState<RFQStats | null>(null);
  const [recentRFQs, setRecentRFQs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, recentData] = await Promise.all([
          rfqService.getRFQStats(),
          rfqService.getRecentRFQs(5)
        ]);
        setStats(statsData);
        setRecentRFQs(recentData);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Active RFQs',
      value: stats?.activeRFQs || 0,
      icon: ClipboardDocumentListIcon,
      color: 'primary.main',
      trend: '+12%',
      description: 'Currently published RFQs'
    },
    {
      title: 'Pending Proposals',
      value: stats?.draftRFQs || 0,
      icon: ClockIcon,
      color: 'warning.main',
      trend: '+8%',
      description: 'Awaiting your review'
    },
    {
      title: 'Completed RFQs',
      value: stats?.closedRFQs || 0,
      icon: CheckCircleIcon,
      color: 'success.main',
      trend: '+15%',
      description: 'Successfully awarded'
    },
    {
      title: 'Urgent Actions',
      value: stats?.averageProposals || 0,
      icon: ExclamationTriangleIcon,
      color: 'error.main',
      trend: '-5%',
      description: 'Require immediate attention'
    }
  ];

  const handleDeleteRFQ = async (id: string) => {
    try {
      await rfqService.deleteRFQ(id);
      setRecentRFQs(prev => prev.filter(rfq => rfq.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Skeleton width={200} height={32} />
          <Skeleton width={120} height={40} />
        </Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map(i => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton width="100%" height={140} variant="rectangular" />
            </Grid>
          ))}
        </Grid>
        <Skeleton width="100%" height={400} variant="rectangular" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" icon={<ExclamationTriangleIcon />}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ color: 'grey.900', fontWeight: 'bold' }}>
            RFQ Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: 'grey.600' }}>
            Manage your requests for quotations
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/rfq/create"
          variant="contained"
          startIcon={<PlusIcon />}
          sx={{ borderRadius: 2 }}
        >
          Create RFQ
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: card.color, mr: 2 }}>
                        <card.icon sx={{ fontSize: 24 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'grey.500', fontWeight: 'medium' }}>
                          {card.title}
                        </Typography>
                        <Typography variant="h5" sx={{ color: 'grey.900', fontWeight: 'bold' }}>
                          {card.value}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArrowTrendingUpIcon sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} />
                      <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'medium' }}>
                        {card.trend}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'grey.600' }}>
                    {card.description}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Recent RFQs */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: 'grey.900' }}>
              Recent RFQs
            </Typography>
            <Button
              component={Link}
              to="/rfq"
              variant="text"
              sx={{ color: 'orange.500', '&:hover': { color: 'orange.600' } }}
            >
              View All
            </Button>
          </Box>
          <Stack divider={<Divider />} spacing={0}>
            {recentRFQs.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <ClipboardDocumentListIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'grey.900', mb: 1 }}>
                  No RFQs yet
                </Typography>
                <Typography variant="body2" sx={{ color: 'grey.600', mb: 3 }}>
                  Start by creating your first RFQ
                </Typography>
                <Button
                  component={Link}
                  to="/rfq/create"
                  variant="contained"
                  startIcon={<PlusIcon />}
                >
                  Create First RFQ
                </Button>
              </Box>
            ) : (
              recentRFQs.map((rfq) => (
                <motion.div
                  key={rfq.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ color: 'grey.900', mr: 2 }}>
                            {rfq.title}
                          </Typography>
                          <StatusBadge status={rfq.status} type="rfq" />
                        </Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'grey.500', 
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {rfq.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ color: 'grey.600' }}>
                            Category: {rfq.category}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'grey.400' }}>•</Typography>
                          <Typography variant="body2" sx={{ color: 'grey.600' }}>
                            Quantity: {rfq.quantity}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'grey.400' }}>•</Typography>
                          <Typography variant="body2" sx={{ color: 'grey.600' }}>
                            Created {formatDistanceToNow(new Date(rfq.createdAt))} ago
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          component={Link}
                          to={`/rfq/${rfq.id}`}
                          title="View RFQ"
                          size="small"
                        >
                          <EyeIcon />
                        </IconButton>
                        <IconButton
                          component={Link}
                          to={`/rfq/${rfq.id}/edit`}
                          title="Edit RFQ"
                          size="small"
                        >
                          <PencilIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteRFQ(rfq.id)}
                          title="Delete RFQ"
                          size="small"
                          color="error"
                        >
                          <TrashIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    {rfq.proposalCount > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', mr: 1 }} />
                        <Typography variant="body2" sx={{ color: 'success.main' }}>
                          {rfq.proposalCount} proposal{rfq.proposalCount !== 1 ? 's' : ''} received
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </motion.div>
              ))
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: 'grey.900', mb: 3 }}>
            Quick Actions
          </Typography>
          <Stack spacing={2}>
            <Paper 
              component={Link}
              to="/rfq/create"
              sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center', 
                textDecoration: 'none',
                bgcolor: 'grey.50',
                '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              <Avatar sx={{ bgcolor: 'orange.500', mr: 2 }}>
                <PlusIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ color: 'grey.900' }}>
                  Create New RFQ
                </Typography>
                <Typography variant="body2" sx={{ color: 'grey.500' }}>
                  Start a new request for quotation
                </Typography>
              </Box>
            </Paper>
            <Paper 
              component={Link}
              to="/rfq?status=pending"
              sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center', 
                textDecoration: 'none',
                bgcolor: 'grey.50',
                '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <ClockIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ color: 'grey.900' }}>
                  Review Proposals
                </Typography>
                <Typography variant="body2" sx={{ color: 'grey.500' }}>
                  Check pending proposal submissions
                </Typography>
              </Box>
            </Paper>
            <Paper 
              component={Link}
              to="/compliance"
              sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center', 
                textDecoration: 'none',
                bgcolor: 'grey.50',
                '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ color: 'grey.900' }}>
                  Compliance Check
                </Typography>
                <Typography variant="body2" sx={{ color: 'grey.500' }}>
                  Verify product compliance
                </Typography>
              </Box>
            </Paper>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};