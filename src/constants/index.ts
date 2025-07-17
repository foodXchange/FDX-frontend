// =============================================================================
// CONSTANTS - Centralized configuration values
// =============================================================================

// Brand Colors
export const BRAND_COLORS = {
  primary: '#FF6B35',
  primaryDark: '#E55100',
  secondary: '#1E4C8A',
  accent: '#B08D57',
  success: '#52B788',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

// Icon Sizes (standardized to 24px for consistency)
export const ICON_SIZES = {
  small: 16,
  medium: 20,
  large: 24,
  xlarge: 32,
} as const;

// Standard icon className for Heroicons
export const ICON_CLASS = 'h-6 w-6';

// Layout Dimensions
export const LAYOUT = {
  sidebar: {
    width: 280,
    collapsedWidth: 80,
  },
  navbar: {
    height: 64,
  },
  container: {
    maxWidth: 1400,
    padding: {
      xs: 2,
      sm: 3,
      md: 4,
      lg: 5,
    },
  },
  borderRadius: {
    small: 1,
    medium: 2,
    large: 3,
    xlarge: 4,
  },
} as const;

// Z-Index Scale
export const Z_INDEX = {
  base: 1,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modal: 400,
  overlay: 500,
  tooltip: 600,
} as const;

// Animation Durations
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
} as const;

// Breakpoints (matching MUI theme)
export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  generic: 'Something went wrong. Please try again.',
  network: 'Network error. Please check your connection.',
  timeout: 'Request timed out. Please try again.',
  unauthorized: 'You are not authorized to access this resource.',
  forbidden: 'Access forbidden.',
  notFound: 'The requested resource was not found.',
  validation: 'Please check your input and try again.',
} as const;

// Loading States
export const LOADING_STATES = {
  idle: 'idle',
  loading: 'loading',
  success: 'success',
  error: 'error',
} as const;

// API Configuration
export const API = {
  baseURL: process.env.REACT_APP_API_URL || 'https://api.foodxchange.com',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

// Application Configuration
export const APP_CONFIG = {
  name: 'FoodXchange',
  version: '1.0.0',
  description: 'Global Food Sourcing Platform',
  author: 'FoodXchange Team',
  supportEmail: 'support@foodxchange.com',
  features: {
    darkMode: true,
    multiLanguage: true,
    analytics: true,
    notifications: true,
  },
} as const;

// Form Configuration
export const FORM = {
  debounceDelay: 300,
  validation: {
    minPasswordLength: 8,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'],
  },
} as const;

// Pagination
export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
  maxPageSize: 1000,
} as const;

// Date Formats
export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  displayWithTime: 'MMM dd, yyyy HH:mm',
  iso: 'yyyy-MM-dd',
  api: 'yyyy-MM-ddTHH:mm:ss.SSSZ',
} as const;

// Toast Configuration
export const TOAST = {
  duration: {
    success: 3000,
    error: 5000,
    info: 4000,
    warning: 4000,
  },
  position: 'top-right',
  maxToasts: 5,
} as const;

// Routes
export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  login: '/login',
  register: '/register',
  profile: '/profile',
  settings: '/settings',
  orders: '/orders',
  suppliers: '/suppliers',
  products: '/products',
  analytics: '/analytics',
  support: '/support',
  notFound: '/404',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  token: 'fdx_auth_token',
  user: 'fdx_user',
  theme: 'fdx_theme',
  language: 'fdx_language',
  preferences: 'fdx_preferences',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  enableAI: true,
  enableAnalytics: true,
  enableNotifications: true,
  enableExport: true,
  enableBulkActions: true,
  enableRealTimeUpdates: true,
} as const;

// Development Configuration
export const DEV_CONFIG = {
  showDebugInfo: process.env.NODE_ENV === 'development',
  enableMockData: process.env.REACT_APP_MOCK_DATA === 'true',
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
} as const;

const config = {
  BRAND_COLORS,
  ICON_SIZES,
  ICON_CLASS,
  LAYOUT,
  Z_INDEX,
  ANIMATION,
  BREAKPOINTS,
  ERROR_MESSAGES,
  LOADING_STATES,
  API,
  APP_CONFIG,
  FORM,
  PAGINATION,
  DATE_FORMATS,
  TOAST,
  ROUTES,
  STORAGE_KEYS,
  FEATURE_FLAGS,
  DEV_CONFIG,
};

export default config;