import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';

export const ShareTarget: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const title = searchParams.get('title');
    const text = searchParams.get('text');
    const url = searchParams.get('url');
    
    // Process shared content
    if (title || text || url) {
      // Create new RFQ with shared content
      const sharedData = {
        title: title || 'Shared Content',
        description: text || '',
        sourceUrl: url || ''
      };
      
      // Navigate to RFQ creation with pre-filled data
      navigate('/rfqs/create', { state: { sharedData } });
    } else {
      // No shared content, redirect to home
      navigate('/');
    }
  }, [searchParams, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        p: 3
      }}
    >
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6">Processing shared content...</Typography>
        <Typography variant="body2" color="text.secondary">
          Please wait while we set up your new RFQ.
        </Typography>
      </Paper>
    </Box>
  );
};