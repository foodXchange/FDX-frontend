import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';

export const ComplianceStats: React.FC = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="body2" sx={{ color: 'grey.600', fontWeight: 'medium' }}>
              Total Checks
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'grey.900' }}>
              156
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="body2" sx={{ color: 'grey.600', fontWeight: 'medium' }}>
              Passed
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              142
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="body2" sx={{ color: 'grey.600', fontWeight: 'medium' }}>
              Failed
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
              14
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ComplianceStats;