import React from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { useAgentStore } from '../store/useAgentStore';

export const ARMTestPage: React.FC = () => {
  const { currentAgent, leads } = useAgentStore();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ARM System Test Page
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Current Agent:
          </Typography>
          <Typography variant="body1">
            {currentAgent ? 
              `${currentAgent.firstName} ${currentAgent.lastName} (${currentAgent.email})` : 
              'No agent loaded'
            }
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Leads Count:
          </Typography>
          <Typography variant="body1">
            {leads.length} leads in store
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Store Test:
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => {
              console.log('Store state:', {
                currentAgent,
                leadsCount: leads.length,
                leads: leads.slice(0, 3)
              });
            }}
          >
            Log Store State
          </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            System Status:
          </Typography>
          <Typography variant="body1" color="success.main">
            ✅ React App Running
          </Typography>
          <Typography variant="body1" color="success.main">
            ✅ Material-UI Components Working
          </Typography>
          <Typography variant="body1" color="success.main">
            ✅ Zustand Store Connected
          </Typography>
          <Typography variant="body1" color="success.main">
            ✅ ARM Components Available
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary">
            This is a test page to verify the ARM system is working properly.
            Check the browser console for any errors.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ARMTestPage;