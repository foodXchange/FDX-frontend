// Service Worker registration and management
export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAManager {
  private deferredPrompt: PWAInstallPrompt | null = null;
  private isInstalled = false;
  private updateAvailable = false;

  constructor() {
    this.initializePWA();
  }

  private initializePWA() {
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as any;
      this.dispatchPWAEvent('installable', { canInstall: true });
    });

    // Check if already installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.dispatchPWAEvent('installed', { isInstalled: true });
    });

    // Listen for SW updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        this.updateAvailable = true;
        this.dispatchPWAEvent('updateavailable', { updateAvailable: true });
      });
    }

    // Check if running as PWA
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                      window.navigator.standalone === true;
  }

  async installPWA(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      this.deferredPrompt = null;
      return outcome === 'accepted';
    } catch (error) {
      console.error('PWA installation failed:', error);
      return false;
    }
  }

  canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  isAppInstalled(): boolean {
    return this.isInstalled;
  }

  hasUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  async updateApp(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }
  }

  private dispatchPWAEvent(type: string, detail: any) {
    window.dispatchEvent(new CustomEvent(`pwa-${type}`, { detail }));
  }
}

export const pwaManager = new PWAManager();

// Offline storage utilities
export class OfflineStorage {
  private dbName = 'fdx-offline-db';
  private version = 1;

  async saveOfflineData(storeName: string, data: any): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction([storeName], 'readwrite');
    const store = tx.objectStore(storeName);
    await store.put(data);
  }

  async getOfflineData(storeName: string, key: string): Promise<any> {
    const db = await this.openDB();
    const tx = db.transaction([storeName], 'readonly');
    const store = tx.objectStore(storeName);
    return await store.get(key);
  }

  async getAllOfflineData(storeName: string): Promise<any[]> {
    const db = await this.openDB();
    const tx = db.transaction([storeName], 'readonly');
    const store = tx.objectStore(storeName);
    return await store.getAll();
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('pending-requests')) {
          db.createObjectStore('pending-requests', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('cached-rfqs')) {
          db.createObjectStore('cached-rfqs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('cached-suppliers')) {
          db.createObjectStore('cached-suppliers', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('draft-orders')) {
          db.createObjectStore('draft-orders', { keyPath: 'id' });
        }
      };
    });
  }
}

export const offlineStorage = new OfflineStorage();

// Network status utilities
export function getNetworkStatus(): boolean {
  return navigator.onLine;
}

export function onNetworkChange(callback: (isOnline: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// Push notification utilities
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
    });
    
    return subscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
}