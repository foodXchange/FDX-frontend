// Runtime configuration - can be updated without rebuilding the app
interface FDXConfig {
  features: {
    expertMarketplace: boolean;
    aiLeadScoring: boolean;
    advancedAnalytics: boolean;
    collaborationWorkspace: boolean;
    videoConsultations: boolean;
    blockchainVerification: boolean;
    voiceCommands: boolean;
  };
  api: {
    baseUrl: string;
    wsUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  ui: {
    theme: string;
    primaryColor: string;
    secondaryColor: string;
    enableAnimations: boolean;
    compactMode: boolean;
  };
  monitoring: {
    enableAnalytics: boolean;
    enableErrorTracking: boolean;
    sampleRate: number;
    excludePaths: string[];
  };
}

declare global {
  interface Window {
    FDX_CONFIG: FDXConfig;
    REACT_APP_API_URL?: string;
    REACT_APP_WS_URL?: string;
  }
}

window.FDX_CONFIG = {
  // Feature flags
  features: {
    expertMarketplace: true,
    aiLeadScoring: true,
    advancedAnalytics: true,
    collaborationWorkspace: true,
    videoConsultations: false,
    blockchainVerification: false,
    voiceCommands: false
  },
  
  // API endpoints - can be overridden at runtime
  api: {
    baseUrl: window.REACT_APP_API_URL || 'https://api.foodxchange.com/api',
    wsUrl: window.REACT_APP_WS_URL || 'wss://api.foodxchange.com',
    timeout: 30000,
    retryAttempts: 3
  },
  
  // UI configuration
  ui: {
    theme: 'light',
    primaryColor: '#1976d2',
    secondaryColor: '#f50057',
    enableAnimations: true,
    compactMode: false
  },
  
  // Monitoring configuration
  monitoring: {
    enableAnalytics: true,
    enableErrorTracking: true,
    sampleRate: 1.0,
    excludePaths: ['/health', '/metrics']
  }
};