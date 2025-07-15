import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logger } from '@/services/logger';
import { performanceMonitor } from '@/services/monitoring';
import { errorReporter } from '@/utils/errorReporting';
import { useAuth } from '@/contexts/AuthContext';

export const MonitoringProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  // Track page views
  useEffect(() => {
    logger.trackPageView(location.pathname, {
      search: location.search,
      hash: location.hash,
    });

    // Measure route change performance
    performanceMonitor.startMeasure('route-change');
    return () => {
      performanceMonitor.endMeasure('route-change');
    };
  }, [location]);

  // Set user context for error reporting
  useEffect(() => {
    if (user) {
      errorReporter.setUser(user.id, {
        email: user.email,
        role: user.role,
        company: user.company,
      });
    } else {
      errorReporter.clearUser();
    }
  }, [user]);

  // Track user activity
  useEffect(() => {
    let activityTimer: NodeJS.Timeout;
    let isActive = true;

    const trackActivity = () => {
      if (!isActive) {
        isActive = true;
        logger.trackEvent('user_active');
      }

      clearTimeout(activityTimer);
      activityTimer = setTimeout(() => {
        isActive = false;
        logger.trackEvent('user_idle');
      }, 5 * 60 * 1000); // 5 minutes
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, trackActivity);
    });

    return () => {
      clearTimeout(activityTimer);
      events.forEach(event => {
        window.removeEventListener(event, trackActivity);
      });
    };
  }, []);

  // Monitor memory usage (in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        const usedHeapSize = memory.usedJSHeapSize / 1048576; // Convert to MB
        const totalHeapSize = memory.totalJSHeapSize / 1048576;
        
        if (usedHeapSize > totalHeapSize * 0.9) {
          logger.warn('High memory usage detected', {
            used: `${usedHeapSize.toFixed(2)} MB`,
            total: `${totalHeapSize.toFixed(2)} MB`,
            percentage: `${((usedHeapSize / totalHeapSize) * 100).toFixed(2)}%`,
          });
        }
      };

      const memoryInterval = setInterval(checkMemory, 30000); // Check every 30 seconds
      return () => clearInterval(memoryInterval);
    }
    return undefined;
  }, []);

  return <>{children}</>;
};