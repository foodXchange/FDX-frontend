// Performance configuration
export const performanceConfig = {
  // Bundle size limits (in KB)
  bundleSize: {
    maxInitialSize: 512,
    maxAsyncSize: 128,
  },
  
  // Lazy loading thresholds
  lazyLoading: {
    imageThreshold: 0.1,
    componentThreshold: 0.05,
  },
  
  // Caching strategies
  caching: {
    staticAssets: '1y',
    apiResponses: '5m',
    chunks: '1y',
  },
  
  // Performance monitoring
  monitoring: {
    enableMetrics: process.env.NODE_ENV === 'production',
    sampleRate: 0.1,
  }
};

export const performanceUtils = {
  // Measure component render time
  measureRender: (componentName: string, renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    
    if (end - start > 16) { // More than one frame
      console.warn(`${componentName} render took ${(end - start).toFixed(2)}ms`);
    }
  },
  
  // Optimize images
  optimizeImage: (src: string) => {
    if (src.includes('?')) return src;
    return `${src}?format=webp&quality=80`;
  },
  
  // Prefetch resources
  prefetchResource: (url: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }
};

export default performanceConfig;
