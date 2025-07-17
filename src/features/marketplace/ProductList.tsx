import React from 'react';
import { Grid, Typography } from '@mui/material';

export const ProductList: React.FC = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="body2" sx={{ color: 'grey.600' }}>
          Products will be displayed here.
        </Typography>
      </Grid>
    </Grid>
  );
};

export default ProductList;