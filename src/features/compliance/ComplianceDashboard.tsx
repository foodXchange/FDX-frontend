import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  IconButton,
  Stack,
  Chip,
  Avatar,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  Tabs,
  Tab,
  LinearProgress,
  Divider,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Dashboard,
  VerifiedUser,
  Assignment,
  Warning,
  CheckCircle,
  Schedule,
  TrendingUp,
  TrendingDown,
  Assessment,
  Flag,
  Security,
  Gavel,
  Rule,
  Policy,
  Notifications,
  CalendarToday,
  Business,
  LocationOn,
  Person,
  Email,
  Phone,
  Download,
  Upload,
  Add,
  Refresh,
  Settings,
  Timeline,
  Analytics,
  Report,
  Task,
  DocumentScanner,
  FindInPage,
  FactCheck,
  RateReview,
  Feedback,
  Error as ErrorIcon,
  Info,
  CloudUpload,
  AttachFile,
  Visibility,
  Edit,
  Delete,
  MoreVert,
  NotificationsActive,
  TrendingFlat,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, differenceInDays, startOfMonth, endOfMonth, isToday, isPast, isFuture, isThisWeek, isThisMonth } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  RadialBarChart,
  RadialBar,
} from 'recharts';

// Import the existing components we'll integrate
import { ComplianceTracker } from './ComplianceTracker';
import { CertificationManager } from './CertificationManager';
import { AuditManager } from './AuditManager';

// Glassmorphism styles
const glassmorphismStyle = {
  background: (theme: any) => alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  borderRadius: 2,
  border: (theme: any) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: (theme: any) => `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.1)}`,
};

// Compliance Metric Card Component
const ComplianceMetricCard: React.FC<{
  title: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
}> = ({ title, value, change, icon, color, subtitle, trend }) => {
  const theme = useTheme();

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />;
      case 'down':
        return <TrendingDown sx={{ fontSize: 16, color: theme.palette.error.main }} />;
      case 'stable':
        return <TrendingFlat sx={{ fontSize: 16, color: theme.palette.grey[500] }} />;
      default:
        return null;
    }
  };

  return (
    <Card sx={glassmorphismStyle}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h3" fontWeight="bold" sx={{ color }}>
              {value}
            </Typography>
            <Typography variant="h6" color="text.primary" gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {change !== undefined && (
              <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                {getTrendIcon()}
                <Typography
                  variant="body2"
                  color={change > 0 ? 'success.main' : change < 0 ? 'error.main' : 'text.secondary'}
                >
                  {Math.abs(change)}% vs last month
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.1),
              color,
              width: 64,
              height: 64,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// Critical Alerts Component
const CriticalAlerts: React.FC = () => {
  const theme = useTheme();
  
  const alerts = [
    {
      id: '1',
      type: 'certification',
      severity: 'error' as const,
      title: 'HACCP Certification Expired',
      message: 'HACCP certification expired 3 days ago. Production may be affected.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      actionRequired: 'Immediate renewal required',
      responsible: 'Quality Assurance Team',
    },
    {
      id: '2',
      type: 'audit',
      severity: 'warning' as const,
      title: 'Upcoming Regulatory Audit',
      message: 'FDA audit scheduled in 5 days. Ensure all documentation is ready.',
      timestamp: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      actionRequired: 'Prepare documentation',
      responsible: 'Compliance Manager',
    },
    {
      id: '3',
      type: 'violation',
      severity: 'warning' as const,
      title: 'Temperature Log Gap',
      message: 'Missing temperature logs for cold storage area for 2 hours.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      actionRequired: 'Investigate and document',
      responsible: 'Operations Team',
    },
  ];

  return (
    <Paper sx={glassmorphismStyle}>
      <Box p={3}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Warning color="error" />
          <Typography variant="h6" fontWeight="bold">
            Critical Alerts
          </Typography>
          <Badge badgeContent={alerts.length} color="error" sx={{ ml: 'auto' }} />
        </Box>
        
        <List>
          {alerts.map((alert, index) => (
            <ListItem key={alert.id} divider={index < alerts.length - 1}>
              <ListItemIcon>
                <Avatar
                  sx={{
                    bgcolor: alpha(
                      alert.severity === 'error' ? theme.palette.error.main : theme.palette.warning.main,
                      0.1
                    ),
                    color: alert.severity === 'error' ? theme.palette.error.main : theme.palette.warning.main,
                    width: 32,
                    height: 32,
                  }}
                >
                  {alert.severity === 'error' ? <ErrorIcon /> : <Warning />}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" fontWeight="bold">
                    {alert.title}
                  </Typography>
                }
                secondary={
                  <Stack spacing={0.5}>
                    <Typography variant="body2">{alert.message}</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={alert.actionRequired}
                        size="small"
                        color={alert.severity === 'error' ? 'error' : 'warning'}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {alert.responsible}
                      </Typography>
                    </Box>
                  </Stack>
                }
              />
              <ListItemSecondaryAction>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

// Compliance Timeline Component
const ComplianceTimeline: React.FC = () => {
  const theme = useTheme();
  
  const timelineData = [
    {
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      title: 'ISO 22000 Surveillance Audit',
      type: 'audit',
      status: 'scheduled',
      description: 'Annual surveillance audit by Bureau Veritas',
    },
    {
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      title: 'Organic Certification Renewal',
      type: 'certification',
      status: 'pending',
      description: 'USDA Organic certification renewal application',
    },
    {
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      title: 'FDA Facility Inspection',
      type: 'regulatory',
      status: 'scheduled',
      description: 'Routine FDA facility inspection',
    },
    {
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      title: 'HACCP Plan Review',
      type: 'review',
      status: 'due',
      description: 'Annual HACCP plan review and update',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return theme.palette.info.main;
      case 'pending':
        return theme.palette.warning.main;
      case 'due':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Paper sx={glassmorphismStyle}>
      <Box p={3}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Upcoming Compliance Events
        </Typography>
        
        <List>
          {timelineData.map((event, index) => (
            <ListItem key={index} alignItems="flex-start">
              <ListItemIcon>
                <Avatar
                  sx={{
                    bgcolor: alpha(getStatusColor(event.status), 0.1),
                    color: getStatusColor(event.status),
                    width: 32,
                    height: 32,
                  }}
                >
                  {event.type === 'audit' ? <Assignment /> : 
                   event.type === 'certification' ? <VerifiedUser /> :
                   event.type === 'regulatory' ? <Gavel /> : <Rule />}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" fontWeight="bold">
                    {event.title}
                  </Typography>
                }
                secondary={
                  <Stack spacing={0.5}>
                    <Typography variant="body2">{event.description}</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarToday sx={{ fontSize: 14 }} />
                      <Typography variant="caption">
                        {format(event.date, 'MMM dd, yyyy')}
                      </Typography>
                      <Chip
                        label={event.status}
                        size="small"
                        sx={{
                          bgcolor: alpha(getStatusColor(event.status), 0.1),
                          color: getStatusColor(event.status),
                        }}
                      />
                    </Box>
                  </Stack>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

// Main Compliance Dashboard Component
export const ComplianceDashboard: React.FC = () => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);

  // Mock compliance data
  const complianceScore = 92;
  const totalCertifications = 24;
  const activeCertifications = 20;
  const expiringSoon = 3;
  const totalAudits = 18;
  const completedAudits = 15;
  const upcomingAudits = 3;
  const totalViolations = 7;
  const resolvedViolations = 4;

  const complianceData = [
    { month: 'Oct', score: 88, violations: 12, audits: 3 },
    { month: 'Nov', score: 91, violations: 8, audits: 2 },
    { month: 'Dec', score: 89, violations: 10, audits: 4 },
    { month: 'Jan', score: 92, violations: 7, audits: 3 },
  ];

  const certificationTypes = [
    { name: 'Food Safety', count: 8, color: theme.palette.error.main },
    { name: 'Quality', count: 6, color: theme.palette.warning.main },
    { name: 'Environmental', count: 4, color: theme.palette.success.main },
    { name: 'Organic', count: 3, color: theme.palette.info.main },
    { name: 'Other', count: 3, color: theme.palette.secondary.main },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Compliance Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive compliance monitoring and management
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Download />}>
            Export Report
          </Button>
          <Button variant="outlined" startIcon={<Settings />}>
            Settings
          </Button>
          <Button variant="contained" startIcon={<Refresh />}>
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <ComplianceMetricCard
            title="Compliance Score"
            value={`${complianceScore}%`}
            change={3}
            icon={<CheckCircle />}
            color={theme.palette.success.main}
            subtitle="Excellent standing"
            trend="up"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ComplianceMetricCard
            title="Active Certifications"
            value={`${activeCertifications}/${totalCertifications}`}
            change={0}
            icon={<VerifiedUser />}
            color={theme.palette.primary.main}
            subtitle={`${expiringSoon} expiring soon`}
            trend="stable"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ComplianceMetricCard
            title="Completed Audits"
            value={`${completedAudits}/${totalAudits}`}
            change={8}
            icon={<Assignment />}
            color={theme.palette.info.main}
            subtitle={`${upcomingAudits} upcoming`}
            trend="up"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ComplianceMetricCard
            title="Open Violations"
            value={totalViolations - resolvedViolations}
            change={-15}
            icon={<Flag />}
            color={theme.palette.warning.main}
            subtitle={`${resolvedViolations} resolved`}
            trend="down"
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3} mb={3}>
        {/* Compliance Trends */}
        <Grid item xs={12} md={8}>
          <Card sx={glassmorphismStyle}>
            <CardHeader
              title="Compliance Trends"
              subheader="Monthly performance overview"
              action={
                <IconButton>
                  <MoreVert />
                </IconButton>
              }
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={complianceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    name="Compliance Score"
                  />
                  <Line
                    type="monotone"
                    dataKey="violations"
                    stroke={theme.palette.error.main}
                    strokeWidth={2}
                    name="Violations"
                  />
                  <Line
                    type="monotone"
                    dataKey="audits"
                    stroke={theme.palette.info.main}
                    strokeWidth={2}
                    name="Audits"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Certification Distribution */}
        <Grid item xs={12} md={4}>
          <Card sx={glassmorphismStyle}>
            <CardHeader title="Certification Types" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={certificationTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {certificationTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts and Timeline */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <CriticalAlerts />
        </Grid>
        <Grid item xs={12} md={6}>
          <ComplianceTimeline />
        </Grid>
      </Grid>

      {/* Detailed Views */}
      <Paper sx={{ ...glassmorphismStyle, mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, value) => setSelectedTab(value)}
          variant="fullWidth"
        >
          <Tab label="Overview" icon={<Dashboard />} iconPosition="start" />
          <Tab label="Certifications" icon={<VerifiedUser />} iconPosition="start" />
          <Tab label="Audits" icon={<Assignment />} iconPosition="start" />
          <Tab label="Compliance Tracker" icon={<Assessment />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {selectedTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={glassmorphismStyle}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Compliance Overview
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your organization maintains excellent compliance standards with a score of {complianceScore}%.
                      Continue monitoring upcoming certifications and audit schedules to maintain this performance.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {selectedTab === 1 && <CertificationManager />}
          {selectedTab === 2 && <AuditManager />}
          {selectedTab === 3 && <ComplianceTracker />}
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default ComplianceDashboard;