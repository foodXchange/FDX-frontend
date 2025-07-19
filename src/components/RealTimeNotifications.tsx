import React, { useEffect, useState, useCallback } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  CheckCircle,
  Warning,
  Info,
  Error as ErrorIcon,
  ShoppingCart,
  Receipt,
  AttachMoney,
  LocalShipping,
  Assignment,
  Person
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../hooks/useAuth';
import notificationSound from '../assets/notification.mp3';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'order' | 'payment' | 'invoice' | 'rfq' | 'sample' | 'compliance' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export const RealTimeNotifications: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [lastNotification, setLastNotification] = useState<Notification | null>(null);
  const { user } = useAuth();
  const { messages, isConnected, sendMessage } = useWebSocket(`wss://api.fdx-platform.com/ws?userId=${user?.id}`);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage.type === 'notification') {
        const newNotification: Notification = {
          id: lastMessage.id || `notif-${Date.now()}`,
          type: lastMessage.data.type || 'info',
          category: lastMessage.data.category || 'system',
          title: lastMessage.data.title,
          message: lastMessage.data.message,
          timestamp: lastMessage.timestamp || new Date().toISOString(),
          read: false,
          actionUrl: lastMessage.data.actionUrl,
          metadata: lastMessage.data.metadata
        };

        setNotifications(prev => [newNotification, ...prev]);
        setLastNotification(newNotification);
        setShowSnackbar(true);

        // Play notification sound if enabled
        if (localStorage.getItem('notificationSound') !== 'false') {
          const audio = new Audio(notificationSound);
          audio.play().catch(e => console.log('Could not play notification sound:', e));
        }

        // Send browser notification if permitted
        if (Notification.permission === 'granted') {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/favicon.ico',
            tag: newNotification.id
          });
        }
      }
    }
  }, [messages]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );

    // Send read status to server
    sendMessage({
      type: 'notification_read',
      notificationId: id
    });
  }, [sendMessage]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );

    // Send bulk read status to server
    sendMessage({
      type: 'notifications_read_all',
      notificationIds: notifications.filter(n => !n.read).map(n => n.id)
    });
  }, [notifications, sendMessage]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  }, []);

  const handleNotificationClick = useCallback((notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    
    handleClose();
  }, [markAsRead]);

  const getNotificationIcon = (category: string, type: string) => {
    switch (category) {
      case 'order':
        return <ShoppingCart color={type as any} />;
      case 'payment':
        return <AttachMoney color={type as any} />;
      case 'invoice':
        return <Receipt color={type as any} />;
      case 'rfq':
        return <Assignment color={type as any} />;
      case 'sample':
        return <LocalShipping color={type as any} />;
      case 'compliance':
        return <Warning color={type as any} />;
      default:
        switch (type) {
          case 'success':
            return <CheckCircle color="success" />;
          case 'warning':
            return <Warning color="warning" />;
          case 'error':
            return <ErrorIcon color="error" />;
          default:
            return <Info color="info" />;
        }
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const open = Boolean(anchorEl);

  // Subscribe to specific notification channels
  useEffect(() => {
    if (isConnected && user) {
      sendMessage({
        type: 'subscribe',
        channels: [
          `user:${user.id}`,
          `organization:${user.organizationId}`,
          'system:broadcast'
        ]
      });
    }
  }, [isConnected, user, sendMessage]);

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label={`${unreadCount} unread notifications`}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? <NotificationsActive /> : <Notifications />}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            maxWidth: 400,
            width: '100%',
            maxHeight: 500,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Notifications
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!isConnected && (
                <Chip
                  label="Offline"
                  size="small"
                  color="error"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
              {unreadCount > 0 && (
                <Button size="small" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
              <Button size="small" onClick={clearNotifications}>
                Clear all
              </Button>
            </Box>
          </Box>
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    backgroundColor: notification.read ? 'transparent' : 'action.hover',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    },
                  }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'transparent' }}>
                      {getNotificationIcon(notification.category, notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.category}
                          size="small"
                          color={getNotificationColor(notification.type) as any}
                          sx={{ fontSize: '0.6rem', height: 16 }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {format(new Date(notification.timestamp), 'MMM d, yyyy h:mm a')}
                        </Typography>
                        {notification.metadata && (
                          <Box sx={{ mt: 0.5 }}>
                            {Object.entries(notification.metadata).map(([key, value]) => (
                              <Chip
                                key={key}
                                label={`${key}: ${value}`}
                                size="small"
                                variant="outlined"
                                sx={{ mr: 0.5, fontSize: '0.65rem', height: 18 }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Menu>

      {/* Toast notification for new messages */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        {lastNotification && (
          <Alert
            onClose={() => setShowSnackbar(false)}
            severity={lastNotification.type}
            sx={{ width: '100%' }}
            action={
              lastNotification.actionUrl && (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    if (lastNotification.actionUrl) {
                      window.location.href = lastNotification.actionUrl;
                    }
                  }}
                >
                  View
                </Button>
              )
            }
          >
            <strong>{lastNotification.title}</strong>
            <br />
            {lastNotification.message}
          </Alert>
        )}
      </Snackbar>
    </>
  );
};

export default RealTimeNotifications;