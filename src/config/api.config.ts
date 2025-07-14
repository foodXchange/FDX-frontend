// API Configuration
export const API_CONFIG = {
  // Base URLs for different environments
  baseURL: {
    development: 'http://localhost:5000/api',
    staging: 'https://staging-api.fdx.com/api',
    production: 'https://api.fdx.com/api',
  },

  // Timeout settings
  timeout: {
    default: 30000, // 30 seconds
    upload: 120000, // 2 minutes for file uploads
    download: 60000, // 1 minute for downloads
  },

  // Retry configuration
  retry: {
    maxAttempts: 3,
    delay: 1000, // Initial delay in ms
    maxDelay: 5000, // Maximum delay between retries
    backoffMultiplier: 2, // Exponential backoff multiplier
  },

  // Cache configuration
  cache: {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    userDataTTL: 10 * 60 * 1000, // 10 minutes
    staticDataTTL: 60 * 60 * 1000, // 1 hour
  },

  // Rate limiting
  rateLimit: {
    maxRequestsPerMinute: 60,
    maxBurstRequests: 10,
  },

  // Headers
  headers: {
    common: {
      'Content-Type': 'application/json',
      'X-Client-Version': process.env.REACT_APP_VERSION || '1.0.0',
      'X-Client-Platform': 'web',
    },
  },

  // Endpoints that don't require authentication
  publicEndpoints: [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/health',
    '/status',
  ],

  // Endpoints that should not be retried
  noRetryEndpoints: [
    '/auth/login',
    '/auth/logout',
    '/payments',
  ],

  // File upload configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ],
    chunkSize: 1024 * 1024, // 1MB chunks for large file uploads
  },

  // WebSocket configuration
  websocket: {
    url: {
      development: 'ws://localhost:5000',
      staging: 'wss://staging-ws.fdx.com',
      production: 'wss://ws.fdx.com',
    },
    reconnectInterval: 5000,
    maxReconnectAttempts: 5,
    heartbeatInterval: 30000,
  },
};

// Get the current environment
export const getCurrentEnvironment = (): 'development' | 'staging' | 'production' => {
  const env = process.env.REACT_APP_ENV || process.env.NODE_ENV;
  
  switch (env) {
    case 'production':
      return 'production';
    case 'staging':
      return 'staging';
    default:
      return 'development';
  }
};

// Get API base URL for current environment
export const getApiBaseUrl = (): string => {
  const env = getCurrentEnvironment();
  return process.env.REACT_APP_API_URL || API_CONFIG.baseURL[env];
};

// Get WebSocket URL for current environment
export const getWebSocketUrl = (): string => {
  const env = getCurrentEnvironment();
  return process.env.REACT_APP_WS_URL || API_CONFIG.websocket.url[env];
};

// Check if endpoint requires authentication
export const requiresAuth = (endpoint: string): boolean => {
  return !API_CONFIG.publicEndpoints.some(publicEndpoint => 
    endpoint.includes(publicEndpoint)
  );
};

// Check if endpoint should be retried
export const shouldRetryEndpoint = (endpoint: string): boolean => {
  return !API_CONFIG.noRetryEndpoints.some(noRetryEndpoint => 
    endpoint.includes(noRetryEndpoint)
  );
};

// Validate file for upload
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > API_CONFIG.upload.maxFileSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${API_CONFIG.upload.maxFileSize / (1024 * 1024)}MB`,
    };
  }

  // Check mime type
  if (!API_CONFIG.upload.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not allowed',
    };
  }

  return { valid: true };
};