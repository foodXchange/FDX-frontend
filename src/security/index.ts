import { setupCSPReporting } from './csp';
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
export * from './monitoring';