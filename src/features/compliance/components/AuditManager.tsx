import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  IconButton,
  Stack,
  Chip,
  Avatar,
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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemIcon,
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
  Badge,
  Tabs,
  Tab,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Tooltip,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Assignment,
  AssignmentTurnedIn,
  Person,
  Schedule,
  CheckCircle,
  Warning,
  ErrorOutline,
  Add,
  Edit,
  Delete,
  Visibility,
  Download,
  Upload,
  Email,
  CalendarToday,
  AccessTime,
  LocationOn,
  Business,
  Group,
  Assessment,
  TrendingUp,
  TrendingDown,
  Flag,
  Report,
  TaskAlt,
  PendingActions,
  Cancel,
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  FileCopy,
  AttachFile,
  Comment,
  Notifications,
  ExpandMore,
  ExpandLess,
  ChecklistRtl,
  RateReview,
  Feedback,
  Security,
  Gavel,
  Rule,
  Policy,
  FindInPage,
  DocumentScanner,
  FactCheck,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'recharts';

// Glassmorphism styles
const glassmorphismStyle = {
  background: (theme: any) => alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  borderRadius: 2,
  border: (theme: any) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: (theme: any) => `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.1)}`,
};

// Audit Card Component
const AuditCard: React.FC<{
  audit: {
    id: string;
    title: string;
    type: 'internal' | 'external' | 'regulatory' | 'customer';
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'high' | 'medium' | 'low';
    scheduledDate: Date;
    duration: number;
    auditor: {
      name: string;
      company: string;
      email: string;
      phone: string;
    };
    scope: string[];
    location: string;
    progress: number;
    findings: {
      critical: number;
      major: number;
      minor: number;
      observations: number;
    };
    checklist: {
      total: number;
      completed: number;
    };
    documents: string[];
  };
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}> = ({ audit, onEdit, onDelete, onView }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = () => {
    switch (audit.status) {
      case 'scheduled':
        return theme.palette.info.main;
      case 'in_progress':
        return theme.palette.warning.main;
      case 'completed':
        return theme.palette.success.main;
      case 'cancelled':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = () => {
    switch (audit.status) {
      case 'scheduled':
        return <Schedule />;
      case 'in_progress':
        return <PlayArrow />;
      case 'completed':
        return <CheckCircle />;
      case 'cancelled':
        return <Cancel />;
      default:
        return <Assignment />;
    }
  };

  const getPriorityColor = () => {
    switch (audit.priority) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getTypeColor = () => {
    switch (audit.type) {
      case 'internal':
        return theme.palette.primary.main;
      case 'external':
        return theme.palette.secondary.main;
      case 'regulatory':
        return theme.palette.error.main;
      case 'customer':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const totalFindings = audit.findings.critical + audit.findings.major + audit.findings.minor + audit.findings.observations;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={glassmorphismStyle}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: alpha(getStatusColor(), 0.1), color: getStatusColor() }}>
              {getStatusIcon()}
            </Avatar>
          }
          action={
            <Stack direction="row" spacing={0.5}>
              <Chip
                label={audit.type}
                size="small"
                sx={{
                  bgcolor: alpha(getTypeColor(), 0.1),
                  color: getTypeColor(),
                  textTransform: 'capitalize',
                }}
              />
              <Chip
                label={audit.priority}
                size="small"
                sx={{
                  bgcolor: alpha(getPriorityColor(), 0.1),
                  color: getPriorityColor(),
                  textTransform: 'capitalize',
                }}
              />
              <IconButton size="small" onClick={onEdit}>
                <Edit />
              </IconButton>
              <IconButton size="small" onClick={onDelete}>
                <Delete />
              </IconButton>
            </Stack>
          }
          title={
            <Typography variant="h6" fontWeight="bold">
              {audit.title}
            </Typography>
          }
          subheader={
            <Stack direction="row" spacing={2} alignItems="center">
              <Box display="flex" alignItems="center" gap={0.5}>
                <CalendarToday fontSize="small" />
                <Typography variant="body2">
                  {format(audit.scheduledDate, 'MMM dd, yyyy')}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <AccessTime fontSize="small" />
                <Typography variant="body2">
                  {audit.duration} hours
                </Typography>
              </Box>
            </Stack>
          }
        />

        <CardContent>
          {/* Progress */}
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {audit.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={audit.progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.grey[300], 0.3),
                '& .MuiLinearProgress-bar': {
                  bgcolor: getStatusColor(),
                  borderRadius: 4,
                },
              }}
            />
          </Box>

          {/* Checklist Progress */}
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Checklist
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {audit.checklist.completed}/{audit.checklist.total}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(audit.checklist.completed / audit.checklist.total) * 100}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.grey[300], 0.3),
                '& .MuiLinearProgress-bar': {
                  bgcolor: theme.palette.info.main,
                  borderRadius: 3,
                },
              }}
            />
          </Box>

          {/* Auditor Information */}
          <Box mb={2}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Auditor
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Person fontSize="small" />
              <Typography variant="body2">{audit.auditor.name}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Business fontSize="small" />
              <Typography variant="body2">{audit.auditor.company}</Typography>
            </Box>
          </Box>

          {/* Location */}
          <Box mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOn fontSize="small" />
              <Typography variant="body2">{audit.location}</Typography>
            </Box>
          </Box>

          {/* Findings Summary */}
          {totalFindings > 0 && (
            <Box mb={2}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Findings Summary
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="error.main" fontWeight="bold">
                      {audit.findings.critical}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Critical
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="warning.main" fontWeight="bold">
                      {audit.findings.major}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Major
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="info.main" fontWeight="bold">
                      {audit.findings.minor}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Minor
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="success.main" fontWeight="bold">
                      {audit.findings.observations}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Obs.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Scope */}
          <Box>
            <Button
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ p: 0, justifyContent: 'flex-start' }}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                Scope ({audit.scope.length} areas)
              </Typography>
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </Button>
            <Collapse in={expanded}>
              <Box mt={1}>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {audit.scope.map((area, index) => (
                    <Chip key={index} label={area} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Box>
            </Collapse>
          </Box>
        </CardContent>

        <CardActions>
          <Button size="small" variant="outlined" startIcon={<Visibility />} onClick={onView}>
            View
          </Button>
          <Button size="small" variant="outlined" startIcon={<Download />}>
            Report
          </Button>
          {audit.status === 'scheduled' && (
            <Button size="small" variant="contained" startIcon={<PlayArrow />}>
              Start
            </Button>
          )}
          {audit.status === 'in_progress' && (
            <Button size="small" variant="contained" color="warning" startIcon={<Pause />}>
              Pause
            </Button>
          )}
        </CardActions>
      </Card>
    </motion.div>
  );
};

// Audit Creation Dialog
const AuditCreationDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  audit?: any;
}> = ({ open, onClose, audit }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    type: 'internal',
    priority: 'medium',
    scheduledDate: new Date(),
    duration: 8,
    auditor: {
      name: '',
      company: '',
      email: '',
      phone: '',
    },
    scope: [''],
    location: '',
  });

  const handleSubmit = () => {
    console.log('Creating audit:', formData);
    onClose();
  };

  const addScope = () => {
    setFormData(prev => ({
      ...prev,
      scope: [...prev.scope, ''],
    }));
  };

  const updateScope = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      scope: prev.scope.map((s, i) => i === index ? value : s),
    }));
  };

  const removeScope = (index: number) => {
    setFormData(prev => ({
      ...prev,
      scope: prev.scope.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {audit ? 'Edit Audit' : 'Schedule New Audit'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Audit Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value="internal">Internal</MenuItem>
                <MenuItem value="external">External</MenuItem>
                <MenuItem value="regulatory">Regulatory</MenuItem>
                <MenuItem value="customer">Customer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Scheduled Date"
                value={formData.scheduledDate}
                onChange={(date) => setFormData({ ...formData, scheduledDate: date || new Date() })}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Duration (hours)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Auditor Name"
              value={formData.auditor.name}
              onChange={(e) => setFormData({
                ...formData,
                auditor: { ...formData.auditor, name: e.target.value }
              })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Auditor Company"
              value={formData.auditor.company}
              onChange={(e) => setFormData({
                ...formData,
                auditor: { ...formData.auditor, company: e.target.value }
              })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Audit Scope
            </Typography>
            {formData.scope.map((scope, index) => (
              <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter scope area"
                  value={scope}
                  onChange={(e) => updateScope(index, e.target.value)}
                />
                <IconButton size="small" onClick={() => removeScope(index)}>
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<Add />} onClick={addScope}>
              Add Scope Area
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {audit ? 'Update' : 'Schedule'} Audit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Audit Manager Component
export const AuditManager: React.FC = () => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<any>(null);

  // Mock audit data
  const audits = [
    {
      id: '1',
      title: 'Annual Food Safety Audit',
      type: 'external' as const,
      status: 'scheduled' as const,
      priority: 'high' as const,
      scheduledDate: new Date('2024-02-15'),
      duration: 16,
      auditor: {
        name: 'Sarah Johnson',
        company: 'SGS Certification',
        email: 'sarah.johnson@sgs.com',
        phone: '+1-555-0123',
      },
      scope: ['HACCP Implementation', 'Sanitation Procedures', 'Temperature Control', 'Documentation Review'],
      location: 'Main Processing Facility',
      progress: 0,
      findings: {
        critical: 0,
        major: 0,
        minor: 0,
        observations: 0,
      },
      checklist: {
        total: 45,
        completed: 0,
      },
      documents: [],
    },
    {
      id: '2',
      title: 'Monthly Quality Control Review',
      type: 'internal' as const,
      status: 'in_progress' as const,
      priority: 'medium' as const,
      scheduledDate: new Date('2024-01-25'),
      duration: 8,
      auditor: {
        name: 'Michael Chen',
        company: 'Internal QA Team',
        email: 'michael.chen@foodxchange.com',
        phone: '+1-555-0456',
      },
      scope: ['Quality Standards', 'Process Controls', 'Product Testing'],
      location: 'Quality Lab',
      progress: 65,
      findings: {
        critical: 0,
        major: 2,
        minor: 5,
        observations: 3,
      },
      checklist: {
        total: 25,
        completed: 16,
      },
      documents: ['QC-Report-Jan-2024.pdf', 'Test-Results-Summary.xlsx'],
    },
    {
      id: '3',
      title: 'Regulatory Compliance Inspection',
      type: 'regulatory' as const,
      status: 'completed' as const,
      priority: 'high' as const,
      scheduledDate: new Date('2024-01-10'),
      duration: 12,
      auditor: {
        name: 'David Rodriguez',
        company: 'FDA Regional Office',
        email: 'david.rodriguez@fda.gov',
        phone: '+1-555-0789',
      },
      scope: ['FDA Compliance', 'Labeling Requirements', 'Facility Standards'],
      location: 'All Facilities',
      progress: 100,
      findings: {
        critical: 0,
        major: 1,
        minor: 2,
        observations: 4,
      },
      checklist: {
        total: 35,
        completed: 35,
      },
      documents: ['FDA-Inspection-Report.pdf', 'Compliance-Action-Plan.pdf'],
    },
  ];

  const auditMetrics = [
    { month: 'Oct', completed: 8, findings: 12 },
    { month: 'Nov', completed: 6, findings: 8 },
    { month: 'Dec', completed: 10, findings: 15 },
    { month: 'Jan', completed: 4, findings: 7 },
  ];

  const findingsByType = [
    { name: 'Critical', value: 2, color: theme.palette.error.main },
    { name: 'Major', value: 8, color: theme.palette.warning.main },
    { name: 'Minor', value: 15, color: theme.palette.info.main },
    { name: 'Observations', value: 12, color: theme.palette.success.main },
  ];

  const handleEdit = (audit: any) => {
    setSelectedAudit(audit);
    setAuditDialogOpen(true);
  };

  const handleDelete = (auditId: string) => {
    console.log('Deleting audit:', auditId);
  };

  const handleView = (audit: any) => {
    console.log('Viewing audit:', audit.id);
  };

  const upcomingAudits = audits.filter(audit => audit.status === 'scheduled');
  const activeAudits = audits.filter(audit => audit.status === 'in_progress');
  const completedAudits = audits.filter(audit => audit.status === 'completed');

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Audit Manager
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Schedule, track, and manage compliance audits
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Download />}>
            Export Report
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAuditDialogOpen(true)}
          >
            Schedule Audit
          </Button>
        </Stack>
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={glassmorphismStyle}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {upcomingAudits.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming Audits
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                  <Schedule sx={{ color: theme.palette.info.main }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={glassmorphismStyle}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {activeAudits.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                  <PlayArrow sx={{ color: theme.palette.warning.main }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={glassmorphismStyle}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {completedAudits.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                  <CheckCircle sx={{ color: theme.palette.success.main }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={glassmorphismStyle}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    37
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Findings
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                  <Flag sx={{ color: theme.palette.error.main }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ ...glassmorphismStyle, mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, value) => setSelectedTab(value)}
          variant="fullWidth"
        >
          <Tab label="All Audits" icon={<Assignment />} iconPosition="start" />
          <Tab label="Analytics" icon={<Assessment />} iconPosition="start" />
          <Tab label="Audit Trail" icon={<DocumentScanner />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {selectedTab === 0 && (
            <Grid container spacing={3}>
              {audits.map((audit) => (
                <Grid item xs={12} md={6} lg={4} key={audit.id}>
                  <AuditCard
                    audit={audit}
                    onEdit={() => handleEdit(audit)}
                    onDelete={() => handleDelete(audit.id)}
                    onView={() => handleView(audit)}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {selectedTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card sx={glassmorphismStyle}>
                  <CardHeader title="Audit Performance Trends" />
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={auditMetrics}>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line
                          type="monotone"
                          dataKey="completed"
                          stroke={theme.palette.primary.main}
                          strokeWidth={2}
                          name="Completed Audits"
                        />
                        <Line
                          type="monotone"
                          dataKey="findings"
                          stroke={theme.palette.error.main}
                          strokeWidth={2}
                          name="Total Findings"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={glassmorphismStyle}>
                  <CardHeader title="Findings Distribution" />
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={findingsByType}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {findingsByType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {selectedTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={glassmorphismStyle}>
                  <CardHeader title="Audit Trail & History" />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Complete audit trail and historical data would be displayed here with detailed logs and compliance history.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Audit Creation/Edit Dialog */}
      <AuditCreationDialog
        open={auditDialogOpen}
        onClose={() => {
          setAuditDialogOpen(false);
          setSelectedAudit(null);
        }}
        audit={selectedAudit}
      />
    </Box>
  );
};

export default AuditManager;