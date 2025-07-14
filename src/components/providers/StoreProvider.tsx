import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationStore } from '@/store/useNotificationStore';
import { ModalManager } from '@components/ui/ModalManager';
import { GlobalLoading } from '@components/ui/GlobalLoading';
import { NotificationContainer } from '@components/ui/NotificationContainer';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const connectNotifications = useNotificationStore((state) => state.connectNotifications);
  const disconnectNotifications = useNotificationStore((state) => state.disconnectNotifications);

  useEffect(() => {
    if (isAuthenticated) {
      connectNotifications();
      return () => {
        disconnectNotifications();
      };
    }
  }, [isAuthenticated, connectNotifications, disconnectNotifications]);

  return (
    <>
      {children}
      <ModalManager />
      <GlobalLoading />
      <NotificationContainer />
    </>
  );
};