import { SecureTokenManager } from './authentication';

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
    const requestKey = `${fetchOptions.method || 'GET'}:${url}`;

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
            headers.Authorization = `Bearer ${newToken}`;
          }
        } else {
          headers.Authorization = `Bearer ${token}`;
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
          'Authorization': `Bearer ${refreshToken}`
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
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
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
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async handleHTTPError(response: Response): Promise<never> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
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
        throw new Error(`Rate limit exceeded. ${retryAfter ? `Try again in ${retryAfter} seconds.` : ''}`);
      
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
}