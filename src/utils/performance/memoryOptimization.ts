import { useEffect, useRef, useCallback, useMemo } from 'react';

// Memory-efficient state management
export function useMemoryEfficientState<T>(
  initialValue: T,
  maxHistorySize: number = 10
) {
  const stateHistory = useRef<T[]>([initialValue]);
  const currentIndex = useRef(0);

  const setState = useCallback((newValue: T | ((prev: T) => T)) => {
    const value = typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(stateHistory.current[currentIndex.current])
      : newValue;

    // Add to history and trim if necessary
    stateHistory.current = [
      ...stateHistory.current.slice(0, currentIndex.current + 1),
      value
    ].slice(-maxHistorySize);
    
    currentIndex.current = stateHistory.current.length - 1;
  }, [maxHistorySize]);

  const getCurrentState = useCallback(() => {
    return stateHistory.current[currentIndex.current];
  }, []);

  const undo = useCallback(() => {
    if (currentIndex.current > 0) {
      currentIndex.current--;
    }
  }, []);

  const redo = useCallback(() => {
    if (currentIndex.current < stateHistory.current.length - 1) {
      currentIndex.current++;
    }
  }, []);

  return {
    state: getCurrentState(),
    setState,
    undo,
    redo,
    canUndo: currentIndex.current > 0,
    canRedo: currentIndex.current < stateHistory.current.length - 1,
  };
}

// Virtualized list for large datasets
export function useVirtualizedList<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number
) {
  const scrollTop = useRef(0);
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop.current / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    return { startIndex, endIndex };
  }, [items.length, containerHeight, itemHeight, scrollTop.current]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex).map((item, index) => ({
      item,
      index: visibleRange.startIndex + index,
      top: (visibleRange.startIndex + index) * itemHeight,
    }));
  }, [items, visibleRange, itemHeight]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    scrollTop.current = event.currentTarget.scrollTop;
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    visibleRange,
  };
}

// Memory-efficient data fetching with cleanup
export function useMemoryEfficientFetch<T>(
  fetchFunction: () => Promise<T>,
  dependencies: React.DependencyList,
  options: {
    maxCacheSize?: number;
    ttl?: number; // Time to live in milliseconds
  } = {}
) {
  const cache = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  const abortController = useRef<AbortController | null>(null);
  const { maxCacheSize = 10, ttl = 5 * 60 * 1000 } = options; // 5 minutes default TTL

  const cacheKey = useMemo(() => JSON.stringify(dependencies), dependencies);

  useEffect(() => {
    // Cleanup function
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  const fetch = useCallback(async (): Promise<T> => {
    // Check cache first
    const cached = cache.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    // Abort previous request
    if (abortController.current) {
      abortController.current.abort();
    }

    abortController.current = new AbortController();

    try {
      const data = await fetchFunction();
      
      // Update cache
      cache.current.set(cacheKey, { data, timestamp: Date.now() });
      
      // Cleanup old cache entries
      if (cache.current.size > maxCacheSize) {
        const entries = Array.from(cache.current.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        // Remove oldest entries
        const toRemove = entries.slice(0, entries.length - maxCacheSize);
        toRemove.forEach(([key]) => cache.current.delete(key));
      }

      return data;
    } catch (error) {
      if (error.name !== 'AbortError') {
        throw error;
      }
      throw new Error('Request aborted');
    }
  }, [cacheKey, fetchFunction, maxCacheSize, ttl]);

  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  const getCacheSize = useCallback(() => {
    return cache.current.size;
  }, []);

  return { fetch, clearCache, getCacheSize };
}

// Resource cleanup hook
export function useResourceCleanup() {
  const resources = useRef<Array<() => void>>([]);

  const addCleanup = useCallback((cleanup: () => void) => {
    resources.current.push(cleanup);
  }, []);

  const cleanup = useCallback(() => {
    resources.current.forEach((fn) => {
      try {
        fn();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    });
    resources.current = [];
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { addCleanup, cleanup };
}

// Debounced value hook for performance
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttled callback hook
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef<number>(0);
  const lastCallTimer = useRef<NodeJS.Timeout | null>(null);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      return callback(...args);
    } else {
      if (lastCallTimer.current) {
        clearTimeout(lastCallTimer.current);
      }
      
      lastCallTimer.current = setTimeout(() => {
        lastCall.current = Date.now();
        callback(...args);
      }, delay - (now - lastCall.current));
    }
  }, [callback, delay]) as T;
}