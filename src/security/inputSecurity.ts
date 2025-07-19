import DOMPurify from 'dompurify';

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
      .replace(/on\w+=/gi, '') // Remove event handlers
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
      .replace(/\.\./g, '') // Remove directory traversal
      .replace(/[<>:"|?*]/g, '') // Remove invalid filename characters
      .replace(/^[.\s]+|[.\s]+$/g, '') // Remove leading/trailing dots and spaces
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
    return phone.replace(/[^0-9+()-\s]/g, '').trim();
  }
}

// Input validation utilities
export class InputValidator {
  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Phone number validation
  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[+]?[1-9]?[0-9]{7,15}$/;
    return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
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
      errors.push(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
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
              fieldErrors.push(`Must be at least ${rules.minLength} characters`);
            }
            if (rules.maxLength && value.length > rules.maxLength) {
              fieldErrors.push(`Must be no more than ${rules.maxLength} characters`);
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
              fieldErrors.push(`Must be at least ${rules.min}`);
            }
            if (rules.max !== undefined && numValue > rules.max) {
              fieldErrors.push(`Must be no more than ${rules.max}`);
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
}