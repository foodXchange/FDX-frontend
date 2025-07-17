import React, { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress, Avatar, Skeleton, Typography } from '@mui/material';
import { BrokenImage } from '@mui/icons-material';
import { useImageOptimization } from '../../hooks/useImageOptimization';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  quality?: number;
  placeholder?: 'blur' | 'skeleton' | 'icon';
  fallback?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  borderRadius?: number | string;
  enableLazyLoading?: boolean;
  enableWebP?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width = '100%',
  height = 'auto',
  quality = 85,
  placeholder = 'skeleton',
  fallback,
  className,
  style,
  objectFit = 'cover',
  borderRadius = 0,
  enableLazyLoading = true,
  enableWebP = true,
  onLoad,
  onError,
}) => {
  const [isInView, setIsInView] = useState(!enableLazyLoading);
  const imgRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { src: optimizedSrc, webpSrc, isLoaded, isError, load } = useImageOptimization(src, {
    quality,
    enableWebP,
    enableLazyLoading,
  });

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!enableLazyLoading || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          load();
          observerRef.current?.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [enableLazyLoading, load]);

  // Load image when in view
  useEffect(() => {
    if (isInView && !enableLazyLoading) {
      load();
    }
  }, [isInView, enableLazyLoading, load]);

  const handleLoad = () => {
    onLoad?.();
  };

  const handleError = () => {
    onError?.();
  };

  const containerStyle: React.CSSProperties = {
    width,
    height,
    borderRadius,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...style,
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit,
    transition: 'opacity 0.3s ease',
    opacity: isLoaded ? 1 : 0,
  };

  const renderPlaceholder = () => {
    switch (placeholder) {
      case 'blur':
        return (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'grey.200',
              filter: 'blur(10px)',
              transition: 'opacity 0.3s ease',
              opacity: isLoaded ? 0 : 1,
            }}
          />
        );
      
      case 'skeleton':
        return !isLoaded && !isError ? (
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              transition: 'opacity 0.3s ease',
              opacity: isLoaded ? 0 : 1,
            }}
          />
        ) : null;
      
      case 'icon':
        return !isLoaded && !isError ? (
          <Avatar
            sx={{
              width: '40%',
              height: '40%',
              backgroundColor: 'grey.200',
              transition: 'opacity 0.3s ease',
              opacity: isLoaded ? 0 : 1,
            }}
          >
            <ImageIcon />
          </Avatar>
        ) : null;
      
      default:
        return null;
    }
  };

  const renderError = () => {
    if (fallback) {
      return fallback;
    }

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
          backgroundColor: 'grey.100',
          width: '100%',
          height: '100%',
        }}
      >
        <BrokenImage sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="caption">Failed to load image</Typography>
      </Box>
    );
  };

  const renderImage = () => {
    if (!isInView && enableLazyLoading) {
      return null;
    }

    return (
      <picture>
        {webpSrc && (
          <source srcSet={webpSrc} type="image/webp" />
        )}
        <img
          src={optimizedSrc}
          alt={alt}
          style={imageStyle}
          onLoad={handleLoad}
          onError={handleError}
          loading={enableLazyLoading ? 'lazy' : 'eager'}
          decoding="async"
        />
      </picture>
    );
  };

  return (
    <Box
      ref={imgRef}
      className={className}
      sx={containerStyle}
    >
      {isError ? renderError() : (
        <>
          {renderPlaceholder()}
          {renderImage()}
          {!isLoaded && !isError && isInView && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                color: 'primary.main',
              }}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default LazyImage;