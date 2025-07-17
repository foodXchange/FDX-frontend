import React from 'react';
import { Box } from '@mui/material';
import { ARMDashboard } from '../components';

export const AgentARMPage: React.FC = () => {
  return (
    <Box sx={{ height: '100%', bgcolor: 'grey.50' }}>
      <ARMDashboard />
    </Box>
  );
};

export default AgentARMPage;