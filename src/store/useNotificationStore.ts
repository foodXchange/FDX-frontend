import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  category?: 'rfq' | 'order' | 'compliance' | 'system';
  metadata?: Record<string, any>;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: (category?: string) => void;

  // Toast notifications
  showToast: (options: {
    type: Notification['type'];
    title: string;
    message?: string;
    duration?: number;
  }) => void;

  // Real-time notification handling
  connectNotifications: () => void;
  disconnectNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    immer((set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) =>
        set((state) => {
          const newNotification: Notification = {
            ...notification,
            id: `${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            read: false,
          };

          state.notifications.unshift(newNotification);
          state.unreadCount += 1;

          // Keep only last 100 notifications
          if (state.notifications.length > 100) {
            state.notifications = state.notifications.slice(0, 100);
          }

          // Play notification sound for important notifications
          if (notification.type === 'error' || notification.type === 'warning') {
            playNotificationSound();
          }
        }),

      markAsRead: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (notification && !notification.read) {
            notification.read = true;
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }),

      markAllAsRead: () =>
        set((state) => {
          state.notifications.forEach((n) => {
            n.read = true;
          });
          state.unreadCount = 0;
        }),

      removeNotification: (id) =>
        set((state) => {
          const index = state.notifications.findIndex((n) => n.id === id);
          if (index !== -1) {
            const notification = state.notifications[index];
            if (!notification.read) {
              state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
            state.notifications.splice(index, 1);
          }
        }),

      clearNotifications: (category) =>
        set((state) => {
          if (category) {
            const toRemove = state.notifications.filter(
              (n) => n.category === category
            );
            const unreadToRemove = toRemove.filter((n) => !n.read).length;
            state.notifications = state.notifications.filter(
              (n) => n.category !== category
            );
            state.unreadCount = Math.max(0, state.unreadCount - unreadToRemove);
          } else {
            state.notifications = [];
            state.unreadCount = 0;
          }
        }),

      showToast: ({ type, title, message, duration = 5000 }) => {
        const notification = {
          type,
          title,
          message,
        };

        get().addNotification(notification);

        // Auto-remove toast after duration
        if (duration > 0) {
          setTimeout(() => {
            const notifications = get().notifications;
            const toastNotification = notifications.find(
              (n) => n.title === title && n.message === message
            );
            if (toastNotification) {
              get().removeNotification(toastNotification.id);
            }
          }, duration);
        }
      },

      connectNotifications: () => {
        // Connect to WebSocket or SSE for real-time notifications
        // This is a placeholder - implement based on your backend
        console.log('Connecting to notification service...');

        // Example: Listen for WebSocket events
        if (typeof window !== 'undefined' && 'EventSource' in window) {
          // const eventSource = new EventSource('/api/notifications/stream');
          // eventSource.onmessage = (event) => {
          //   const notification = JSON.parse(event.data);
          //   get().addNotification(notification);
          // };
        }
      },

      disconnectNotifications: () => {
        // Disconnect from notification service
        console.log('Disconnecting from notification service...');
      },
    })),
    {
      name: 'notification-store',
    }
  )
);

// Helper function to play notification sound
function playNotificationSound() {
  if (typeof window !== 'undefined' && 'Audio' in window) {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore errors (e.g., autoplay policy)
      });
    } catch (error) {
      // Ignore errors
    }
  }
}

// Global notification handlers
export const notify = {
  success: (title: string, message?: string) =>
    useNotificationStore.getState().showToast({ type: 'success', title, message }),
  
  error: (title: string, message?: string) =>
    useNotificationStore.getState().showToast({ type: 'error', title, message }),
  
  warning: (title: string, message?: string) =>
    useNotificationStore.getState().showToast({ type: 'warning', title, message }),
  
  info: (title: string, message?: string) =>
    useNotificationStore.getState().showToast({ type: 'info', title, message }),
};