import { FC } from 'react';
import { Container, Box, Typography } from '@mui/material';

const CollaborationWorkspace: FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Collaboration Workspace
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Work together with experts on your projects
        </Typography>
      </Box>
      
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Collaboration Workspace Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This feature will provide a collaborative workspace for clients and experts to work together on projects.
        </Typography>
      </Box>
    </Container>
  );
};

export default CollaborationWorkspace;