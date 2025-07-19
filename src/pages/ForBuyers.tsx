import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const ForBuyers: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ForBuyers
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ForBuyers page content goes here.
        </Typography>
      </Box>
    </Container>
  );
};

export default ForBuyers;
