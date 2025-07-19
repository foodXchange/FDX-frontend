import React, { memo } from 'react';
import { Box, Typography, IconButton, Button, Tooltip, CircularProgress } from '@mui/material';
import { Refresh as RefreshIcon, Add as PlusIcon, Dashboard as DashboardIcon } from '@mui/icons-material';
import { PlusIcon } from '@heroicons/react/24/outline';

interface ARMDashboardHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
  onAddLead: () => void;
}

export const ARMDashboardHeader = memo<ARMDashboardHeaderProps>(({
  isLoading,
  onRefresh,
  onAddLead,
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <DashboardIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Agent Relationship Management
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Refresh data">
          <IconButton onClick={onRefresh} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          startIcon={<PlusIcon />}
          onClick={onAddLead}
          sx={{ textTransform: 'none' }}
        >
          Add Lead
        </Button>
      </Box>
    </Box>
  );
});