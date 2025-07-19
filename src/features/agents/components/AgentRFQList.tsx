import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Chip,
  Grid,
  Skeleton,
  InputAdornment
} from '@mui/material';
import { Search as MagnifyingGlassIcon } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useAgentStore } from '../store/useAgentStore';
import { AgentRFQCard } from './AgentRFQCard';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface RFQ {
  id: string;
  title: string;
  description: string;
  category: string;
  buyerName: string;
  buyerLocation: string;
  estimatedValue: number;
  createdAt: Date;
  expiresAt: Date;
  status: string;
  // Agent-specific properties (optional for type extension)
  matchScore?: number;
  estimatedCommission?: number;
  claimDeadline?: Date;
}

interface AgentRFQListProps {
  rfqs: RFQ[];
  loading?: boolean;
}

export const AgentRFQList: React.FC<AgentRFQListProps> = ({ rfqs, loading }) => {
  const { user } = useAuth();
  const { updateLead } = useAgentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'match' | 'value' | 'time'>('match');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const isAgent = user?.isAgent || user?.role === 'agent';

  // Map RFQs to Leads with match scores (mock implementation)
  const rfqsWithAgentData = React.useMemo(() => {
    if (!isAgent) return rfqs;

    return rfqs.map(rfq => {
      // Mock match score calculation
      const matchScore = Math.floor(Math.random() * 40) + 60; // 60-100
      const estimatedCommission = rfq.estimatedValue * 0.02; // 2% commission
      const claimDeadline = new Date(Date.now() + Math.random() * 4 * 60 * 60 * 1000); // 0-4 hours

      return {
        ...rfq,
        matchScore,
        estimatedCommission,
        claimDeadline
      };
    });
  }, [rfqs, isAgent]);

  // Filter and sort RFQs
  const filteredAndSortedRFQs = React.useMemo(() => {
    let filtered = rfqsWithAgentData;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(rfq => 
        rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfq.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfq.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(rfq => rfq.category === filterCategory);
    }

    // Sort
    if (isAgent) {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'match':
            return (b.matchScore || 0) - (a.matchScore || 0);
          case 'value':
            return b.estimatedValue - a.estimatedValue;
          case 'time':
            return new Date(a.claimDeadline || 0).getTime() - new Date(b.claimDeadline || 0).getTime();
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [rfqsWithAgentData, searchTerm, filterCategory, sortBy, isAgent]);

  const categories = React.useMemo(() => {
    const cats = new Set(rfqs.map(rfq => rfq.category));
    return ['all', ...Array.from(cats)];
  }, [rfqs]);

  const handleClaim = async (rfqId: string) => {
    try {
      // Mock implementation - replace with actual API call
      updateLead(rfqId, { status: 'claimed' });
      // Show success notification
    } catch (error) {
      // Show error notification
      console.error('Failed to claim lead:', error);
    }
  };

  return (
    <Stack spacing={3}>
      {/* Filters and Search */}
      {isAgent && (
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              {/* Search */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search RFQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MagnifyingGlassIcon sx={{ color: 'grey.400' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Category Filter */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    label="Category"
                  >
                    {categories.map(cat => (
                      <MenuItem key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Sort */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    label="Sort By"
                  >
                    <MenuItem value="match">Best Match First</MenuItem>
                    <MenuItem value="value">Highest Value First</MenuItem>
                    <MenuItem value="time">Expiring Soon First</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Active filters indicator */}
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, color: 'grey.600' }}>
              <FunnelIcon sx={{ mr: 1, fontSize: 16 }} />
              <Typography variant="body2" sx={{ mr: 2 }}>
                Showing {filteredAndSortedRFQs.length} of {rfqs.length} RFQs
              </Typography>
              {isAgent && (
                <Chip
                  label={`${filteredAndSortedRFQs.filter(r => r.matchScore && r.matchScore >= 90).length} perfect matches`}
                  color="success"
                  size="small"
                />
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* RFQ List */}
      <Stack spacing={3}>
        {loading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent>
                <Stack spacing={2}>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton variant="rectangular" width="100%" height={60} />
                </Stack>
              </CardContent>
            </Card>
          ))
        ) : filteredAndSortedRFQs.length === 0 ? (
          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="grey.500">
                  No RFQs found matching your criteria
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedRFQs.map(rfq => (
            <AgentRFQCard
              key={rfq.id}
              rfq={rfq}
              matchScore={rfq.matchScore}
              estimatedCommission={rfq.estimatedCommission}
              claimDeadline={rfq.claimDeadline}
              onClaim={isAgent ? handleClaim : undefined}
            >
              {/* Non-agent view actions */}
              {!isAgent && (
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <button sx={{ color: "white" }} sx={{ display: "flex" }} sx={{ borderRadius: 1 }} sx={{ borderRadius: 2 }}>
                    View Details
                  </button>
                  <button sx={{ bgcolor: "grey.50" }} sx={{ color: "grey.700" }} sx={{ display: "flex" }} sx={{ borderRadius: 1 }} sx={{ borderRadius: 2 }} sx={{ border: 1 }} sx={{ borderColor: "grey.300" }}>
                    Submit Quote
                  </button>
                </Stack>
              )}
            </AgentRFQCard>
          ))
        )}
      </Stack>
    </Stack>
  );
};