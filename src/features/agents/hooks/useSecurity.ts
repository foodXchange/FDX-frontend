import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEffect, useCallback, useState, useRef } from 'react';
import {
  sanitizeContent,
  sanitizeUrl,
  csrfTokenManager,
  InputValidator,
  ContentType,
} from '../utils/security';

interface SecurityConfig {
  enableSessionTimeout?: boolean;
  sessionTimeoutMs?: number;
  enableRateLimit?: boolean;
  rateLimitRequests?: number;
  rateLimitWindowMs?: number;
  enableCSRF?: boolean;
  enableContentSanitization?: boolean;
}

interface SecurityState {
  isSecure: boolean;
  csrfToken: string;
  sessionExpiring: boolean;
  rateLimited: boolean;
  lastActivity: number;
}

export function useSecurity(config: SecurityConfig = {}) {
  const {
    enableSessionTimeout = true,
    sessionTimeoutMs = 30 * 60 * 1000, // 30 minutes
    enableRateLimit = true,
    rateLimitRequests = 100,
    rateLimitWindowMs = 60000, // 1 minute
    enableCSRF = true,
    enableContentSanitization = true,
  } = config;

  const [securityState, setSecurityState] = useState<SecurityState>({
    isSecure: true,
    csrfToken: '',
    sessionExpiring: false,
    rateLimited: false,
    lastActivity: Date.now(),
  });

  const warningTimeoutRef = useRef<NodeJS.Timeout>();
  const sessionTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize CSRF token
  useEffect(() => {
    if (enableCSRF) {
      csrfTokenManager.getToken().then(token => {
        setSecurityState(prev => ({ ...prev, csrfToken: token }));
      }).catch(error => {
        console.error('Failed to initialize CSRF token:', error);
        setSecurityState(prev => ({ ...prev, isSecure: false }));
      });
    }
  }, [enableCSRF]);

  // Session timeout management
  const resetSessionTimeout = useCallback(() => {
    if (!enableSessionTimeout) return;

    const now = Date.now();
    setSecurityState(prev => ({ 
      ...prev, 
      lastActivity: now,
      sessionExpiring: false,
    }));

    // Clear existing timeouts
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);

    // Set warning timeout (5 minutes before expiry)
    warningTimeoutRef.current = setTimeout(() => {
      setSecurityState(prev => ({ ...prev, sessionExpiring: true }));
    }, sessionTimeoutMs - 5 * 60 * 1000);

    // Set session timeout
    sessionTimeoutRef.current = setTimeout(() => {
      handleSessionExpiry();
    }, sessionTimeoutMs);
  }, [enableSessionTimeout, sessionTimeoutMs]);

  const handleSessionExpiry = useCallback(() => {
    setSecurityState(prev => ({ 
      ...prev, 
      isSecure: false,
      sessionExpiring: false,
    }));
    
    // Clear session data
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    
    // Redirect to login or show session expired modal
    window.dispatchEvent(new CustomEvent('sessionExpired'));
  }, []);

  const extendSession = useCallback(async () => {
    try {
      // Make a request to extend the session
      await fetch('/api/auth/extend-session', {
        method: 'POST',
        credentials: 'include',
      });
      
      resetSessionTimeout();
      
      // Refresh CSRF token if needed
      if (enableCSRF) {
        const newToken = await csrfTokenManager.getToken();
        setSecurityState(prev => ({ ...prev, csrfToken: newToken }));
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
      handleSessionExpiry();
    }
  }, [enableCSRF, resetSessionTimeout, handleSessionExpiry]);

  // Track user activity for session management
  useEffect(() => {
    if (!enableSessionTimeout) return;

    const activities = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => resetSessionTimeout();

    activities.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initialize session timeout
    resetSessionTimeout();

    return () => {
      activities.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    };
  }, [enableSessionTimeout, resetSessionTimeout]);

  // Content sanitization utility
  const sanitize = useCallback((content: string, type: ContentType = 'text') => {
    if (!enableContentSanitization) return content;
    return sanitizeContent(content, type);
  }, [enableContentSanitization]);

  // URL sanitization utility
  const sanitizeURL = useCallback((url: string) => {
    return sanitizeUrl(url);
  }, []);

  // Rate limiting check
  const checkRateLimit = useCallback((identifier: string) => {
    if (!enableRateLimit) return true;

    const isAllowed = InputValidator.checkRateLimit(
      identifier,
      rateLimitRequests,
      rateLimitWindowMs
    );

    if (!isAllowed) {
      setSecurityState(prev => ({ ...prev, rateLimited: true }));
      
      // Reset rate limit status after window expires
      setTimeout(() => {
        setSecurityState(prev => ({ ...prev, rateLimited: false }));
      }, rateLimitWindowMs);
    }

    return isAllowed;
  }, [enableRateLimit, rateLimitRequests, rateLimitWindowMs]);

  // Input validation utilities
  const validateInput = useCallback((input: string, type: 'email' | 'phone' | 'url' | 'search' | 'filename') => {
    switch (type) {
      case 'email':
        return InputValidator.isValidEmail(input);
      case 'phone':
        return InputValidator.isValidPhone(input);
      case 'url':
        return InputValidator.isValidUrl(input);
      case 'search':
        return InputValidator.sanitizeSearchTerm(input);
      case 'filename':
        return InputValidator.sanitizeFileName(input);
      default:
        return true;
    }
  }, []);

  // Secure form submission
  const secureSubmit = useCallback(async (
    endpoint: string,
    data: Record<string, any>,
    options: RequestInit = {}
  ) => {
    if (!securityState.isSecure) {
      throw new Error('Session is not secure');
    }

    if (securityState.rateLimited) {
      throw new Error('Rate limit exceeded');
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': securityState.csrfToken,
          ...options.headers,
        },
        credentials: 'include',
        body: JSON.stringify(data),
        ...options,
      });

      if (response.status === 403) {
        // Possible CSRF token expiry
        if (enableCSRF) {
          csrfTokenManager.invalidateToken();
          const newToken = await csrfTokenManager.getToken();
          setSecurityState(prev => ({ ...prev, csrfToken: newToken }));
        }
        throw new Error('Security validation failed');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Secure submission failed:', error);
      throw error;
    }
  }, [securityState, enableCSRF]);

  // Security headers validation
  const validateSecurityHeaders = useCallback(async () => {
    try {
      const response = await fetch('/api/security/headers', {
        method: 'HEAD',
      });

      const requiredHeaders = [
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Strict-Transport-Security',
        'Content-Security-Policy',
      ];

      const missingHeaders = requiredHeaders.filter(header => 
        !response.headers.has(header)
      );

      if (missingHeaders.length > 0) {
        console.warn('Missing security headers:', missingHeaders);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Security headers validation failed:', error);
      return false;
    }
  }, []);

  // XSS detection in content
  const detectXSS = useCallback((content: string): boolean => {
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /eval\s*\(/i,
      /expression\s*\(/i,
    ];

    return xssPatterns.some(pattern => pattern.test(content));
  }, []);

  // Generate Content Security Policy nonce
  const generateCSPNonce = useCallback((): string => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }, []);

  return {
    securityState,
    sanitize,
    sanitizeURL,
    validateInput,
    checkRateLimit,
    extendSession,
    secureSubmit,
    validateSecurityHeaders,
    detectXSS,
    generateCSPNonce,
    isSecure: securityState.isSecure,
    isSessionExpiring: securityState.sessionExpiring,
    isRateLimited: securityState.rateLimited,
  };
}

// Hook for secure file uploads
export function useSecureFileUpload() {
  const [uploadState, setUploadState] = useState({
    uploading: false,
    progress: 0,
    error: null as string | null,
  });

  const uploadFile = useCallback(async (
    file: File,
    endpoint: string,
    options: {
      maxSize?: number;
      allowedTypes?: string[];
      onProgress?: (progress: number) => void;
    } = {}
  ) => {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
      onProgress,
    } = options;

    setUploadState({ uploading: true, progress: 0, error: null });

    try {
      // Validate file size
      if (file.size > maxSize) {
        throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
      }

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed`);
      }

      // Sanitize file name
      const sanitizedName = InputValidator.sanitizeFileName(file.name);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file, sanitizedName);

      // Get CSRF token
      const csrfToken = await csrfTokenManager.getToken();

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadState(prev => ({ ...prev, progress }));
            onProgress?.(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadState({ uploading: false, progress: 100, error: null });
            resolve(JSON.parse(xhr.responseText));
          } else {
            const error = `Upload failed: ${xhr.statusText}`;
            setUploadState({ uploading: false, progress: 0, error });
            reject(new Error(error));
          }
        });

        xhr.addEventListener('error', () => {
          const error = 'Upload failed due to network error';
          setUploadState({ uploading: false, progress: 0, error });
          reject(new Error(error));
        });

        xhr.open('POST', endpoint);
        xhr.setRequestHeader('X-CSRF-Token', csrfToken);
        xhr.send(formData);
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadState({ uploading: false, progress: 0, error: errorMessage });
      throw error;
    }
  }, []);

  return {
    uploadState,
    uploadFile,
  };
}

export default useSecurity;