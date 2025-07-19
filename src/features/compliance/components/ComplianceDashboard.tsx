import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Stack,
  Chip,
  Paper,
  Modal,
  IconButton,
  Alert,
  AlertTitle
} from '@mui/material';

interface ComplianceStats {
  totalValidations: number;
  passedValidations: number;
  failedValidations: number;
  averageScore: number;
  criticalIssues: number;
  pendingFixes: number;
}

interface RecentValidation {
  id: string;
  productName: string;
  productType: string;
  score: number;
  status: 'passed' | 'failed';
  timestamp: Date;
  criticalErrors: number;
}

export const ComplianceDashboard: React.FC = () => {
  const [stats, setStats] = useState<ComplianceStats>({
    totalValidations: 0,
    passedValidations: 0,
    failedValidations: 0,
    averageScore: 0,
    criticalIssues: 0,
    pendingFixes: 0
  });

  const [recentValidations, setRecentValidations] = useState<RecentValidation[]>([]);
  const [selectedRFQ, setSelectedRFQ] = useState<string | null>(null);

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        fetch('/api/compliance/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/compliance/history?limit=10', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats || {
          totalValidations: 47,
          passedValidations: 38,
          failedValidations: 9,
          averageScore: 82,
          criticalIssues: 3,
          pendingFixes: 5
        });
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setRecentValidations(historyData.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch compliance data:', error);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, subtext }: any) => (
    <Card>
      <CardHeader
        avatar={<Avatar sx={{ bgcolor: color }}><Icon /></Avatar>}
        title={title}
        subheader={subtext}
        titleTypographyProps={{ variant: 'body2' }}
      />
      <CardContent>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Compliance Center
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor and validate product specifications to prevent costly errors
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={DocumentCheckIcon}
              title="Total Validations"
              value={stats.totalValidations}
              color="primary.main"
              subtext="All time"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={CheckCircleIcon}
              title="Pass Rate"
              value={`${stats.passedValidations > 0 ? Math.round((stats.passedValidations / stats.totalValidations) * 100) : 0}%`}
              color="success.main"
              subtext={`${stats.passedValidations} passed`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={ChartBarIcon}
              title="Average Score"
              value={stats.averageScore}
              color="info.main"
              subtext="Out of 100"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={ExclamationTriangleIcon}
              title="Critical Issues"
              value={stats.criticalIssues}
              color="error.main"
              subtext={`${stats.pendingFixes} pending`}
            />
          </Grid>
        </Grid>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Recent Validations */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardHeader title="Recent Validations" />
              <CardContent sx={{ p: 0 }}>
                {recentValidations.length === 0 ? (
                  <Box sx={{ p: 6, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      No validations yet. Create an RFQ and validate specifications.
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {recentValidations.map((validation, index) => (
                      <React.Fragment key={validation.id}>
                        <ListItem
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                          onClick={() => setSelectedRFQ(validation.id)}
                        >
                          <ListItemIcon>
                            {validation.status === 'passed' ? (
                              <CheckCircleIcon color="success" />
                            ) : (
                              <XCircleIcon color="error" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={validation.productName}
                            secondary={`${validation.productType} • ${new Date(validation.timestamp).toLocaleDateString()}`}
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" component="div">
                                {validation.score}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Score
                              </Typography>
                            </Box>
                            {validation.criticalErrors > 0 && (
                              <Chip
                                icon={<ExclamationTriangleIcon />}
                                label={`${validation.criticalErrors} critical errors`}
                                color="error"
                                size="small"
                              />
                            )}
                          </Box>
                        </ListItem>
                        {index < recentValidations.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Color Rules Card */}
              <Card>
                <CardHeader title="Product Color Rules" />
                <CardContent>
                  <Stack spacing={2}>
                    <Alert severity="success" sx={{ borderLeft: 4, borderColor: 'success.main' }}>
                      <AlertTitle>Allowed Colors</AlertTitle>
                      Golden, Light Golden, Amber, Honey
                    </Alert>
                    <Alert severity="error" sx={{ borderLeft: 4, borderColor: 'error.main' }}>
                      <AlertTitle>Prohibited Colors</AlertTitle>
                      Green, Blue, Red, Purple
                    </Alert>
                  </Stack>
                </CardContent>
              </Card>

              {/* Required Certifications */}
              <Card>
                <CardHeader title="Common Certifications" />
                <CardContent>
                  <List dense>
                    {['FDA Food Safety', 'HACCP', 'USDA Organic', 'Kosher', 'Halal', 'Gluten-Free'].map((cert) => (
                      <ListItem key={cert} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <ShieldCheckIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={cert} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>

              {/* Quick Validate */}
              <Paper sx={{ p: 3, bgcolor: 'primary.light' }}>
                <Typography variant="h6" gutterBottom>
                  Need to Validate?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Run compliance checks on your RFQs to prevent specification errors before they become costly mistakes.
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => window.location.href = '/rfq'}
                >
                  Go to RFQ Management
                </Button>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        {/* Validation Modal */}
        <Modal
          open={Boolean(selectedRFQ)}
          onClose={() => setSelectedRFQ(null)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Paper
            sx={{
              maxWidth: 600,
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              p: 3,
              position: 'relative'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Validation Details</Typography>
              <IconButton onClick={() => setSelectedRFQ(null)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Typography color="text.secondary">
              Validation details for RFQ: {selectedRFQ}
            </Typography>
          </Paper>
        </Modal>
      </Stack>
    </Box>
  );
};