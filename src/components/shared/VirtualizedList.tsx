import React, { useCallback, useRef, useState, useEffect, memo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  loadMore?: () => Promise<void>;
  hasMore?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  overscan?: number;
  threshold?: number;
  onScroll?: (scrollTop: number) => void;
  className?: string;
  estimatedTotalHeight?: number;
}

const VirtualizedListComponent = <T extends any>({
  items,
  renderItem,
  itemHeight = 80,
  loadMore,
  hasMore = false,
  loading = false,
  emptyMessage = 'No items to display',
  overscan = 5,
  threshold = 15,
  onScroll,
  className,
  estimatedTotalHeight,
}: VirtualizedListProps<T>) => {
  const listRef = useRef<List>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Calculate total item count including loading indicator
  const itemCount = hasMore ? items.length + 1 : items.length;

  // Check if more items need to be loaded
  const isItemLoaded = useCallback(
    (index: number) => !hasMore || index < items.length,
    [hasMore, items.length]
  );

  // Load more items
  const loadMoreItems = useCallback(async () => {
    if (isLoadingMore || !loadMore) return;
    
    setIsLoadingMore(true);
    try {
      await loadMore();
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, loadMore]);

  // Row renderer with memoization
  const Row = memo(({ index, style }: ListChildComponentProps) => {
    if (!isItemLoaded(index)) {
      return (
        <Box
          sx={{
            ...style,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      );
    }

    const item = items[index];
    return (
      <Box sx={style}>
        {renderItem(item, index)}
      </Box>
    );
  });

  // Handle scroll events
  const handleScroll = useCallback(
    ({ scrollOffset }: { scrollOffset: number }) => {
      onScroll?.(scrollOffset);
    },
    [onScroll]
  );

  // Scroll to top method
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(0);
    }
  }, [items.length === 0]);

  // Empty state
  if (!loading && items.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 200,
          color: 'text.secondary',
        }}
      >
        <Typography variant="body1">{emptyMessage}</Typography>
      </Box>
    );
  }

  // Loading state
  if (loading && items.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 200,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      className={className}
      sx={{
        height: '100%',
        width: '100%',
        position: 'relative',
      }}
    >
      <AutoSizer>
        {({ height, width }) => (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={itemCount}
            loadMoreItems={loadMoreItems}
            threshold={threshold}
          >
            {({ onItemsRendered, ref }) => (
              <List
                ref={(list) => {
                  ref(list);
                  listRef.current = list;
                }}
                height={height}
                width={width}
                itemCount={itemCount}
                itemSize={itemHeight}
                overscanCount={overscan}
                onItemsRendered={onItemsRendered}
                onScroll={handleScroll}
                estimatedItemSize={itemHeight}
              >
                {Row}
              </List>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </Box>
  );
};

// Export memoized component for performance
export const VirtualizedList = memo(VirtualizedListComponent) as typeof VirtualizedListComponent;

// Export utility hook for scroll restoration
export const useScrollRestoration = (key: string) => {
  const [scrollTop, setScrollTop] = useState(() => {
    const saved = sessionStorage.getItem(`scroll-${key}`);
    return saved ? parseInt(saved, 10) : 0;
  });

  const saveScrollPosition = useCallback(
    (position: number) => {
      setScrollTop(position);
      sessionStorage.setItem(`scroll-${key}`, position.toString());
    },
    [key]
  );

  return { scrollTop, saveScrollPosition };
};