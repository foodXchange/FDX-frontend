import { useState, useEffect, useCallback } from 'react';
import { performanceConfig, performanceUtils } from '../config/performance.config';

import { useCallback, useEffect, useRef, useState } from "react";

interface UsePerformanceOptimizationOptions {
  enableVirtualization?: boolean;
  enableLazyLoading?: boolean;
  enablePrefetch?: boolean;
  measurePerformance?: boolean;
}

export const usePerformanceOptimization = (
  componentName: string, 
  options: UsePerformanceOptimizationOptions = {}
) => {
  const {
    enableVirtualization = true,
    enableLazyLoading = true,
    enablePrefetch = true,
    measurePerformance = process.env.NODE_ENV === 'development',
  } = options;

  const [isLowMemory, setIsLowMemory] = useState(false);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const renderTimeRef = useRef<() => number>();

  // Check device capabilities
  useEffect(() => {
    setIsLowMemory(performanceUtils.isLowMemoryDevice());
    setIsSlowConnection(performanceUtils.isSlowConnection());
    
    // Monitor memory usage
    const checkMemory = () => {
      setIsLowMemory(performanceUtils.isLowMemoryDevice());
    };
    
    const interval = setInterval(checkMemory, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Measure render performance
  useEffect(() => {
    if (measurePerformance) {
      renderTimeRef.current = performanceUtils.measureRender(componentName);
      
      return () => {
        if (renderTimeRef.current) {
          const duration = renderTimeRef.current();
          
          // Log to performance monitoring
          if ((window as any).gtag) {
            (window as any).gtag('event', 'component_render', {
              event_category: 'Performance',
              event_label: componentName,
              value: Math.round(duration)
            });
          }
        }
      };
    }
  }, [componentName, measurePerformance]);

  // Prefetch resources on hover
  const prefetchOnHover = useCallback((url: string) => {
    if (!enablePrefetch) return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }, [enablePrefetch]);

  // Lazy load component
  const shouldLazyLoad = enableLazyLoading && (isLowMemory || isSlowConnection);

  // Virtualization settings
  const virtualizationConfig = {
    enabled: enableVirtualization && !isLowMemory,
    itemHeight: isLowMemory ? 40 : 60,
    overscan: isLowMemory ? 2 : 5
  };

  return {
    isLowMemory,
    isSlowConnection,
    shouldLazyLoad,
    virtualizationConfig,
    prefetchOnHover,
    measurePerformance: measurePerformance && Boolean(renderTimeRef.current)
  };
};

export default usePerformanceOptimization;