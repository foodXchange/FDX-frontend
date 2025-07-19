// Security event monitoring and logging
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
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*src/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi,
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
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
      issues.push(`${criticalEvents} critical security events detected`);
    }
    if (highEvents > 5) {
      issues.push(`${highEvents} high-severity security events detected`);
    }
    if (mediumEvents > 20) {
      issues.push(`${mediumEvents} medium-severity security events detected`);
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
};