import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import { FixedSizeList as VirtualList, VariableSizeList as VariableVirtualList } from 'react-window';
import { motion, AnimatePresence } from 'framer-motion';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';

// Types
interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number | ((index: number) => number);
  height?: number;
  width?: number;
  hasNextPage?: boolean;
  isNextPageLoading?: boolean;
  loadNextPage?: () => Promise<void>;
  threshold?: number;
  overscan?: number;
  className?: string;
  emptyComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  onScroll?: (scrollTop: number) => void;
  enableInfiniteScroll?: boolean;
  enableVirtualization?: boolean;
  estimatedItemSize?: number;
  maintainScrollPosition?: boolean;
  itemKey?: (index: number, item: T) => string | number;
  direction?: 'vertical' | 'horizontal';
}

// Virtual list item wrapper
const VirtualListItem = React.memo<{
  index: number;
  style: React.CSSProperties;
  data: {
    items: any[];
    renderItem: (item: any, index: number) => React.ReactNode;
    itemKey?: (index: number, item: any) => string | number;
  };
}>(({ index, style, data }) => {
  const { items, renderItem, itemKey } = data;
  const item = items[index];
  const key = itemKey ? itemKey(index, item) : index;

  return (
    <motion.div
      style={style}
      key={key}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      {renderItem(item, index)}
    </motion.div>
  );
});

VirtualListItem.displayName = 'VirtualListItem';

// Infinite loading item
const InfiniteLoadingItem = React.memo<{
  index: number;
  style: React.CSSProperties;
  data: {
    items: any[];
    renderItem: (item: any, index: number) => React.ReactNode;
    hasNextPage: boolean;
    isNextPageLoading: boolean;
    loadingComponent?: React.ReactNode;
  };
}>(({ index, style, data }) => {
  const { items, renderItem, hasNextPage, isNextPageLoading, loadingComponent } = data;
  const theme = useTheme();

  let content;
  if (index < items.length) {
    content = renderItem(items[index], index);
  } else if (hasNextPage && isNextPageLoading) {
    content = loadingComponent || (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        py={2}
        sx={{
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          borderRadius: 1,
        }}
      >
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 1 }}>
          Loading more items...
        </Typography>
      </Box>
    );
  } else if (hasNextPage) {
    content = (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        py={2}
        sx={{
          background: alpha(theme.palette.background.paper, 0.5),
          borderRadius: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Scroll to load more
        </Typography>
      </Box>
    );
  } else {
    content = null;
  }

  return (
    <motion.div
      style={style}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {content}
    </motion.div>
  );
});

InfiniteLoadingItem.displayName = 'InfiniteLoadingItem';

// Main virtualized list component
export const VirtualizedList = <T,>({
  items,
  renderItem,
  itemHeight = 60,
  height = 400,
  width = '100%',
  hasNextPage = false,
  isNextPageLoading = false,
  loadNextPage,
  threshold = 15,
  overscan = 5,
  className,
  emptyComponent,
  loadingComponent,
  errorComponent,
  onScroll,
  enableInfiniteScroll = false,
  enableVirtualization = true,
  estimatedItemSize = 60,
  maintainScrollPosition = false,
  itemKey,
  direction = 'vertical',
}: VirtualizedListProps<T>) => {
  const theme = useTheme();
  const listRef = useRef<VirtualList | VariableVirtualList | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousItemCount = useRef(items.length);
  const scrollPositionRef = useRef(0);

  // Calculate item count for infinite scroll
  const itemCount = useMemo(() => {
    if (enableInfiniteScroll && hasNextPage) {
      return items.length + 1;
    }
    return items.length;
  }, [items.length, hasNextPage, enableInfiniteScroll]);

  // Check if item is loaded
  const isItemLoaded = useCallback((index: number) => {
    return !enableInfiniteScroll || index < items.length;
  }, [items.length, enableInfiniteScroll]);

  // Load more items
  const loadMoreItems = useCallback(async () => {
    if (isLoading || !loadNextPage || !hasNextPage) return;

    setIsLoading(true);
    setError(null);

    try {
      await loadNextPage();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more items');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, loadNextPage, hasNextPage]);

  // Handle scroll events
  const handleScroll = useCallback(({ scrollTop: newScrollTop }: { scrollTop: number }) => {
    setScrollTop(newScrollTop);
    scrollPositionRef.current = newScrollTop;
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Maintain scroll position when items are added
  useEffect(() => {
    if (maintainScrollPosition && listRef.current && items.length > previousItemCount.current) {
      const itemsAdded = items.length - previousItemCount.current;
      const heightOfAddedItems = typeof itemHeight === 'number' 
        ? itemHeight * itemsAdded 
        : estimatedItemSize * itemsAdded;
      
      const newScrollTop = scrollPositionRef.current + heightOfAddedItems;
      listRef.current.scrollTo(newScrollTop);
    }
    previousItemCount.current = items.length;
  }, [items.length, itemHeight, estimatedItemSize, maintainScrollPosition]);

  // Get item height for variable size lists
  const getItemHeight = useCallback((index: number) => {
    if (typeof itemHeight === 'function') {
      return itemHeight(index);
    }
    return itemHeight;
  }, [itemHeight]);

  // Render empty state
  if (items.length === 0 && !isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={height}
        width={width}
        sx={{
          background: alpha(theme.palette.background.paper, 0.5),
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        {emptyComponent || (
          <Typography variant="body2" color="text.secondary">
            No items to display
          </Typography>
        )}
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={height}
        width={width}
        sx={{
          background: alpha(theme.palette.error.main, 0.1),
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
        }}
      >
        {errorComponent || (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}
      </Box>
    );
  }

  // Prepare data for list items
  const itemData = useMemo(() => ({
    items,
    renderItem,
    itemKey,
    hasNextPage,
    isNextPageLoading,
    loadingComponent,
  }), [items, renderItem, itemKey, hasNextPage, isNextPageLoading, loadingComponent]);

  // Render non-virtualized list for small datasets
  if (!enableVirtualization || items.length < 100) {
    return (
      <Box
        sx={{
          height,
          width,
          overflow: 'auto',
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(20px)',
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
        className={className}
      >
        <List>
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={itemKey ? itemKey(index, item) : index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                {renderItem(item, index)}
              </motion.div>
            ))}
          </AnimatePresence>
          {enableInfiniteScroll && hasNextPage && (
            <ListItem>
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="center" py={2}>
                    {isLoading ? (
                      <>
                        <CircularProgress size={24} />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          Loading more items...
                        </Typography>
                      </>
                    ) : (
                      <Typography
                        variant="body2"
                        color="primary"
                        sx={{ cursor: 'pointer' }}
                        onClick={loadMoreItems}
                      >
                        Load more
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          )}
        </List>
      </Box>
    );
  }

  // Render virtualized list with infinite scroll
  if (enableInfiniteScroll) {
    return (
      <Box
        sx={{
          height,
          width,
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(20px)',
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
        className={className}
      >
        <AutoSizer>
          {({ height: autoHeight, width: autoWidth }) => (
            <InfiniteLoader
              isItemLoaded={isItemLoaded}
              itemCount={itemCount}
              loadMoreItems={loadMoreItems}
              threshold={threshold}
            >
              {({ onItemsRendered, ref }) => (
                typeof itemHeight === 'function' ? (
                  <VariableVirtualList
                    ref={(list) => {
                      listRef.current = list;
                      ref(list);
                    }}
                    height={autoHeight}
                    width={autoWidth}
                    itemCount={itemCount}
                    itemSize={getItemHeight}
                    itemData={itemData}
                    onItemsRendered={onItemsRendered}
                    onScroll={handleScroll}
                    overscanCount={overscan}
                    direction={direction}
                  >
                    {InfiniteLoadingItem}
                  </VariableVirtualList>
                ) : (
                  <VirtualList
                    ref={(list) => {
                      listRef.current = list;
                      ref(list);
                    }}
                    height={autoHeight}
                    width={autoWidth}
                    itemCount={itemCount}
                    itemSize={itemHeight as number}
                    itemData={itemData}
                    onItemsRendered={onItemsRendered}
                    onScroll={handleScroll}
                    overscanCount={overscan}
                    direction={direction}
                  >
                    {InfiniteLoadingItem}
                  </VirtualList>
                )
              )}
            </InfiniteLoader>
          )}
        </AutoSizer>
      </Box>
    );
  }

  // Render standard virtualized list
  return (
    <Box
      sx={{
        height,
        width,
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(20px)',
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
      className={className}
    >
      <AutoSizer>
        {({ height: autoHeight, width: autoWidth }) => (
          typeof itemHeight === 'function' ? (
            <VariableVirtualList
              ref={listRef}
              height={autoHeight}
              width={autoWidth}
              itemCount={itemCount}
              itemSize={getItemHeight}
              itemData={itemData}
              onScroll={handleScroll}
              overscanCount={overscan}
              direction={direction}
            >
              {VirtualListItem}
            </VariableVirtualList>
          ) : (
            <VirtualList
              ref={listRef}
              height={autoHeight}
              width={autoWidth}
              itemCount={itemCount}
              itemSize={itemHeight as number}
              itemData={itemData}
              onScroll={handleScroll}
              overscanCount={overscan}
              direction={direction}
            >
              {VirtualListItem}
            </VirtualList>
          )
        )}
      </AutoSizer>
    </Box>
  );
};

// Memoized list item wrapper for performance
export const MemoizedListItem = React.memo<{
  children: React.ReactNode;
  keyProp?: string | number;
}>(({ children, keyProp }) => {
  return <Box key={keyProp}>{children}</Box>;
});

MemoizedListItem.displayName = 'MemoizedListItem';

// Hook for managing virtual list state
export const useVirtualList = <T,>(
  initialItems: T[],
  pageSize: number = 50
) => {
  const [items, setItems] = useState<T[]>(initialItems);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef(1);

  const loadNextPage = useCallback(async () => {
    if (isLoading || !hasNextPage) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data generation
      const newItems = Array.from({ length: pageSize }, (_, i) => ({
        id: `item-${pageRef.current}-${i}`,
        title: `Item ${pageRef.current * pageSize + i + 1}`,
        description: `Description for item ${pageRef.current * pageSize + i + 1}`,
      })) as T[];

      setItems(prev => [...prev, ...newItems]);
      pageRef.current += 1;

      // Stop loading after 5 pages for demo
      if (pageRef.current > 5) {
        setHasNextPage(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasNextPage, pageSize]);

  const reset = useCallback(() => {
    setItems(initialItems);
    setHasNextPage(true);
    setIsLoading(false);
    setError(null);
    pageRef.current = 1;
  }, [initialItems]);

  return {
    items,
    hasNextPage,
    isLoading,
    error,
    loadNextPage,
    reset,
  };
};

export default VirtualizedList;