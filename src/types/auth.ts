// =============================================================================
// AUTH TYPES - Authentication and authorization type definitions
// =============================================================================

import { User } from './business';

// Authentication State Types
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  permissions: string[];
  error: AuthError | null;
  lastActivity: string | null;
  sessionExpiry: string | null;
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export type AuthErrorCode = 
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_DISABLED'
  | 'ACCOUNT_NOT_VERIFIED'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'REFRESH_TOKEN_EXPIRED'
  | 'REFRESH_TOKEN_INVALID'
  | 'SESSION_EXPIRED'
  | 'TWO_FACTOR_REQUIRED'
  | 'TWO_FACTOR_INVALID'
  | 'PERMISSION_DENIED'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

// Token Types
export interface TokenPayload {
  sub: string; // User ID
  email: string;
  role: string;
  permissions: string[];
  iat: number; // Issued at
  exp: number; // Expires at
  aud: string; // Audience
  iss: string; // Issuer
  jti: string; // JWT ID
}

export interface RefreshTokenPayload {
  sub: string; // User ID
  type: 'refresh';
  iat: number; // Issued at
  exp: number; // Expires at
  jti: string; // JWT ID
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  scope: string[];
}

// Session Types
export interface Session {
  id: string;
  userId: string;
  deviceId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  location?: GeoLocation;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  isActive: boolean;
  isCurrent: boolean;
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  version: string;
  fingerprint: string;
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
}

// Permission Types
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: PermissionAction;
  scope: PermissionScope;
  conditions?: PermissionCondition[];
}

export type PermissionAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'execute'
  | 'approve'
  | 'reject';

export type PermissionScope = 
  | 'global'
  | 'organization'
  | 'department'
  | 'team'
  | 'own';

export interface PermissionCondition {
  type: 'time' | 'location' | 'resource_state' | 'user_property';
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  field?: string;
}

// Role Types
export interface Role {
  id: string;
  name: string;
  description: string;
  type: RoleType;
  level: number;
  permissions: Permission[];
  inherits?: string[]; // Role IDs this role inherits from
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RoleType = 
  | 'system_admin'
  | 'admin'
  | 'manager'
  | 'user'
  | 'guest'
  | 'service_account';

// Two-Factor Authentication Types
export interface TwoFactorAuth {
  isEnabled: boolean;
  method: TwoFactorMethod;
  backupCodes: string[];
  qrCodeUrl?: string;
  secret?: string;
}

export type TwoFactorMethod = 
  | 'totp' // Time-based One-Time Password
  | 'sms'
  | 'email'
  | 'backup_codes';

export interface TwoFactorSetupRequest {
  method: TwoFactorMethod;
  phoneNumber?: string; // Required for SMS
}

export interface TwoFactorSetupResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorVerifyRequest {
  code: string;
  method: TwoFactorMethod;
  backupCode?: string;
}

// Password Types
export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  allowedSpecialChars: string;
  maxAge: number; // Days
  historyCount: number; // Number of previous passwords to remember
  lockoutAttempts: number;
  lockoutDuration: number; // Minutes
}

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    specialChars: boolean;
  };
}

export interface PasswordResetRequest {
  email: string;
  callbackUrl?: string;
}

export interface PasswordResetResponse {
  message: string;
  resetToken?: string; // Only in dev/test environments
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Account Verification Types
export interface AccountVerification {
  email: {
    verified: boolean;
    verifiedAt?: string;
    token?: string;
    expiresAt?: string;
  };
  phone: {
    verified: boolean;
    verifiedAt?: string;
    token?: string;
    expiresAt?: string;
  };
  identity: {
    verified: boolean;
    verifiedAt?: string;
    method?: 'manual' | 'automated';
    documents?: string[];
  };
}

export interface VerificationRequest {
  type: 'email' | 'phone' | 'identity';
  token?: string;
  data?: Record<string, any>;
}

// OAuth Types
export interface OAuthProvider {
  id: string;
  name: string;
  type: 'google' | 'microsoft' | 'linkedin' | 'github';
  clientId: string;
  scopes: string[];
  redirectUrl: string;
  enabled: boolean;
}

export interface OAuthState {
  provider: string;
  redirectUrl: string;
  nonce: string;
  createdAt: string;
}

export interface OAuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
  idToken?: string;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  provider: string;
  verified: boolean;
}

// Security Types
export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  userId: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  location?: GeoLocation;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
}

export type SecurityEventType = 
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'password_change'
  | 'password_reset'
  | 'two_factor_enabled'
  | 'two_factor_disabled'
  | 'account_locked'
  | 'account_unlocked'
  | 'permission_denied'
  | 'suspicious_activity'
  | 'token_refresh'
  | 'session_expired'
  | 'email_change'
  | 'profile_update';

export interface SecuritySettings {
  passwordPolicy: PasswordPolicy;
  sessionTimeout: number; // Minutes
  maxConcurrentSessions: number;
  requireTwoFactor: boolean;
  allowedIpRanges?: string[];
  blockedIpRanges?: string[];
  allowedCountries?: string[];
  blockedCountries?: string[];
  enableDeviceTracking: boolean;
  enableLocationTracking: boolean;
  notifyOnNewDevice: boolean;
  notifyOnNewLocation: boolean;
  notifyOnPasswordChange: boolean;
  notifyOnPermissionChange: boolean;
}

// Audit Types
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, { oldValue: any; newValue: any }>;
  metadata?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
}

// API Key Types
export interface ApiKey {
  id: string;
  name: string;
  description?: string;
  key: string; // Masked in responses
  userId: string;
  permissions: string[];
  scopes: string[];
  rateLimit: {
    requests: number;
    period: number; // Seconds
  };
  expiresAt?: string;
  lastUsed?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApiKeyRequest {
  name: string;
  description?: string;
  permissions: string[];
  scopes: string[];
  expiresAt?: string;
  rateLimit?: {
    requests: number;
    period: number;
  };
}

export interface CreateApiKeyResponse {
  apiKey: ApiKey;
  secret: string; // Only returned once
}

// Context Types
export interface AuthContextValue {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  permissions: string[];
  error: AuthError | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<void>;
  
  // Two-Factor
  enableTwoFactor: (method: TwoFactorMethod) => Promise<TwoFactorSetupResponse>;
  disableTwoFactor: () => Promise<void>;
  verifyTwoFactor: (code: string, method: TwoFactorMethod) => Promise<void>;
  
  // Verification
  verifyEmail: (token: string) => Promise<void>;
  verifyPhone: (token: string) => Promise<void>;
  resendVerification: (type: 'email' | 'phone') => Promise<void>;
  
  // Permissions
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  
  // Utils
  clearError: () => void;
  checkSession: () => Promise<void>;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyName?: string;
  companyType?: 'buyer' | 'supplier' | 'both';
  agreeToTerms: boolean;
  subscribeToNewsletter?: boolean;
}

// Hook Types
export interface UseAuthReturn extends AuthContextValue {}

export interface UsePermissionsReturn {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  loading: boolean;
}

export interface UseSessionReturn {
  sessions: Session[];
  currentSession: Session | null;
  loading: boolean;
  error: string | null;
  refreshSessions: () => Promise<void>;
  terminateSession: (sessionId: string) => Promise<void>;
  terminateAllSessions: () => Promise<void>;
}

// Guard Types
export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  requirePermissions?: string[];
  requireRole?: string;
  requireVerified?: boolean;
  redirectTo?: string;
}

export interface PermissionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  permissions: string[];
  requireAll?: boolean;
  requireRole?: string;
}

// Utility Types
export type AuthActionType = 
  | 'LOGIN_START'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'REGISTER_START'
  | 'REGISTER_SUCCESS'
  | 'REGISTER_FAILURE'
  | 'REFRESH_TOKEN_START'
  | 'REFRESH_TOKEN_SUCCESS'
  | 'REFRESH_TOKEN_FAILURE'
  | 'UPDATE_PROFILE_START'
  | 'UPDATE_PROFILE_SUCCESS'
  | 'UPDATE_PROFILE_FAILURE'
  | 'CLEAR_ERROR'
  | 'SET_LOADING'
  | 'SET_ERROR';

export interface AuthAction {
  type: AuthActionType;
  payload?: any;
}

// Type Guards
export const isAuthError = (error: any): error is AuthError => {
  return error && typeof error.code === 'string' && typeof error.message === 'string';
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  return userPermissions.includes(requiredPermission) || userPermissions.includes('*');
};

export const hasAnyPermission = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.some(permission => hasPermission(userPermissions, permission));
};

export const hasAllPermissions = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.every(permission => hasPermission(userPermissions, permission));
};

export const isValidSession = (session: Session): boolean => {
  return session.isActive && new Date(session.expiresAt) > new Date();
};

export const getPasswordStrength = (password: string): PasswordStrength => {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    specialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(requirements).filter(Boolean).length;
  
  const feedback: string[] = [];
  if (!requirements.length) feedback.push('Password must be at least 8 characters long');
  if (!requirements.uppercase) feedback.push('Add uppercase letters');
  if (!requirements.lowercase) feedback.push('Add lowercase letters');
  if (!requirements.numbers) feedback.push('Add numbers');
  if (!requirements.specialChars) feedback.push('Add special characters');

  return {
    score,
    feedback,
    requirements,
  };
};