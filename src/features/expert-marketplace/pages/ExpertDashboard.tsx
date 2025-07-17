import { FC } from 'react';
import { Container, Box, Typography } from '@mui/material';

const ExpertDashboard: FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Expert Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your expert profile and services
        </Typography>
      </Box>
      
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Expert Dashboard Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This feature will allow experts to manage their profiles, services, and client interactions.
        </Typography>
      </Box>
    </Container>
  );
};

export default ExpertDashboard;