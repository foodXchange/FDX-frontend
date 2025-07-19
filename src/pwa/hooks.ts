import { useState, useEffect } from 'react';
import { pwaManager, offlineStorage, getNetworkStatus, onNetworkChange } from './utils';

// Hook for PWA installation
export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setCanInstall(pwaManager.canInstall());
    setIsInstalled(pwaManager.isAppInstalled());

    const handleInstallable = () => setCanInstall(true);
    const handleInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    window.addEventListener('pwa-installable', handleInstallable);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const installPWA = async () => {
    const success = await pwaManager.installPWA();
    if (success) {
      setIsInstalled(true);
      setCanInstall(false);
    }
    return success;
  };

  return {
    canInstall,
    isInstalled,
    installPWA
  };
}

// Hook for app updates
export function usePWAUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    setUpdateAvailable(pwaManager.hasUpdateAvailable());

    const handleUpdate = () => setUpdateAvailable(true);
    window.addEventListener('pwa-updateavailable', handleUpdate);

    return () => {
      window.removeEventListener('pwa-updateavailable', handleUpdate);
    };
  }, []);

  const updateApp = async () => {
    await pwaManager.updateApp();
    window.location.reload();
  };

  return {
    updateAvailable,
    updateApp
  };
}

// Hook for network status
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(getNetworkStatus());

  useEffect(() => {
    const cleanup = onNetworkChange(setIsOnline);
    return cleanup;
  }, []);

  return isOnline;
}

// Hook for offline storage
export function useOfflineStorage() {
  const saveOfflineData = async (storeName: string, data: any) => {
    try {
      await offlineStorage.saveOfflineData(storeName, data);
      return true;
    } catch (error) {
      console.error('Failed to save offline data:', error);
      return false;
    }
  };

  const getOfflineData = async (storeName: string, key: string) => {
    try {
      return await offlineStorage.getOfflineData(storeName, key);
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  };

  const getAllOfflineData = async (storeName: string) => {
    try {
      return await offlineStorage.getAllOfflineData(storeName);
    } catch (error) {
      console.error('Failed to get all offline data:', error);
      return [];
    }
  };

  return {
    saveOfflineData,
    getOfflineData,
    getAllOfflineData
  };
}

// Hook for background sync
export function useBackgroundSync() {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  const queueRequest = async (url: string, options: RequestInit) => {
    const request = {
      id: Date.now().toString(),
      url,
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body,
      timestamp: Date.now()
    };

    try {
      await offlineStorage.saveOfflineData('pending-requests', request);
      setPendingRequests(prev => [...prev, request]);
      
      // Register background sync
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('background-sync');
      }
    } catch (error) {
      console.error('Failed to queue request:', error);
    }
  };

  const getPendingRequests = async () => {
    const requests = await offlineStorage.getAllOfflineData('pending-requests');
    setPendingRequests(requests);
    return requests;
  };

  useEffect(() => {
    getPendingRequests();
  }, []);

  return {
    pendingRequests,
    queueRequest,
    getPendingRequests
  };
}