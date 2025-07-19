import React, { 
  memo, 
  useCallback, 
  useMemo, 
  useRef, 
  useEffect,
  useState,
  ComponentType 
} from 'react';

// HOC for pure component optimization
export function withMemoization<P extends object>(
  Component: ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) {
  return memo(Component, areEqual);
}

// Deep comparison memo
export function withDeepMemo<P extends object>(Component: ComponentType<P>) {
  return memo(Component, (prevProps, nextProps) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  });
}

// Selective prop memoization
export function withSelectiveMemo<P extends object>(
  Component: ComponentType<P>,
  watchProps: (keyof P)[]
) {
  return memo(Component, (prevProps, nextProps) => {
    return watchProps.every(prop => prevProps[prop] === nextProps[prop]);
  });
}

// Render prevention hook
export function useRenderPrevention(dependencies: React.DependencyList) {
  const prevDeps = useRef(dependencies);
  const shouldRender = useMemo(() => {
    const hasChanged = dependencies.some((dep, index) => dep !== prevDeps.current[index]);
    prevDeps.current = dependencies;
    return hasChanged;
  }, dependencies);

  return shouldRender;
}

// Batch state updates
export function useBatchedState<T>(initialState: T) {
  const [state, setState] = useState(initialState);
  const batchedUpdates = useRef<Partial<T>[]>([]);
  const batchTimeout = useRef<NodeJS.Timeout | null>(null);

  const batchSetState = useCallback((update: Partial<T>) => {
    batchedUpdates.current.push(update);
    
    if (batchTimeout.current) {
      clearTimeout(batchTimeout.current);
    }

    batchTimeout.current = setTimeout(() => {
      setState(prevState => {
        const newState = { ...prevState };
        batchedUpdates.current.forEach(update => {
          Object.assign(newState, update);
        });
        batchedUpdates.current = [];
        return newState;
      });
    }, 0);
  }, []);

  return [state, batchSetState] as const;
}

// Optimized list rendering
interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  windowSize?: number;
  threshold?: number;
}

export function OptimizedList<T>({
  items,
  renderItem,
  keyExtractor,
  windowSize = 10,
  threshold = 5
}: OptimizedListProps<T>) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: windowSize });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useThrottledCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, clientHeight } = containerRef.current;
    const itemHeight = clientHeight / windowSize;
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - threshold);
    const end = Math.min(items.length, start + windowSize + threshold * 2);

    setVisibleRange({ start, end });
  }, 100);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height: '100%', overflow: 'auto' }}
    >
      <div style={{ height: visibleRange.start * (100 / windowSize) + '%' }} />
      {visibleItems.map((item, index) => (
        <div key={keyExtractor(item, visibleRange.start + index)}>
          {renderItem(item, visibleRange.start + index)}
        </div>
      ))}
      <div style={{ height: (items.length - visibleRange.end) * (100 / windowSize) + '%' }} />
    </div>
  );
}

// Conditional rendering optimization
export function useConditionalRender<T>(
  condition: boolean,
  component: () => T,
  fallback?: () => T
): T | null {
  return useMemo(() => {
    if (condition) {
      return component();
    }
    return fallback ? fallback() : null;
  }, [condition]);
}

// Frame-based rendering for heavy components
export function useFrameBasedRendering(
  renderFunction: () => React.ReactNode,
  dependencies: React.DependencyList
) {
  const [content, setContent] = useState<React.ReactNode>(null);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    setIsRendering(true);
    
    const renderFrame = () => {
      try {
        const result = renderFunction();
        setContent(result);
      } catch (error) {
        console.error('Frame-based rendering error:', error);
      } finally {
        setIsRendering(false);
      }
    };

    requestAnimationFrame(renderFrame);
  }, dependencies);

  return { content, isRendering };
}

// Memoized event handlers
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

// Stable reference hook
export function useStableReference<T>(value: T): T {
  const ref = useRef(value);
  
  if (JSON.stringify(ref.current) !== JSON.stringify(value)) {
    ref.current = value;
  }
  
  return ref.current;
}

// Component profiling hook
export function useComponentProfiler(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(0);

  useEffect(() => {
    renderCount.current++;
    const now = performance.now();
    
    if (lastRenderTime.current > 0) {
      const timeSinceLastRender = now - lastRenderTime.current;
      console.log(`${componentName} - Render #${renderCount.current}, Time since last: ${timeSinceLastRender.toFixed(2)}ms`);
    }
    
    lastRenderTime.current = now;
  });

  return {
    renderCount: renderCount.current,
    resetProfiler: () => {
      renderCount.current = 0;
      lastRenderTime.current = 0;
    }
  };
}