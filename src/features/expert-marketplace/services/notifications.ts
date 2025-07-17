import React from 'react';
interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface CustomPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class NotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY || '';

  async initialize(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    if (!('PushManager' in window)) {
      throw new Error('Push notifications not supported');
    }

    // Register service worker
    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', this.swRegistration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
    } else if (permission === 'denied') {
      console.log('Notification permission denied');
    } else {
      console.log('Notification permission dismissed');
    }

    return permission;
  }

  async subscribeToPush(): Promise<CustomPushSubscription | null> {
    if (!this.swRegistration) {
      throw new Error('Service Worker not registered');
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      return null;
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);

      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
        },
      };
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  async unsubscribeFromPush(): Promise<void> {
    if (!this.swRegistration) {
      return;
    }

    const subscription = await this.swRegistration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      await this.removeSubscriptionFromServer(subscription);
    }
  }

  async showLocalNotification(data: NotificationData): Promise<void> {
    const permission = Notification.permission;
    
    if (permission !== 'granted') {
      console.warn('Cannot show notification: permission not granted');
      return;
    }

    if (this.swRegistration) {
      // Use service worker for better control
      await this.swRegistration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/icons/notification-icon.png',
        badge: data.badge || '/icons/badge-icon.png',
        tag: data.tag,
        data: data.data,
        // actions: data.actions, // Note: actions property is not supported in standard Notification API
        requireInteraction: data.requireInteraction,
        silent: data.silent,
      });
    } else {
      // Fallback to basic notification
      new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/icons/notification-icon.png',
        tag: data.tag,
        data: data.data,
        requireInteraction: data.requireInteraction,
        silent: data.silent,
      });
    }
  }

  async scheduleNotification(data: NotificationData, delay: number): Promise<void> {
    setTimeout(() => {
      this.showLocalNotification(data);
    }, delay);
  }

  // Expert marketplace specific notifications
  async notifyNewBooking(expertName: string, bookingDate: string): Promise<void> {
    await this.showLocalNotification({
      title: 'New Booking Request',
      body: `${expertName} has requested a consultation on ${bookingDate}`,
      icon: '/icons/booking-icon.png',
      tag: 'new-booking',
      data: { type: 'booking', action: 'new' },
      actions: [
        { action: 'view', title: 'View Details' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
      requireInteraction: true,
    });
  }

  async notifyBookingConfirmed(expertName: string, bookingDate: string): Promise<void> {
    await this.showLocalNotification({
      title: 'Booking Confirmed',
      body: `Your consultation with ${expertName} on ${bookingDate} has been confirmed`,
      icon: '/icons/booking-confirmed-icon.png',
      tag: 'booking-confirmed',
      data: { type: 'booking', action: 'confirmed' },
    });
  }

  async notifyNewMessage(senderName: string, preview: string): Promise<void> {
    await this.showLocalNotification({
      title: `New message from ${senderName}`,
      body: preview,
      icon: '/icons/message-icon.png',
      tag: 'new-message',
      data: { type: 'message', action: 'new' },
      actions: [
        { action: 'reply', title: 'Reply' },
        { action: 'view', title: 'View' },
      ],
    });
  }

  async notifyCollaborationUpdate(projectName: string, updateType: string): Promise<void> {
    await this.showLocalNotification({
      title: 'Project Update',
      body: `${updateType} in ${projectName}`,
      icon: '/icons/collaboration-icon.png',
      tag: 'collaboration-update',
      data: { type: 'collaboration', action: updateType },
    });
  }

  async notifyPaymentReceived(amount: string, currency: string): Promise<void> {
    await this.showLocalNotification({
      title: 'Payment Received',
      body: `You received ${amount} ${currency}`,
      icon: '/icons/payment-icon.png',
      tag: 'payment-received',
      data: { type: 'payment', action: 'received' },
    });
  }

  // Utility methods
  isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      return null;
    }

    const subscription = await this.swRegistration.pushManager.getSubscription();
    if (!subscription) {
      return null;
    }

    return {
      endpoint: subscription.endpoint,
      expirationTime: subscription.expirationTime,
      keys: {
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
        auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
      },
    } as any;
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('expert_marketplace_token')}`,
      },
      body: JSON.stringify({
        subscription: {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
          },
        },
      }),
    });
  }

  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    await fetch('/api/notifications/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('expert_marketplace_token')}`,
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
      }),
    });
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const notificationService = new NotificationService();
export type { NotificationData, NotificationAction };