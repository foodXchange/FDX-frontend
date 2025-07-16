import { useState, useEffect, useMemo, useCallback } from 'react';

interface VirtualizationConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  threshold?: number;
}

interface VirtualizationResult<T> {
  visibleItems: Array<{ index: number; item: T; style: React.CSSProperties }>;
  totalHeight: number;
  scrollElementProps: {
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
    style: React.CSSProperties;
  };
  containerProps: {
    style: React.CSSProperties;
  };
}

export function useVirtualization<T>(
  items: T[],
  config: VirtualizationConfig
): VirtualizationResult<T> {
  const { itemHeight, containerHeight, overscan = 5, threshold = 100 } = config;
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  }, []);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = start + visibleCount;

    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.length, end + overscan),
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    if (items.length < threshold) {
      // Don't virtualize for small lists
      return items.map((item, index) => ({
        index,
        item,
        style: {
          height: itemHeight,
          position: 'relative' as const,
        },
      }));
    }

    const result = [];
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      result.push({
        index: i,
        item: items[i],
        style: {
          position: 'absolute' as const,
          top: i * itemHeight,
          height: itemHeight,
          width: '100%',
        },
      });
    }
    return result;
  }, [items, visibleRange, itemHeight, threshold]);

  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    totalHeight,
    scrollElementProps: {
      onScroll: handleScroll,
      style: {
        height: containerHeight,
        overflow: 'auto',
      },
    },
    containerProps: {
      style: {
        height: items.length < threshold ? 'auto' : totalHeight,
        position: items.length < threshold ? 'static' : 'relative',
      },
    },
  };
}

export default useVirtualization;