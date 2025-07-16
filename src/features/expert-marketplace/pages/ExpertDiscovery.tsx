import { FC, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Drawer,
  useMediaQuery,
  useTheme,
  IconButton,
  Paper,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  FilterList,
  ViewList,
  ViewModule,
  Sort,
} from '@mui/icons-material';
import { useExperts } from '../hooks';
import {
  ExpertSearchBar,
  ExpertCard,
  ExpertFilters,
} from '../components';

export const ExpertDiscovery: FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [filtersOpen, setFiltersOpen] = useState(!isMobile);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const {
    experts,
    filters,
    loading,
    error,
    hasMore,
    totalCount,
    searchExperts,
    loadMore,
    updateFilters,
    clearFilters,
  } = useExperts({
    pageSize: 20,
    autoSearch: true,
  });

  const handleSearch = (query: string) => {
    updateFilters({ query });
  };

  const handleFiltersChange = (newFilters: any) => {
    updateFilters(newFilters);
  };

  const handleApplyFilters = () => {
    searchExperts();
    if (isMobile) {
      setFiltersOpen(false);
    }
  };

  const renderExpertSkeleton = () => (
    <Grid container spacing={3}>
      {Array.from({ length: 8 }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" gap={2} mb={2}>
              <Skeleton variant="circular" width={56} height={56} />
              <Box flex={1}>
                <Skeleton variant="text" height={24} />
                <Skeleton variant="text" height={20} width="60%" />
              </Box>
            </Box>
            <Skeleton variant="text" height={60} />
            <Box display="flex" gap={1} mt={2}>
              <Skeleton variant="rectangular" width={80} height={24} />
              <Skeleton variant="rectangular" width={60} height={24} />
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Find Food Industry Experts
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connect with verified experts to optimize your food supply chain
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box mb={3}>
        <ExpertSearchBar
          value={filters.query || ''}
          filters={filters}
          onSearch={handleSearch}
          onFilterClick={() => setFiltersOpen(true)}
          onClearSearch={clearFilters}
          activeFilterCount={Object.keys(filters).filter(k => k !== 'query').length}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Filters Sidebar */}
        {isMobile ? (
          <Drawer
            anchor="left"
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            sx={{
              '& .MuiDrawer-paper': {
                width: 320,
                p: 2,
              },
            }}
          >
            <ExpertFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onApply={handleApplyFilters}
              onReset={clearFilters}
            />
          </Drawer>
        ) : (
          <Grid item md={3}>
            <ExpertFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onApply={handleApplyFilters}
              onReset={clearFilters}
            />
          </Grid>
        )}

        {/* Results */}
        <Grid item xs={12} md={filtersOpen && !isMobile ? 9 : 12}>
          {/* Results Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              {isMobile && (
                <IconButton onClick={() => setFiltersOpen(true)}>
                  <FilterList />
                </IconButton>
              )}
              <Typography variant="h6">
                {loading ? 'Searching...' : `${totalCount} experts found`}
              </Typography>
            </Box>
            
            <Box display="flex" gap={1}>
              <IconButton
                onClick={() => setViewMode('grid')}
                color={viewMode === 'grid' ? 'primary' : 'default'}
              >
                <ViewModule />
              </IconButton>
              <IconButton
                onClick={() => setViewMode('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
              >
                <ViewList />
              </IconButton>
              <IconButton>
                <Sort />
              </IconButton>
            </Box>
          </Box>

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading && experts.length === 0 && renderExpertSkeleton()}

          {/* Empty State */}
          {!loading && experts.length === 0 && !error && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No experts found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Try adjusting your search criteria or filters
              </Typography>
              <Button variant="outlined" onClick={clearFilters}>
                Clear Filters
              </Button>
            </Paper>
          )}

          {/* Experts Grid */}
          {experts.length > 0 && (
            <>
              <Grid container spacing={3}>
                {experts.map((expert) => (
                  <Grid
                    item
                    xs={12}
                    sm={viewMode === 'list' ? 12 : 6}
                    md={viewMode === 'list' ? 12 : 6}
                    lg={viewMode === 'list' ? 12 : 4}
                    key={expert.id}
                  >
                    <ExpertCard
                      expert={expert}
                      variant={viewMode === 'list' ? 'compact' : 'default'}
                      onBookmark={(expertId) => {
                        // Handle bookmark
                        console.log('Bookmark expert:', expertId);
                      }}
                      onMessage={(expertId) => {
                        // Handle message
                        console.log('Message expert:', expertId);
                      }}
                      onBook={(expertId) => {
                        // Handle booking
                        console.log('Book expert:', expertId);
                      }}
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Load More */}
              {hasMore && (
                <Box textAlign="center" mt={4}>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={loadMore}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load More Experts'}
                  </Button>
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};