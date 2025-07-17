import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    rfqUpdates: boolean;
    orderUpdates: boolean;
    marketing: boolean;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'supplier' | 'buyer';
  avatar?: string;
  preferences?: Record<string, unknown>;
  permissions?: string[];
  lastLogin?: Date;
  isActive: boolean;
}

interface AppState {
  user: User | null;
  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // App state
  isOnline: boolean;
  setOnline: (online: boolean) => void;
  
  // Global loading states
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
  
  // Feature flags
  featureFlags: Record<string, boolean>;
  setFeatureFlag: (flag: string, enabled: boolean) => void;
  
  // Recent activity
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: Date;
    data?: Record<string, unknown>;
  }>;
  addActivity: (activity: Omit<AppState['recentActivity'][0], 'id' | 'timestamp'>) => void;
  clearActivity: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'light',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  currency: 'USD',
  notifications: {
    email: true,
    push: true,
    rfqUpdates: true,
    orderUpdates: true,
    marketing: false,
  },
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set) => ({
        user: null,
        // Settings
        settings: defaultSettings,
        updateSettings: (newSettings) =>
          set((state) => {
            Object.assign(state.settings, newSettings);
          }),

        // App state
        isOnline: navigator.onLine,
        setOnline: (online) =>
          set((state) => {
            state.isOnline = online;
          }),

        // Global loading
        globalLoading: false,
        setGlobalLoading: (loading) =>
          set((state) => {
            state.globalLoading = loading;
          }),

        // Feature flags
        featureFlags: {
          aiMatching: true,
          advancedCompliance: true,
          bulkOperations: true,
          realtimeTracking: true,
        },
        setFeatureFlag: (flag, enabled) =>
          set((state) => {
            state.featureFlags[flag] = enabled;
          }),

        // Recent activity
        recentActivity: [],
        addActivity: (activity) =>
          set((state) => {
            state.recentActivity.unshift({
              ...activity,
              id: `${Date.now()}-${Math.random()}`,
              timestamp: new Date(),
            });
            // Keep only last 50 activities
            if (state.recentActivity.length > 50) {
              state.recentActivity = state.recentActivity.slice(0, 50);
            }
          }),
        clearActivity: () =>
          set((state) => {
            state.recentActivity = [];
          }),
      })),
      {
        name: 'app-store',
        partialize: (state) => ({
          settings: state.settings,
          featureFlags: state.featureFlags,
        }),
      }
    )
  )
);

// Listen for online/offline events
window.addEventListener('online', () => {
  useAppStore.getState().setOnline(true);
});

window.addEventListener('offline', () => {
  useAppStore.getState().setOnline(false);
});