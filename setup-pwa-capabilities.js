const fs = require('fs');
const path = require('path');

console.log('📱 PHASE 4: Setting up PWA capabilities and enhanced UX...');

// Create service worker
function createServiceWorker() {
  console.log('⚙️ Creating service worker...');
  
  const serviceWorker = `const CACHE_NAME = 'fdx-frontend-v1.0.0';
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico'
];

const API_CACHE_URLS = [
  '/api/rfqs',
  '/api/suppliers',
  '/api/orders'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE_URLS))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(\`\${CACHE_NAME}-api\`).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache for API requests
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(request)
          .then((response) => {
            // Cache new resources
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
      })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle offline form submissions
      handleBackgroundSync()
    );
  }
});

async function handleBackgroundSync() {
  const db = await openDB();
  const tx = db.transaction(['pending-requests'], 'readonly');
  const store = tx.objectStore('pending-requests');
  const requests = await store.getAll();

  for (const requestData of requests) {
    try {
      await fetch(requestData.url, {
        method: requestData.method,
        headers: requestData.headers,
        body: requestData.body
      });
      
      // Remove from pending requests after successful sync
      const deleteTx = db.transaction(['pending-requests'], 'readwrite');
      const deleteStore = deleteTx.objectStore('pending-requests');
      await deleteStore.delete(requestData.id);
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }
}

// IndexedDB helper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fdx-offline-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-requests')) {
        db.createObjectStore('pending-requests', { keyPath: 'id' });
      }
    };
  });
}

// Push notification handler
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon-192x192.png',
      badge: '/favicon-192x192.png',
      data: data.data,
      actions: [
        {
          action: 'view',
          title: 'View Details'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});`;
  
  fs.writeFileSync('./public/sw.js', serviceWorker);
  console.log('✅ Created service worker');
}

// Create PWA manifest
function createPWAManifest() {
  console.log('📋 Creating PWA manifest...');
  
  const manifest = {
    name: "FoodXchange - B2B Food Trading Platform",
    short_name: "FoodXchange",
    description: "Comprehensive B2B platform for food trading, supplier management, and supply chain optimization",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1976d2",
    orientation: "portrait-primary",
    scope: "/",
    categories: ["business", "productivity", "food"],
    lang: "en-US",
    icons: [
      {
        src: "/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/favicon-512x512.png", 
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ],
    screenshots: [
      {
        src: "/screenshot-desktop.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide"
      },
      {
        src: "/screenshot-mobile.png", 
        sizes: "375x812",
        type: "image/png",
        form_factor: "narrow"
      }
    ],
    shortcuts: [
      {
        name: "Create RFQ",
        short_name: "New RFQ",
        description: "Create a new Request for Quote",
        url: "/rfqs/create",
        icons: [{ src: "/favicon-192x192.png", sizes: "192x192" }]
      },
      {
        name: "Browse Suppliers",
        short_name: "Suppliers", 
        description: "Browse available suppliers",
        url: "/suppliers",
        icons: [{ src: "/favicon-192x192.png", sizes: "192x192" }]
      },
      {
        name: "Order History",
        short_name: "Orders",
        description: "View order history",
        url: "/orders",
        icons: [{ src: "/favicon-192x192.png", sizes: "192x192" }]
      }
    ],
    share_target: {
      action: "/share",
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        title: "title",
        text: "text",
        url: "url",
        files: [
          {
            name: "documents",
            accept: ["image/*", ".pdf", ".doc", ".docx"]
          }
        ]
      }
    }
  };
  
  fs.writeFileSync('./public/manifest.json', JSON.stringify(manifest, null, 2));
  console.log('✅ Created PWA manifest');
}

// Create offline page
function createOfflinePage() {
  console.log('📱 Creating offline page...');
  
  const offlinePage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Offline - FoodXchange</title>
    <style>
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .container {
            max-width: 400px;
            padding: 2rem;
        }
        .icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        h1 {
            margin: 0 0 1rem 0;
            font-size: 2rem;
        }
        p {
            margin: 0 0 2rem 0;
            opacity: 0.9;
            line-height: 1.5;
        }
        .button {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid white;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
        }
        .button:hover {
            background: white;
            color: #667eea;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">📡</div>
        <h1>You're Offline</h1>
        <p>
            No internet connection detected. Some features may be limited, 
            but you can still browse cached content and create drafts.
        </p>
        <a href="/" class="button">Try Again</a>
    </div>
    
    <script>
        // Retry connection every 5 seconds
        setInterval(() => {
            if (navigator.onLine) {
                window.location.href = '/';
            }
        }, 5000);
    </script>
</body>
</html>`;
  
  fs.writeFileSync('./public/offline.html', offlinePage);
  console.log('✅ Created offline page');
}

// Create PWA utilities and hooks
function createPWAUtils() {
  console.log('🛠️ Creating PWA utilities...');
  
  if (!fs.existsSync('./src/pwa')) {
    fs.mkdirSync('./src/pwa', { recursive: true });
  }
  
  const pwaUtils = `// Service Worker registration and management
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
    window.dispatchEvent(new CustomEvent(\`pwa-\${type}\`, { detail }));
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
}`;
  
  fs.writeFileSync('./src/pwa/utils.ts', pwaUtils);
  console.log('✅ Created PWA utilities');
}

// Create PWA React hooks
function createPWAHooks() {
  console.log('🪝 Creating PWA React hooks...');
  
  const pwaHooks = `import { useState, useEffect } from 'react';
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
}`;
  
  fs.writeFileSync('./src/pwa/hooks.ts', pwaHooks);
  console.log('✅ Created PWA hooks');
}

// Create PWA install banner component
function createPWAInstallBanner() {
  console.log('📲 Creating PWA install banner...');
  
  const installBanner = `import React, { useState } from 'react';
import { Box, Paper, Typography, Button, IconButton, Slide } from '@mui/material';
import { Close as CloseIcon, GetApp as InstallIcon } from '@mui/icons-material';
import { usePWAInstall } from '../pwa/hooks';

export const PWAInstallBanner: React.FC = () => {
  const { canInstall, installPWA } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  return (
    <Slide direction="up" in={!dismissed} mountOnEnter unmountOnExit>
      <Paper
        sx={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          right: 16,
          maxWidth: 400,
          mx: 'auto',
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
        elevation={6}
      >
        <InstallIcon />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Install FoodXchange
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Get the full app experience with offline access and push notifications.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleInstall}
            sx={{ 
              color: 'white', 
              borderColor: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            Install
          </Button>
          <IconButton
            size="small"
            onClick={handleDismiss}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Paper>
    </Slide>
  );
};`;
  
  fs.writeFileSync('./src/components/PWAInstallBanner.tsx', installBanner);
  console.log('✅ Created PWA install banner');
}

// Create offline indicator component
function createOfflineIndicator() {
  console.log('📶 Creating offline indicator...');
  
  const offlineIndicator = `import React from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { WifiOff as OfflineIcon } from '@mui/icons-material';
import { useNetworkStatus, useBackgroundSync } from '../pwa/hooks';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useNetworkStatus();
  const { pendingRequests } = useBackgroundSync();

  if (isOnline && pendingRequests.length === 0) {
    return null;
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        p: 1.5,
        bgcolor: isOnline ? 'warning.main' : 'error.main',
        color: 'white',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}
      elevation={6}
    >
      {!isOnline && <OfflineIcon />}
      <Typography variant="body2">
        {!isOnline ? 'Offline Mode' : 'Syncing...'}
      </Typography>
      {pendingRequests.length > 0 && (
        <Chip
          label={\`\${pendingRequests.length} pending\`}
          size="small"
          sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.2)', 
            color: 'white',
            '& .MuiChip-label': { color: 'white' }
          }}
        />
      )}
    </Paper>
  );
};`;
  
  fs.writeFileSync('./src/components/OfflineIndicator.tsx', offlineIndicator);
  console.log('✅ Created offline indicator');
}

// Update index.html with PWA meta tags
function updateIndexHTML() {
  console.log('📄 Updating index.html with PWA meta tags...');
  
  const indexPath = './public/index.html';
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Add PWA meta tags after viewport
    const pwaMetaTags = `    <meta name="theme-color" content="#1976d2" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="FoodXchange" />
    <meta name="msapplication-TileColor" content="#1976d2" />
    <meta name="msapplication-config" content="/browserconfig.xml" />
    
    <!-- PWA icons -->
    <link rel="apple-touch-icon" href="/favicon-192x192.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
    <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png" />
    
    <!-- PWA manifest -->
    <link rel="manifest" href="/manifest.json" />`;

    content = content.replace(
      /<meta name="viewport"[^>]*>/,
      `<meta name="viewport" content="width=device-width, initial-scale=1" />
${pwaMetaTags}`
    );
    
    fs.writeFileSync(indexPath, content);
    console.log('✅ Updated index.html');
  }
}

// Create browserconfig.xml for Windows tiles
function createBrowserConfig() {
  console.log('🖼️ Creating browserconfig.xml...');
  
  const browserConfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square150x150logo src="/favicon-192x192.png"/>
            <TileColor>#1976d2</TileColor>
        </tile>
    </msapplication>
</browserconfig>`;
  
  fs.writeFileSync('./public/browserconfig.xml', browserConfig);
  console.log('✅ Created browserconfig.xml');
}

// Create share target handler
function createShareTarget() {
  console.log('🔗 Creating share target handler...');
  
  const shareTarget = `import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';

export const ShareTarget: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const title = searchParams.get('title');
    const text = searchParams.get('text');
    const url = searchParams.get('url');
    
    // Process shared content
    if (title || text || url) {
      // Create new RFQ with shared content
      const sharedData = {
        title: title || 'Shared Content',
        description: text || '',
        sourceUrl: url || ''
      };
      
      // Navigate to RFQ creation with pre-filled data
      navigate('/rfqs/create', { state: { sharedData } });
    } else {
      // No shared content, redirect to home
      navigate('/');
    }
  }, [searchParams, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        p: 3
      }}
    >
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6">Processing shared content...</Typography>
        <Typography variant="body2" color="text.secondary">
          Please wait while we set up your new RFQ.
        </Typography>
      </Paper>
    </Box>
  );
};`;
  
  fs.writeFileSync('./src/components/ShareTarget.tsx', shareTarget);
  console.log('✅ Created share target handler');
}

// Run all PWA setup
async function setupPWACapabilities() {
  try {
    createServiceWorker();
    createPWAManifest();
    createOfflinePage();
    createPWAUtils();
    createPWAHooks();
    createPWAInstallBanner();
    createOfflineIndicator();
    updateIndexHTML();
    createBrowserConfig();
    createShareTarget();
    
    console.log('🎉 PHASE 4 COMPLETE: PWA capabilities and enhanced UX setup!');
    console.log('📱 Features added:');
    console.log('  • Service Worker with caching strategies');
    console.log('  • PWA manifest with app shortcuts');
    console.log('  • Offline functionality and storage');
    console.log('  • Install banner and update notifications');
    console.log('  • Background sync for offline forms');
    console.log('  • Push notification support');
    console.log('  • Share target integration');
    console.log('  • Network status indicators');
    console.log('📋 Next: Add components to App.tsx and register service worker');
    
  } catch (error) {
    console.error('❌ Error setting up PWA:', error);
  }
}

setupPWACapabilities();