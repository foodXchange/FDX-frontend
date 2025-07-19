import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const ExpertsLanding: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ExpertsLanding
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ExpertsLanding page content goes here.
        </Typography>
      </Box>
    </Container>
  );
};

export default ExpertsLanding;
