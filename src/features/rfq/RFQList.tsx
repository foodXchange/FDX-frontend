import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  IconButton,
  Stack,
  Pagination,
  Alert,
  Paper,
  Collapse,
  Divider,
  Container,
  Skeleton
} from '@mui/material';
import { Search as MagnifyingGlassIcon, Edit as PencilIcon, Delete as TrashIcon,  } from '@mui/icons-material';
import { rfqService } from '../../services/rfqService';
import { RFQ, RFQFilters } from '../../shared/types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatDistanceToNow, format } from 'date-fns';
import { ExclamationTriangleIcon, UserGroupIcon, PlusIcon, FunnelIcon, DocumentTextIcon, CalendarDaysIcon, EyeIcon } from '@heroicons/react/24/outline';

interface RFQListProps {
  userRole?: 'buyer' | 'supplier';
  showActions?: boolean;
}

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'closed', label: 'Closed' },
  { value: 'awarded', label: 'Awarded' },
  { value: 'expired', label: 'Expired' },
];

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'Fruits & Vegetables', label: 'Fruits & Vegetables' },
  { value: 'Grains & Cereals', label: 'Grains & Cereals' },
  { value: 'Dairy Products', label: 'Dairy Products' },
  { value: 'Meat & Poultry', label: 'Meat & Poultry' },
  { value: 'Seafood', label: 'Seafood' },
  { value: 'Processed Foods', label: 'Processed Foods' },
  { value: 'Beverages', label: 'Beverages' },
  { value: 'Spices & Seasonings', label: 'Spices & Seasonings' },
  { value: 'Oils & Fats', label: 'Oils & Fats' },
  { value: 'Bakery Products', label: 'Bakery Products' },
];

const sortOptions = [
  { value: 'createdAt_desc', label: 'Newest First' },
  { value: 'createdAt_asc', label: 'Oldest First' },
  { value: 'title_asc', label: 'Title A-Z' },
  { value: 'title_desc', label: 'Title Z-A' },
  { value: 'deliveryDate_asc', label: 'Delivery Date (Early)' },
  { value: 'deliveryDate_desc', label: 'Delivery Date (Late)' },
  { value: 'submissionDeadline_asc', label: 'Deadline (Soon)' },
  { value: 'submissionDeadline_desc', label: 'Deadline (Later)' },
];

export const RFQList: React.FC<RFQListProps> = ({ 
  userRole = 'buyer', 
  showActions = true 
}) => {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState<RFQFilters>({
    status: '',
    category: '',
    sortBy: 'createdAt_desc',
    page: 1,
    limit: itemsPerPage,
  });

  useEffect(() => {
    fetchRFQs();
  }, [filters]);

  const fetchRFQs = async () => {
    try {
      setLoading(true);
      const filterParams = {
        ...filters,
        search: searchTerm,
        page: currentPage,
      };
      
      const response = await rfqService.getRFQs(filterParams);
      setRfqs(response.data);
      setTotalPages(Math.ceil(response.total / itemsPerPage));
    } catch (err) {
      setError('Failed to load RFQs');
      console.error('RFQ fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchRFQs();
  };

  const handleFilterChange = (key: keyof RFQFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleDeleteRFQ = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this RFQ?')) {
      try {
        await rfqService.deleteRFQ(id);
        setRfqs(prev => prev.filter(rfq => rfq.id !== id));
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const getUrgencyLevel = (rfq: RFQ) => {
    const now = new Date();
    const deadline = new Date(rfq.submissionDeadline);
    const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursLeft < 0) return 'expired';
    if (hoursLeft < 24) return 'urgent';
    if (hoursLeft < 72) return 'warning';
    return 'normal';
  };

  const getUrgencyDisplay = (urgency: string) => {
    switch (urgency) {
      case 'expired':
        return { text: 'Expired', color: 'error' };
      case 'urgent':
        return { text: 'Urgent', color: 'error' };
      case 'warning':
        return { text: 'Soon', color: 'warning' };
      default:
        return null;
    }
  };

  const filteredRFQs = useMemo(() => {
    return rfqs.filter(rfq => {
      const matchesSearch = rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rfq.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rfq.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [rfqs, searchTerm]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton width={200} height={32} />
          <Skeleton width={120} height={40} />
        </Box>
        <Stack spacing={2}>
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} width="100%" height={120} variant="rectangular" />
          ))}
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error" icon={<ExclamationTriangleIcon />}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ color: 'grey.900', fontWeight: 'bold' }}>
            RFQ Management
          </Typography>
          <Typography variant="body1" sx={{ color: 'grey.600' }}>
            {userRole === 'buyer' ? 'Manage your requests for quotations' : 'Browse available RFQs'}
          </Typography>
        </Box>
        {userRole === 'buyer' && (
          <Button
            component={Link}
            to="/rfq/create"
            variant="contained"
            startIcon={<PlusIcon />}
            sx={{ borderRadius: 2 }}
          >
            Create RFQ
          </Button>
        )}
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSearch}>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search RFQs by title, description, or category..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MagnifyingGlassIcon sx={{ color: 'grey.400' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ borderRadius: 2 }}
                >
                  Search
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => setShowFilters(!showFilters)}
                  startIcon={<FunnelIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Filters
                </Button>
              </Box>
            </Stack>
          </form>

          <Collapse in={showFilters}>
            <Box sx={{ mt: 2, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      label="Status"
                    >
                      {statusOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      label="Category"
                    >
                      {categoryOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      label="Sort By"
                    >
                      {sortOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* RFQ List */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: 'grey.900' }}>
              RFQs ({filteredRFQs.length})
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.500' }}>
              Page {currentPage} of {totalPages}
            </Typography>
          </Box>

          <Stack divider={<Divider />} spacing={0}>
            {filteredRFQs.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <DocumentTextIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'grey.900', mb: 1 }}>
                  {searchTerm ? 'No RFQs found' : 'No RFQs available'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'grey.600', mb: 3 }}>
                  {searchTerm 
                    ? 'Try adjusting your search terms or filters'
                    : userRole === 'buyer' 
                      ? 'Start by creating your first RFQ' 
                      : 'No RFQs are currently available'
                  }
                </Typography>
                {userRole === 'buyer' && !searchTerm && (
                  <Button
                    component={Link}
                    to="/rfq/create"
                    variant="contained"
                    startIcon={<PlusIcon />}
                  >
                    Create First RFQ
                  </Button>
                )}
              </Box>
            ) : (
              filteredRFQs.map((rfq) => {
                const urgency = getUrgencyLevel(rfq);
                const urgencyDisplay = getUrgencyDisplay(urgency);
                
                return (
                  <motion.div
                    key={rfq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                            <Typography
                              component={Link}
                              to={`/rfq/${rfq.id}`}
                              variant="h6"
                              sx={{ 
                                color: 'grey.900',
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' }
                              }}
                            >
                              {rfq.title}
                            </Typography>
                            <StatusBadge status={rfq.status} type="rfq" />
                            {urgencyDisplay && (
                              <Chip
                                label={urgencyDisplay.text}
                                color={urgencyDisplay.color as any}
                                size="small"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            )}
                          </Box>
                          
                          <Typography variant="body2" sx={{ color: 'grey.600', mb: 2 }}>
                            {rfq.description}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <DocumentTextIcon sx={{ fontSize: 16 }} />
                              <Typography variant="body2">{rfq.category}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2">{rfq.quantity} {rfq.unit}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CalendarDaysIcon sx={{ fontSize: 16 }} />
                              <Typography variant="body2">
                                Delivery: {format(new Date(rfq.deliveryDate), 'MMM dd, yyyy')}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2">
                                Deadline: {format(new Date(rfq.submissionDeadline), 'MMM dd, yyyy HH:mm')}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2">
                                Created {formatDistanceToNow(new Date(rfq.createdAt))} ago
                              </Typography>
                            </Box>
                          </Box>
                          
                          {rfq.proposalCount > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <UserGroupIcon sx={{ fontSize: 16 }} />
                              <Typography variant="body2">
                                {rfq.proposalCount} proposal{rfq.proposalCount !== 1 ? 's' : ''} received
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        
                        {showActions && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                              component={Link}
                              to={`/rfq/${rfq.id}`}
                              title="View RFQ"
                              size="small"
                            >
                              <EyeIcon />
                            </IconButton>
                            {userRole === 'buyer' && rfq.status === 'draft' && (
                              <IconButton
                                component={Link}
                                to={`/rfq/${rfq.id}/edit`}
                                title="Edit RFQ"
                                size="small"
                              >
                                <PencilIcon />
                              </IconButton>
                            )}
                            {userRole === 'buyer' && (
                              <IconButton
                                onClick={() => handleDeleteRFQ(rfq.id)}
                                title="Delete RFQ"
                                size="small"
                                color="error"
                              >
                                <TrashIcon />
                              </IconButton>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  </motion.div>
                );
              })
            )}
          </Stack>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'grey.500' }}>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRFQs.length)} of {filteredRFQs.length} results
                </Typography>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => setCurrentPage(page)}
                  color="primary"
                  shape="rounded"
                />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};