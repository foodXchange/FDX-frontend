import React, { useState, useCallback } from 'react';
import {
  Box,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  IconButton,
  Skeleton,
} from '@mui/material';
import { FixedSizeList as VirtualList } from 'react-window';
import { Refresh, Search } from '@mui/icons-material';
import { useVirtualization } from '../../hooks/useVirtualization';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useOptimizedSearch } from '../../hooks/useOptimizedSearch';

interface VirtualizedListItem {
  id: string;
  title: string;
  subtitle?: string;
  avatar?: string;
  status?: string;
  metadata?: Record<string, any>;
}

interface VirtualizedListProps {
  items: VirtualizedListItem[];
  height?: number;
  itemHeight?: number;
  searchFields?: string[];
  enableSearch?: boolean;
  enableInfiniteScroll?: boolean;
  onItemClick?: (item: VirtualizedListItem) => void;
  onRefresh?: () => void;
  fetchMore?: (page: number) => Promise<{ data: VirtualizedListItem[]; hasMore: boolean }>;
  renderCustomItem?: (item: VirtualizedListItem, index: number) => React.ReactNode;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  className?: string;
}

const VirtualizedList: React.FC<VirtualizedListProps> = ({
  items,
  height = 400,
  itemHeight = 72,
  searchFields = ['title', 'subtitle'],
  enableSearch = true,
  enableInfiniteScroll = false,
  onItemClick,
  onRefresh,
  fetchMore,
  renderCustomItem,
  loading = false,
  error = null,
  emptyMessage = 'No items found',
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Search functionality
  const [searchResult, search, clearSearch] = useOptimizedSearch(items, {
    searchFields,
    debounceMs: 300,
    minLength: 1,
    fuzzyMatch: true,
  });

  // Infinite scroll
  const infiniteScroll = useInfiniteScroll(
    fetchMore || (() => Promise.resolve({ data: [], hasMore: false })),
    {
      enabled: enableInfiniteScroll && !!fetchMore,
    }
  );

  // Use search results or original items
  const displayItems = searchResult.query ? searchResult.results : items;

  // Virtualization for large lists
  const virtualization = useVirtualization(displayItems, {
    itemHeight,
    containerHeight: height,
    overscan: 5,
  });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    search(query);
  }, [search]);

  const handleRefresh = useCallback(() => {
    clearSearch();
    setSearchQuery('');
    infiniteScroll.reset();
    onRefresh?.();
  }, [clearSearch, infiniteScroll, onRefresh]);

  // Render individual list item
  const renderItem = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const visibleItem = virtualization.visibleItems[index];
    
    if (!visibleItem) {
      return (
        <div style={style}>
          <Skeleton variant="rectangular" width="100%" height={itemHeight - 8} />
        </div>
      );
    }

    const item = visibleItem.item;

    if (renderCustomItem) {
      return (
        <div style={style}>
          {renderCustomItem(item, index)}
        </div>
      );
    }

    return (
      <div style={style}>
        <ListItem
          onClick={() => onItemClick?.(item)}
          sx={{
            cursor: onItemClick ? 'pointer' : 'default',
            '&:hover': onItemClick ? {
              backgroundColor: 'action.hover',
            } : {},
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {item.avatar && (
            <Avatar
              src={item.avatar}
              sx={{ mr: 2 }}
            >
              {item.title.charAt(0).toUpperCase()}
            </Avatar>
          )}
          
          <ListItemText
            primary={
              <Typography variant="subtitle1" noWrap>
                {item.title}
              </Typography>
            }
            secondary={
              <Box>
                {item.subtitle && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {item.subtitle}
                  </Typography>
                )}
                {item.status && (
                  <Chip
                    label={item.status}
                    size="small"
                    variant="outlined"
                    sx={{ mt: 0.5 }}
                  />
                )}
              </Box>
            }
          />
        </ListItem>
      </div>
    );
  }, [virtualization.visibleItems, itemHeight, renderCustomItem, onItemClick]);

  const renderContent = () => {
    if (loading && items.length === 0) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height={height}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert 
          severity="error" 
          action={
            <IconButton size="small" onClick={handleRefresh}>
              <Refresh />
            </IconButton>
          }
        >
          {error}
        </Alert>
      );
    }

    if (displayItems.length === 0) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          height={height}
          gap={2}
        >
          <Typography variant="h6" color="text.secondary">
            {emptyMessage}
          </Typography>
          {onRefresh && (
            <IconButton onClick={handleRefresh}>
              <Refresh />
            </IconButton>
          )}
        </Box>
      );
    }

    return (
      <Box position="relative">
        <VirtualList
          height={height}
          width="100%"
          itemCount={virtualization.visibleItems.length}
          itemSize={itemHeight}
          overscanCount={5}
        >
          {renderItem}
        </VirtualList>
        
        {/* Infinite scroll trigger */}
        {enableInfiniteScroll && (
          <div ref={infiniteScroll.observerTarget} style={{ height: 1 }} />
        )}
        
        {/* Loading indicator for infinite scroll */}
        {infiniteScroll.isLoading && (
          <Box
            display="flex"
            justifyContent="center"
            py={2}
          >
            <CircularProgress size={24} />
          </Box>
        )}
        
        {infiniteScroll.error && (
          <Alert severity="error" sx={{ m: 1 }}>
            {infiniteScroll.error}
          </Alert>
        )}
      </Box>
    );
  };

  return (
    <Box className={className}>
      {/* Search Header */}
      {enableSearch && (
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box sx={{ position: 'relative', flexGrow: 1 }}>
            <Search
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'text.secondary',
                fontSize: 20,
              }}
            />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 8px 8px 36px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </Box>
          
          {searchResult.isSearching && <CircularProgress size={20} />}
          
          {onRefresh && (
            <IconButton onClick={handleRefresh} size="small">
              <Refresh />
            </IconButton>
          )}
        </Box>
      )}

      {/* Search Results Info */}
      {searchResult.query && (
        <Box sx={{ px: 2, py: 1, backgroundColor: 'grey.50' }}>
          <Typography variant="caption" color="text.secondary">
            {searchResult.totalResults} results for "{searchResult.query}"
          </Typography>
        </Box>
      )}

      {/* List Content */}
      {renderContent()}
    </Box>
  );
};

export default VirtualizedList;