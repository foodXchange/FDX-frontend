// Configuration helper that combines environment variables and runtime config

interface FeatureFlags {
  expertMarketplace: boolean;
  aiLeadScoring: boolean;
  advancedAnalytics: boolean;
  collaborationWorkspace: boolean;
  videoConsultations: boolean;
  blockchainVerification: boolean;
  voiceCommands: boolean;
}

interface ApiConfig {
  baseUrl: string;
  wsUrl: string;
  timeout: number;
  retryAttempts: number;
}

interface UIConfig {
  theme: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  enableAnimations: boolean;
  compactMode: boolean;
}

interface MonitoringConfig {
  enableAnalytics: boolean;
  enableErrorTracking: boolean;
  sampleRate: number;
  excludePaths: string[];
}

interface Config {
  environment: string;
  features: FeatureFlags;
  api: ApiConfig;
  ui: UIConfig;
  monitoring: MonitoringConfig;
  appInsights: {
    instrumentationKey?: string;
    connectionString?: string;
  };
  session: {
    timeout: number;
    refreshInterval: number;
  };
  upload: {
    maxFileSize: number;
    allowedFileTypes: string[];
  };
}

// Get runtime config with fallback to window config
const getRuntimeConfig = (): any => {
  if (typeof window !== 'undefined' && (window as any).FDX_CONFIG) {
    return (window as any).FDX_CONFIG;
  }
  return {};
};

const runtimeConfig = getRuntimeConfig();

// Build configuration from environment variables and runtime config
const config: Config = {
  environment: process.env.REACT_APP_ENVIRONMENT || 'development',
  
  features: {
    expertMarketplace: runtimeConfig.features?.expertMarketplace ?? true,
    aiLeadScoring: runtimeConfig.features?.aiLeadScoring ?? true,
    advancedAnalytics: runtimeConfig.features?.advancedAnalytics ?? true,
    collaborationWorkspace: runtimeConfig.features?.collaborationWorkspace ?? true,
    videoConsultations: runtimeConfig.features?.videoConsultations ?? false,
    blockchainVerification: runtimeConfig.features?.blockchainVerification ?? false,
    voiceCommands: runtimeConfig.features?.voiceCommands ?? false,
  },
  
  api: {
    baseUrl: process.env.REACT_APP_API_URL || runtimeConfig.api?.baseUrl || 'http://localhost:3001/api',
    wsUrl: process.env.REACT_APP_WS_URL || runtimeConfig.api?.wsUrl || 'ws://localhost:3001',
    timeout: runtimeConfig.api?.timeout || 30000,
    retryAttempts: runtimeConfig.api?.retryAttempts || 3,
  },
  
  ui: {
    theme: runtimeConfig.ui?.theme || 'light',
    primaryColor: runtimeConfig.ui?.primaryColor || '#1976d2',
    secondaryColor: runtimeConfig.ui?.secondaryColor || '#f50057',
    enableAnimations: runtimeConfig.ui?.enableAnimations ?? true,
    compactMode: runtimeConfig.ui?.compactMode ?? false,
  },
  
  monitoring: {
    enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true' || runtimeConfig.monitoring?.enableAnalytics || false,
    enableErrorTracking: runtimeConfig.monitoring?.enableErrorTracking ?? true,
    sampleRate: runtimeConfig.monitoring?.sampleRate || 1.0,
    excludePaths: runtimeConfig.monitoring?.excludePaths || ['/health', '/metrics'],
  },
  
  appInsights: {
    instrumentationKey: process.env.REACT_APP_APP_INSIGHTS_KEY,
    connectionString: process.env.REACT_APP_APP_INSIGHTS_CONNECTION_STRING,
  },
  
  session: {
    timeout: Number(process.env.REACT_APP_SESSION_TIMEOUT) || 3600000,
    refreshInterval: Number(process.env.REACT_APP_REFRESH_INTERVAL) || 300000,
  },
  
  upload: {
    maxFileSize: Number(process.env.REACT_APP_MAX_FILE_SIZE) || 10485760,
    allowedFileTypes: process.env.REACT_APP_ALLOWED_FILE_TYPES?.split(',') || ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
  },
};

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return config.features[feature];
};

// Helper function to get API endpoint
export const getApiEndpoint = (path: string): string => {
  const baseUrl = config.api.baseUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// Helper function to get WebSocket URL
export const getWebSocketUrl = (path?: string): string => {
  const wsUrl = config.api.wsUrl.replace(/\/$/, '');
  if (path) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${wsUrl}${cleanPath}`;
  }
  return wsUrl;
};

export default config;