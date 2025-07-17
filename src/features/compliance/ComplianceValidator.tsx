import React from 'react';
import { Typography, Paper } from '@mui/material';

export const ComplianceValidator: React.FC = () => {
  return (
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'semibold' }}>
        Compliance Validator
      </Typography>
      <Typography variant="body2" sx={{ color: 'grey.600' }}>
        Upload documents for compliance validation.
      </Typography>
    </Paper>
  );
};

export default ComplianceValidator;