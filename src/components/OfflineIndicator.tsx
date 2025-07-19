import React from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { WifiOff as OfflineIcon } from '@mui/icons-material';
import { useNetworkStatus, useBackgroundSync } from '../pwa/hooks';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useNetworkStatus();
  const { pendingRequests } = useBackgroundSync();

  if (isOnline && pendingRequests.length === 0) {
    return null;
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        p: 1.5,
        bgcolor: isOnline ? 'warning.main' : 'error.main',
        color: 'white',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}
      elevation={6}
    >
      {!isOnline && <OfflineIcon />}
      <Typography variant="body2">
        {!isOnline ? 'Offline Mode' : 'Syncing...'}
      </Typography>
      {pendingRequests.length > 0 && (
        <Chip
          label={`${pendingRequests.length} pending`}
          size="small"
          sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.2)', 
            color: 'white',
            '& .MuiChip-label': { color: 'white' }
          }}
        />
      )}
    </Paper>
  );
};