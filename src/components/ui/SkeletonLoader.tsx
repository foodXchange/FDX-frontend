import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className,
  variant = 'text',
  width,
  height,
  count = 1,
}) => {
  const baseClasses = 'skeleton animate-pulse bg-gray-200';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl',
  };

  const defaultSizes = {
    text: { width: '100%', height: '1rem' },
    circular: { width: '3rem', height: '3rem' },
    rectangular: { width: '100%', height: '10rem' },
    card: { width: '100%', height: '20rem' },
  };

  const style = {
    width: width || defaultSizes[variant].width,
    height: height || defaultSizes[variant].height,
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(baseClasses, variantClasses[variant], className)}
          style={style}
        />
      ))}
    </>
  );
};

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => (
  <div className="glass-morphism rounded-xl p-6 space-y-4">
    <SkeletonLoader variant="rectangular" height="200px" className="mb-4" />
    <SkeletonLoader variant="text" className="w-3/4" />
    <SkeletonLoader variant="text" className="w-1/2" />
    <div className="flex justify-between items-center mt-4">
      <SkeletonLoader variant="text" width="80px" />
      <SkeletonLoader variant="circular" width="40px" height="40px" />
    </div>
  </div>
);

// RFQ List Item Skeleton
export const RFQListItemSkeleton: React.FC = () => (
  <div className="glass-morphism rounded-lg p-4 flex items-center space-x-4">
    <SkeletonLoader variant="circular" width="48px" height="48px" />
    <div className="flex-1 space-y-2">
      <SkeletonLoader variant="text" className="w-1/3" />
      <SkeletonLoader variant="text" className="w-1/2" />
    </div>
    <SkeletonLoader variant="rectangular" width="100px" height="32px" />
  </div>
);

// Dashboard Card Skeleton
export const DashboardCardSkeleton: React.FC = () => (
  <div className="glass-morphism rounded-xl p-6 space-y-4">
    <div className="flex justify-between items-start">
      <SkeletonLoader variant="circular" width="48px" height="48px" />
      <SkeletonLoader variant="text" width="60px" />
    </div>
    <SkeletonLoader variant="text" className="w-1/2" />
    <SkeletonLoader variant="text" width="120px" height="32px" />
  </div>
);

// Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => (
  <div className="space-y-2">
    {/* Header */}
    <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-t-lg">
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonLoader key={i} variant="text" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid grid-cols-4 gap-4 p-4 border-b">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <SkeletonLoader key={colIndex} variant="text" />
        ))}
      </div>
    ))}
  </div>
);