import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Stack, Alert,
  Card, CardContent, LinearProgress, List, ListItem, ListItemText,
  ListItemSecondaryAction, Tabs, Tab, Avatar, Grid, IconButton
} from '@mui/material';
import {
  Add, Assignment, CheckCircle, Schedule, PlayArrow, Pause, Stop,
  GetApp, CalendarToday, Person, Business, Timeline, Report
} from "@mui/icons-material";
import { format } from "date-fns";

interface Audit {
  id: string;
  title: string;
  type: 'Internal' | 'External' | 'Supplier' | 'Regulatory';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  auditor: string;
  auditee: string;
  scheduledDate: string;
  completedDate?: string;
  score?: number;
  findings: {
    critical: number;
    major: number;
    minor: number;
    observations: number;
  };
  checklist?: ChecklistItem[];
}

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  status: 'pass' | 'fail' | 'na' | 'pending';
  notes?: string;
}

const mockAudits: Audit[] = [
  {
    id: '1',
    title: 'Q4 2024 Internal Food Safety Audit',
    type: 'Internal',
    status: 'in_progress',
    auditor: 'Sarah Johnson',
    auditee: 'Production Facility A',
    scheduledDate: '2024-12-15',
    findings: {
      critical: 0,
      major: 2,
      minor: 5,
      observations: 3
    }
  },
  {
    id: '2',
    title: 'Supplier Compliance Audit - ABC Foods',
    type: 'Supplier',
    status: 'scheduled',
    auditor: 'Michael Chen',
    auditee: 'ABC Foods Ltd',
    scheduledDate: '2024-12-20',
    findings: {
      critical: 0,
      major: 0,
      minor: 0,
      observations: 0
    }
  },
  {
    id: '3',
    title: 'FDA Regulatory Inspection',
    type: 'Regulatory',
    status: 'completed',
    auditor: 'FDA Inspector',
    auditee: 'Main Warehouse',
    scheduledDate: '2024-11-10',
    completedDate: '2024-11-12',
    score: 92,
    findings: {
      critical: 0,
      major: 1,
      minor: 3,
      observations: 2
    }
  }
];

const mockChecklist: ChecklistItem[] = [
  { id: '1', category: 'Documentation', item: 'HACCP Plan Updated', status: 'pass' },
  { id: '2', category: 'Documentation', item: 'Training Records Complete', status: 'pass' },
  { id: '3', category: 'Facility', item: 'Equipment Maintenance Logs', status: 'fail', notes: 'Missing Q3 records' },
  { id: '4', category: 'Facility', item: 'Temperature Monitoring', status: 'pass' },
  { id: '5', category: 'Process', item: 'CCP Monitoring', status: 'pending' }
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AuditManager: React.FC = () => {
  const [audits, setAudits] = React.useState<Audit[]>(mockAudits);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedAudit, setSelectedAudit] = React.useState<Audit | null>(null);
  const [tabValue, setTabValue] = React.useState(0);
  const [checklist, setChecklist] = React.useState<ChecklistItem[]>(mockChecklist);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'scheduled': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'scheduled': return <Schedule />;
      case 'in_progress': return <PlayArrow />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <Stop />;
      default: return null;
    }
  };

  const stats = {
    total: audits.length,
    scheduled: audits.filter(a => a.status === 'scheduled').length,
    inProgress: audits.filter(a => a.status === 'in_progress').length,
    completed: audits.filter(a => a.status === 'completed').length,
    avgScore: Math.round(
      audits
        .filter(a => a.score)
        .reduce((acc, a) => acc + (a.score || 0), 0) /
      audits.filter(a => a.score).length || 0
    )
  };

  const handleChecklistUpdate = (itemId: string, status: ChecklistItem['status']) => {
    setChecklist(checklist.map(item => item.id === itemId ? { ...item, status } : item));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Audit Manager
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedAudit(null);
            setOpenDialog(true);
          }}
        >
          Schedule Audit
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Audits
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.total}
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Scheduled
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {stats.scheduled}
                  </Typography>
                </Box>
                <Schedule sx={{ fontSize: 40, color: 'info.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    In Progress
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {stats.inProgress}
                  </Typography>
                </Box>
                <PlayArrow sx={{ fontSize: 40, color: 'warning.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Completed
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {stats.completed}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Avg Score
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {stats.avgScore}%
                  </Typography>
                </Box>
                <Timeline sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="All Audits" />
        <Tab label="Active Audit" />
        <Tab label="Audit Templates" />
        <Tab label="Reports" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        {/* Audits Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Audit Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Auditor</TableCell>
                <TableCell>Auditee</TableCell>
                <TableCell>Scheduled Date</TableCell>
                <TableCell>Findings</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {audits.map((audit) => (
                <TableRow key={audit.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {audit.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={audit.type} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={getStatusIcon(audit.status) as any}
                      label={audit.status.replace('_', ' ')}
                      size="small"
                      color={getStatusColor(audit.status) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 24, height: 24 }}>
                        {audit.auditor[0]}
                      </Avatar>
                      <Typography variant="body2">{audit.auditor}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{audit.auditee}</TableCell>
                  <TableCell>{format(new Date(audit.scheduledDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      {audit.findings.critical > 0 && (
                        <Chip label={`${audit.findings.critical} Critical`} size="small" color="error" />
                      )}
                      {audit.findings.major > 0 && (
                        <Chip label={`${audit.findings.major} Major`} size="small" color="warning" />
                      )}
                      {audit.findings.minor > 0 && (
                        <Chip label={`${audit.findings.minor} Minor`} size="small" />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {audit.score ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress 
                          variant="determinate" 
                          value={audit.score}
                          sx={{ width: 60, height: 8, borderRadius: 1 }}
                        />
                        <Typography variant="body2" fontWeight="bold">
                          {audit.score}%
                        </Typography>
                      </Box>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {audit.status === 'scheduled' && (
                        <IconButton size="small" color="primary">
                          <PlayArrow />
                        </IconButton>
                      )}
                      {audit.status === 'in_progress' && (
                        <IconButton size="small" color="warning">
                          <Pause />
                        </IconButton>
                      )}
                      <IconButton size="small">
                        <GetApp />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Active Audit Checklist */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Active Audit: Q4 2024 Internal Food Safety Audit
          </Typography>
          <Box display="flex" gap={2} mb={3}>
            <Chip icon={<Person />} label="Auditor: Sarah Johnson" />
            <Chip icon={<Business />} label="Production Facility A" />
            <Chip icon={<CalendarToday />} label="Started: Dec 15, 2024" />
          </Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            Complete the checklist items below. Mark each item as Pass, Fail, or N/A
          </Alert>
          <List>
            {checklist.map((item) => (
              <ListItem key={item.id} divider>
                <ListItemText
                  primary={item.item}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.secondary">
                        {item.category}
                      </Typography>
                      {item.notes && (
                        <Typography component="span" variant="body2" color="error">
                          {' - ' + item.notes}
                        </Typography>
                      )}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant={item.status === 'pass' ? 'contained' : 'outlined'}
                      color="success"
                      onClick={() => handleChecklistUpdate(item.id, 'pass')}
                    >
                      Pass
                    </Button>
                    <Button
                      size="small"
                      variant={item.status === 'fail' ? 'contained' : 'outlined'}
                      color="error"
                      onClick={() => handleChecklistUpdate(item.id, 'fail')}
                    >
                      Fail
                    </Button>
                    <Button
                      size="small"
                      variant={item.status === 'na' ? 'contained' : 'outlined'}
                      onClick={() => handleChecklistUpdate(item.id, 'na')}
                    >
                      N/A
                    </Button>
                  </Stack>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <Button variant="outlined">Save Progress</Button>
            <Button variant="contained" startIcon={<Report />}>
              Complete Audit
            </Button>
          </Box>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Audit Templates
        </Typography>
        <Alert severity="info">
          Pre-configured audit templates help standardize your audit process. Coming soon...
        </Alert>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Audit Reports
        </Typography>
        <Alert severity="info">
          Generate and download comprehensive audit reports. Coming soon...
        </Alert>
      </TabPanel>

      {/* Schedule Audit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Schedule New Audit</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField fullWidth label="Audit Title" />
            <TextField fullWidth select label="Audit Type">
              <MenuItem value="Internal">Internal</MenuItem>
              <MenuItem value="External">External</MenuItem>
              <MenuItem value="Supplier">Supplier</MenuItem>
              <MenuItem value="Regulatory">Regulatory</MenuItem>
            </TextField>
            <TextField fullWidth label="Auditor" />
            <TextField fullWidth label="Auditee" />
            <TextField
              fullWidth
              label="Scheduled Date"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            <TextField fullWidth select label="Audit Template">
              <MenuItem value="food_safety">Food Safety Audit</MenuItem>
              <MenuItem value="gmp">GMP Audit</MenuItem>
              <MenuItem value="supplier">Supplier Audit</MenuItem>
              <MenuItem value="custom">Custom Checklist</MenuItem>
            </TextField>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Audit Scope & Objectives"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            Schedule Audit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditManager;