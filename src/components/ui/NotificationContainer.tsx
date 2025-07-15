import React, { useMemo } from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Toast } from './Toast';
import { Box } from '@mui/material';

export const NotificationContainer: React.FC = () => {
  const allNotifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore((state) => state.removeNotification);
  
  const notifications = useMemo(() => 
    allNotifications.filter((n) => !n.read).slice(0, 5),
    [allNotifications]
  );

  return (
    <Box 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        right: 0, 
        p: 4, 
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        zIndex: 'tooltip', 
        pointerEvents: 'none' 
      }}
    >
      {notifications.map((notification) => (
        <Box 
          key={notification.id} 
          sx={{ pointerEvents: 'auto' }}
        >
          <Toast
            id={notification.id}
            title={notification.title || notification.message || 'Notification'}
            message={notification.message}
            type={notification.type === 'error' ? 'error' : notification.type === 'success' ? 'success' : 'info'}
            onClose={() => removeNotification(notification.id)}
          />
        </Box>
      ))}
    </Box>
  );
};