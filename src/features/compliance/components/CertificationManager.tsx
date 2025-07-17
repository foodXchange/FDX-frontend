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
  TablePagination,
  Stepper,
  Step,
  StepLabel,
  StepContent,
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
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  LinearProgress,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  VerifiedUser,
  Assignment,
  CloudUpload,
  Description,
  Schedule,
  Warning,
  CheckCircle,
  Cancel,
  Refresh,
  Download,
  Email,
  Add,
  Edit,
  Delete,
  Visibility,
  FileCopy,
  History,
  Notifications,
  CalendarToday,
  AttachFile,
  Security,
  Rule,
  Policy,
  Gavel,
  Flag,
  TrendingUp,
  Assessment,
  Business,
  LocationOn,
  Phone,
  Person,
  DateRange,
  AccessTime,
  PendingActions,
  TaskAlt,
  Block,
  ErrorOutline,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, differenceInDays, isPast, isFuture } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

// Glassmorphism styles
const glassmorphismStyle = {
  background: (theme: any) => alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  borderRadius: 2,
  border: (theme: any) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: (theme: any) => `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.1)}`,
};

// Certification Card Component
const CertificationCard: React.FC<{
  certificate: {
    id: string;
    name: string;
    type: string;
    issuer: string;
    issueDate: Date;
    expiryDate: Date;
    status: 'active' | 'expiring' | 'expired' | 'pending';
    documentUrl?: string;
    scope: string;
    certificationBody: string;
    lastAuditDate?: Date;
    nextAuditDate?: Date;
    complianceScore: number;
    requirements: string[];
    issuingAuthority: {
      name: string;
      contact: string;
      location: string;
    };
  };
  onRenew: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ certificate, onRenew, onView, onEdit, onDelete }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  
  const daysUntilExpiry = differenceInDays(certificate.expiryDate, new Date());
  
  const getStatusColor = () => {
    switch (certificate.status) {
      case 'active':
        return daysUntilExpiry <= 30 ? theme.palette.warning.main : theme.palette.success.main;
      case 'expiring':
        return theme.palette.warning.main;
      case 'expired':
        return theme.palette.error.main;
      case 'pending':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = () => {
    switch (certificate.status) {
      case 'active':
        return daysUntilExpiry <= 30 ? <Warning /> : <CheckCircle />;
      case 'expiring':
        return <Schedule />;
      case 'expired':
        return <Block />;
      case 'pending':
        return <PendingActions />;
      default:
        return <Assignment />;
    }
  };

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          ...glassmorphismStyle,
          border: `2px solid ${alpha(getStatusColor(), 0.3)}`,
          height: '100%',
        }}
      >
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: alpha(getStatusColor(), 0.1), color: getStatusColor() }}>
              {getStatusIcon()}
            </Avatar>
          }
          action={
            <Stack direction="row" spacing={0.5}>
              <Chip
                label={certificate.status}
                size="small"
                sx={{
                  bgcolor: alpha(getStatusColor(), 0.1),
                  color: getStatusColor(),
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
              {certificate.name}
            </Typography>
          }
          subheader={
            <Box>
              <Typography variant="body2" color="text.secondary">
                {certificate.type} • {certificate.issuer}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Scope: {certificate.scope}
              </Typography>
            </Box>
          }
        />

        <CardContent>
          {/* Validity Period */}
          <Box mb={2}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Validity Period
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">
                {format(certificate.issueDate, 'MMM dd, yyyy')} - {format(certificate.expiryDate, 'MMM dd, yyyy')}
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {certificate.status === 'expired' ? 'Expired' : `${daysUntilExpiry} days left`}
              </Typography>
            </Box>
            
            {certificate.status !== 'expired' && (
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
            )}
          </Box>

          {/* Compliance Score */}
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2" fontWeight="bold">
                Compliance Score
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ color: getComplianceScoreColor(certificate.complianceScore) }}
              >
                {certificate.complianceScore}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={certificate.complianceScore}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.grey[300], 0.3),
                '& .MuiLinearProgress-bar': {
                  bgcolor: getComplianceScoreColor(certificate.complianceScore),
                  borderRadius: 3,
                },
              }}
            />
          </Box>

          {/* Issuing Authority */}
          <Box mb={2}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Issuing Authority
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Business fontSize="small" />
              <Typography variant="body2">{certificate.issuingAuthority.name}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <LocationOn fontSize="small" />
              <Typography variant="body2">{certificate.issuingAuthority.location}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Phone fontSize="small" />
              <Typography variant="body2">{certificate.issuingAuthority.contact}</Typography>
            </Box>
          </Box>

          {/* Audit Information */}
          {(certificate.lastAuditDate || certificate.nextAuditDate) && (
            <Box mb={2}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Audit Schedule
              </Typography>
              {certificate.lastAuditDate && (
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <History fontSize="small" />
                  <Typography variant="body2">
                    Last audit: {format(certificate.lastAuditDate, 'MMM dd, yyyy')}
                  </Typography>
                </Box>
              )}
              {certificate.nextAuditDate && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Schedule fontSize="small" />
                  <Typography variant="body2">
                    Next audit: {format(certificate.nextAuditDate, 'MMM dd, yyyy')}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Requirements */}
          <Box>
            <Button
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ p: 0, justifyContent: 'flex-start' }}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                Requirements ({certificate.requirements.length})
              </Typography>
            </Button>
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <List dense>
                    {certificate.requirements.map((req, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <CheckCircle fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={req}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </CardContent>

        <CardActions>
          <Button size="small" variant="outlined" startIcon={<Visibility />} onClick={onView}>
            View
          </Button>
          <Button size="small" variant="outlined" startIcon={<Download />}>
            Download
          </Button>
          {(certificate.status === 'expiring' || certificate.status === 'expired') && (
            <Button
              size="small"
              variant="contained"
              color={certificate.status === 'expired' ? 'error' : 'warning'}
              startIcon={<Refresh />}
              onClick={onRenew}
            >
              Renew
            </Button>
          )}
        </CardActions>
      </Card>
    </motion.div>
  );
};

// Certification Workflow Component
const CertificationWorkflow: React.FC<{
  open: boolean;
  onClose: () => void;
  certificate?: any;
}> = ({ open, onClose, certificate }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    scope: '',
    issuer: '',
    certificationBody: '',
    issueDate: new Date(),
    expiryDate: addDays(new Date(), 365),
    requirements: [''],
    issuingAuthority: {
      name: '',
      contact: '',
      location: '',
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    onDrop: (files) => {
      console.log('Files dropped:', files);
    },
  });

  const steps = [
    'Basic Information',
    'Certification Details',
    'Requirements',
    'Document Upload',
    'Review & Submit',
  ];

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    console.log('Submitting certification:', formData);
    onClose();
  };

  const addRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, ''],
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => (i === index ? value : req)),
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {certificate ? 'Edit Certification' : 'Add New Certification'}
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                <Box sx={{ mt: 2, mb: 1 }}>
                  {index === 0 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Certification Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          >
                            <MenuItem value="Food Safety">Food Safety</MenuItem>
                            <MenuItem value="Quality Management">Quality Management</MenuItem>
                            <MenuItem value="Environmental">Environmental</MenuItem>
                            <MenuItem value="Organic">Organic</MenuItem>
                            <MenuItem value="Halal">Halal</MenuItem>
                            <MenuItem value="Kosher">Kosher</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Scope"
                          multiline
                          rows={2}
                          value={formData.scope}
                          onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                        />
                      </Grid>
                    </Grid>
                  )}

                  {index === 1 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Issuer"
                          value={formData.issuer}
                          onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Certification Body"
                          value={formData.certificationBody}
                          onChange={(e) => setFormData({ ...formData, certificationBody: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Issue Date"
                            value={formData.issueDate}
                            onChange={(date) => setFormData({ ...formData, issueDate: date || new Date() })}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Expiry Date"
                            value={formData.expiryDate}
                            onChange={(date) => setFormData({ ...formData, expiryDate: date || addDays(new Date(), 365) })}
                          />
                        </LocalizationProvider>
                      </Grid>
                    </Grid>
                  )}

                  {index === 2 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Certification Requirements
                      </Typography>
                      {formData.requirements.map((req, reqIndex) => (
                        <Box key={reqIndex} display="flex" alignItems="center" gap={1} mb={1}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Enter requirement"
                            value={req}
                            onChange={(e) => updateRequirement(reqIndex, e.target.value)}
                          />
                          <IconButton size="small" onClick={() => removeRequirement(reqIndex)}>
                            <Delete />
                          </IconButton>
                        </Box>
                      ))}
                      <Button startIcon={<Add />} onClick={addRequirement}>
                        Add Requirement
                      </Button>
                    </Box>
                  )}

                  {index === 3 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Upload Certificate Documents
                      </Typography>
                      <Box
                        {...getRootProps()}
                        sx={{
                          border: `2px dashed ${theme.palette.divider}`,
                          borderRadius: 2,
                          p: 4,
                          textAlign: 'center',
                          cursor: 'pointer',
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                          },
                        }}
                      >
                        <input {...getInputProps()} />
                        <CloudUpload sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 2 }} />
                        <Typography variant="body1" gutterBottom>
                          Drag & drop files here, or click to select
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          PDF, PNG, JPG files accepted
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {index === 4 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Review Certification Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Name</Typography>
                          <Typography variant="body1">{formData.name}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Type</Typography>
                          <Typography variant="body1">{formData.type}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Scope</Typography>
                          <Typography variant="body1">{formData.scope}</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={index === steps.length - 1 ? handleSubmit : handleNext}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {index === steps.length - 1 ? 'Submit' : 'Continue'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Back
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
    </Dialog>
  );
};

// Main Certification Manager Component
export const CertificationManager: React.FC = () => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Mock certificates data
  const certificates = [
    {
      id: '1',
      name: 'HACCP Food Safety Certification',
      type: 'Food Safety',
      issuer: 'SGS',
      issueDate: new Date('2023-01-15'),
      expiryDate: new Date('2024-01-15'),
      status: 'expiring' as const,
      scope: 'Food processing and handling for all product categories',
      certificationBody: 'SGS Certification Services',
      lastAuditDate: new Date('2023-01-10'),
      nextAuditDate: new Date('2023-12-15'),
      complianceScore: 92,
      requirements: [
        'Hazard analysis procedures implemented',
        'Critical control points identified and monitored',
        'Corrective actions documented',
        'Verification procedures in place',
        'Record keeping system maintained',
      ],
      issuingAuthority: {
        name: 'SGS Group',
        contact: '+1-555-0123',
        location: 'Geneva, Switzerland',
      },
    },
    {
      id: '2',
      name: 'ISO 22000:2018 Quality Management',
      type: 'Quality Management',
      issuer: 'Bureau Veritas',
      issueDate: new Date('2023-03-20'),
      expiryDate: new Date('2026-03-20'),
      status: 'active' as const,
      scope: 'Quality management system for food safety',
      certificationBody: 'Bureau Veritas Certification',
      lastAuditDate: new Date('2023-03-15'),
      nextAuditDate: new Date('2024-03-15'),
      complianceScore: 95,
      requirements: [
        'Quality management system documented',
        'Customer satisfaction monitoring',
        'Continual improvement processes',
        'Risk-based thinking implemented',
      ],
      issuingAuthority: {
        name: 'Bureau Veritas',
        contact: '+1-555-0456',
        location: 'Paris, France',
      },
    },
    {
      id: '3',
      name: 'USDA Organic Certification',
      type: 'Organic',
      issuer: 'USDA',
      issueDate: new Date('2023-06-01'),
      expiryDate: new Date('2024-06-01'),
      status: 'active' as const,
      scope: 'Organic product certification for fruits and vegetables',
      certificationBody: 'USDA National Organic Program',
      complianceScore: 88,
      requirements: [
        'Organic production methods used',
        'No synthetic pesticides or fertilizers',
        'Organic integrity maintained',
        'Organic system plan followed',
      ],
      issuingAuthority: {
        name: 'USDA',
        contact: '+1-555-0789',
        location: 'Washington, DC, USA',
      },
    },
  ];

  const handleEdit = (cert: any) => {
    setSelectedCertificate(cert);
    setWorkflowOpen(true);
  };

  const handleDelete = (certId: string) => {
    console.log('Deleting certificate:', certId);
  };

  const handleRenew = (cert: any) => {
    console.log('Renewing certificate:', cert.id);
  };

  const handleView = (cert: any) => {
    console.log('Viewing certificate:', cert.id);
  };

  const expiringSoon = certificates.filter(cert => {
    const daysUntilExpiry = differenceInDays(cert.expiryDate, new Date());
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  });

  const expired = certificates.filter(cert => isPast(cert.expiryDate));

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Certification Manager
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage certifications, track compliance, and handle renewals
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Download />}
          >
            Export Report
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setWorkflowOpen(true)}
          >
            Add Certification
          </Button>
        </Stack>
      </Box>

      {/* Alerts */}
      {(expiringSoon.length > 0 || expired.length > 0) && (
        <Grid container spacing={2} mb={3}>
          {expiringSoon.length > 0 && (
            <Grid item xs={12} md={6}>
              <Alert severity="warning">
                <AlertTitle>Expiring Soon</AlertTitle>
                {expiringSoon.length} certification(s) expiring within 30 days
              </Alert>
            </Grid>
          )}
          {expired.length > 0 && (
            <Grid item xs={12} md={6}>
              <Alert severity="error">
                <AlertTitle>Expired</AlertTitle>
                {expired.length} certification(s) have expired
              </Alert>
            </Grid>
          )}
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ ...glassmorphismStyle, mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, value) => setSelectedTab(value)}
          variant="fullWidth"
        >
          <Tab label="All Certifications" icon={<VerifiedUser />} iconPosition="start" />
          <Tab label="Renewal Pipeline" icon={<Schedule />} iconPosition="start" />
          <Tab label="Compliance Audit" icon={<Assessment />} iconPosition="start" />
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
              {certificates.map((cert) => (
                <Grid item xs={12} md={6} lg={4} key={cert.id}>
                  <CertificationCard
                    certificate={cert}
                    onRenew={() => handleRenew(cert)}
                    onView={() => handleView(cert)}
                    onEdit={() => handleEdit(cert)}
                    onDelete={() => handleDelete(cert.id)}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {selectedTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={glassmorphismStyle}>
                  <CardHeader title="Renewal Pipeline" />
                  <CardContent>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Certification</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Expires</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Action Required</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {certificates
                            .filter(cert => differenceInDays(cert.expiryDate, new Date()) <= 90)
                            .map((cert) => (
                              <TableRow key={cert.id}>
                                <TableCell>{cert.name}</TableCell>
                                <TableCell>{cert.type}</TableCell>
                                <TableCell>{format(cert.expiryDate, 'MMM dd, yyyy')}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={cert.status}
                                    color={cert.status === 'active' ? 'success' : 'warning'}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {differenceInDays(cert.expiryDate, new Date()) <= 30 ? 'Urgent' : 'Monitor'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Stack direction="row" spacing={1}>
                                    <IconButton size="small" onClick={() => handleView(cert)}>
                                      <Visibility />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleRenew(cert)}>
                                      <Refresh />
                                    </IconButton>
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {selectedTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={glassmorphismStyle}>
                  <CardHeader title="Compliance Audit Dashboard" />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Comprehensive compliance audit tracking and reporting functionality would be implemented here.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Certification Workflow Dialog */}
      <CertificationWorkflow
        open={workflowOpen}
        onClose={() => {
          setWorkflowOpen(false);
          setSelectedCertificate(null);
        }}
        certificate={selectedCertificate}
      />
    </Box>
  );
};

export default CertificationManager;