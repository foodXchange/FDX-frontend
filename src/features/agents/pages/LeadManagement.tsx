import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Search,
  FilterList,
  ViewKanban,
  ViewList,
  Add,
  Download,
} from '@mui/icons-material';
import { useAgentStore } from '../store';
import { agentApi } from '../services';
import { LeadSearchFilters, LeadStatus, LeadPriority, BusinessType } from '../types';
import LeadKanban from '../components/organisms/LeadKanban';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`lead-tabpanel-${index}`}
    aria-labelledby={`lead-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const LeadManagement: React.FC = () => {
  const theme = useTheme();
  const {
    leads,
    setLeads,
    leadFilters,
    setLeadFilters,
    leadLoading,
    currentAgent,
  } = useAgentStore();

  const [currentTab, setCurrentTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeads();
  }, [leadFilters]);

  const loadLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await agentApi.searchLeads(leadFilters);
      setLeads(result.leads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLeadFilters({ ...leadFilters, search: query });
  };

  const handleFilterChange = (filterKey: keyof LeadSearchFilters, value: any) => {
    setLeadFilters({ ...leadFilters, [filterKey]: value });
  };

  const clearFilters = () => {
    setLeadFilters({});
    setSearchQuery('');
  };

  const exportLeads = () => {
    // Implement CSV export functionality
    const csvContent = [
      ['Company Name', 'Contact Person', 'Email', 'Phone', 'Status', 'Priority', 'Estimated Revenue'],
      ...leads.map(lead => [
        lead.companyName,
        lead.contactPerson,
        lead.email,
        lead.phone,
        lead.status,
        lead.priority,
        lead.estimatedRevenue.toString(),
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getActiveFiltersCount = () => {
    return Object.values(leadFilters).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length;
  };

  const LeadListView: React.FC = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        List View (Coming Soon)
      </Typography>
      <Alert severity="info">
        The list view is currently under development. Please use the Kanban view for now.
      </Alert>
    </Box>
  );

  const FilterPanel: React.FC = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                multiple
                value={leadFilters.status || []}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="contacted">Contacted</MenuItem>
                <MenuItem value="qualified">Qualified</MenuItem>
                <MenuItem value="proposal">Proposal</MenuItem>
                <MenuItem value="negotiation">Negotiation</MenuItem>
                <MenuItem value="closed_won">Closed Won</MenuItem>
                <MenuItem value="closed_lost">Closed Lost</MenuItem>
                <MenuItem value="nurturing">Nurturing</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                multiple
                value={leadFilters.priority || []}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                label="Priority"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Business Type</InputLabel>
              <Select
                multiple
                value={leadFilters.businessType || []}
                onChange={(e) => handleFilterChange('businessType', e.target.value)}
                label="Business Type"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="restaurant">Restaurant</MenuItem>
                <MenuItem value="grocery">Grocery</MenuItem>
                <MenuItem value="catering">Catering</MenuItem>
                <MenuItem value="food_truck">Food Truck</MenuItem>
                <MenuItem value="bakery">Bakery</MenuItem>
                <MenuItem value="farm">Farm</MenuItem>
                <MenuItem value="distributor">Distributor</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Location"
              value={leadFilters.location || ''}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              placeholder="City, State"
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={clearFilters} size="small">
            Clear All
          </Button>
          <Button variant="contained" onClick={loadLeads} size="small">
            Apply Filters
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Lead Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={exportLeads}
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Add Lead
            </Button>
          </Box>
        </Box>
        
        {/* Search and Filter Bar */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ 
              textTransform: 'none',
              minWidth: 'fit-content',
              position: 'relative',
            }}
          >
            Filters
            {getActiveFiltersCount() > 0 && (
              <Chip
                label={getActiveFiltersCount()}
                size="small"
                color="primary"
                sx={{ ml: 1, height: 20 }}
              />
            )}
          </Button>
        </Box>
        
        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip label={`Total: ${leads.length}`} color="primary" />
          <Chip label={`Active: ${leads.filter(l => l.status !== 'closed_won' && l.status !== 'closed_lost').length}`} color="success" />
          <Chip label={`Won: ${leads.filter(l => l.status === 'closed_won').length}`} color="success" />
          <Chip label={`Lost: ${leads.filter(l => l.status === 'closed_lost').length}`} color="error" />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filter Panel */}
      {showFilters && <FilterPanel />}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab
            icon={<ViewKanban />}
            label="Kanban"
            iconPosition="start"
            sx={{ textTransform: 'none' }}
          />
          <Tab
            icon={<ViewList />}
            label="List"
            iconPosition="start"
            sx={{ textTransform: 'none' }}
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={currentTab} index={0}>
        <LeadKanban />
      </TabPanel>
      
      <TabPanel value={currentTab} index={1}>
        <LeadListView />
      </TabPanel>
    </Container>
  );
};

export default LeadManagement;