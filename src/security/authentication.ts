import CryptoJS from 'crypto-js';

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
    
    return `otpauth://totp/${encodedIssuer}:${encodedUsername}?secret=${encodedSecret}&issuer=${encodedIssuer}`;
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
}