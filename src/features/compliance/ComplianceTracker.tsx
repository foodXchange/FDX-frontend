import React, { useState } from 'react';
import {
  Box, Typography, Paper, Card, CardContent, LinearProgress, Chip, Stack,
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, AvatarGroup,
  Tooltip, Divider, Grid, IconButton
} from "@mui/material";
import {
  CheckCircle, Warning, Error as ErrorIcon, TrendingUp, TrendingDown,
  Assignment, Timeline, MoreVert, Download, Schedule, Business, Category, Refresh
} from "@mui/icons-material";
import { format } from "date-fns";

interface ComplianceItem {
  id: string;
  category: 'Certification' | 'Audit' | 'Training' | 'Policy' | 'Inspection';
  title: string;
  description: string;
  dueDate: string;
  status: 'compliant' | 'pending' | 'non_compliant' | 'at_risk';
  assignedTo: string[];
  lastUpdated: string;
  supplier?: string;
  priority: 'high' | 'medium' | 'low';
  completionPercentage: number;
}

interface ComplianceMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

const mockComplianceItems: ComplianceItem[] = [
  {
    id: '1',
    category: 'Certification',
    title: 'ISO 22000 Renewal',
    description: 'Annual ISO 22000 food safety certification renewal',
    dueDate: '2024-12-30',
    status: 'at_risk',
    assignedTo: ['John Doe', 'Jane Smith'],
    lastUpdated: '2024-12-01',
    supplier: 'Premium Foods Ltd',
    priority: 'high',
    completionPercentage: 75
  },
  {
    id: '2',
    category: 'Audit',
    title: 'Q4 Internal Audit',
    description: 'Quarterly internal compliance audit',
    dueDate: '2024-12-20',
    status: 'pending',
    assignedTo: ['Sarah Johnson'],
    lastUpdated: '2024-12-10',
    priority: 'medium',
    completionPercentage: 40
  },
  {
    id: '3',
    category: 'Training',
    title: 'HACCP Training Renewal',
    description: 'Annual HACCP training for production staff',
    dueDate: '2025-01-15',
    status: 'compliant',
    assignedTo: ['Training Team'],
    lastUpdated: '2024-11-28',
    priority: 'medium',
    completionPercentage: 100
  },
  {
    id: '4',
    category: 'Policy',
    title: 'Food Safety Policy Update',
    description: 'Review and update food safety policy document',
    dueDate: '2024-12-15',
    status: 'non_compliant',
    assignedTo: ['Policy Team'],
    lastUpdated: '2024-12-05',
    priority: 'high',
    completionPercentage: 20
  }
];

const mockMetrics: ComplianceMetric[] = [
  { name: 'Overall Compliance', value: 85, change: 5, trend: 'up' },
  { name: 'Active Certifications', value: 12, change: 2, trend: 'up' },
  { name: 'Pending Actions', value: 8, change: -3, trend: 'down' },
  { name: 'Risk Items', value: 3, change: 1, trend: 'up' }
];

const ComplianceTracker: React.FC = () => {
  const [items, setItems] = useState<ComplianceItem[]>(mockComplianceItems);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'at_risk' | 'compliant'>('all');

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'compliant': return 'success';
      case 'pending': return 'warning';
      case 'non_compliant': return 'error';
      case 'at_risk': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'compliant': return <CheckCircle />;
      case 'pending': return <Schedule />;
      case 'non_compliant': return <ErrorIcon />;
      case 'at_risk': return <Warning />;
      default: return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Certification': return <Assignment />;
      case 'Audit': return <Timeline />;
      case 'Training': return <Category />;
      case 'Policy': return <Business />;
      case 'Inspection': return <CheckCircle />;
      default: return <Assignment />;
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedId('');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Compliance Tracker
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Download />}>
            Export Report
          </Button>
          <Button variant="contained" startIcon={<Refresh />}>
            Refresh Data
          </Button>
        </Stack>
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={3} mb={3}>
        {mockMetrics.map((metric, index) => (
          <Grid key={metric.name} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      {metric.name}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {metric.value}{metric.name === 'Overall Compliance' ? '%' : ''}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {metric.trend === 'up' ? (
                        <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                      ) : metric.trend === 'down' ? (
                        <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                      ) : null}
                      <Typography
                        variant="body2"
                        color={metric.trend === 'up' ? 'success.main' : metric.trend === 'down' ? 'error.main' : 'text.secondary'}
                      >
                        {metric.change > 0 ? '+' : ''}{metric.change}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filter Controls */}
      <Box display="flex" gap={2} mb={3}>
        <Button
          variant={filter === 'all' ? 'contained' : 'outlined'}
          onClick={() => setFilter('all')}
        >
          All Items
        </Button>
        <Button
          variant={filter === 'pending' ? 'contained' : 'outlined'}
          color="warning"
          onClick={() => setFilter('pending')}
        >
          Pending
        </Button>
        <Button
          variant={filter === 'at_risk' ? 'contained' : 'outlined'}
          color="error"
          onClick={() => setFilter('at_risk')}
        >
          At Risk
        </Button>
        <Button
          variant={filter === 'compliant' ? 'contained' : 'outlined'}
          color="success"
          onClick={() => setFilter('compliant')}
        >
          Compliant
        </Button>
      </Box>

      {/* Compliance Items Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.description}
                    </Typography>
                    {item.supplier && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        Supplier: {item.supplier}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getCategoryIcon(item.category) as any}
                    label={item.category}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(item.status) as any}
                    label={item.status.replace('_', ' ')}
                    size="small"
                    color={getStatusColor(item.status) as any}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.priority}
                    size="small"
                    color={getPriorityColor(item.priority) as any}
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LinearProgress
                      variant="determinate"
                      value={item.completionPercentage}
                      sx={{ width: 60, height: 8, borderRadius: 1 }}
                    />
                    <Typography variant="body2" fontWeight="bold">
                      {item.completionPercentage}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {format(new Date(item.dueDate), 'MMM dd, yyyy')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <AvatarGroup max={3} sx={{ justifyContent: 'flex-start' }}>
                    {item.assignedTo.map((person, index) => (
                      <Tooltip key={index} title={person}>
                        <Avatar sx={{ width: 24, height: 24 }}>
                          {person[0]}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </AvatarGroup>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, item.id)}
                  >
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Assignment fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Schedule fontSize="small" />
          </ListItemIcon>
          <ListItemText>Update Status</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ComplianceTracker;