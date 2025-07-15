import React from 'react';
import { Skeleton, Box, SxProps, Theme } from '@mui/material';

interface SkeletonLoaderProps {
  sx?: SxProps<Theme>;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  sx,
  variant = 'text',
  width,
  height,
  count = 1,
}) => {
  const defaultSizes = {
    text: { width: '100%', height: 16 },
    circular: { width: 48, height: 48 },
    rectangular: { width: '100%', height: 160 },
    card: { width: '100%', height: 320 },
  };

  const skeletonProps = {
    variant: variant === 'card' ? 'rectangular' as const : variant,
    width: width || defaultSizes[variant].width,
    height: height || defaultSizes[variant].height,
    sx: {
      borderRadius: variant === 'card' ? 3 : variant === 'rectangular' ? 2 : undefined,
      ...sx,
    },
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} {...skeletonProps} />
      ))}
    </>
  );
};

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => (
  <Box
    sx={{
      borderRadius: 3,
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      bgcolor: 'background.paper',
      boxShadow: 1,
    }}
  >
    <SkeletonLoader variant="rectangular" height={200} sx={{ mb: 2 }} />
    <SkeletonLoader variant="text" width="75%" />
    <SkeletonLoader variant="text" width="50%" />
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
      <SkeletonLoader variant="text" width={80} />
      <SkeletonLoader variant="circular" width={40} height={40} />
    </Box>
  </Box>
);

// RFQ List Item Skeleton
export const RFQListItemSkeleton: React.FC = () => (
  <Box
    sx={{
      borderRadius: 2,
      p: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      bgcolor: 'background.paper',
      boxShadow: 1,
    }}
  >
    <SkeletonLoader variant="circular" width={48} height={48} />
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <SkeletonLoader variant="text" width="33%" />
      <SkeletonLoader variant="text" width="50%" />
    </Box>
    <SkeletonLoader variant="rectangular" width={100} height={32} />
  </Box>
);

// Dashboard Card Skeleton
export const DashboardCardSkeleton: React.FC = () => (
  <Box
    sx={{
      borderRadius: 3,
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      bgcolor: 'background.paper',
      boxShadow: 1,
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <SkeletonLoader variant="circular" width={48} height={48} />
      <SkeletonLoader variant="text" width={60} />
    </Box>
    <SkeletonLoader variant="text" width="50%" />
    <SkeletonLoader variant="text" width={120} height={32} />
  </Box>
);

// Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
    {/* Header */}
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 2,
        p: 2,
        bgcolor: 'grey.50',
        borderRadius: '8px 8px 0 0',
      }}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonLoader key={i} variant="text" />
      ))}
    </Box>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <Box
        key={rowIndex}
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 2,
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <SkeletonLoader key={colIndex} variant="text" />
        ))}
      </Box>
    ))}
  </Box>
);