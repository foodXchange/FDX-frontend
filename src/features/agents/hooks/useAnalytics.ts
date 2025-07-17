import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEffect, useCallback, useRef, useState } from 'react';

// Analytics event types
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
  page: string;
  userAgent: string;
}

interface UserJourney {
  sessionId: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  events: AnalyticsEvent[];
  pages: string[];
  actions: string[];
  conversions: string[];
  duration?: number;
  bounced: boolean;
}

interface AnalyticsConfig {
  enableAutoTracking?: boolean;
  enablePageTracking?: boolean;
  enableClickTracking?: boolean;
  enableErrorTracking?: boolean;
  enablePerformanceTracking?: boolean;
  trackingEndpoint?: string;
  batchSize?: number;
  flushInterval?: number;
  enableDebug?: boolean;
  userId?: string;
}

interface AnalyticsState {
  sessionId: string;
  userId?: string;
  isTracking: boolean;
  eventsQueued: number;
  lastFlush: number;
}

export function useAnalytics(config: AnalyticsConfig = {}) {
  const {
    enableAutoTracking = true,
    enablePageTracking = true,
    enableClickTracking = true,
    enableErrorTracking = true,
    enablePerformanceTracking = true,
    // trackingEndpoint = '/api/analytics/events', // Not used currently
    batchSize = 10,
    flushInterval = 30000, // 30 seconds
    enableDebug = false,
    userId,
  } = config;

  const [analyticsState, setAnalyticsState] = useState<AnalyticsState>({
    sessionId: generateSessionId(),
    userId,
    isTracking: enableAutoTracking,
    eventsQueued: 0,
    lastFlush: Date.now(),
  });

  const eventQueue = useRef<AnalyticsEvent[]>([]);
  const flushIntervalRef = useRef<NodeJS.Timeout>();
  const currentJourney = useRef<UserJourney | null>(null);

  // Define flushEvents function
  const flushEvents = useCallback(() => {
    if (eventQueue.current.length > 0) {
      // Send events to analytics service
      console.log('Flushing events:', eventQueue.current);
      eventQueue.current = [];
    }
  }, []);

  // Track an event
  const track = useCallback((eventName: string, properties: Record<string, any> = {}) => {
    if (!analyticsState.isTracking) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: Date.now(),
      sessionId: analyticsState.sessionId,
      userId: analyticsState.userId,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    };

    eventQueue.current.push(event);
    
    // Add to current journey
    if (currentJourney.current) {
      currentJourney.current.events.push(event);
      
      if (eventName === 'page_view') {
        const page = properties.page || window.location.pathname;
        if (!currentJourney.current.pages.includes(page)) {
          currentJourney.current.pages.push(page);
        }
      } else if (isActionEvent(eventName)) {
        currentJourney.current.actions.push(eventName);
      } else if (isConversionEvent(eventName)) {
        currentJourney.current.conversions.push(eventName);
      }
    }

    setAnalyticsState(prev => ({
      ...prev,
      eventsQueued: eventQueue.current.length,
    }));

    if (enableDebug) {
      console.log('Analytics Event:', event);
    }

    // Auto-flush if batch size reached
    if (eventQueue.current.length >= batchSize) {
      flushEvents();
    }
  }, [analyticsState.isTracking, analyticsState.sessionId, analyticsState.userId, batchSize, enableDebug, flushEvents]);

  // Start new session
  const startSession = useCallback(() => {
    const journey: UserJourney = {
      sessionId: analyticsState.sessionId,
      userId: analyticsState.userId,
      startTime: Date.now(),
      events: [],
      pages: [],
      actions: [],
      conversions: [],
      bounced: false,
    };

    currentJourney.current = journey;
    track('session_start');
  }, [analyticsState.sessionId, analyticsState.userId, track]);

  // End current session
  const endSession = useCallback(() => {
    if (!currentJourney.current) return;

    const journey = currentJourney.current;
    journey.endTime = Date.now();
    journey.duration = journey.endTime - journey.startTime;
    journey.bounced = journey.pages.length <= 1 && journey.duration < 30000;

    track('session_end', {
      duration: journey.duration,
      pageCount: journey.pages.length,
      actionCount: journey.actions.length,
      conversionCount: journey.conversions.length,
      bounced: journey.bounced,
    });

    // Send journey data
    // sendUserJourney(journey);
    currentJourney.current = null;
  }, [track]);

  // Track page view
  const trackPageView = useCallback((page: string, properties: Record<string, any> = {}) => {
    track('page_view', {
      page,
      title: document.title,
      referrer: document.referrer,
      ...properties,
    });
  }, [track]);

  // Track user action
  const trackAction = useCallback((action: string, properties: Record<string, any> = {}) => {
    track(`action_${action}`, properties);
  }, [track]);

  // Track conversion
  const trackConversion = useCallback((conversion: string, value?: number, properties: Record<string, any> = {}) => {
    track(`conversion_${conversion}`, {
      value,
      ...properties,
    });
  }, [track]);

  // Track form interaction
  const trackForm = useCallback((formName: string, action: 'start' | 'complete' | 'abandon', properties: Record<string, any> = {}) => {
    track(`form_${action}`, {
      form: formName,
      ...properties,
    });
  }, [track]);

  // Track search
  const trackSearch = useCallback((query: string, results: number, properties: Record<string, any> = {}) => {
    track('search', {
      query,
      results,
      ...properties,
    });
  }, [track]);

  // Identify user
  const identify = useCallback((newUserId: string, traits: Record<string, any> = {}) => {
    setAnalyticsState(prev => ({ ...prev, userId: newUserId }));
    
    track('user_identified', {
      userId: newUserId,
      traits,
    });
  }, [track]);

  // Enable/disable tracking
  const setTracking = useCallback((enabled: boolean) => {
    setAnalyticsState(prev => ({ ...prev, isTracking: enabled }));
    
    if (enabled && !currentJourney.current) {
      startSession();
    } else if (!enabled && currentJourney.current) {
      endSession();
    }
  }, [startSession, endSession]);

  // Initialize session
  useEffect(() => {
    if (analyticsState.isTracking) {
      startSession();
    }

    return () => {
      if (currentJourney.current) {
        endSession();
      }
    };
  }, [analyticsState.isTracking, startSession, endSession]);

  // Set up auto-flush interval
  useEffect(() => {
    if (flushInterval > 0) {
      flushIntervalRef.current = setInterval(() => {
        flushEvents();
      }, flushInterval);

      return () => {
        if (flushIntervalRef.current) {
          clearInterval(flushIntervalRef.current);
        }
      };
    }
    return undefined;
  }, [flushInterval, flushEvents]);

  // Page tracking
  useEffect(() => {
    if (enablePageTracking && analyticsState.isTracking) {
      trackPageView(window.location.pathname);
    }
  }, [enablePageTracking, analyticsState.isTracking, trackPageView]);

  // Click tracking
  useEffect(() => {
    if (!enableClickTracking || !analyticsState.isTracking) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      const elementInfo = getElementInfo(target);
      track('click', {
        element: elementInfo.tagName,
        text: elementInfo.text,
        href: elementInfo.href,
        className: elementInfo.className,
        id: elementInfo.id,
        position: { x: event.clientX, y: event.clientY },
      });
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [enableClickTracking, analyticsState.isTracking, track]);

  // Error tracking
  useEffect(() => {
    if (!enableErrorTracking || !analyticsState.isTracking) return;

    const handleError = (event: ErrorEvent) => {
      track('error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      track('unhandled_promise_rejection', {
        reason: event.reason,
        stack: event.reason?.stack,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [enableErrorTracking, analyticsState.isTracking, track]);

  // Performance tracking
  useEffect(() => {
    if (!enablePerformanceTracking || !analyticsState.isTracking) return undefined;

    const trackPerformance = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');

        track('page_performance', {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
          transferSize: navigation.transferSize,
          encodedBodySize: navigation.encodedBodySize,
        });
      }
    };

    if (document.readyState === 'complete') {
      trackPerformance();
      return undefined;
    } else {
      window.addEventListener('load', trackPerformance);
      return () => window.removeEventListener('load', trackPerformance);
    }
  }, [enablePerformanceTracking, analyticsState.isTracking, track]);

  return {
    ...analyticsState,
    track,
    trackPageView,
    trackAction,
    trackConversion,
    trackForm,
    trackSearch,
    identify,
    flushEvents,
    getInsights: () => [],  // insights property doesn't exist on analyticsState
    setTracking,
    currentJourney: currentJourney.current,
  };
}

// Utility functions
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

function getElementInfo(element: HTMLElement) {
  return {
    tagName: element.tagName.toLowerCase(),
    text: element.textContent?.trim().substring(0, 100) || '',
    href: (element as HTMLAnchorElement).href || '',
    className: element.className,
    id: element.id,
  };
}

function isActionEvent(eventName: string): boolean {
  return eventName.startsWith('action_') || 
         ['click', 'form_start', 'form_complete', 'search'].includes(eventName);
}

function isConversionEvent(eventName: string): boolean {
  return eventName.startsWith('conversion_') ||
         ['user_identified', 'lead_created', 'purchase_completed'].includes(eventName);
}

// Utility functions for analytics calculations (not currently used)
// function calculateEngagementScore(journey: UserJourney, duration: number): number {
//   let score = 0;
//   
//   // Base score from session duration (0-40 points)
//   score += Math.min(40, duration / 1000 / 60); // 1 point per minute, max 40
//   
//   // Page views (0-20 points)
//   score += Math.min(20, journey.pages.length * 5);
//   
//   // Actions (0-30 points)
//   score += Math.min(30, journey.actions.length * 2);
//   
//   // Conversions (0-10 points per conversion)
//   score += journey.conversions.length * 10;
//   
//   return Math.min(100, score);
// }

// function predictConversion(journey: UserJourney): number {
//   let probability = 0.1; // Base 10%
//   
//   // More page views = higher probability
//   probability += journey.pages.length * 0.05;
//   
//   // Actions indicate engagement
//   probability += journey.actions.length * 0.03;
//   
//   // Time spent
//   const duration = Date.now() - journey.startTime;
//   if (duration > 60000) probability += 0.2; // Bonus for 1+ minute
//   if (duration > 300000) probability += 0.3; // Bonus for 5+ minutes
//   
//   // Existing conversions indicate high intent
//   probability += journey.conversions.length * 0.4;
//   
//   return Math.min(1, probability);
// }

// Hook for A/B testing
export function useABTest(testName: string, variants: string[]) {
  const { track } = useAnalytics();
  const [variant, setVariant] = useState<string>('');

  useEffect(() => {
    // Get user ID or session ID for consistent assignment
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('sessionId');
    const hash = simpleHash(userId + testName);
    const variantIndex = hash % variants.length;
    const selectedVariant = variants[variantIndex];
    
    setVariant(selectedVariant);
    
    // Track assignment
    track('ab_test_assigned', {
      testName,
      variant: selectedVariant,
      variants,
    });
  }, [testName, variants, track]);

  const trackConversion = useCallback((conversionName: string, value?: number) => {
    track('ab_test_conversion', {
      testName,
      variant,
      conversion: conversionName,
      value,
    });
  }, [testName, variant, track]);

  return { variant, trackConversion };
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export default useAnalytics;