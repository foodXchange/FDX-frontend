import React, { useState, useEffect, useCallback } from 'react';
// PWA Utilities for Agent Module

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;

  constructor() {
    this.init();
  }

  private init() {
    // Check if app is already installed
    this.checkInstallStatus();
    
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      console.log('PWA was installed');
    });

    // Register service worker
    this.registerServiceWorker();
  }

  private checkInstallStatus() {
    // Check if app is running in standalone mode
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                     (window.navigator as any).standalone === true;
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New update available
                  this.showUpdateAvailable();
                }
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private showUpdateAvailable() {
    // Show update notification
    if (window.confirm('A new version is available. Refresh to update?')) {
      window.location.reload();
    }
  }

  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      return outcome === 'accepted';
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }

  canInstall(): boolean {
    return !!this.deferredPrompt;
  }

  isAppInstalled(): boolean {
    return this.isInstalled;
  }

  // Notification management
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const applicationServerKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;

      if (!applicationServerKey) {
        console.warn('VAPID public key not configured');
        return null;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlB64ToUint8Array(applicationServerKey),
      });

      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  private urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
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

  // Offline data management
  async saveOfflineData(key: string, data: any): Promise<void> {
    try {
      const serializedData = JSON.stringify({
        data,
        timestamp: Date.now(),
      });
      localStorage.setItem(`offline_${key}`, serializedData);
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  getOfflineData<T>(key: string): T | null {
    try {
      const serializedData = localStorage.getItem(`offline_${key}`);
      if (!serializedData) return null;

      const { data } = JSON.parse(serializedData);
      return data as T;
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  }

  clearOfflineData(key?: string): void {
    if (key) {
      localStorage.removeItem(`offline_${key}`);
    } else {
      // Clear all offline data
      Object.keys(localStorage)
        .filter(k => k.startsWith('offline_'))
        .forEach(k => localStorage.removeItem(k));
    }
  }

  // Connection status
  isOnline(): boolean {
    return navigator.onLine;
  }

  onConnectionChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  // Background sync
  async registerBackgroundSync(tag: string): Promise<void> {
    if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.warn('Background sync is not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      // Check if sync is supported
      if ('sync' in registration) {
        await (registration as any).sync.register(tag);
      }
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }

  // Share API
  async share(data: ShareData): Promise<boolean> {
    if (!navigator.share) {
      // Fallback to clipboard API
      if (navigator.clipboard && data.url) {
        try {
          await navigator.clipboard.writeText(data.url);
          return true;
        } catch (error) {
          console.error('Clipboard write failed:', error);
          return false;
        }
      }
      return false;
    }

    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.error('Web Share failed:', error);
      return false;
    }
  }

  // Device capabilities
  getDeviceCapabilities() {
    return {
      standalone: this.isAppInstalled(),
      pushNotifications: 'Notification' in window && 'serviceWorker' in navigator,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      share: !!navigator.share,
      clipboard: !!navigator.clipboard,
      geolocation: !!navigator.geolocation,
      camera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      vibration: !!navigator.vibrate,
    };
  }
}

// Create singleton instance
export const pwaManager = new PWAManager();

// Import React for hooks

// React hook for PWA functionality
export const usePWA = () => {
  const [canInstall, setCanInstall] = React.useState(pwaManager.canInstall());
  const [isInstalled, setIsInstalled] = React.useState(pwaManager.isAppInstalled());
  const [isOnline, setIsOnline] = React.useState(pwaManager.isOnline());

  React.useEffect(() => {
    // Update install status periodically
    const interval = setInterval(() => {
      setCanInstall(pwaManager.canInstall());
      setIsInstalled(pwaManager.isAppInstalled());
    }, 1000);

    // Listen for connection changes
    const unsubscribe = pwaManager.onConnectionChange(setIsOnline);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const installApp = React.useCallback(async () => {
    const success = await pwaManager.showInstallPrompt();
    if (success) {
      setIsInstalled(true);
      setCanInstall(false);
    }
    return success;
  }, []);

  const requestNotifications = React.useCallback(async () => {
    return await pwaManager.requestNotificationPermission();
  }, []);

  const subscribeToPush = React.useCallback(async () => {
    return await pwaManager.subscribeToPushNotifications();
  }, []);

  return {
    canInstall,
    isInstalled,
    isOnline,
    installApp,
    requestNotifications,
    subscribeToPush,
    capabilities: pwaManager.getDeviceCapabilities(),
  };
};

export default pwaManager;