import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  Button,
  IconButton,
  Stack,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  Alert,
  AlertTitle,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  useTheme,
  alpha,
} from '@mui/material';
import {
  VerifiedUser,
  Warning,
  Error as ErrorIcon,
  CheckCircle,
  Schedule,
  Assignment,
  Description,
  CloudUpload,
  Gavel,
  Security,
  Flag,
  TrendingUp,
  TrendingDown,
  Refresh,
  Download,
  Email,
  CalendarToday,
  AccessTime,
  Block,
  TaskAlt,
  PendingActions,
  Rule,
  Policy,
  Dashboard,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, differenceInDays, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ComplianceMetrics } from '../types';

// Glassmorphism styles
const glassmorphismStyle = {
  background: (theme: any) => alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  borderRadius: 2,
  border: (theme: any) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: (theme: any) => `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.1)}`,
};

// Compliance Status Card
const ComplianceStatusCard: React.FC<{
  status: 'compliant' | 'warning' | 'violation';
  count: number;
  percentage: number;
  trend: number;
}> = ({ status, count, percentage, trend }) => {
  const theme = useTheme();
  
  const statusConfig = {
    compliant: {
      color: theme.palette.success.main,
      icon: <CheckCircle />,
      label: 'Compliant',
    },
    warning: {
      color: theme.palette.warning.main,
      icon: <Warning />,
      label: 'Warnings',
    },
    violation: {
      color: theme.palette.error.main,
      icon: <ErrorIcon />,
      label: 'Violations',
    },
  };

  const { color, icon, label } = statusConfig[status];

  return (
    <Card sx={glassmorphismStyle}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" variant="caption" gutterBottom>
              {label}
            </Typography>
            <Typography variant="h3" fontWeight="bold" color={color}>
              {count}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {percentage}% of total
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              {trend > 0 ? (
                <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />
              ) : (
                <TrendingDown sx={{ fontSize: 16, color: theme.palette.error.main }} />
              )}
              <Typography
                variant="caption"
                color={trend > 0 ? 'success.main' : 'error.main'}
                ml={0.5}
              >
                {Math.abs(trend)}% vs last month
              </Typography>
            </Box>
          </Box>
          <Avatar sx={{ bgcolor: alpha(color, 0.1), color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// Certification Card
const CertificationCard: React.FC<{
  certification: {
    id: string;
    name: string;
    type: string;
    issuer: string;
    issueDate: string;
    expiryDate: string;
    status: 'active' | 'expiring' | 'expired';
    documentUrl?: string;
  };
  onRenew: () => void;
  onView: () => void;
}> = ({ certification, onRenew, onView }) => {
  const theme = useTheme();
  const daysUntilExpiry = differenceInDays(new Date(certification.expiryDate), new Date());
  
  const getStatusColor = () => {
    if (certification.status === 'expired') return theme.palette.error.main;
    if (certification.status === 'expiring') return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const getStatusIcon = () => {
    if (certification.status === 'expired') return <Block />;
    if (certification.status === 'expiring') return <Warning />;
    return <VerifiedUser />;
  };

  return (
    <Card 
      sx={{
        ...glassmorphismStyle,
        border: `2px solid ${alpha(getStatusColor(), 0.3)}`,
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: alpha(getStatusColor(), 0.1), color: getStatusColor() }}>
              {getStatusIcon()}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {certification.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {certification.type} • {certification.issuer}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={certification.status}
            color={
              certification.status === 'active' ? 'success' :
              certification.status === 'expiring' ? 'warning' : 'error'
            }
            size="small"
          />
        </Box>

        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Validity Period
            </Typography>
            <Typography variant="body2">
              {format(new Date(certification.issueDate), 'MMM dd, yyyy')} - 
              {format(new Date(certification.expiryDate), 'MMM dd, yyyy')}
            </Typography>
          </Box>
          
          {certification.status !== 'expired' && (
            <>
              <LinearProgress
                variant="determinate"
                value={Math.max(0, Math.min(100, (365 - daysUntilExpiry) / 365 * 100))}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: alpha(getStatusColor(), 0.1),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getStatusColor(),
                    borderRadius: 4,
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" mt={0.5}>
                {daysUntilExpiry} days remaining
              </Typography>
            </>
          )}
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Description />}
            onClick={onView}
          >
            View
          </Button>
          {(certification.status === 'expiring' || certification.status === 'expired') && (
            <Button
              size="small"
              variant="contained"
              color={certification.status === 'expired' ? 'error' : 'warning'}
              startIcon={<Refresh />}
              onClick={onRenew}
            >
              Renew
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

// Compliance Timeline
const ComplianceTimeline: React.FC<{
  events: Array<{
    id: string;
    type: 'audit' | 'certification' | 'violation' | 'update';
    title: string;
    description: string;
    date: string;
    status: 'completed' | 'pending' | 'failed';
  }>;
}> = ({ events }) => {
  const theme = useTheme();

  const getEventIcon = (type: string, status: string) => {
    if (status === 'failed') return <ErrorIcon />;
    switch (type) {
      case 'audit':
        return <Assignment />;
      case 'certification':
        return <VerifiedUser />;
      case 'violation':
        return <Warning />;
      case 'update':
        return <Rule />;
      default:
        return <Flag />;
    }
  };

  const getEventColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.palette.success.main;
      case 'pending':
        return theme.palette.warning.main;
      case 'failed':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Timeline>
      {events.map((event, index) => (
        <TimelineItem key={event.id}>
          <TimelineOppositeContent sx={{ flex: 0.3 }} color="text.secondary">
            <Typography variant="caption">
              {format(new Date(event.date), 'MMM dd, yyyy')}
            </Typography>
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot sx={{ bgcolor: getEventColor(event.status) }}>
              {getEventIcon(event.type, event.status)}
            </TimelineDot>
            {index < events.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {event.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {event.description}
              </Typography>
              <Chip
                label={event.status}
                size="small"
                sx={{ mt: 1 }}
                color={
                  event.status === 'completed' ? 'success' :
                  event.status === 'pending' ? 'warning' : 'error'
                }
              />
            </Paper>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

// Main Compliance Tracker Component
export const ComplianceTracker: React.FC = () => {
  const theme = useTheme();
  const [selectedView, setSelectedView] = useState<'overview' | 'certifications' | 'audits' | 'violations'>('overview');
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState<any>(null);

  // Mock data
  const complianceMetrics: ComplianceMetrics = {
    overallScore: 92,
    categories: [
      { name: 'Food Safety', score: 95, status: 'compliant', issues: 2 },
      { name: 'Quality Standards', score: 88, status: 'warning', issues: 5 },
      { name: 'Environmental', score: 94, status: 'compliant', issues: 1 },
      { name: 'Labor Practices', score: 90, status: 'compliant', issues: 3 },
    ],
    certifications: {
      total: 24,
      active: 20,
      expiringSoon: 3,
      expired: 1,
    },
    audits: {
      scheduled: 5,
      completed: 12,
      failed: 1,
      nextAudit: '2024-02-15',
    },
    violations: [
      {
        id: '1',
        type: 'Documentation',
        severity: 'medium',
        description: 'Missing temperature logs for cold storage',
        date: '2024-01-10',
        status: 'open',
      },
      {
        id: '2',
        type: 'Safety',
        severity: 'low',
        description: 'Incomplete safety training records',
        date: '2024-01-05',
        status: 'resolved',
      },
    ],
  };

  const certifications = [
    {
      id: '1',
      name: 'HACCP Certification',
      type: 'Food Safety',
      issuer: 'SGS',
      issueDate: '2023-01-15',
      expiryDate: '2024-01-15',
      status: 'expiring' as const,
    },
    {
      id: '2',
      name: 'ISO 22000:2018',
      type: 'Quality Management',
      issuer: 'Bureau Veritas',
      issueDate: '2023-03-20',
      expiryDate: '2026-03-20',
      status: 'active' as const,
    },
    {
      id: '3',
      name: 'Organic Certification',
      type: 'Product',
      issuer: 'USDA',
      issueDate: '2023-06-01',
      expiryDate: '2024-06-01',
      status: 'active' as const,
    },
  ];

  const timelineEvents = [
    {
      id: '1',
      type: 'audit' as const,
      title: 'Annual Food Safety Audit',
      description: 'Comprehensive HACCP audit completed successfully',
      date: '2024-01-20',
      status: 'completed' as const,
    },
    {
      id: '2',
      type: 'certification' as const,
      title: 'ISO 22000 Renewal',
      description: 'Quality management certification renewed',
      date: '2024-01-15',
      status: 'completed' as const,
    },
    {
      id: '3',
      type: 'violation' as const,
      title: 'Temperature Log Issue',
      description: 'Missing temperature logs identified during inspection',
      date: '2024-01-10',
      status: 'pending' as const,
    },
    {
      id: '4',
      type: 'audit' as const,
      title: 'Quarterly Safety Review',
      description: 'Scheduled safety compliance review',
      date: '2024-02-15',
      status: 'pending' as const,
    },
  ];

  const complianceDistribution = [
    { name: 'Compliant', value: 85, color: theme.palette.success.main },
    { name: 'Warnings', value: 12, color: theme.palette.warning.main },
    { name: 'Violations', value: 3, color: theme.palette.error.main },
  ];

  const handleRenewCertification = (cert: any) => {
    setSelectedCertification(cert);
    setRenewDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Compliance Tracker
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor certifications, audits, and regulatory compliance
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<CalendarToday />}>
            Schedule Audit
          </Button>
          <Button variant="contained" startIcon={<CloudUpload />}>
            Upload Certificate
          </Button>
        </Stack>
      </Box>

      {/* Compliance Score Overview */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card sx={glassmorphismStyle}>
            <CardContent>
              <Box textAlign="center">
                <Typography variant="h6" gutterBottom>
                  Overall Compliance Score
                </Typography>
                <Box position="relative" display="inline-flex">
                  <svg width={120} height={120}>
                    <circle
                      cx={60}
                      cy={60}
                      r={50}
                      fill="none"
                      stroke={alpha(theme.palette.success.main, 0.2)}
                      strokeWidth={10}
                    />
                    <circle
                      cx={60}
                      cy={60}
                      r={50}
                      fill="none"
                      stroke={theme.palette.success.main}
                      strokeWidth={10}
                      strokeDasharray={`${(complianceMetrics.overallScore / 100) * 314} 314`}
                      transform="rotate(-90 60 60)"
                      strokeLinecap="round"
                    />
                  </svg>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <Typography variant="h3" fontWeight="bold">
                      {complianceMetrics.overallScore}%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" mt={2}>
                  Excellent compliance standing
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <ComplianceStatusCard
            status="compliant"
            count={85}
            percentage={85}
            trend={5}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <ComplianceStatusCard
            status="warning"
            count={12}
            percentage={12}
            trend={-2}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <ComplianceStatusCard
            status="violation"
            count={3}
            percentage={3}
            trend={-1}
          />
        </Grid>
      </Grid>

      {/* Navigation Tabs */}
      <Paper sx={{ ...glassmorphismStyle, mb: 3, p: 1 }}>
        <Stack direction="row" spacing={1}>
          {[
            { id: 'overview', label: 'Overview', icon: <Dashboard /> },
            { id: 'certifications', label: 'Certifications', icon: <VerifiedUser /> },
            { id: 'audits', label: 'Audits', icon: <Assignment /> },
            { id: 'violations', label: 'Violations', icon: <Warning /> },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={selectedView === tab.id ? 'contained' : 'text'}
              startIcon={tab.icon}
              onClick={() => setSelectedView(tab.id as any)}
              sx={{ flex: 1 }}
            >
              {tab.label}
            </Button>
          ))}
        </Stack>
      </Paper>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {selectedView === 'overview' && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card sx={glassmorphismStyle}>
                  <CardHeader title="Compliance by Category" />
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={complianceMetrics.categories}>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <RechartsTooltip />
                        <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                          {complianceMetrics.categories.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={
                                entry.status === 'compliant' ? theme.palette.success.main :
                                entry.status === 'warning' ? theme.palette.warning.main :
                                theme.palette.error.main
                              } 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={glassmorphismStyle}>
                  <CardHeader title="Compliance Distribution" />
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={complianceDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {complianceDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={glassmorphismStyle}>
                  <CardHeader title="Recent Compliance Events" />
                  <CardContent>
                    <ComplianceTimeline events={timelineEvents} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {selectedView === 'certifications' && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <AlertTitle>Attention Required</AlertTitle>
                  {complianceMetrics.certifications.expiringSoon} certifications expiring within 30 days
                </Alert>
              </Grid>
              {certifications.map((cert) => (
                <Grid item xs={12} md={6} lg={4} key={cert.id}>
                  <CertificationCard
                    certification={cert}
                    onRenew={() => handleRenewCertification(cert)}
                    onView={() => console.log('View certificate:', cert)}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {selectedView === 'audits' && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={glassmorphismStyle}>
                  <CardHeader 
                    title="Upcoming Audits" 
                    action={
                      <Chip 
                        label={`Next audit in ${differenceInDays(new Date(complianceMetrics.audits.nextAudit!), new Date())} days`}
                        color="warning"
                      />
                    }
                  />
                  <CardContent>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Audit Type</TableCell>
                            <TableCell>Scheduled Date</TableCell>
                            <TableCell>Auditor</TableCell>
                            <TableCell>Scope</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>Quarterly Safety Review</TableCell>
                            <TableCell>{format(new Date('2024-02-15'), 'MMM dd, yyyy')}</TableCell>
                            <TableCell>Internal Team</TableCell>
                            <TableCell>Full Facility</TableCell>
                            <TableCell>
                              <Chip label="Scheduled" color="warning" size="small" />
                            </TableCell>
                            <TableCell>
                              <Button size="small">Prepare</Button>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {selectedView === 'violations' && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={glassmorphismStyle}>
                  <CardHeader title="Compliance Violations" />
                  <CardContent>
                    <List>
                      {complianceMetrics.violations.map((violation) => (
                        <ListItem key={violation.id} divider>
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              bgcolor: alpha(
                                violation.severity === 'high' ? theme.palette.error.main :
                                violation.severity === 'medium' ? theme.palette.warning.main :
                                theme.palette.info.main, 
                                0.1
                              ),
                              color: violation.severity === 'high' ? theme.palette.error.main :
                                violation.severity === 'medium' ? theme.palette.warning.main :
                                theme.palette.info.main
                            }}>
                              <Warning />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={violation.description}
                            secondary={
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip label={violation.type} size="small" />
                                <Typography variant="caption">
                                  {format(new Date(violation.date), 'MMM dd, yyyy')}
                                </Typography>
                              </Stack>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Chip
                              label={violation.status}
                              color={violation.status === 'resolved' ? 'success' : 'warning'}
                              size="small"
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Renew Certification Dialog */}
      <Dialog open={renewDialogOpen} onClose={() => setRenewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Renew Certification</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Certification Name"
              value={selectedCertification?.name || ''}
              disabled
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="New Expiry Date"
                value={selectedCertification ? addDays(new Date(selectedCertification.expiryDate), 365) : null}
              />
            </LocalizationProvider>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Renewal Notes"
              placeholder="Add any notes about the renewal..."
            />
            <Button
              variant="outlined"
              startIcon={<CloudUpload />}
              component="label"
            >
              Upload New Certificate
              <input type="file" hidden />
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenewDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setRenewDialogOpen(false)}>
            Submit Renewal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComplianceTracker;