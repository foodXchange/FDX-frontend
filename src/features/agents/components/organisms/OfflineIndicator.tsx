import React, { useState, useCallback } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Button,
  Box,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
} from '@mui/material';
import {
  CloudOff,
  CloudQueue,
  CloudDone,
  Sync,
  SyncDisabled,
  Refresh,
  ExpandMore,
  ExpandLess,
  Delete,
  Warning,
  Schedule,
  InstallMobile,
  GetApp,
} from '@mui/icons-material';
import useOfflineSupport, { useProgressiveWebApp, useServiceWorker } from '../../hooks/useOfflineSupport';

interface OfflineIndicatorProps {
  showInstallPrompt?: boolean;
  showServiceWorkerUpdates?: boolean;
  showDetailedStatus?: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showInstallPrompt = true,
  showServiceWorkerUpdates = true,
  showDetailedStatus = true,
}) => {
  const {
    isOnline,
    pendingActions,
    syncInProgress,
    lastSyncTime,
    syncErrors,
    forcSync,
    clearPendingActions,
    pendingCount,
    hasErrors,
  } = useOfflineSupport();

  const { isInstallable, installApp } = useProgressiveWebApp();
  const { hasUpdate, updateServiceWorker } = useServiceWorker();

  const [showDetails, setShowDetails] = useState(false);
  const [showActionsDialog, setShowActionsDialog] = useState(false);
  const [showInstallDialog, setShowInstallDialog] = useState(false);

  // Format last sync time
  const formatLastSync = useCallback(() => {
    if (!lastSyncTime) return 'Never';
    
    const now = Date.now();
    const diff = now - lastSyncTime;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }, [lastSyncTime]);

  // Get status info
  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        severity: 'warning' as const,
        title: 'Offline Mode',
        message: `Working offline. ${pendingCount} actions queued.`,
        icon: <CloudOff />,
      };
    }

    if (syncInProgress) {
      return {
        severity: 'info' as const,
        title: 'Syncing',
        message: 'Syncing pending changes...',
        icon: <Sync className="animate-spin" />,
      };
    }

    if (hasErrors) {
      return {
        severity: 'error' as const,
        title: 'Sync Errors',
        message: `${syncErrors.length} actions failed to sync.`,
        icon: <SyncDisabled />,
      };
    }

    if (pendingCount > 0) {
      return {
        severity: 'warning' as const,
        title: 'Pending Changes',
        message: `${pendingCount} changes waiting to sync.`,
        icon: <CloudQueue />,
      };
    }

    return null;
  };

  const statusInfo = getStatusInfo();

  const handleInstallApp = async () => {
    const success = await installApp();
    if (success) {
      setShowInstallDialog(false);
    }
  };

  const PendingActionsDialog = () => (
    <Dialog
      open={showActionsDialog}
      onClose={() => setShowActionsDialog(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Pending Actions</DialogTitle>
      <DialogContent>
        {pendingActions.length === 0 ? (
          <Typography color="text.secondary" align="center" py={4}>
            No pending actions
          </Typography>
        ) : (
          <List>
            {pendingActions.map((action) => (
              <ListItem key={action.id}>
                <ListItemIcon>
                  {action.retryCount > 0 ? (
                    <Warning color="warning" />
                  ) : (
                    <Schedule color="action" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={action.type}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {action.method} {action.url}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(action.timestamp).toLocaleString()}
                        {action.retryCount > 0 && ` • ${action.retryCount} retries`}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowActionsDialog(false)}>Close</Button>
        {pendingActions.length > 0 && (
          <>
            <Button onClick={forcSync} disabled={!isOnline || syncInProgress}>
              Retry Sync
            </Button>
            <Button 
              onClick={clearPendingActions} 
              color="error"
              startIcon={<Delete />}
            >
              Clear All
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );

  const InstallDialog = () => (
    <Dialog open={showInstallDialog} onClose={() => setShowInstallDialog(false)}>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <InstallMobile />
          Install App
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography paragraph>
          Install this app on your device for a better experience:
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <li>Work offline with automatic sync</li>
          <li>Faster loading and better performance</li>
          <li>Native app-like experience</li>
          <li>Push notifications for important updates</li>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowInstallDialog(false)}>
          Not Now
        </Button>
        <Button 
          variant="contained" 
          onClick={handleInstallApp}
          startIcon={<GetApp />}
        >
          Install
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      {/* Main offline indicator */}
      {statusInfo && (
        <Snackbar
          open={true}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          sx={{ mb: showDetailedStatus ? 8 : 0 }}
        >
          <Alert
            severity={statusInfo.severity}
            icon={statusInfo.icon}
            action={
              <Box display="flex" alignItems="center" gap={1}>
                {isOnline && pendingCount > 0 && (
                  <IconButton
                    size="small"
                    onClick={forcSync}
                    disabled={syncInProgress}
                    title="Sync now"
                  >
                    <Sync />
                  </IconButton>
                )}
                {showDetailedStatus && (
                  <IconButton
                    size="small"
                    onClick={() => setShowDetails(!showDetails)}
                    title="Show details"
                  >
                    {showDetails ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                )}
              </Box>
            }
          >
            <AlertTitle>{statusInfo.title}</AlertTitle>
            {statusInfo.message}
          </Alert>
        </Snackbar>
      )}

      {/* Detailed status panel */}
      {showDetailedStatus && (
        <Snackbar
          open={true}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert severity="info" sx={{ width: '100%' }}>
            <Collapse in={showDetails}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Connection Status
                </Typography>
                
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Chip
                    label={isOnline ? 'Online' : 'Offline'}
                    color={isOnline ? 'success' : 'warning'}
                    size="small"
                    icon={isOnline ? <CloudDone /> : <CloudOff />}
                  />
                  
                  <Badge badgeContent={pendingCount} color="warning">
                    <Chip
                      label="Pending"
                      variant="outlined"
                      size="small"
                      onClick={() => setShowActionsDialog(true)}
                      clickable={pendingCount > 0}
                    />
                  </Badge>
                  
                  <Typography variant="caption" color="text.secondary">
                    Last sync: {formatLastSync()}
                  </Typography>
                </Box>

                {syncInProgress && (
                  <Box mb={2}>
                    <Typography variant="caption" display="block" gutterBottom>
                      Syncing...
                    </Typography>
                    <LinearProgress />
                  </Box>
                )}

                {hasErrors && (
                  <Box mb={2}>
                    <Typography variant="caption" color="error" display="block">
                      {syncErrors.length} sync errors
                    </Typography>
                    {syncErrors.slice(0, 2).map((error, index) => (
                      <Typography key={index} variant="caption" color="error" display="block">
                        • {error}
                      </Typography>
                    ))}
                    {syncErrors.length > 2 && (
                      <Typography variant="caption" color="error">
                        +{syncErrors.length - 2} more errors
                      </Typography>
                    )}
                  </Box>
                )}

                <Box display="flex" gap={1}>
                  {isOnline && (
                    <Button
                      size="small"
                      onClick={forcSync}
                      disabled={syncInProgress}
                      startIcon={<Refresh />}
                    >
                      Sync Now
                    </Button>
                  )}
                  
                  {pendingCount > 0 && (
                    <Button
                      size="small"
                      onClick={() => setShowActionsDialog(true)}
                    >
                      View Actions
                    </Button>
                  )}
                </Box>
              </Box>
            </Collapse>
          </Alert>
        </Snackbar>
      )}

      {/* PWA Install prompt */}
      {showInstallPrompt && isInstallable && (
        <Snackbar
          open={true}
          autoHideDuration={10000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            severity="info"
            action={
              <Box>
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => setShowInstallDialog(true)}
                >
                  Install
                </Button>
              </Box>
            }
          >
            Install this app for a better offline experience
          </Alert>
        </Snackbar>
      )}

      {/* Service Worker update prompt */}
      {showServiceWorkerUpdates && hasUpdate && (
        <Snackbar
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            severity="info"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={updateServiceWorker}
              >
                Update
              </Button>
            }
          >
            A new version is available. Update now?
          </Alert>
        </Snackbar>
      )}

      {/* Dialogs */}
      <PendingActionsDialog />
      <InstallDialog />
    </>
  );
};

export default OfflineIndicator;