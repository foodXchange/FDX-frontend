import { useState, useEffect, useCallback, useRef } from 'react';

interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  url: string;
  method: string;
  retryCount: number;
  maxRetries: number;
}

interface OfflineState {
  isOnline: boolean;
  pendingActions: OfflineAction[];
  syncInProgress: boolean;
  lastSyncTime: number | null;
  syncErrors: string[];
}

interface OfflineConfig {
  maxRetries?: number;
  retryDelay?: number;
  enableBackgroundSync?: boolean;
  syncInterval?: number;
  maxPendingActions?: number;
  enableNotifications?: boolean;
}

export function useOfflineSupport(config: OfflineConfig = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    enableBackgroundSync = true,
    syncInterval = 30000, // 30 seconds
    maxPendingActions = 100,
    enableNotifications = true,
  } = config;

  const [offlineState, setOfflineState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    pendingActions: [],
    syncInProgress: false,
    lastSyncTime: null,
    syncErrors: [],
  });

  const syncIntervalRef = useRef<NodeJS.Timeout>();
  const notificationPermission = useRef<NotificationPermission>('default');

  // Load pending actions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('offline-pending-actions');
    if (stored) {
      try {
        const pendingActions = JSON.parse(stored);
        setOfflineState(prev => ({ ...prev, pendingActions }));
      } catch (error) {
        console.error('Failed to load pending actions:', error);
      }
    }

    // Request notification permission
    if (enableNotifications && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        notificationPermission.current = permission;
      });
    }
  }, [enableNotifications]);

  // Save pending actions to localStorage
  const savePendingActions = useCallback((actions: OfflineAction[]) => {
    try {
      localStorage.setItem('offline-pending-actions', JSON.stringify(actions));
    } catch (error) {
      console.error('Failed to save pending actions:', error);
    }
  }, []);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setOfflineState(prev => ({ ...prev, isOnline: true, syncErrors: [] }));
      
      if (enableNotifications && notificationPermission.current === 'granted') {
        new Notification('Back Online', {
          body: 'Connection restored. Syncing pending changes...',
          icon: '/icon-192x192.png',
        });
      }

      // Trigger sync when coming back online
      syncPendingActions();
    };

    const handleOffline = () => {
      setOfflineState(prev => ({ ...prev, isOnline: false }));
      
      if (enableNotifications && notificationPermission.current === 'granted') {
        new Notification('Offline Mode', {
          body: 'You are now offline. Changes will be saved locally.',
          icon: '/icon-192x192.png',
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enableNotifications]);

  // Background sync interval
  useEffect(() => {
    if (!enableBackgroundSync || !offlineState.isOnline) return;

    syncIntervalRef.current = setInterval(() => {
      if (offlineState.pendingActions.length > 0 && !offlineState.syncInProgress) {
        syncPendingActions();
      }
    }, syncInterval);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [enableBackgroundSync, offlineState.isOnline, offlineState.pendingActions.length, offlineState.syncInProgress, syncInterval]);

  // Queue action for offline execution
  const queueAction = useCallback((
    type: string,
    data: any,
    url: string,
    method: string = 'POST'
  ): string => {
    const action: OfflineAction = {
      id: generateActionId(),
      type,
      data,
      timestamp: Date.now(),
      url,
      method,
      retryCount: 0,
      maxRetries,
    };

    setOfflineState(prev => {
      const newActions = [...prev.pendingActions, action];
      
      // Limit number of pending actions
      if (newActions.length > maxPendingActions) {
        newActions.splice(0, newActions.length - maxPendingActions);
      }
      
      const newState = { ...prev, pendingActions: newActions };
      savePendingActions(newState.pendingActions);
      return newState;
    });

    return action.id;
  }, [maxRetries, maxPendingActions, savePendingActions]);

  // Remove action from queue
  const removeAction = useCallback((actionId: string) => {
    setOfflineState(prev => {
      const newActions = prev.pendingActions.filter(action => action.id !== actionId);
      const newState = { ...prev, pendingActions: newActions };
      savePendingActions(newState.pendingActions);
      return newState;
    });
  }, [savePendingActions]);

  // Sync pending actions
  const syncPendingActions = useCallback(async () => {
    if (!offlineState.isOnline || offlineState.syncInProgress || offlineState.pendingActions.length === 0) {
      return;
    }

    setOfflineState(prev => ({ ...prev, syncInProgress: true, syncErrors: [] }));

    const actionsToSync = [...offlineState.pendingActions];
    const syncErrors: string[] = [];

    for (const action of actionsToSync) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(action.data),
        });

        if (response.ok) {
          // Successfully synced, remove from queue
          removeAction(action.id);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
        
        // Increment retry count
        setOfflineState(prev => {
          const updatedActions = prev.pendingActions.map(a => 
            a.id === action.id 
              ? { ...a, retryCount: a.retryCount + 1 }
              : a
          );
          
          // Remove if max retries exceeded
          const filteredActions = updatedActions.filter(a => 
            a.id !== action.id || a.retryCount < a.maxRetries
          );
          
          savePendingActions(filteredActions);
          return { ...prev, pendingActions: filteredActions };
        });

        syncErrors.push(`${action.type}: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Add delay between requests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }

    setOfflineState(prev => ({
      ...prev,
      syncInProgress: false,
      lastSyncTime: Date.now(),
      syncErrors,
    }));

    // Show notification if sync completed
    if (enableNotifications && notificationPermission.current === 'granted' && actionsToSync.length > 0) {
      const successCount = actionsToSync.length - syncErrors.length;
      new Notification('Sync Complete', {
        body: `${successCount} changes synced${syncErrors.length > 0 ? `, ${syncErrors.length} failed` : ''}`,
        icon: '/icon-192x192.png',
      });
    }
  }, [offlineState.isOnline, offlineState.syncInProgress, offlineState.pendingActions, removeAction, retryDelay, enableNotifications, savePendingActions]);

  // Clear all pending actions
  const clearPendingActions = useCallback(() => {
    setOfflineState(prev => {
      const newState = { ...prev, pendingActions: [], syncErrors: [] };
      savePendingActions([]);
      return newState;
    });
  }, [savePendingActions]);

  // Manual sync trigger
  const forcSync = useCallback(() => {
    if (offlineState.isOnline) {
      syncPendingActions();
    }
  }, [offlineState.isOnline, syncPendingActions]);

  // Get pending actions count by type
  const getPendingActionsByType = useCallback((type: string) => {
    return offlineState.pendingActions.filter(action => action.type === type);
  }, [offlineState.pendingActions]);

  // Offline-aware fetch wrapper
  const offlineFetch = useCallback(async (
    url: string,
    options: RequestInit = {},
    actionType: string = 'api_call'
  ): Promise<Response> => {
    if (!offlineState.isOnline) {
      // Queue the action for later sync
      const actionId = queueAction(actionType, options.body, url, options.method as string || 'GET');
      
      // Return a mock response for offline mode
      return new Response(JSON.stringify({ 
        success: false, 
        offline: true, 
        actionId,
        message: 'Action queued for sync when online' 
      }), {
        status: 202, // Accepted
        statusText: 'Queued for offline sync',
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Online - make the actual request
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      // Network error while online - queue for retry
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const actionId = queueAction(actionType, options.body, url, options.method as string || 'GET');
        
        return new Response(JSON.stringify({ 
          success: false, 
          offline: true, 
          actionId,
          message: 'Network error - action queued for retry' 
        }), {
          status: 202,
          statusText: 'Queued for retry',
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      throw error;
    }
  }, [offlineState.isOnline, queueAction]);

  return {
    isOnline: offlineState.isOnline,
    pendingActions: offlineState.pendingActions,
    syncInProgress: offlineState.syncInProgress,
    lastSyncTime: offlineState.lastSyncTime,
    syncErrors: offlineState.syncErrors,
    queueAction,
    removeAction,
    syncPendingActions,
    clearPendingActions,
    forcSync,
    getPendingActionsByType,
    offlineFetch,
    pendingCount: offlineState.pendingActions.length,
    hasErrors: offlineState.syncErrors.length > 0,
  };
}

// Progressive Web App utilities
export function useProgressiveWebApp() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      setIsInstalled(
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        (window.navigator as any).standalone === true
      );
    };

    checkInstalled();
    window.addEventListener('resize', checkInstalled);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setIsInstallable(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('resize', checkInstalled);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        setInstallPrompt(null);
        setIsInstallable(false);
        return true;
      }
    } catch (error) {
      console.error('Install failed:', error);
    }

    return false;
  }, [installPrompt]);

  return {
    isInstalled,
    isInstallable,
    installApp,
  };
}

// Service Worker management
export function useServiceWorker() {
  const [swState, setSWState] = useState({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isUpdating: false,
    hasUpdate: false,
    error: null as string | null,
  });

  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!swState.isSupported) return;

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        setRegistration(reg);
        setSWState(prev => ({ ...prev, isRegistered: true }));

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            setSWState(prev => ({ ...prev, isUpdating: true }));
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setSWState(prev => ({ 
                  ...prev, 
                  hasUpdate: true, 
                  isUpdating: false 
                }));
              }
            });
          }
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
        setSWState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : String(error)
        }));
      }
    };

    registerSW();
  }, [swState.isSupported]);

  const updateServiceWorker = useCallback(async () => {
    if (!registration) return;

    try {
      await registration.update();
      window.location.reload();
    } catch (error) {
      console.error('Service Worker update failed:', error);
    }
  }, [registration]);

  const skipWaiting = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [registration]);

  return {
    ...swState,
    updateServiceWorker,
    skipWaiting,
  };
}

// Helper function to generate unique action IDs
function generateActionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
}

export default useOfflineSupport;