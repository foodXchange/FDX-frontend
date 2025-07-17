import { FC } from 'react';
import { Container, Box, Typography } from '@mui/material';

const ExpertServices: FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Expert Services
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and manage expert services
        </Typography>
      </Box>
      
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Expert Services Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This feature will display all available expert services and allow service management.
        </Typography>
      </Box>
    </Container>
  );
};

export default ExpertServices;