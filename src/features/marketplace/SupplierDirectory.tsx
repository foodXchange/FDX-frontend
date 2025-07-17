import React from 'react';
import { Paper, Typography } from '@mui/material';

export const SupplierDirectory: React.FC = () => {
  return (
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h6" sx={{ fontWeight: 'semibold', mb: 2 }}>
        Supplier Directory
      </Typography>
      <Typography variant="body2" sx={{ color: 'grey.600' }}>
        Browse verified suppliers.
      </Typography>
    </Paper>
  );
};

export default SupplierDirectory;