import { useState, useEffect, useCallback } from 'react';

interface ImageOptimizationConfig {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
  enableWebP?: boolean;
  enableLazyLoading?: boolean;
  placeholder?: string;
}

interface OptimizedImage {
  src: string;
  webpSrc?: string;
  placeholder: string;
  isLoaded: boolean;
  isError: boolean;
  load: () => void;
}

export function useImageOptimization(
  originalSrc: string,
  config: ImageOptimizationConfig = {}
): OptimizedImage {
  const {
    quality = 85,
    maxWidth = 1920,
    maxHeight = 1080,
    format = 'jpeg',
    enableWebP = true,
    enableLazyLoading = true,
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04Ny4xIDEyNi44SDE0MEw5My42IDY4LjJIODdWMTI2LjhaTTExMC4zIDEyNi44SDE2OVY2OC4ySDE1OS4yVjExOUgxMDcuNVY2OC4ySDE1NS42VjEyNi44WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K',
  } = config;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!enableLazyLoading);

  // Generate optimized image URLs
  const optimizedSrc = generateOptimizedUrl(originalSrc, {
    quality,
    maxWidth,
    maxHeight,
    format,
  });

  const webpSrc = enableWebP ? generateOptimizedUrl(originalSrc, {
    quality,
    maxWidth,
    maxHeight,
    format: 'webp',
  }) : undefined;

  const load = useCallback(() => {
    setShouldLoad(true);
  }, []);

  useEffect(() => {
    if (!shouldLoad || !originalSrc) return;

    setIsLoaded(false);
    setIsError(false);

    const img = new Image();
    
    img.onload = () => {
      setIsLoaded(true);
      setIsError(false);
    };
    
    img.onerror = () => {
      setIsError(true);
      setIsLoaded(false);
    };

    // Load WebP if supported, fallback to optimized format
    if (webpSrc && isWebPSupported()) {
      img.src = webpSrc;
    } else {
      img.src = optimizedSrc;
    }

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [shouldLoad, originalSrc, optimizedSrc, webpSrc]);

  return {
    src: optimizedSrc,
    webpSrc,
    placeholder,
    isLoaded,
    isError,
    load,
  };
}

// Generate optimized image URL (would integrate with image CDN)
function generateOptimizedUrl(
  src: string,
  _options: {
    quality: number;
    maxWidth: number;
    maxHeight: number;
    format: string;
  }
): string {
  if (!src || src.startsWith('data:')) return src;

  // For demo purposes, return original URL
  // In production, this would integrate with services like:
  // - Cloudinary: `https://res.cloudinary.com/demo/image/fetch/w_${maxWidth},h_${maxHeight},c_limit,f_${format},q_${quality}/${encodeURIComponent(src)}`
  // - ImageKit: `https://ik.imagekit.io/demo/tr:w-${maxWidth},h-${maxHeight},f-${format},q-${quality}/${src}`
  // - AWS CloudFront with Lambda@Edge
  
  return src;
}

// Check WebP support
function isWebPSupported(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

// Hook for progressive image loading
export function useProgressiveImage(
  lowQualitySrc: string,
  highQualitySrc: string
): { src: string; blur: boolean } {
  const [src, setSrc] = useState(lowQualitySrc);
  const [blur, setBlur] = useState(true);

  useEffect(() => {
    setSrc(lowQualitySrc);
    setBlur(true);

    const img = new Image();
    img.onload = () => {
      setSrc(highQualitySrc);
      setBlur(false);
    };
    img.src = highQualitySrc;

    return () => {
      img.onload = null;
    };
  }, [lowQualitySrc, highQualitySrc]);

  return { src, blur };
}

// Hook for image preloading
export function useImagePreloader(urls: string[]): boolean {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (urls.length === 0) {
      setIsLoaded(true);
      return;
    }

    let loadedCount = 0;
    const totalCount = urls.length;

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === totalCount) {
        setIsLoaded(true);
      }
    };

    urls.forEach((url) => {
      const img = new Image();
      img.onload = checkComplete;
      img.onerror = checkComplete;
      img.src = url;
    });
  }, [urls]);

  return isLoaded;
}

export default useImageOptimization;