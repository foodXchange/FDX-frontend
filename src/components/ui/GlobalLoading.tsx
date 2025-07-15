import React from 'react';
import { useUIStore } from '@/store/useUIStore';
import { Box, Typography, LinearProgress, CircularProgress } from '@mui/material';

export const GlobalLoading: React.FC = () => {
  const loadingTasks = useUIStore((state) => state.loadingTasks);
  const taskCount = Object.keys(loadingTasks).length;
  const isLoading = taskCount > 0;

  if (!isLoading) return null;

  const loadingMessage = Object.values(loadingTasks)[0] || 'Loading...';

  return (
    <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 'appBar' }}>
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: 2, 
          px: 4 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
          <CircularProgress 
            size={20} 
            sx={{ color: 'white' }} 
          />
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500,
              color: 'white'
            }}
          >
            {loadingMessage}
          </Typography>
        </Box>
      </Box>
      <LinearProgress 
        sx={{ 
          height: 4,
          bgcolor: 'primary.light',
          '& .MuiLinearProgress-bar': {
            bgcolor: 'primary.main'
          }
        }} 
      />
    </Box>
  );
};