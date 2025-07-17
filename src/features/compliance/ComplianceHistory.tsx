import React from 'react';
import { Box, Typography } from '@mui/material';

export const ComplianceHistory: React.FC = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 'semibold', mb: 2 }}>
        Compliance History
      </Typography>
      <Typography variant="body2" sx={{ color: 'grey.600' }}>
        Compliance history will be displayed here.
      </Typography>
    </Box>
  );
};

export default ComplianceHistory;