import DOMPurify from 'dompurify';

// Configuration for different content types
const SECURITY_CONFIGS = {
  // Basic text content (user names, titles, etc.)
  text: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  },
  
  // Rich text content (descriptions, comments, etc.)
  richText: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'ul', 'ol', 'li', 'blockquote'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  },
  
  // HTML content with links
  htmlWithLinks: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'ul', 'ol', 'li', 'blockquote', 'a'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
    SANITIZE_DOM: true,
  },
  
  // Strict mode for untrusted content
  strict: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    SANITIZE_DOM: true,
    KEEP_CONTENT: true,
  },
};

export type ContentType = keyof typeof SECURITY_CONFIGS;

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeContent(
  content: string,
  type: ContentType = 'text'
): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  const config = SECURITY_CONFIGS[type];
  
  try {
    return DOMPurify.sanitize(content, config);
  } catch (error) {
    console.error('Content sanitization failed:', error);
    // Fallback to strict text-only sanitization
    return DOMPurify.sanitize(content, SECURITY_CONFIGS.strict);
  }
}

/**
 * Validate and sanitize URLs
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    const parsedUrl = new URL(url);
    
    // Only allow http, https, and mailto protocols
    const allowedProtocols = ['http:', 'https:', 'mailto:'];
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return '';
    }

    // Prevent javascript: and data: URLs
    if (parsedUrl.protocol === 'javascript:' || parsedUrl.protocol === 'data:') {
      return '';
    }

    return parsedUrl.toString();
  } catch (error) {
    // Invalid URL
    return '';
  }
}

/**
 * CSRF Token Management
 */
class CSRFTokenManager {
  private static instance: CSRFTokenManager;
  private token: string = '';
  private tokenExpiry: number = 0;

  private constructor() {}

  static getInstance(): CSRFTokenManager {
    if (!CSRFTokenManager.instance) {
      CSRFTokenManager.instance = new CSRFTokenManager();
    }
    return CSRFTokenManager.instance;
  }

  async getToken(): Promise<string> {
    if (this.isTokenValid()) {
      return this.token;
    }

    return this.refreshToken();
  }

  private isTokenValid(): boolean {
    return Boolean(this.token) && Date.now() < this.tokenExpiry;
  }

  private async refreshToken(): Promise<string> {
    try {
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }

      const data = await response.json();
      this.token = data.token;
      this.tokenExpiry = Date.now() + (data.expiresIn * 1000); // Convert to milliseconds

      return this.token;
    } catch (error) {
      console.error('Failed to refresh CSRF token:', error);
      throw error;
    }
  }

  invalidateToken(): void {
    this.token = '';
    this.tokenExpiry = 0;
  }
}

export const csrfTokenManager = CSRFTokenManager.getInstance();

/**
 * Secure HTTP client with CSRF protection
 */
export class SecureHttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await csrfTokenManager.getToken();

    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
      'X-CSRF-Token': token,
    };

    const requestOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Include cookies for session management
    };

    try {
      const response = await fetch(url, requestOptions);

      // Handle CSRF token expiry
      if (response.status === 403 && response.headers.get('X-CSRF-Error')) {
        csrfTokenManager.invalidateToken();
        // Retry with new token
        const newToken = await csrfTokenManager.getToken();
        requestOptions.headers = {
          ...requestOptions.headers,
          'X-CSRF-Token': newToken,
        };
        return this.request(endpoint, requestOptions);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }

      return response.text() as unknown as T;
    } catch (error) {
      console.error('Secure HTTP request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

/**
 * Input validation utilities
 */
export class InputValidator {
  // Email validation with stricter regex
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Phone number validation (international format)
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
  }

  // URL validation
  static isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  // SQL injection prevention for search terms
  static sanitizeSearchTerm(term: string): string {
    if (!term || typeof term !== 'string') {
      return '';
    }

    // Remove potentially dangerous characters
    return term
      .replace(/['"\\;]/g, '') // Remove quotes and escape characters
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove block comments
      .trim()
      .substring(0, 100); // Limit length
  }

  // Sanitize file names
  static sanitizeFileName(fileName: string): string {
    if (!fileName || typeof fileName !== 'string') {
      return '';
    }

    return fileName
      .replace(/[^a-zA-Z0-9.\-_]/g, '_') // Replace invalid characters
      .replace(/\.{2,}/g, '.') // Prevent directory traversal
      .substring(0, 255); // Limit length
  }

  // Rate limiting check (simple in-memory implementation)
  private static rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  static checkRateLimit(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60000
  ): boolean {
    const now = Date.now();
    const entry = this.rateLimitMap.get(identifier);

    if (!entry || now > entry.resetTime) {
      this.rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    if (entry.count >= maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }
}

/**
 * Content Security Policy helpers
 */
export class CSPHelper {
  static generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }

  static createCSPHeader(nonce: string): string {
    return [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' https:",
      "connect-src 'self' https:",
      "media-src 'self'",
      "object-src 'none'",
      "frame-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; ');
  }
}

/**
 * Session security utilities
 */
export class SessionSecurity {
  private static readonly ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static readonly WARNING_TIMEOUT = 5 * 60 * 1000; // 5 minutes before expiry
  
  private static lastActivity = Date.now();
  private static warningShown = false;
  private static timeoutId: NodeJS.Timeout | null = null;

  static initialize(
    onSessionExpiry?: () => void,
    onSessionWarning?: () => void
  ): void {
    this.updateActivity();

    // Track user activity
    const activities = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activities.forEach(event => {
      document.addEventListener(event, () => this.updateActivity(), true);
    });

    // Check session periodically
    setInterval(() => {
      this.checkSession(onSessionExpiry, onSessionWarning);
    }, 60000); // Check every minute
  }

  private static updateActivity(): void {
    this.lastActivity = Date.now();
    this.warningShown = false;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private static checkSession(
    onSessionExpiry?: () => void,
    onSessionWarning?: () => void
  ): void {
    const now = Date.now();
    const timeSinceActivity = now - this.lastActivity;

    if (timeSinceActivity >= this.ACTIVITY_TIMEOUT) {
      onSessionExpiry?.();
    } else if (
      timeSinceActivity >= this.ACTIVITY_TIMEOUT - this.WARNING_TIMEOUT &&
      !this.warningShown
    ) {
      this.warningShown = true;
      onSessionWarning?.();
    }
  }

  static extendSession(): void {
    this.updateActivity();
  }
}

/**
 * Password strength validation
 */
export class PasswordValidator {
  static validateStrength(password: string): {
    score: number;
    feedback: string[];
    isValid: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long');
    } else if (password.length >= 12) {
      score += 2;
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain lowercase letters');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain uppercase letters');
    } else {
      score += 1;
    }

    if (!/\d/.test(password)) {
      feedback.push('Password must contain numbers');
    } else {
      score += 1;
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      feedback.push('Password must contain special characters');
    } else {
      score += 1;
    }

    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
      feedback.push('Avoid repeating characters');
      score -= 1;
    }

    if (/123|abc|qwe/i.test(password)) {
      feedback.push('Avoid common sequences');
      score -= 1;
    }

    const isValid = score >= 4 && feedback.length === 0;

    return {
      score: Math.max(0, Math.min(5, score)),
      feedback,
      isValid,
    };
  }
}

// Create a singleton instance for the secure HTTP client
export const secureHttpClient = new SecureHttpClient();

export default {
  sanitizeContent,
  sanitizeUrl,
  csrfTokenManager,
  SecureHttpClient,
  InputValidator,
  CSPHelper,
  SessionSecurity,
  PasswordValidator,
  secureHttpClient,
};