import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Box, Skeleton, IconButton, Typography, useTheme, alpha, CircularProgress,  } from '@mui/material';
import { BrokenImage, Image as PhotoIcon, Refresh, Download, Fullscreen, ZoomIn, ZoomOut,  } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Image optimization configurations
const IMAGE_FORMATS = ['webp', 'avif', 'jpg', 'png'] as const;
const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 960,
  lg: 1280,
  xl: 1920,
} as const;

type ImageFormat = typeof IMAGE_FORMATS[number];
type Breakpoint = keyof typeof BREAKPOINTS;

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  placeholder?: string;
  fallback?: string;
  loading?: 'lazy' | 'eager';
  quality?: number;
  formats?: ImageFormat[];
  responsive?: boolean;
  breakpoints?: Partial<Record<Breakpoint, string>>;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  blur?: boolean;
  progressive?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onClick?: () => void;
  showControls?: boolean;
  enableZoom?: boolean;
  enableFullscreen?: boolean;
  enableDownload?: boolean;
  animationDuration?: number;
  threshold?: number;
  rootMargin?: string;
  priority?: boolean;
  preload?: boolean;
  fadeIn?: boolean;
  retryCount?: number;
  retryDelay?: number;
  aspectRatio?: number;
  title?: string;
  description?: string;
  sizes?: string;
  srcSet?: string;
  decode?: 'sync' | 'async' | 'auto';
  crossOrigin?: 'anonymous' | 'use-credentials';
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
}

// Image loading states
type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

// Intersection Observer hook for lazy loading
const useIntersectionObserver = (
  threshold: number = 0.1,
  rootMargin: string = '50px'
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [elementRef, isIntersecting] as const;
};

// Image format detection
const supportsWebP = () => {
  if (typeof window === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
};

const supportsAVIF = () => {
  if (typeof window === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').startsWith('data:image/avif');
};

// Generate optimized image URL
const generateOptimizedUrl = (
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: ImageFormat;
  } = {}
) => {
  const { width, height, quality = 85, format } = options;
  
  // This is a placeholder for actual image optimization service
  // In a real implementation, you would integrate with services like:
  // - Cloudinary
  // - ImageKit
  // - Vercel Image Optimization
  // - Next.js Image Optimization
  
  let optimizedUrl = src;
  const params = new URLSearchParams();
  
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  if (quality) params.append('q', quality.toString());
  if (format) params.append('f', format);
  
  if (params.toString()) {
    optimizedUrl += `?${params.toString()}`;
  }
  
  return optimizedUrl;
};

// Generate responsive image sources
const generateResponsiveSources = (
  src: string,
  formats: ImageFormat[],
  breakpoints: Partial<Record<Breakpoint, string>>,
  quality: number
) => {
  const sources: { srcSet: string; media?: string; type?: string }[] = [];
  
  // Generate sources for each format
  formats.forEach(format => {
    const srcSet = Object.entries(breakpoints)
      .map(([breakpoint, size]) => {
        const width = BREAKPOINTS[breakpoint as Breakpoint];
        const optimizedUrl = generateOptimizedUrl(src, { width, format, quality });
        return `${optimizedUrl} ${width}w`;
      })
      .join(', ');
    
    if (srcSet) {
      sources.push({
        srcSet,
        type: `image/${format}`,
      });
    }
  });
  
  return sources;
};

// Main LazyImage component
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width = '100%',
  height = 'auto',
  className,
  placeholder,
  fallback,
  loading = 'lazy',
  quality = 85,
  formats = ['webp', 'jpg'],
  responsive = false,
  breakpoints = {},
  objectFit = 'cover',
  blur = false,
  progressive = true,
  onLoad,
  onError,
  onClick,
  showControls = false,
  enableZoom = false,
  enableFullscreen = false,
  enableDownload = false,
  animationDuration = 300,
  threshold = 0.1,
  rootMargin = '50px',
  priority = false,
  preload = false,
  fadeIn = true,
  retryCount = 3,
  retryDelay = 1000,
  aspectRatio,
  title,
  description,
  sizes,
  srcSet,
  decode = 'async',
  crossOrigin,
  referrerPolicy,
}) => {
  const theme = useTheme();
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elementRef, isIntersecting] = useIntersectionObserver(threshold, rootMargin);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Determine if image should load
  const shouldLoad = loading === 'eager' || priority || isIntersecting;
  
  // Handle image load
  const handleLoad = useCallback(() => {
    setLoadingState('loaded');
    onLoad?.();
  }, [onLoad]);
  
  // Handle image error with retry logic
  const handleError = useCallback((error: Error) => {
    if (retryAttempts < retryCount) {
      setTimeout(() => {
        setRetryAttempts(prev => prev + 1);
        setLoadingState('loading');
      }, retryDelay);
    } else {
      setLoadingState('error');
      onError?.(error);
    }
  }, [retryAttempts, retryCount, retryDelay, onError]);
  
  // Handle retry
  const handleRetry = useCallback(() => {
    setRetryAttempts(0);
    setLoadingState('loading');
  }, []);
  
  // Handle zoom
  const handleZoom = useCallback(() => {
    setIsZoomed(prev => !prev);
  }, []);
  
  // Handle fullscreen
  const handleFullscreen = useCallback(() => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
      setIsFullscreen(prev => !prev);
    }
  }, [isFullscreen]);
  
  // Handle download
  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'image';
    link.click();
  }, [src, alt]);
  
  // Get optimal image format
  const getOptimalFormat = useCallback(() => {
    if (formats.includes('avif') && supportsAVIF()) return 'avif';
    if (formats.includes('webp') && supportsWebP()) return 'webp';
    return formats.find(format => ['jpg', 'jpeg', 'png'].includes(format)) || 'jpg';
  }, [formats]);
  
  // Generate optimized image URL
  const optimizedSrc = generateOptimizedUrl(src, {
    width: typeof width === 'number' ? width : undefined,
    height: typeof height === 'number' ? height : undefined,
    quality,
    format: getOptimalFormat(),
  });
  
  // Generate responsive sources
  const responsiveSources = responsive 
    ? generateResponsiveSources(src, formats, breakpoints, quality)
    : [];
  
  // Preload image if needed
  useEffect(() => {
    if (preload && priority) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = optimizedSrc;
      document.head.appendChild(link);
      
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [preload, priority, optimizedSrc]);
  
  // Load image when conditions are met
  useEffect(() => {
    if (shouldLoad && loadingState === 'idle') {
      setLoadingState('loading');
    }
  }, [shouldLoad, loadingState]);
  
  // Container styles
  const containerStyles = {
    position: 'relative' as const,
    width,
    height,
    overflow: 'hidden',
    borderRadius: 1,
    backgroundColor: alpha(theme.palette.grey[300], 0.1),
    ...(aspectRatio && {
      aspectRatio: aspectRatio.toString(),
    }),
    ...(isZoomed && {
      transform: 'scale(1.5)',
      transition: `transform ${animationDuration}ms ease-in-out`,
    }),
  };
  
  // Image styles
  const imageStyles = {
    width: '100%',
    height: '100%',
    objectFit,
    display: loadingState === 'loaded' ? 'block' : 'none',
    ...(blur && {
      filter: 'blur(4px)',
      transition: 'filter 0.3s ease-in-out',
    }),
    ...(fadeIn && {
      opacity: loadingState === 'loaded' ? 1 : 0,
      transition: `opacity ${animationDuration}ms ease-in-out`,
    }),
  };
  
  // Render controls
  const renderControls = () => {
    if (!showControls) return null;
    
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          display: 'flex',
          gap: 0.5,
          opacity: 0,
          transition: 'opacity 0.2s ease-in-out',
          '.MuiBox-root:hover &': {
            opacity: 1,
          },
        }}
      >
        {enableZoom && (
          <IconButton
            size="small"
            onClick={handleZoom}
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
              '&:hover': {
                backgroundColor: alpha(theme.palette.background.paper, 1),
              },
            }}
          >
            {isZoomed ? <ZoomOut /> : <ZoomIn />}
          </IconButton>
        )}
        {enableFullscreen && (
          <IconButton
            size="small"
            onClick={handleFullscreen}
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
              '&:hover': {
                backgroundColor: alpha(theme.palette.background.paper, 1),
              },
            }}
          >
            <Fullscreen />
          </IconButton>
        )}
        {enableDownload && (
          <IconButton
            size="small"
            onClick={handleDownload}
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
              '&:hover': {
                backgroundColor: alpha(theme.palette.background.paper, 1),
              },
            }}
          >
            <Download />
          </IconButton>
        )}
      </Box>
    );
  };
  
  // Render placeholder
  const renderPlaceholder = () => {
    if (placeholder) {
      return (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: alpha(theme.palette.grey[300], 0.1),
          }}
        >
          <img
            src={placeholder}
            alt=""
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(8px)',
              transform: 'scale(1.1)',
            }}
          />
        </Box>
      );
    }
    
    return (
      <Skeleton
        variant="rectangular"
        width="100%"
        height="100%"
        animation="wave"
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: 1,
        }}
      />
    );
  };
  
  // Render loading state
  const renderLoading = () => (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
      }}
    >
      <CircularProgress size={24} />
    </Box>
  );
  
  // Render error state
  const renderError = () => (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: alpha(theme.palette.error.main, 0.1),
        color: theme.palette.error.main,
      }}
    >
      <BrokenImage sx={{ fontSize: 48, mb: 1 }} />
      <Typography variant="caption" align="center" gutterBottom>
        Failed to load image
      </Typography>
      <IconButton size="small" onClick={handleRetry}>
        <Refresh />
      </IconButton>
    </Box>
  );
  
  return (
    <Box
      ref={elementRef}
      sx={containerStyles}
      className={className}
      onClick={onClick}
      title={title}
    >
      <Box ref={containerRef} sx={{ width: '100%', height: '100%' }}>
        {/* Placeholder */}
        {loadingState !== 'loaded' && renderPlaceholder()}
        
        {/* Main image */}
        {shouldLoad && (
          <AnimatePresence>
            {responsive && responsiveSources.length > 0 ? (
              <motion.picture
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: animationDuration / 1000 }}
              >
                {responsiveSources.map((source, index) => (
                  <source
                    key={index}
                    srcSet={source.srcSet}
                    media={source.media}
                    type={source.type}
                  />
                ))}
                <img
                  ref={imageRef}
                  src={optimizedSrc}
                  alt={alt}
                  style={imageStyles}
                  onLoad={handleLoad}
                  onError={(e) => handleError(new Error('Image failed to load'))}
                  loading={loading}
                  decoding={decode}
                  sizes={sizes}
                  srcSet={srcSet}
                  crossOrigin={crossOrigin}
                  referrerPolicy={referrerPolicy}
                />
              </motion.picture>
            ) : (
              <motion.img
                ref={imageRef}
                src={optimizedSrc}
                alt={alt}
                style={imageStyles}
                onLoad={handleLoad}
                onError={(e) => handleError(new Error('Image failed to load'))}
                loading={loading}
                decoding={decode}
                sizes={sizes}
                srcSet={srcSet}
                crossOrigin={crossOrigin}
                referrerPolicy={referrerPolicy}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: animationDuration / 1000 }}
              />
            )}
          </AnimatePresence>
        )}
        
        {/* Loading state */}
        {loadingState === 'loading' && renderLoading()}
        
        {/* Error state */}
        {loadingState === 'error' && renderError()}
        
        {/* Controls */}
        {renderControls()}
        
        {/* Description */}
        {description && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: 1,
              background: `linear-gradient(transparent, ${alpha(theme.palette.common.black, 0.7)})`,
              color: 'white',
              opacity: 0,
              transition: 'opacity 0.2s ease-in-out',
              '.MuiBox-root:hover &': {
                opacity: 1,
              },
            }}
          >
            <Typography variant="caption">{description}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Optimized image component with React.memo
export const OptimizedImage = React.memo(LazyImage);

// Hook for managing image loading
export const useImageLoader = (src: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!src) return;
    
    setIsLoading(true);
    setIsError(false);
    
    const img = new Image();
    img.onload = () => {
      setIsLoaded(true);
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsError(true);
      setIsLoading(false);
    };
    img.src = src;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);
  
  return { isLoaded, isError, isLoading };
};

export default LazyImage;