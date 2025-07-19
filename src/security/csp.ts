// Content Security Policy configuration for enhanced security
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
      return `${key} ${Array.isArray(value) ? value.join(' ') : value}`;
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
}