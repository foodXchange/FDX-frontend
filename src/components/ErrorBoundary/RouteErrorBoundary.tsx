import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, Box, Typography, Stack } from '@mui/material';
import { logger } from '@/services/logger';
import { Home as HomeIcon } from '@mui/icons-material';

export const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError() as Error;
  const navigate = useNavigate();

  React.useEffect(() => {
    logger.error('Route error boundary triggered', {
      error: error?.message,
      stack: error?.stack,
      pathname: window.location.pathname,
    });
  }, [error]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <ExclamationTriangleIcon sx={{ color: 'error.main', fontSize: 48 }} />
          </Box>
          
          <Typography variant="h5" sx={{ color: 'grey.900', mb: 2 }}>
            Page Error
          </Typography>
          
          <Typography variant="body2" sx={{ color: 'grey.600', mb: 3 }}>
            Sorry, an error occurred while loading this page.
          </Typography>

          {process.env.NODE_ENV === 'development' && error && (
            <Box sx={{ mt: 3, textAlign: 'left' }}>
              <details>
                <summary sx={{ cursor: 'pointer', color: '#6b7280' }}>
                  Error Details
                </summary>
                <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: 'error.main', mb: 1 }}>
                    {error.message || 'Unknown error'}
                  </Typography>
                  {error.stack && (
                    <Box component="pre" sx={{ color: 'grey.600', fontSize: '0.75rem', overflow: 'auto' }}>
                      {error.stack}
                    </Box>
                  )}
                </Box>
              </details>
            </Box>
          )}

          <Stack spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleGoHome}
              startIcon={<HomeIcon />}
            >
              Go to Home
            </Button>
            
            <Button
              variant="outlined"
              fullWidth
              onClick={handleReload}
              startIcon={<ArrowPathIcon />}
            >
              Reload Page
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};