const fs = require('fs');
const path = require('path');

console.log('🔒 PHASE 6: Implementing security and scalability features...');

// Create Content Security Policy (CSP) configuration
function createCSPConfiguration() {
  console.log('🛡️ Creating Content Security Policy configuration...');
  
  const cspConfig = `// Content Security Policy configuration for enhanced security
export interface CSPConfig {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'connect-src': string[];
  'font-src': string[];
  'object-src': string[];
  'media-src': string[];
  'frame-src': string[];
  'base-uri': string[];
  'form-action': string[];
  'frame-ancestors': string[];
  'upgrade-insecure-requests': boolean;
}

export const cspConfig: CSPConfig = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Remove in production, use nonces
    "'unsafe-eval'", // Remove in production
    'https://cdn.jsdelivr.net',
    'https://unpkg.com',
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled-components/emotion
    'https://fonts.googleapis.com',
    'https://cdn.jsdelivr.net'
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:',
    'https://www.google-analytics.com',
    'https://stats.g.doubleclick.net'
  ],
  'connect-src': [
    "'self'",
    'https://api.foodxchange.com',
    'https://analytics.foodxchange.com',
    'https://sentry.io',
    'https://www.google-analytics.com',
    'wss://api.foodxchange.com'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net'
  ],
  'object-src': ["'none'"],
  'media-src': ["'self'", 'blob:', 'data:'],
  'frame-src': [
    "'self'",
    'https://www.youtube.com',
    'https://player.vimeo.com'
  ],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': true
};

// Generate CSP header string
export function generateCSPHeader(): string {
  const directives = Object.entries(cspConfig)
    .filter(([key, value]) => key !== 'upgrade-insecure-requests' || value === true)
    .map(([key, value]) => {
      if (key === 'upgrade-insecure-requests') {
        return key;
      }
      return \`\${key} \${Array.isArray(value) ? value.join(' ') : value}\`;
    });
  
  return directives.join('; ');
}

// CSP violation reporting
export function setupCSPReporting() {
  window.addEventListener('securitypolicyviolation', (e) => {
    console.error('CSP Violation:', {
      blockedURI: e.blockedURI,
      violatedDirective: e.violatedDirective,
      originalPolicy: e.originalPolicy,
      documentURI: e.documentURI,
      lineNumber: e.lineNumber,
      columnNumber: e.columnNumber,
      sourceFile: e.sourceFile
    });
    
    // Report to monitoring service
    if (window.fetch) {
      fetch('/api/security/csp-violation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockedURI: e.blockedURI,
          violatedDirective: e.violatedDirective,
          documentURI: e.documentURI,
          timestamp: new Date().toISOString()
        })
      }).catch(console.error);
    }
  });
}`;
  
  if (!fs.existsSync('./src/security')) {
    fs.mkdirSync('./src/security', { recursive: true });
  }
  
  fs.writeFileSync('./src/security/csp.ts', cspConfig);
  console.log('✅ Created CSP configuration');
}

// Create authentication security utilities
function createAuthSecurity() {
  console.log('🔐 Creating authentication security utilities...');
  
  const authSecurity = `import CryptoJS from 'crypto-js';

// Secure token management
export class SecureTokenManager {
  private static readonly TOKEN_KEY = 'fdx_auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'fdx_refresh_token';
  private static readonly ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'default-key';

  // Encrypt sensitive data
  private static encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.ENCRYPTION_KEY).toString();
  }

  // Decrypt sensitive data
  private static decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Store token securely
  static setToken(token: string): void {
    const encryptedToken = this.encrypt(token);
    localStorage.setItem(this.TOKEN_KEY, encryptedToken);
  }

  // Retrieve token securely
  static getToken(): string | null {
    const encryptedToken = localStorage.getItem(this.TOKEN_KEY);
    if (!encryptedToken) return null;
    
    try {
      return this.decrypt(encryptedToken);
    } catch (error) {
      console.error('Token decryption failed:', error);
      this.clearTokens();
      return null;
    }
  }

  // Store refresh token
  static setRefreshToken(refreshToken: string): void {
    const encryptedToken = this.encrypt(refreshToken);
    sessionStorage.setItem(this.REFRESH_TOKEN_KEY, encryptedToken);
  }

  // Get refresh token
  static getRefreshToken(): string | null {
    const encryptedToken = sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!encryptedToken) return null;
    
    try {
      return this.decrypt(encryptedToken);
    } catch (error) {
      console.error('Refresh token decryption failed:', error);
      return null;
    }
  }

  // Clear all tokens
  static clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // Check if token is expired
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  // Get token expiration time
  static getTokenExpiration(token: string): Date | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch (error) {
      return null;
    }
  }
}

// Session security
export class SessionSecurity {
  private static sessionTimeout = 30 * 60 * 1000; // 30 minutes
  private static warningTime = 5 * 60 * 1000; // 5 minutes before expiry
  private static checkInterval = 60 * 1000; // Check every minute
  private static lastActivity = Date.now();
  private static warningShown = false;
  private static intervalId: NodeJS.Timeout | null = null;

  // Initialize session monitoring
  static initialize(onSessionExpired?: () => void, onSessionWarning?: () => void): void {
    this.setupActivityTracking();
    this.startSessionMonitoring(onSessionExpired, onSessionWarning);
  }

  // Track user activity
  private static setupActivityTracking(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => {
      this.lastActivity = Date.now();
      this.warningShown = false;
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });
  }

  // Monitor session timeout
  private static startSessionMonitoring(
    onSessionExpired?: () => void,
    onSessionWarning?: () => void
  ): void {
    this.intervalId = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - this.lastActivity;

      // Show warning
      if (timeSinceActivity > this.sessionTimeout - this.warningTime && !this.warningShown) {
        this.warningShown = true;
        onSessionWarning?.();
      }

      // Session expired
      if (timeSinceActivity > this.sessionTimeout) {
        this.cleanup();
        SecureTokenManager.clearTokens();
        onSessionExpired?.();
      }
    }, this.checkInterval);
  }

  // Extend session
  static extendSession(): void {
    this.lastActivity = Date.now();
    this.warningShown = false;
  }

  // Cleanup session monitoring
  static cleanup(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Get time until session expires
  static getTimeUntilExpiry(): number {
    const timeSinceActivity = Date.now() - this.lastActivity;
    return Math.max(0, this.sessionTimeout - timeSinceActivity);
  }
}

// Password security utilities
export class PasswordSecurity {
  // Password strength validation
  static validatePassword(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Password must be at least 8 characters long');
    }

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Add uppercase letters');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Add numbers');

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('Add special characters');

    // Common password check
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'qwerty',
      'letmein', 'welcome', 'monkey', '1234567890'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      score = 0;
      feedback.push('Avoid common passwords');
    }

    // Sequential characters check
    if (this.hasSequentialChars(password)) {
      score -= 1;
      feedback.push('Avoid sequential characters');
    }

    return {
      isValid: score >= 4,
      score: Math.max(0, score),
      feedback
    };
  }

  private static hasSequentialChars(password: string): boolean {
    for (let i = 0; i < password.length - 2; i++) {
      const char1 = password.charCodeAt(i);
      const char2 = password.charCodeAt(i + 1);
      const char3 = password.charCodeAt(i + 2);
      
      if (char2 === char1 + 1 && char3 === char2 + 1) {
        return true;
      }
    }
    return false;
  }

  // Generate secure password
  static generateSecurePassword(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';
    
    // Ensure at least one character from each type
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

// Two-factor authentication utilities
export class TwoFactorAuth {
  // Generate TOTP secret
  static generateSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)];
    }
    return secret;
  }

  // Generate QR code URL for authenticator apps
  static generateQRCodeURL(secret: string, username: string, issuer: string = 'FoodXchange'): string {
    const encodedSecret = encodeURIComponent(secret);
    const encodedUsername = encodeURIComponent(username);
    const encodedIssuer = encodeURIComponent(issuer);
    
    return \`otpauth://totp/\${encodedIssuer}:\${encodedUsername}?secret=\${encodedSecret}&issuer=\${encodedIssuer}\`;
  }

  // Validate TOTP code (simplified - use proper library in production)
  static validateTOTPCode(secret: string, code: string): boolean {
    // This is a simplified implementation
    // In production, use a proper TOTP library like 'otplib'
    const window = 30; // 30-second window
    const currentTime = Math.floor(Date.now() / 1000 / window);
    
    // Check current window and adjacent windows for clock skew
    for (let i = -1; i <= 1; i++) {
      const timeWindow = currentTime + i;
      const expectedCode = this.generateTOTPCode(secret, timeWindow);
      if (expectedCode === code) {
        return true;
      }
    }
    
    return false;
  }

  private static generateTOTPCode(secret: string, timeWindow: number): string {
    // Simplified TOTP generation - use proper implementation in production
    const hash = CryptoJS.HmacSHA1(timeWindow.toString(), secret);
    const code = parseInt(hash.toString().slice(-6), 16) % 1000000;
    return code.toString().padStart(6, '0');
  }
}`;
  
  fs.writeFileSync('./src/security/authentication.ts', authSecurity);
  console.log('✅ Created authentication security utilities');
}

// Create input sanitization and validation
function createInputSecurity() {
  console.log('🧹 Creating input sanitization and validation...');
  
  const inputSecurity = `import DOMPurify from 'dompurify';

// Input sanitization utilities
export class InputSanitizer {
  // Sanitize HTML content
  static sanitizeHTML(html: string, options?: DOMPurify.Config): string {
    const defaultOptions: DOMPurify.Config = {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'title'],
      ALLOW_DATA_ATTR: false,
      SANITIZE_DOM: true,
      WHOLE_DOCUMENT: false,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      FORCE_BODY: false,
      ...options
    };
    
    return DOMPurify.sanitize(html, defaultOptions);
  }

  // Sanitize for display in text content
  static sanitizeText(text: string): string {
    return text
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Sanitize SQL-like inputs (basic protection)
  static sanitizeSQL(input: string): string {
    const sqlKeywords = [
      'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE',
      'ALTER', 'EXEC', 'UNION', 'SCRIPT', 'EVAL'
    ];
    
    let sanitized = input;
    sqlKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      sanitized = sanitized.replace(regex, '');
    });
    
    return sanitized
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;--]/g, '') // Remove SQL comment markers
      .trim();
  }

  // Sanitize file paths
  static sanitizeFilePath(path: string): string {
    return path
      .replace(/\\.\\./g, '') // Remove directory traversal
      .replace(/[<>:"|?*]/g, '') // Remove invalid filename characters
      .replace(/^[.\\s]+|[.\\s]+$/g, '') // Remove leading/trailing dots and spaces
      .substring(0, 255); // Limit length
  }

  // Sanitize URLs
  static sanitizeURL(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Invalid protocol');
      }
      
      // Remove potentially dangerous query parameters
      const dangerousParams = ['script', 'eval', 'javascript'];
      dangerousParams.forEach(param => {
        urlObj.searchParams.delete(param);
      });
      
      return urlObj.toString();
    } catch (error) {
      return '';
    }
  }

  // Sanitize email addresses
  static sanitizeEmail(email: string): string {
    return email
      .toLowerCase()
      .replace(/[^a-z0-9@._-]/g, '')
      .trim();
  }

  // Sanitize phone numbers
  static sanitizePhoneNumber(phone: string): string {
    return phone.replace(/[^0-9+()-\\s]/g, '').trim();
  }
}

// Input validation utilities
export class InputValidator {
  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Phone number validation
  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[+]?[1-9]?[0-9]{7,15}$/;
    return phoneRegex.test(phone.replace(/[\\s()-]/g, ''));
  }

  // URL validation
  static isValidURL(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  // File upload validation
  static validateFileUpload(file: File, options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['image/*', 'application/pdf'],
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
    } = options;

    // Size validation
    if (file.size > maxSize) {
      errors.push(\`File size exceeds \${maxSize / (1024 * 1024)}MB limit\`);
    }

    // Type validation
    const isTypeAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isTypeAllowed) {
      errors.push('File type not allowed');
    }

    // Extension validation
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      errors.push('File extension not allowed');
    }

    // Filename validation
    if (file.name.length > 255) {
      errors.push('Filename too long');
    }

    if (/[<>:"|?*]/.test(file.name)) {
      errors.push('Filename contains invalid characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Form data validation
  static validateFormData(data: Record<string, any>, schema: Record<string, {
    type: 'string' | 'number' | 'email' | 'url' | 'phone';
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
  }>): { isValid: boolean; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {};

    Object.entries(schema).forEach(([field, rules]) => {
      const value = data[field];
      const fieldErrors: string[] = [];

      // Required validation
      if (rules.required && (value === undefined || value === null || value === '')) {
        fieldErrors.push('This field is required');
        errors[field] = fieldErrors;
        return;
      }

      // Skip further validation if field is empty and not required
      if (!value && !rules.required) return;

      // Type-specific validation
      switch (rules.type) {
        case 'string':
          if (typeof value !== 'string') {
            fieldErrors.push('Must be a string');
          } else {
            if (rules.minLength && value.length < rules.minLength) {
              fieldErrors.push(\`Must be at least \${rules.minLength} characters\`);
            }
            if (rules.maxLength && value.length > rules.maxLength) {
              fieldErrors.push(\`Must be no more than \${rules.maxLength} characters\`);
            }
            if (rules.pattern && !rules.pattern.test(value)) {
              fieldErrors.push('Invalid format');
            }
          }
          break;

        case 'number':
          const numValue = Number(value);
          if (isNaN(numValue)) {
            fieldErrors.push('Must be a number');
          } else {
            if (rules.min !== undefined && numValue < rules.min) {
              fieldErrors.push(\`Must be at least \${rules.min}\`);
            }
            if (rules.max !== undefined && numValue > rules.max) {
              fieldErrors.push(\`Must be no more than \${rules.max}\`);
            }
          }
          break;

        case 'email':
          if (!this.isValidEmail(value)) {
            fieldErrors.push('Must be a valid email address');
          }
          break;

        case 'url':
          if (!this.isValidURL(value)) {
            fieldErrors.push('Must be a valid URL');
          }
          break;

        case 'phone':
          if (!this.isValidPhoneNumber(value)) {
            fieldErrors.push('Must be a valid phone number');
          }
          break;
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Rate limiting for client-side operations
export class RateLimiter {
  private static limits: Map<string, { count: number; resetTime: number }> = new Map();

  static checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const limit = this.limits.get(key);

    if (!limit || now > limit.resetTime) {
      // Reset or create new limit
      this.limits.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (limit.count >= maxRequests) {
      return false; // Rate limit exceeded
    }

    limit.count++;
    return true;
  }

  static getRemainingAttempts(key: string, maxRequests: number): number {
    const limit = this.limits.get(key);
    if (!limit) return maxRequests;
    return Math.max(0, maxRequests - limit.count);
  }

  static getResetTime(key: string): number {
    const limit = this.limits.get(key);
    return limit ? limit.resetTime : 0;
  }

  static clearLimit(key: string): void {
    this.limits.delete(key);
  }
}`;
  
  fs.writeFileSync('./src/security/inputSecurity.ts', inputSecurity);
  console.log('✅ Created input security utilities');
}

// Create API security utilities
function createAPISecurity() {
  console.log('🌐 Creating API security utilities...');
  
  const apiSecurity = `import { SecureTokenManager } from './authentication';

// API request interceptor with security features
export class SecureAPIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private requestQueue: Map<string, Promise<any>> = new Map();

  constructor(baseURL: string, defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...defaultHeaders
    };
  }

  // Secure request with automatic token refresh
  async request<T>(
    endpoint: string,
    options: RequestInit & {
      skipAuth?: boolean;
      skipDeduplication?: boolean;
      timeout?: number;
    } = {}
  ): Promise<T> {
    const {
      skipAuth = false,
      skipDeduplication = false,
      timeout = 30000,
      ...fetchOptions
    } = options;

    const url = this.buildURL(endpoint);
    const requestKey = \`\${fetchOptions.method || 'GET'}:\${url}\`;

    // Request deduplication for GET requests
    if (!skipDeduplication && (!fetchOptions.method || fetchOptions.method === 'GET')) {
      const existingRequest = this.requestQueue.get(requestKey);
      if (existingRequest) {
        return existingRequest;
      }
    }

    // Build request
    const requestPromise = this.executeRequest<T>(url, {
      ...fetchOptions,
      skipAuth,
      timeout
    });

    // Store in queue for deduplication
    if (!skipDeduplication) {
      this.requestQueue.set(requestKey, requestPromise);
      requestPromise.finally(() => {
        this.requestQueue.delete(requestKey);
      });
    }

    return requestPromise;
  }

  private async executeRequest<T>(
    url: string,
    options: RequestInit & { skipAuth?: boolean; timeout?: number }
  ): Promise<T> {
    const { skipAuth, timeout, ...fetchOptions } = options;

    // Add authentication header
    const headers = { ...this.defaultHeaders };
    if (!skipAuth) {
      const token = SecureTokenManager.getToken();
      if (token) {
        // Check if token is expired
        if (SecureTokenManager.isTokenExpired(token)) {
          const refreshed = await this.refreshToken();
          if (!refreshed) {
            throw new Error('Authentication expired. Please log in again.');
          }
          const newToken = SecureTokenManager.getToken();
          if (newToken) {
            headers.Authorization = \`Bearer \${newToken}\`;
          }
        } else {
          headers.Authorization = \`Bearer \${token}\`;
        }
      } else if (!skipAuth) {
        throw new Error('Authentication required');
      }
    }

    // Add CSRF protection
    const csrfToken = this.getCSRFToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    // Add request ID for tracking
    const requestId = this.generateRequestId();
    headers['X-Request-ID'] = requestId;

    // Create request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: { ...headers, ...fetchOptions.headers },
        signal: controller.signal,
        credentials: 'include', // Include cookies for CSRF protection
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        await this.handleHTTPError(response);
      }

      // Parse response
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text() as unknown as T;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw this.handleNetworkError(error);
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = SecureTokenManager.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(this.buildURL('/auth/refresh'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${refreshToken}\`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        SecureTokenManager.setToken(data.accessToken);
        if (data.refreshToken) {
          SecureTokenManager.setRefreshToken(data.refreshToken);
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  private buildURL(endpoint: string): string {
    const url = endpoint.startsWith('http') ? endpoint : \`\${this.baseURL}\${endpoint}\`;
    return url;
  }

  private getCSRFToken(): string | null {
    // Get CSRF token from meta tag or cookie
    const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (metaToken) return metaToken;

    // Fallback to cookie
    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('csrfToken='));
    return csrfCookie ? csrfCookie.split('=')[1] : null;
  }

  private generateRequestId(): string {
    return \`req_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  }

  private async handleHTTPError(response: Response): Promise<never> {
    let errorMessage = \`HTTP \${response.status}: \${response.statusText}\`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // If response is not JSON, use status text
    }

    // Handle specific status codes
    switch (response.status) {
      case 401:
        SecureTokenManager.clearTokens();
        window.location.href = '/login';
        throw new Error('Authentication expired. Please log in again.');
      
      case 403:
        throw new Error('Access denied. You do not have permission to perform this action.');
      
      case 429:
        const retryAfter = response.headers.get('Retry-After');
        throw new Error(\`Rate limit exceeded. \${retryAfter ? \`Try again in \${retryAfter} seconds.\` : ''}\`);
      
      case 500:
        throw new Error('Server error. Please try again later.');
      
      default:
        throw new Error(errorMessage);
    }
  }

  private handleNetworkError(error: any): Error {
    if (!navigator.onLine) {
      return new Error('No internet connection. Please check your network and try again.');
    }
    
    if (error.message?.includes('Failed to fetch')) {
      return new Error('Unable to connect to server. Please try again later.');
    }
    
    return error instanceof Error ? error : new Error('Network error occurred');
  }

  // Convenience methods
  async get<T>(endpoint: string, options?: Omit<RequestInit, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: Omit<RequestInit, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async put<T>(endpoint: string, data?: any, options?: Omit<RequestInit, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async delete<T>(endpoint: string, options?: Omit<RequestInit, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async patch<T>(endpoint: string, data?: any, options?: Omit<RequestInit, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    });
  }
}

// Create global API client instance
export const apiClient = new SecureAPIClient(
  process.env.REACT_APP_API_URL || 'https://api.foodxchange.com',
  {
    'X-Client-Version': process.env.REACT_APP_VERSION || '1.0.0',
    'X-Client-Platform': 'web'
  }
);

// Request encryption for sensitive data
export class RequestEncryption {
  private static publicKey: string | null = null;

  // Initialize with server's public key
  static async initialize(): Promise<void> {
    try {
      const response = await fetch('/api/public-key');
      const data = await response.json();
      this.publicKey = data.publicKey;
    } catch (error) {
      console.error('Failed to fetch public key:', error);
    }
  }

  // Encrypt sensitive request data
  static async encryptData(data: any): Promise<string> {
    if (!this.publicKey) {
      throw new Error('Encryption not initialized');
    }

    // In a real implementation, use Web Crypto API or a crypto library
    // This is a placeholder for the encryption logic
    const encrypted = btoa(JSON.stringify(data)); // Simple base64 encoding as placeholder
    return encrypted;
  }

  // Create encrypted request
  static async createEncryptedRequest(data: any): Promise<{ encryptedData: string; signature: string }> {
    const encryptedData = await this.encryptData(data);
    
    // Create signature for integrity verification
    const signature = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(encryptedData + this.publicKey)
    );
    
    return {
      encryptedData,
      signature: Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    };
  }
}`;
  
  fs.writeFileSync('./src/security/apiSecurity.ts', apiSecurity);
  console.log('✅ Created API security utilities');
}

// Create micro-frontend architecture utilities
function createMicrofrontendUtils() {
  console.log('🏗️ Creating micro-frontend architecture utilities...');
  
  if (!fs.existsSync('./src/microfrontend')) {
    fs.mkdirSync('./src/microfrontend', { recursive: true });
  }
  
  const microfrontendUtils = `// Micro-frontend module loader and registry
export interface MicrofrontendConfig {
  name: string;
  url: string;
  scope: string;
  module: string;
  version?: string;
  dependencies?: string[];
  fallback?: React.ComponentType;
  errorBoundary?: React.ComponentType;
}

export class MicrofrontendRegistry {
  private static modules: Map<string, MicrofrontendConfig> = new Map();
  private static loadedModules: Map<string, any> = new Map();
  private static loadingPromises: Map<string, Promise<any>> = new Map();

  // Register a micro-frontend module
  static register(config: MicrofrontendConfig): void {
    this.modules.set(config.name, config);
    console.log(\`Registered micro-frontend: \${config.name}\`);
  }

  // Load a micro-frontend module
  static async loadModule(name: string): Promise<any> {
    const config = this.modules.get(name);
    if (!config) {
      throw new Error(\`Micro-frontend '\${name}' not registered\`);
    }

    // Return cached module if already loaded
    if (this.loadedModules.has(name)) {
      return this.loadedModules.get(name);
    }

    // Return existing loading promise if already loading
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name);
    }

    // Start loading process
    const loadPromise = this.loadModuleInternal(config);
    this.loadingPromises.set(name, loadPromise);

    try {
      const module = await loadPromise;
      this.loadedModules.set(name, module);
      this.loadingPromises.delete(name);
      return module;
    } catch (error) {
      this.loadingPromises.delete(name);
      throw error;
    }
  }

  private static async loadModuleInternal(config: MicrofrontendConfig): Promise<any> {
    // Load dependencies first
    if (config.dependencies) {
      await Promise.all(
        config.dependencies.map(dep => this.loadModule(dep))
      );
    }

    // Load the remote module
    await this.loadRemoteEntry(config);

    // Get the module from the global scope
    const container = (window as any)[config.scope];
    if (!container) {
      throw new Error(\`Container '\${config.scope}' not found\`);
    }

    // Initialize the container
    await container.init(this.getSharedDependencies());

    // Get the module factory
    const factory = await container.get(config.module);
    const module = factory();

    return module;
  }

  private static async loadRemoteEntry(config: MicrofrontendConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = config.url;
      script.type = 'text/javascript';
      script.async = true;

      script.onload = () => {
        console.log(\`Loaded remote entry for \${config.name}\`);
        resolve();
      };

      script.onerror = () => {
        reject(new Error(\`Failed to load remote entry for \${config.name}\`));
      };

      document.head.appendChild(script);
    });
  }

  private static getSharedDependencies(): any {
    return {
      react: {
        singleton: true,
        requiredVersion: '^18.0.0',
        get: () => import('react')
      },
      'react-dom': {
        singleton: true,
        requiredVersion: '^18.0.0',
        get: () => import('react-dom')
      },
      '@mui/material': {
        singleton: true,
        requiredVersion: '^5.0.0',
        get: () => import('@mui/material')
      }
    };
  }

  // Unload a module (for hot reloading)
  static unloadModule(name: string): void {
    this.loadedModules.delete(name);
    console.log(\`Unloaded micro-frontend: \${name}\`);
  }

  // Get all registered modules
  static getRegisteredModules(): MicrofrontendConfig[] {
    return Array.from(this.modules.values());
  }

  // Check if module is loaded
  static isModuleLoaded(name: string): boolean {
    return this.loadedModules.has(name);
  }
}

// React component for loading micro-frontends
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';

interface MicrofrontendComponentProps {
  name: string;
  fallback?: React.ComponentType;
  onError?: (error: Error) => void;
  [key: string]: any;
}

export const MicrofrontendComponent: React.FC<MicrofrontendComponentProps> = ({
  name,
  fallback: CustomFallback,
  onError,
  ...props
}) => {
  const [error, setError] = useState<Error | null>(null);
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadComponent = async () => {
      try {
        setError(null);
        const module = await MicrofrontendRegistry.loadModule(name);
        
        if (isMounted) {
          // Assume the module exports a default component
          setComponent(() => module.default || module);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(\`Failed to load \${name}\`);
        if (isMounted) {
          setError(error);
          onError?.(error);
        }
      }
    };

    loadComponent();

    return () => {
      isMounted = false;
    };
  }, [name, onError]);

  if (error) {
    const config = MicrofrontendRegistry.modules.get(name);
    const ErrorComponent = config?.errorBoundary;
    
    if (ErrorComponent) {
      return <ErrorComponent />;
    }
    
    return (
      <Alert severity="error">
        Failed to load {name}: {error.message}
      </Alert>
    );
  }

  if (!Component) {
    const config = MicrofrontendRegistry.modules.get(name);
    const FallbackComponent = CustomFallback || config?.fallback;
    
    if (FallbackComponent) {
      return <FallbackComponent />;
    }
    
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return <Component {...props} />;
};

// Higher-order component for micro-frontend wrapping
export function withMicrofrontend(name: string) {
  return function <P extends object>(WrappedComponent: React.ComponentType<P>) {
    return React.memo((props: P) => {
      return (
        <MicrofrontendComponent name={name} {...props}>
          <WrappedComponent {...props} />
        </MicrofrontendComponent>
      );
    });
  };
}

// Event bus for micro-frontend communication
export class MicrofrontendEventBus {
  private static listeners: Map<string, Set<Function>> = new Map();

  // Subscribe to events
  static subscribe(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  // Emit events
  static emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(\`Error in event listener for '\${event}':\`, error);
        }
      });
    }
  }

  // Clear all listeners for an event
  static clearListeners(event: string): void {
    this.listeners.delete(event);
  }

  // Clear all listeners
  static clearAllListeners(): void {
    this.listeners.clear();
  }

  // Get active events
  static getActiveEvents(): string[] {
    return Array.from(this.listeners.keys());
  }
}

// Shared state management for micro-frontends
export class SharedStateManager {
  private static state: Map<string, any> = new Map();
  private static subscribers: Map<string, Set<Function>> = new Map();

  // Set shared state
  static setState(key: string, value: any): void {
    const oldValue = this.state.get(key);
    this.state.set(key, value);
    
    // Notify subscribers
    const callbacks = this.subscribers.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(value, oldValue);
        } catch (error) {
          console.error(\`Error in state subscriber for '\${key}':\`, error);
        }
      });
    }
  }

  // Get shared state
  static getState(key: string): any {
    return this.state.get(key);
  }

  // Subscribe to state changes
  static subscribe(key: string, callback: Function): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    
    this.subscribers.get(key)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.get(key)?.delete(callback);
    };
  }

  // Clear state
  static clearState(key: string): void {
    this.state.delete(key);
    this.setState(key, undefined);
  }

  // Get all state keys
  static getStateKeys(): string[] {
    return Array.from(this.state.keys());
  }
}

// React hook for shared state
export function useSharedState<T>(key: string, initialValue?: T): [T, (value: T) => void] {
  const [value, setValue] = React.useState<T>(() => 
    SharedStateManager.getState(key) ?? initialValue
  );

  React.useEffect(() => {
    const unsubscribe = SharedStateManager.subscribe(key, (newValue: T) => {
      setValue(newValue);
    });

    return unsubscribe;
  }, [key]);

  const setSharedValue = React.useCallback((newValue: T) => {
    SharedStateManager.setState(key, newValue);
  }, [key]);

  return [value, setSharedValue];
}`;
  
  fs.writeFileSync('./src/microfrontend/registry.tsx', microfrontendUtils);
  console.log('✅ Created micro-frontend utilities');
}

// Create security monitoring and logging
function createSecurityMonitoring() {
  console.log('🔍 Creating security monitoring and logging...');
  
  const securityMonitoring = `// Security event monitoring and logging
export interface SecurityEvent {
  type: 'auth_attempt' | 'auth_failure' | 'csrf_violation' | 'xss_attempt' | 'injection_attempt' | 'rate_limit_exceeded' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  userAgent: string;
  ip?: string;
  userId?: string;
  sessionId: string;
  details: Record<string, any>;
  fingerprint: string;
}

export class SecurityMonitor {
  private static events: SecurityEvent[] = [];
  private static maxEvents = 1000;
  private static fingerprint: string;

  static initialize(): void {
    this.fingerprint = this.generateFingerprint();
    this.setupGlobalListeners();
    console.log('Security monitoring initialized');
  }

  private static generateFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Browser fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.hardwareConcurrency || 0,
      navigator.deviceMemory || 0
    ].join('|');
    
    return btoa(fingerprint).slice(0, 32);
  }

  private static setupGlobalListeners(): void {
    // Monitor for potential XSS attempts
    const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    if (originalInnerHTML) {
      Object.defineProperty(Element.prototype, 'innerHTML', {
        set: function(value: string) {
          if (typeof value === 'string' && SecurityMonitor.detectXSS(value)) {
            SecurityMonitor.logSecurityEvent({
              type: 'xss_attempt',
              severity: 'high',
              details: { 
                element: this.tagName,
                content: value.substring(0, 200),
                url: window.location.href
              }
            });
          }
          return originalInnerHTML.set?.call(this, value);
        },
        get: originalInnerHTML.get,
        configurable: true
      });
    }

    // Monitor console access (potential debugging attempts)
    const originalLog = console.log;
    console.log = function(...args) {
      if (args.some(arg => typeof arg === 'string' && arg.includes('password'))) {
        SecurityMonitor.logSecurityEvent({
          type: 'suspicious_activity',
          severity: 'medium',
          details: { 
            action: 'console_password_access',
            url: window.location.href
          }
        });
      }
      return originalLog.apply(this, args);
    };

    // Monitor for script injection attempts
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.tagName === 'SCRIPT') {
              SecurityMonitor.logSecurityEvent({
                type: 'injection_attempt',
                severity: 'critical',
                details: {
                  src: element.getAttribute('src'),
                  content: element.textContent?.substring(0, 200),
                  url: window.location.href
                }
              });
            }
          }
        });
      });
    });

    observer.observe(document, {
      childList: true,
      subtree: true
    });
  }

  private static detectXSS(content: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\\/script>/gi,
      /javascript:/gi,
      /on\\w+\\s*=/gi,
      /<iframe[^>]*src/gi,
      /eval\\s*\\(/gi,
      /expression\\s*\\(/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /vbscript:/gi
    ];

    return xssPatterns.some(pattern => pattern.test(content));
  }

  static logSecurityEvent(event: Partial<SecurityEvent>): void {
    const securityEvent: SecurityEvent = {
      type: event.type || 'suspicious_activity',
      severity: event.severity || 'medium',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId(),
      details: event.details || {},
      fingerprint: this.fingerprint,
      ...event
    };

    this.events.push(securityEvent);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Send to security endpoint
    this.reportSecurityEvent(securityEvent);

    // Log critical events immediately
    if (securityEvent.severity === 'critical') {
      console.error('Critical security event:', securityEvent);
    }
  }

  private static async reportSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      await fetch('/api/security/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
        credentials: 'include'
      });
    } catch (error) {
      console.error('Failed to report security event:', error);
    }
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('security_session_id');
    if (!sessionId) {
      sessionId = \`session_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
      sessionStorage.setItem('security_session_id', sessionId);
    }
    return sessionId;
  }

  static getSecurityEvents(): SecurityEvent[] {
    return [...this.events];
  }

  static getEventsByType(type: SecurityEvent['type']): SecurityEvent[] {
    return this.events.filter(event => event.type === type);
  }

  static getEventsBySeverity(severity: SecurityEvent['severity']): SecurityEvent[] {
    return this.events.filter(event => event.severity === severity);
  }

  static clearEvents(): void {
    this.events = [];
  }

  // Security health check
  static getSecurityHealth(): {
    status: 'good' | 'warning' | 'critical';
    score: number;
    issues: string[];
  } {
    const recentEvents = this.events.filter(
      event => Date.now() - new Date(event.timestamp).getTime() < 24 * 60 * 60 * 1000
    );

    const criticalEvents = recentEvents.filter(e => e.severity === 'critical').length;
    const highEvents = recentEvents.filter(e => e.severity === 'high').length;
    const mediumEvents = recentEvents.filter(e => e.severity === 'medium').length;

    let score = 100;
    const issues: string[] = [];

    // Deduct points for security events
    score -= criticalEvents * 20;
    score -= highEvents * 10;
    score -= mediumEvents * 5;

    if (criticalEvents > 0) {
      issues.push(\`\${criticalEvents} critical security events detected\`);
    }
    if (highEvents > 5) {
      issues.push(\`\${highEvents} high-severity security events detected\`);
    }
    if (mediumEvents > 20) {
      issues.push(\`\${mediumEvents} medium-severity security events detected\`);
    }

    // Check browser security features
    if (!window.crypto || !window.crypto.subtle) {
      score -= 10;
      issues.push('Web Crypto API not available');
    }

    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      score -= 15;
      issues.push('Not using HTTPS');
    }

    // Determine status
    let status: 'good' | 'warning' | 'critical';
    if (score >= 80) status = 'good';
    else if (score >= 60) status = 'warning';
    else status = 'critical';

    return {
      status,
      score: Math.max(0, score),
      issues
    };
  }
}

// React component for security dashboard
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  List, 
  ListItem, 
  ListItemText,
  LinearProgress,
  Alert
} from '@mui/material';

export const SecurityDashboard: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [health, setHealth] = useState(SecurityMonitor.getSecurityHealth());

  useEffect(() => {
    const updateData = () => {
      setEvents(SecurityMonitor.getSecurityEvents().slice(-20));
      setHealth(SecurityMonitor.getSecurityHealth());
    };

    updateData();
    const interval = setInterval(updateData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'good': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Security Dashboard
      </Typography>

      {/* Security Health */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Security Health Score
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ flex: 1, mr: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={health.score} 
                color={getHealthColor(health.status) as any}
              />
            </Box>
            <Typography variant="h6">{health.score}/100</Typography>
            <Chip 
              label={health.status.toUpperCase()} 
              color={getHealthColor(health.status) as any}
              sx={{ ml: 1 }}
            />
          </Box>
          {health.issues.length > 0 && (
            <Alert severity={health.status === 'critical' ? 'error' : 'warning'}>
              <Typography variant="subtitle2">Security Issues:</Typography>
              <ul>
                {health.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Security Events
          </Typography>
          {events.length === 0 ? (
            <Typography color="text.secondary">No security events recorded</Typography>
          ) : (
            <List>
              {events.map((event, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1">
                          {event.type.replace(/_/g, ' ').toUpperCase()}
                        </Typography>
                        <Chip 
                          label={event.severity} 
                          size="small"
                          color={getSeverityColor(event.severity) as any}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(event.timestamp).toLocaleString()}
                        </Typography>
                        {Object.keys(event.details).length > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            {JSON.stringify(event.details, null, 2).substring(0, 100)}...
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};`;
  
  fs.writeFileSync('./src/security/monitoring.tsx', securityMonitoring);
  console.log('✅ Created security monitoring');
}

// Update package.json with security dependencies
function updatePackageJsonForSecurity() {
  console.log('📦 Updating package.json for security...');
  
  const packagePath = './package.json';
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Add security dependencies
    packageJson.dependencies = {
      ...packageJson.dependencies,
      'crypto-js': '^4.2.0',
      'dompurify': '^3.0.5'
    };
    
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      '@types/crypto-js': '^4.2.0',
      '@types/dompurify': '^3.0.0',
      'bundlesize': '^0.18.1'
    };
    
    // Add security scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      'security:audit': 'npm audit --audit-level moderate',
      'security:scan': 'npm run build && bundlesize',
      'security:test': 'npm run test -- --testPathPattern=security',
      'security:report': 'npm audit --json > security-audit.json'
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json for security');
  }
}

// Create main security initialization
function createSecurityInit() {
  console.log('🔐 Creating security initialization...');
  
  const securityInit = `import { setupCSPReporting } from './csp';
import { SessionSecurity } from './authentication';
import { SecurityMonitor } from './monitoring';
import { RequestEncryption } from './apiSecurity';

// Initialize all security features
export function initializeSecurity(): void {
  // Content Security Policy
  setupCSPReporting();
  
  // Session security
  SessionSecurity.initialize(
    () => {
      // On session expired
      window.location.href = '/login?reason=expired';
    },
    () => {
      // On session warning
      console.warn('Session expiring soon');
      // Could show a warning dialog here
    }
  );
  
  // Security monitoring
  SecurityMonitor.initialize();
  
  // Request encryption
  RequestEncryption.initialize().catch(console.error);
  
  console.log('🔒 Security systems initialized');
}

// Export all security utilities
export * from './csp';
export * from './authentication';
export * from './inputSecurity';
export * from './apiSecurity';
export * from './monitoring';`;
  
  fs.writeFileSync('./src/security/index.ts', securityInit);
  console.log('✅ Created security initialization');
}

// Run all security and scalability setup
async function setupSecurityScalability() {
  try {
    createCSPConfiguration();
    createAuthSecurity();
    createInputSecurity();
    createAPISecurity();
    createMicrofrontendUtils();
    createSecurityMonitoring();
    updatePackageJsonForSecurity();
    createSecurityInit();
    
    console.log('🎉 PHASE 6 COMPLETE: Security and scalability features setup!');
    console.log('🔒 Security features added:');
    console.log('  • Content Security Policy (CSP) configuration');
    console.log('  • Secure authentication with token encryption');
    console.log('  • Session management with timeout protection');
    console.log('  • Input sanitization and validation');
    console.log('  • API security with CSRF protection');
    console.log('  • Security monitoring and event logging');
    console.log('  • Password security utilities');
    console.log('  • Two-factor authentication support');
    console.log('🏗️ Scalability features added:');
    console.log('  • Micro-frontend architecture support');
    console.log('  • Module federation registry');
    console.log('  • Inter-app communication bus');
    console.log('  • Shared state management');
    console.log('  • Dynamic module loading');
    console.log('📋 Next: npm install security deps and integrate with app');
    
  } catch (error) {
    console.error('❌ Error setting up security and scalability:', error);
  }
}

setupSecurityScalability();