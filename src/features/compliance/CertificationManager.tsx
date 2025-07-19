import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Stack, Alert,
  Card, CardContent, Menu, ListItemIcon, ListItemText, Grid, IconButton
} from '@mui/material';
import {
  Add, Upload, Download, Delete, Edit, Visibility, Warning,
  CheckCircle, Schedule, MoreVert, CloudUpload, Refresh
} from "@mui/icons-material";
import { format, differenceInDays } from "date-fns";

interface Certification {
  id: string;
  name: string;
  type: 'ISO' | 'HACCP' | 'FDA' | 'GMP' | 'Organic' | 'Halal' | 'Kosher' | 'Other';
  issuer: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expiring' | 'expired' | 'pending';
  documentUrl?: string;
  supplier?: string;
  lastVerified?: string;
  notes?: string;
}

const certificationTypes = [
  'ISO', 'HACCP', 'FDA', 'GMP', 'Organic', 'Halal', 'Kosher', 'Other'
];

const mockCertifications: Certification[] = [
  {
    id: '1',
    name: 'ISO 22000:2018 Food Safety',
    type: 'ISO',
    issuer: 'SGS International',
    issueDate: '2023-01-15',
    expiryDate: '2025-01-14',
    status: 'active',
    supplier: 'Premium Foods Ltd',
    lastVerified: '2024-12-01'
  },
  {
    id: '2',
    name: 'HACCP Certification',
    type: 'HACCP',
    issuer: 'Bureau Veritas',
    issueDate: '2023-06-20',
    expiryDate: '2024-08-19',
    status: 'expiring',
    supplier: 'Fresh Produce Co',
    lastVerified: '2024-11-15'
  },
  {
    id: '3',
    name: 'FDA Registration',
    type: 'FDA',
    issuer: 'US FDA',
    issueDate: '2022-03-10',
    expiryDate: '2024-03-09',
    status: 'expired',
    supplier: 'Global Pharma Inc'
  }
];

const CertificationManager: React.FC = () => {
  const [certifications, setCertifications] = React.useState<Certification[]>(mockCertifications);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedCert, setSelectedCert] = React.useState<Certification | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = React.useState<string>('');
  const [filter, setFilter] = React.useState<'all' | 'active' | 'expiring' | 'expired'>('all');

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'success';
      case 'expiring': return 'warning';
      case 'expired': return 'error';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'active': return <CheckCircle />;
      case 'expiring': return <Warning />;
      case 'expired': return <Warning />;
      case 'pending': return <Schedule />;
      default: return null;
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    return differenceInDays(new Date(expiryDate), new Date());
  };

  const updateCertificationStatus = (cert: Certification) => {
    const daysUntilExpiry = getDaysUntilExpiry(cert.expiryDate);
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring';
    return 'active';
  };

  const filteredCertifications = certifications.filter(cert => {
    if (filter === 'all') return true;
    return cert.status === filter;
  });

  const stats = {
    total: certifications.length,
    active: certifications.filter(c => c.status === 'active').length,
    expiring: certifications.filter(c => c.status === 'expiring').length,
    expired: certifications.filter(c => c.status === 'expired').length
  };

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
          Certification Manager
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<CloudUpload />}>
            Bulk Upload
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedCert(null);
              setOpenDialog(true);
            }}
          >
            Add Certification
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Certifications
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.total}
                  </Typography>
                </Box>
                <Upload sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Active
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {stats.active}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Expiring Soon
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {stats.expiring}
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 40, color: 'warning.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Expired
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {stats.expired}
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 40, color: 'error.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Controls */}
      <Box display="flex" gap={2} mb={3}>
        <Button
          variant={filter === 'all' ? 'contained' : 'outlined'}
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'active' ? 'contained' : 'outlined'}
          color="success"
          onClick={() => setFilter('active')}
        >
          Active
        </Button>
        <Button
          variant={filter === 'expiring' ? 'contained' : 'outlined'}
          color="warning"
          onClick={() => setFilter('expiring')}
        >
          Expiring
        </Button>
        <Button
          variant={filter === 'expired' ? 'contained' : 'outlined'}
          color="error"
          onClick={() => setFilter('expired')}
        >
          Expired
        </Button>
      </Box>

      {/* Certifications Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Certification Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Issuer</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Days Until Expiry</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCertifications.map((cert) => {
              const daysUntilExpiry = getDaysUntilExpiry(cert.expiryDate);
              return (
                <TableRow key={cert.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {cert.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={cert.type} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(cert.status) as any}
                      label={cert.status}
                      size="small"
                      color={getStatusColor(cert.status) as any}
                    />
                  </TableCell>
                  <TableCell>{cert.issuer}</TableCell>
                  <TableCell>{cert.supplier}</TableCell>
                  <TableCell>{format(new Date(cert.issueDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{format(new Date(cert.expiryDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color={daysUntilExpiry < 0 ? 'error' : daysUntilExpiry <= 30 ? 'warning.main' : 'text.primary'}
                    >
                      {daysUntilExpiry < 0 ? `${Math.abs(daysUntilExpiry)} days overdue` : `${daysUntilExpiry} days`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, cert.id)}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
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
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Refresh fontSize="small" />
          </ListItemIcon>
          <ListItemText>Verify</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add/Edit Certification Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCert ? 'Edit Certification' : 'Add New Certification'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField fullWidth label="Certification Name" />
            <TextField fullWidth select label="Type">
              {certificationTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField fullWidth label="Issuer" />
            <TextField fullWidth label="Supplier" />
            <TextField
              fullWidth
              label="Issue Date"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Expiry Date"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes"
            />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Upload Document
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CloudUpload />}
                component="label"
              >
                Choose File
                <input type="file" hidden accept=".pdf,.doc,.docx" />
              </Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            {selectedCert ? 'Update' : 'Add'} Certification
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CertificationManager;