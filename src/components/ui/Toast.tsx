import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { Theme } from '@mui/material/styles';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: (id: string) => void;
}

const getToastConfig = (theme: Theme) => ({
  success: {
    icon: CheckCircleIcon,
    backgroundColor: theme.palette.success.light + '20',
    borderColor: theme.palette.success.light,
    textColor: theme.palette.success.dark,
    iconColor: theme.palette.success.main,
  },
  error: {
    icon: XCircleIcon,
    backgroundColor: theme.palette.error.light + '20',
    borderColor: theme.palette.error.light,
    textColor: theme.palette.error.dark,
    iconColor: theme.palette.error.main,
  },
  info: {
    icon: InformationCircleIcon,
    backgroundColor: theme.palette.info.light + '20',
    borderColor: theme.palette.info.light,
    textColor: theme.palette.info.dark,
    iconColor: theme.palette.info.main,
  },
  warning: {
    icon: ExclamationCircleIcon,
    backgroundColor: theme.palette.warning.light + '20',
    borderColor: theme.palette.warning.light,
    textColor: theme.palette.warning.dark,
    iconColor: theme.palette.warning.main,
  },
});

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  action,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const theme = useTheme();
  const config = getToastConfig(theme)[type];
  const Icon = config.icon;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.(id);
    }, 300);
  };

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [duration, id]);

  return (
    <AnimatePresence>
      {isVisible && (
        <Box
          component={motion.div}
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          sx={{
            maxWidth: 384,
            width: '100%',
            boxShadow: theme.shadows[8],
            borderRadius: 2,
            pointerEvents: 'auto',
            border: `1px solid ${config.borderColor}`,
            bgcolor: config.backgroundColor,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Box sx={{ flexShrink: 0 }}>
                <Box 
                  component={Icon}
                  sx={{ 
                    width: 24,
                    height: 24,
                    color: config.iconColor 
                  }} 
                />
              </Box>
              <Box sx={{ ml: 1.5, width: 0, flex: 1, pt: 0.25 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 500,
                    color: config.textColor,
                    fontSize: '0.875rem',
                  }}
                >
                  {title}
                </Typography>
                {message && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mt: 0.5, 
                      fontSize: '0.875rem',
                      opacity: 0.9,
                      color: config.textColor,
                    }}
                  >
                    {message}
                  </Typography>
                )}
                {action && (
                  <Box sx={{ mt: 1.5 }}>
                    <Button
                      onClick={action.onClick}
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: config.textColor,
                        p: 0,
                        minWidth: 'auto',
                        '&:hover': {
                          textDecoration: 'underline',
                          bgcolor: 'transparent',
                        },
                      }}
                    >
                      {action.label}
                    </Button>
                  </Box>
                )}
              </Box>
              <Box sx={{ ml: 2, flexShrink: 0, display: 'flex' }}>
                <IconButton
                  onClick={handleClose}
                  size="small"
                  sx={{
                    color: config.textColor,
                    '&:hover': {
                      opacity: 0.7,
                    },
                  }}
                >
                  <Box component={XMarkIcon} sx={{ width: 24, height: 24 }} />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </AnimatePresence>
  );
};

// Toast Container
export const ToastContainer: React.FC<{ toasts: ToastProps[] }> = ({ toasts }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 'tooltip',
      }}
    >
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {toasts.map((toast) => (
          <Box key={toast.id} sx={{ pointerEvents: 'auto' }}>
            <Toast {...toast} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const showToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Date.now().toString();
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: (toastId) => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId));
      },
    };
    
    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (title: string, message?: string) =>
    showToast({ type: 'success', title, message });

  const error = (title: string, message?: string) =>
    showToast({ type: 'error', title, message });

  const info = (title: string, message?: string) =>
    showToast({ type: 'info', title, message });

  const warning = (title: string, message?: string) =>
    showToast({ type: 'warning', title, message });

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };
};