import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, Box, Typography, Stack } from '@mui/material';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <ShieldExclamationIcon sx={{ color: 'error.main', fontSize: 48 }} />
          </Box>
          
          <Typography variant="h5" sx={{ color: 'grey.900', mb: 2 }}>
            Access Denied
          </Typography>
          
          <Typography variant="body2" sx={{ color: 'grey.600', mb: 2 }}>
            You don't have permission to access this page.
          </Typography>
          
          <Typography variant="body2" sx={{ color: 'grey.600', mb: 4 }}>
            If you believe this is an error, please contact your administrator or try logging in with a different account.
          </Typography>
          
          <Stack spacing={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            
            <Button
              component={Link}
              to="/dashboard"
              variant="outlined"
              fullWidth
            >
              Go to Dashboard
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
export default Unauthorized;
