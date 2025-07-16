import { useState, useEffect, useCallback, useRef } from 'react';

interface InfiniteScrollConfig {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

interface InfiniteScrollResult {
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  loadMore: () => void;
  reset: () => void;
  observerTarget: React.RefObject<HTMLDivElement>;
}

export function useInfiniteScroll<T>(
  fetchMore: (page: number) => Promise<{ data: T[]; hasMore: boolean }>,
  config: InfiniteScrollConfig = {}
): InfiniteScrollResult {
  const {
    threshold = 1.0,
    rootMargin = '100px',
    enabled = true,
  } = config;

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const observerTarget = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadMore = useCallback(async () => {
    if (!enabled || isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchMore(page);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more items');
    } finally {
      setIsLoading(false);
    }
  }, [fetchMore, page, isLoading, hasMore, enabled]);

  const reset = useCallback(() => {
    setPage(1);
    setHasMore(true);
    setIsLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (!enabled || !observerTarget.current) return;

    const target = observerTarget.current;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(target);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, hasMore, isLoading, loadMore, threshold, rootMargin]);

  return {
    hasMore,
    isLoading,
    error,
    loadMore,
    reset,
    observerTarget,
  };
}

export default useInfiniteScroll;