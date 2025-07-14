import React from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Toast } from './Toast';

export const NotificationContainer: React.FC = () => {
  const notifications = useNotificationStore((state) => 
    state.notifications.filter((n) => !n.read).slice(0, 5)
  );
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-2 z-50 pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <Toast
            id={notification.id}
            title={notification.title || notification.message || 'Notification'}
            message={notification.message}
            type={notification.type === 'error' ? 'error' : notification.type === 'success' ? 'success' : 'info'}
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </div>
  );
};