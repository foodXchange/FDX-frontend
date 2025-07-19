import React, { useState } from 'react';
import { Box, Paper, Typography, Button, IconButton, Slide } from '@mui/material';
import { Close as CloseIcon, GetApp as InstallIcon } from '@mui/icons-material';
import { usePWAInstall } from '../pwa/hooks';

export const PWAInstallBanner: React.FC = () => {
  const { canInstall, installPWA } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  return (
    <Slide direction="up" in={!dismissed} mountOnEnter unmountOnExit>
      <Paper
        sx={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          right: 16,
          maxWidth: 400,
          mx: 'auto',
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
        elevation={6}
      >
        <InstallIcon />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Install FoodXchange
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Get the full app experience with offline access and push notifications.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleInstall}
            sx={{ 
              color: 'white', 
              borderColor: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            Install
          </Button>
          <IconButton
            size="small"
            onClick={handleDismiss}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Paper>
    </Slide>
  );
};