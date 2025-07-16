import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Collapse,
  Grid,
  Slider,
  DatePicker,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormLabel,
  Divider,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  Save,
  ExpandMore,
  ExpandLess,
  TuneSharp,
  LocationOn,
  Business,
  AttachMoney,
  Schedule,
  Star,
} from '@mui/icons-material';
import { LeadSearchFilters, BusinessType, LeadPriority, LeadStatus, LeadSource } from '../../types';

interface SavedFilter {
  id: string;
  name: string;
  filters: LeadSearchFilters;
  isDefault: boolean;
  createdAt: string;
}

interface AdvancedSearchFilterProps {
  filters: LeadSearchFilters;
  onFiltersChange: (filters: LeadSearchFilters) => void;
  onSearch: () => void;
  resultCount?: number;
  isLoading?: boolean;
}

const AdvancedSearchFilter: React.FC<AdvancedSearchFilterProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  resultCount = 0,
  isLoading = false,
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [showSavedFilters, setShowSavedFilters] = useState(false);

  // Quick filter options
  const quickFilters = [
    { label: 'My Leads', filters: { assignedAgentId: 'current' } },
    { label: 'Hot Leads', filters: { priority: ['urgent', 'high'] } },
    { label: 'New This Week', filters: { dateRange: { startDate: getWeekStart(), endDate: new Date().toISOString() } } },
    { label: 'High Value', filters: { estimatedRevenue: { min: 10000 } } },
    { label: 'Restaurants', filters: { businessType: ['restaurant'] } },
    { label: 'Qualified', filters: { status: ['qualified', 'proposal', 'negotiation'] } },
  ];

  // Location suggestions (mock data)
  const locationSuggestions = [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
    'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA',
  ];

  function getWeekStart(): string {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekStart = new Date(date.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart.toISOString();
  }

  const handleFilterChange = (key: keyof LeadSearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleQuickFilter = (quickFilter: { filters: Partial<LeadSearchFilters> }) => {
    onFiltersChange({ ...filters, ...quickFilter.filters });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  };

  const saveCurrentFilter = () => {
    if (!filterName.trim()) return;

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName.trim(),
      filters: { ...filters },
      isDefault: false,
      createdAt: new Date().toISOString(),
    };

    setSavedFilters(prev => [...prev, newFilter]);
    setFilterName('');
    setSaveDialogOpen(false);
  };

  const loadSavedFilter = (savedFilter: SavedFilter) => {
    onFiltersChange(savedFilter.filters);
    setShowSavedFilters(false);
  };

  const deleteSavedFilter = (filterId: string) => {
    setSavedFilters(prev => prev.filter(f => f.id !== filterId));
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ pb: 2 }}>
        {/* Search Bar */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search leads by company, contact, email, or phone..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
              endAdornment: filters.search && (
                <IconButton size="small" onClick={() => handleFilterChange('search', '')}>
                  <Clear />
                </IconButton>
              ),
            }}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          />
          <Button
            variant="contained"
            onClick={onSearch}
            disabled={isLoading}
            sx={{ minWidth: 100 }}
          >
            Search
          </Button>
        </Box>

        {/* Quick Filters */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {quickFilters.map((quickFilter, index) => (
            <Chip
              key={index}
              label={quickFilter.label}
              onClick={() => handleQuickFilter(quickFilter)}
              variant="outlined"
              size="small"
              sx={{
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            />
          ))}
        </Box>

        {/* Filter Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              startIcon={<FilterList />}
              endIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setIsExpanded(!isExpanded)}
              variant="outlined"
              size="small"
            >
              Advanced Filters
              {getActiveFilterCount() > 0 && (
                <Chip
                  label={getActiveFilterCount()}
                  size="small"
                  color="primary"
                  sx={{ ml: 1, height: 20 }}
                />
              )}
            </Button>
            
            {getActiveFilterCount() > 0 && (
              <Button
                startIcon={<Clear />}
                onClick={clearAllFilters}
                variant="text"
                size="small"
                color="error"
              >
                Clear All
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<Save />}
              onClick={() => setSaveDialogOpen(true)}
              variant="text"
              size="small"
              disabled={getActiveFilterCount() === 0}
            >
              Save Filter
            </Button>
            
            <Button
              startIcon={<TuneSharp />}
              onClick={() => setShowSavedFilters(!showSavedFilters)}
              variant="text"
              size="small"
            >
              Saved Filters
            </Button>
          </Box>
        </Box>

        {/* Results Summary */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {isLoading ? 'Searching...' : `${resultCount} leads found`}
          </Typography>
          {getActiveFilterCount() > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {filters.status?.map(status => (
                <Chip
                  key={status}
                  label={`Status: ${status}`}
                  size="small"
                  onDelete={() => {
                    const newStatus = filters.status?.filter(s => s !== status);
                    handleFilterChange('status', newStatus?.length ? newStatus : undefined);
                  }}
                />
              ))}
              {filters.priority?.map(priority => (
                <Chip
                  key={priority}
                  label={`Priority: ${priority}`}
                  size="small"
                  onDelete={() => {
                    const newPriority = filters.priority?.filter(p => p !== priority);
                    handleFilterChange('priority', newPriority?.length ? newPriority : undefined);
                  }}
                />
              ))}
              {filters.businessType?.map(type => (
                <Chip
                  key={type}
                  label={`Type: ${type}`}
                  size="small"
                  onDelete={() => {
                    const newTypes = filters.businessType?.filter(t => t !== type);
                    handleFilterChange('businessType', newTypes?.length ? newTypes : undefined);
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Saved Filters */}
        <Collapse in={showSavedFilters}>
          <Box sx={{ mb: 2, p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05), borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Saved Filters</Typography>
            {savedFilters.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No saved filters yet. Create some custom filters to save time!
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {savedFilters.map(savedFilter => (
                  <Chip
                    key={savedFilter.id}
                    label={savedFilter.name}
                    onClick={() => loadSavedFilter(savedFilter)}
                    onDelete={() => deleteSavedFilter(savedFilter.id)}
                    color={savedFilter.isDefault ? 'primary' : 'default'}
                    variant={savedFilter.isDefault ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Collapse>

        {/* Advanced Filters */}
        <Collapse in={isExpanded}>
          <Box sx={{ pt: 2 }}>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              {/* Status Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    multiple
                    value={filters.status || []}
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

              {/* Priority Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    multiple
                    value={filters.priority || []}
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

              {/* Business Type Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Business Type</InputLabel>
                  <Select
                    multiple
                    value={filters.businessType || []}
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

              {/* Location Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <Autocomplete
                  options={locationSuggestions}
                  value={filters.location || ''}
                  onChange={(_, newValue) => handleFilterChange('location', newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Location"
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                  )}
                  freeSolo
                />
              </Grid>

              {/* Source Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Source</InputLabel>
                  <Select
                    multiple
                    value={filters.source || []}
                    onChange={(e) => handleFilterChange('source', e.target.value)}
                    label="Source"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    <MenuItem value="website">Website</MenuItem>
                    <MenuItem value="referral">Referral</MenuItem>
                    <MenuItem value="cold_call">Cold Call</MenuItem>
                    <MenuItem value="social_media">Social Media</MenuItem>
                    <MenuItem value="advertisement">Advertisement</MenuItem>
                    <MenuItem value="event">Event</MenuItem>
                    <MenuItem value="partner">Partner</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Assigned Agent */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Assigned Agent</InputLabel>
                  <Select
                    value={filters.assignedAgentId || ''}
                    onChange={(e) => handleFilterChange('assignedAgentId', e.target.value)}
                    label="Assigned Agent"
                  >
                    <MenuItem value="">All Agents</MenuItem>
                    <MenuItem value="current">My Leads</MenuItem>
                    <MenuItem value="unassigned">Unassigned</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Estimated Revenue Range */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  <AttachMoney sx={{ mr: 1 }} />
                  Estimated Revenue Range
                </Typography>
                <Box sx={{ px: 2 }}>
                  <Slider
                    value={[
                      (filters as any).estimatedRevenue?.min || 0,
                      (filters as any).estimatedRevenue?.max || 100000,
                    ]}
                    onChange={(_, newValue) => {
                      const [min, max] = newValue as number[];
                      handleFilterChange('estimatedRevenue', { min, max });
                    }}
                    valueLabelDisplay="auto"
                    min={0}
                    max={100000}
                    step={1000}
                    valueLabelFormat={(value) => `$${value.toLocaleString()}`}
                    marks={[
                      { value: 0, label: '$0' },
                      { value: 25000, label: '$25K' },
                      { value: 50000, label: '$50K' },
                      { value: 75000, label: '$75K' },
                      { value: 100000, label: '$100K+' },
                    ]}
                  />
                </Box>
              </Grid>

              {/* Date Range */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Schedule sx={{ mr: 1 }} />
                  Date Range
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    type="date"
                    label="From"
                    size="small"
                    value={filters.dateRange?.startDate?.split('T')[0] || ''}
                    onChange={(e) => {
                      const startDate = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                      handleFilterChange('dateRange', {
                        ...filters.dateRange,
                        startDate,
                      });
                    }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    type="date"
                    label="To"
                    size="small"
                    value={filters.dateRange?.endDate?.split('T')[0] || ''}
                    onChange={(e) => {
                      const endDate = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                      handleFilterChange('dateRange', {
                        ...filters.dateRange,
                        endDate,
                      });
                    }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        {/* Save Filter Dialog */}
        <Collapse in={saveDialogOpen}>
          <Box sx={{ mt: 2, p: 2, backgroundColor: alpha(theme.palette.info.main, 0.05), borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>Save Current Filter</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                size="small"
                label="Filter Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="e.g., High Priority Restaurant Leads"
              />
              <Button
                variant="contained"
                onClick={saveCurrentFilter}
                disabled={!filterName.trim()}
                size="small"
              >
                Save
              </Button>
              <Button
                variant="text"
                onClick={() => setSaveDialogOpen(false)}
                size="small"
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearchFilter;