import React, { useState, useEffect, useRef, memo } from 'react';
import { Box, Skeleton, SxProps, Theme } from '@mui/material';
import { BrokenImage } from '@mui/icons-material';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  aspectRatio?: string;
  placeholder?: string;
  errorFallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  sx?: SxProps<Theme>;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  quality?: number;
  blur?: boolean;
  className?: string;
}

const LazyImageComponent: React.FC<LazyImageProps> = ({
  src,
  alt,
  width = '100%',
  height = 'auto',
  aspectRatio,
  placeholder,
  errorFallback,
  onLoad,
  onError,
  sx,
  loading = 'lazy',
  priority = false,
  quality = 75,
  blur = true,
  className,
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !containerRef.current) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  // Preload image
  useEffect(() => {
    if (!isInView || !src) return;

    const img = new Image();
    
    img.onload = () => {
      setImageState('loaded');
      onLoad?.();
    };
    
    img.onerror = () => {
      setImageState('error');
      onError?.();
    };
    
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isInView, src, onLoad, onError]);

  // Generate optimized image URL if using a CDN
  const getOptimizedSrc = () => {
    if (!src) return '';
    
    // Example optimization for common CDNs
    if (src.includes('cloudinary.com')) {
      const qualityParam = `q_${quality}`;
      const formatParam = 'f_auto';
      return src.replace('/upload/', `/upload/${qualityParam},${formatParam}/`);
    }
    
    return src;
  };

  const optimizedSrc = getOptimizedSrc();

  return (
    <Box
      ref={containerRef}
      className={className}
      sx={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        backgroundColor: 'grey.100',
        ...(aspectRatio && {
          aspectRatio,
          height: 'auto',
        }),
        ...sx,
      }}
    >
      {/* Placeholder/Skeleton */}
      {imageState === 'loading' && (
        <>
          {placeholder ? (
            <Box
              component="img"
              src={placeholder}
              alt=""
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: blur ? 'blur(10px)' : 'none',
                transform: 'scale(1.1)',
              }}
            />
          ) : (
            <Skeleton
              variant="rectangular"
              sx={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />
          )}
        </>
      )}

      {/* Main Image */}
      {isInView && imageState !== 'error' && (
        <Box
          component="img"
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          loading={loading}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: imageState === 'loaded' ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      )}

      {/* Error State */}
      {imageState === 'error' && (
        errorFallback || (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              backgroundColor: 'grey.200',
              color: 'grey.500',
            }}
          >
            <BrokenImage sx={{ fontSize: 48 }} />
          </Box>
        )
      )}
    </Box>
  );
};

export const LazyImage = memo(LazyImageComponent);

// Utility hook for preloading images
export const useImagePreloader = (images: string[]) => {
  const [loaded, setLoaded] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    const imagePromises = images.map((src) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        
        img.onload = () => {
          setLoaded((prev) => new Set(prev).add(src));
          resolve();
        };
        
        img.onerror = () => {
          setErrors((prev) => new Set(prev).add(src));
          resolve();
        };
        
        img.src = src;
      });
    });

    Promise.all(imagePromises);
  }, [images]);

  return {
    loaded: Array.from(loaded),
    errors: Array.from(errors),
    isLoading: loaded.size + errors.size < images.length,
  };
};