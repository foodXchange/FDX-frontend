const fs = require('fs');
const path = require('path');

console.log('⚡ PHASE 5: Implementing advanced performance optimizations...');

// Create advanced webpack configuration
function createAdvancedWebpackConfig() {
  console.log('📦 Creating advanced webpack configuration...');
  
  const advancedConfig = `const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Production optimizations
      if (env === 'production') {
        // Enable tree shaking
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          usedExports: true,
          sideEffects: false,
          
          // Advanced code splitting
          splitChunks: {
            chunks: 'all',
            maxInitialRequests: 20,
            maxAsyncRequests: 20,
            cacheGroups: {
              // Vendor chunks
              vendor: {
                test: /[\\\\/]node_modules[\\\\/]/,
                name: 'vendors',
                priority: 10,
                chunks: 'all',
              },
              
              // React and React DOM
              react: {
                test: /[\\\\/]node_modules[\\\\/](react|react-dom)[\\\\/]/,
                name: 'react',
                priority: 20,
                chunks: 'all',
              },
              
              // Material UI
              mui: {
                test: /[\\\\/]node_modules[\\\\/]@mui[\\\\/]/,
                name: 'mui',
                priority: 15,
                chunks: 'all',
              },
              
              // Heroicons
              heroicons: {
                test: /[\\\\/]node_modules[\\\\/]@heroicons[\\\\/]/,
                name: 'heroicons',
                priority: 15,
                chunks: 'all',
              },
              
              // React Query
              reactQuery: {
                test: /[\\\\/]node_modules[\\\\/]@tanstack[\\\\/]/,
                name: 'react-query',
                priority: 15,
                chunks: 'all',
              },
              
              // Routing
              routing: {
                test: /[\\\\/]node_modules[\\\\/]react-router[\\\\/]/,
                name: 'routing',
                priority: 15,
                chunks: 'all',
              },
              
              // Common components
              common: {
                name: 'common',
                minChunks: 2,
                priority: 5,
                chunks: 'all',
                enforce: true,
              },
            },
          },
          
          // Module concatenation
          concatenateModules: true,
          
          // Minimize configuration
          minimize: true,
          minimizer: [
            ...webpackConfig.optimization.minimizer,
          ],
        };

        // Add compression plugin
        webpackConfig.plugins.push(
          new CompressionPlugin({
            algorithm: 'gzip',
            test: /\\.(js|css|html|svg)$/,
            threshold: 8192,
            minRatio: 0.8,
          })
        );

        // Add Brotli compression
        webpackConfig.plugins.push(
          new CompressionPlugin({
            filename: '[path][base].br',
            algorithm: 'brotliCompress',
            test: /\\.(js|css|html|svg)$/,
            compressionOptions: { level: 11 },
            threshold: 8192,
            minRatio: 0.8,
          })
        );

        // Bundle analyzer (only when ANALYZE=true)
        if (process.env.ANALYZE) {
          webpackConfig.plugins.push(
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              openAnalyzer: false,
            })
          );
        }
      }

      // Development optimizations
      if (env === 'development') {
        // Faster builds in development
        webpackConfig.optimization.removeAvailableModules = false;
        webpackConfig.optimization.removeEmptyChunks = false;
        webpackConfig.optimization.splitChunks = false;
        
        // Better source maps
        webpackConfig.devtool = 'eval-cheap-module-source-map';
      }

      // Dynamic imports optimization
      webpackConfig.module.rules.push({
        test: /\\.(js|jsx|ts|tsx)$/,
        include: paths.appSrc,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [
                '@babel/plugin-syntax-dynamic-import',
                ['@babel/plugin-proposal-decorators', { legacy: true }],
              ],
            },
          },
        ],
      });

      // Image optimization
      webpackConfig.module.rules.push({
        test: /\\.(png|jpg|jpeg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'static/media/[name].[contenthash:8].[ext]',
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: { progressive: true, quality: 75 },
              optipng: { enabled: true },
              pngquant: { quality: [0.6, 0.8] },
              gifsicle: { interlaced: false },
              webp: { quality: 75 },
            },
          },
        ],
      });

      return webpackConfig;
    },
  },
  
  // Development server optimizations
  devServer: {
    compress: true,
    hot: true,
    overlay: false,
    stats: 'minimal',
  },
};`;
  
  fs.writeFileSync('./craco.config.ts', advancedConfig);
  console.log('✅ Created advanced webpack configuration');
}

// Create advanced lazy loading utilities
function createLazyLoadingUtils() {
  console.log('🔄 Creating advanced lazy loading utilities...');
  
  if (!fs.existsSync('./src/utils/performance')) {
    fs.mkdirSync('./src/utils/performance', { recursive: true });
  }
  
  const lazyUtils = `import React, { Suspense, ComponentType, lazy } from 'react';
import { CircularProgress, Box } from '@mui/material';

// Enhanced lazy loading with retry logic
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): T {
  const LazyComponent = lazy(() => {
    return importFunc().catch((error) => {
      console.error('Failed to load component:', error);
      // Retry once after a delay
      return new Promise((resolve) => {
        setTimeout(() => {
          importFunc().then(resolve).catch(() => {
            // Return error component if retry fails
            resolve({
              default: (() => (
                <Box p={3} textAlign="center">
                  <p>Failed to load component. Please refresh the page.</p>
                </Box>
              )) as T,
            });
          });
        }, 1000);
      });
    });
  });

  const WrappedComponent = (props: any) => (
    <Suspense
      fallback={
        fallback || (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <CircularProgress />
          </Box>
        )
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  );

  return WrappedComponent as T;
}

// Preload components based on user interaction
export function preloadComponent(importFunc: () => Promise<any>) {
  return importFunc();
}

// Intersection Observer based lazy loading
export function createIntersectionLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: IntersectionObserverInit = {}
): T {
  const LazyComponent = lazy(importFunc);
  
  const IntersectionWrapper = (props: any) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1, ...options }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => observer.disconnect();
    }, []);

    return (
      <div ref={ref}>
        {isVisible ? (
          <Suspense fallback={<CircularProgress />}>
            <LazyComponent {...props} />
          </Suspense>
        ) : (
          <Box minHeight="200px" display="flex" alignItems="center" justifyContent="center">
            <CircularProgress />
          </Box>
        )}
      </div>
    );
  };

  return IntersectionWrapper as T;
}

// Route-based code splitting with preloading
export function createRouteComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  preloadRoutes: string[] = []
): T {
  const LazyComponent = lazy(importFunc);
  
  // Preload on route hover/focus
  React.useEffect(() => {
    const preloadOnInteraction = (event: Event) => {
      const target = event.target as HTMLElement;
      const href = target.getAttribute('href') || target.closest('a')?.getAttribute('href');
      
      if (href && preloadRoutes.some(route => href.includes(route))) {
        preloadComponent(importFunc);
      }
    };

    document.addEventListener('mouseover', preloadOnInteraction);
    document.addEventListener('focusin', preloadOnInteraction);

    return () => {
      document.removeEventListener('mouseover', preloadOnInteraction);
      document.removeEventListener('focusin', preloadOnInteraction);
    };
  }, []);

  const RouteWrapper = (props: any) => (
    <Suspense
      fallback={
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress size={60} />
        </Box>
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  );

  return RouteWrapper as T;
}

// Image lazy loading with placeholder
export interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  className,
  style,
  onLoad,
  onError,
}) => {
  const [imageSrc, setImageSrc] = React.useState(placeholder);
  const [isLoading, setIsLoading] = React.useState(true);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = new Image();
          img.onload = () => {
            setImageSrc(src);
            setIsLoading(false);
            onLoad?.();
          };
          img.onerror = () => {
            setIsLoading(false);
            onError?.();
          };
          img.src = src;
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, onLoad, onError]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      style={{
        ...style,
        opacity: isLoading ? 0.7 : 1,
        transition: 'opacity 0.3s ease',
      }}
    />
  );
};`;
  
  fs.writeFileSync('./src/utils/performance/lazyLoading.tsx', lazyUtils);
  console.log('✅ Created advanced lazy loading utilities');
}

// Create memory optimization utilities
function createMemoryOptimizations() {
  console.log('🧠 Creating memory optimization utilities...');
  
  const memoryUtils = `import { useEffect, useRef, useCallback, useMemo } from 'react';

// Memory-efficient state management
export function useMemoryEfficientState<T>(
  initialValue: T,
  maxHistorySize: number = 10
) {
  const stateHistory = useRef<T[]>([initialValue]);
  const currentIndex = useRef(0);

  const setState = useCallback((newValue: T | ((prev: T) => T)) => {
    const value = typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(stateHistory.current[currentIndex.current])
      : newValue;

    // Add to history and trim if necessary
    stateHistory.current = [
      ...stateHistory.current.slice(0, currentIndex.current + 1),
      value
    ].slice(-maxHistorySize);
    
    currentIndex.current = stateHistory.current.length - 1;
  }, [maxHistorySize]);

  const getCurrentState = useCallback(() => {
    return stateHistory.current[currentIndex.current];
  }, []);

  const undo = useCallback(() => {
    if (currentIndex.current > 0) {
      currentIndex.current--;
    }
  }, []);

  const redo = useCallback(() => {
    if (currentIndex.current < stateHistory.current.length - 1) {
      currentIndex.current++;
    }
  }, []);

  return {
    state: getCurrentState(),
    setState,
    undo,
    redo,
    canUndo: currentIndex.current > 0,
    canRedo: currentIndex.current < stateHistory.current.length - 1,
  };
}

// Virtualized list for large datasets
export function useVirtualizedList<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number
) {
  const scrollTop = useRef(0);
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop.current / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    return { startIndex, endIndex };
  }, [items.length, containerHeight, itemHeight, scrollTop.current]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex).map((item, index) => ({
      item,
      index: visibleRange.startIndex + index,
      top: (visibleRange.startIndex + index) * itemHeight,
    }));
  }, [items, visibleRange, itemHeight]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    scrollTop.current = event.currentTarget.scrollTop;
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    visibleRange,
  };
}

// Memory-efficient data fetching with cleanup
export function useMemoryEfficientFetch<T>(
  fetchFunction: () => Promise<T>,
  dependencies: React.DependencyList,
  options: {
    maxCacheSize?: number;
    ttl?: number; // Time to live in milliseconds
  } = {}
) {
  const cache = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  const abortController = useRef<AbortController | null>(null);
  const { maxCacheSize = 10, ttl = 5 * 60 * 1000 } = options; // 5 minutes default TTL

  const cacheKey = useMemo(() => JSON.stringify(dependencies), dependencies);

  useEffect(() => {
    // Cleanup function
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  const fetch = useCallback(async (): Promise<T> => {
    // Check cache first
    const cached = cache.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    // Abort previous request
    if (abortController.current) {
      abortController.current.abort();
    }

    abortController.current = new AbortController();

    try {
      const data = await fetchFunction();
      
      // Update cache
      cache.current.set(cacheKey, { data, timestamp: Date.now() });
      
      // Cleanup old cache entries
      if (cache.current.size > maxCacheSize) {
        const entries = Array.from(cache.current.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        // Remove oldest entries
        const toRemove = entries.slice(0, entries.length - maxCacheSize);
        toRemove.forEach(([key]) => cache.current.delete(key));
      }

      return data;
    } catch (error) {
      if (error.name !== 'AbortError') {
        throw error;
      }
      throw new Error('Request aborted');
    }
  }, [cacheKey, fetchFunction, maxCacheSize, ttl]);

  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  const getCacheSize = useCallback(() => {
    return cache.current.size;
  }, []);

  return { fetch, clearCache, getCacheSize };
}

// Resource cleanup hook
export function useResourceCleanup() {
  const resources = useRef<Array<() => void>>([]);

  const addCleanup = useCallback((cleanup: () => void) => {
    resources.current.push(cleanup);
  }, []);

  const cleanup = useCallback(() => {
    resources.current.forEach((fn) => {
      try {
        fn();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    });
    resources.current = [];
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { addCleanup, cleanup };
}

// Debounced value hook for performance
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttled callback hook
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef<number>(0);
  const lastCallTimer = useRef<NodeJS.Timeout | null>(null);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      return callback(...args);
    } else {
      if (lastCallTimer.current) {
        clearTimeout(lastCallTimer.current);
      }
      
      lastCallTimer.current = setTimeout(() => {
        lastCall.current = Date.now();
        callback(...args);
      }, delay - (now - lastCall.current));
    }
  }, [callback, delay]) as T;
}`;
  
  fs.writeFileSync('./src/utils/performance/memoryOptimization.ts', memoryUtils);
  console.log('✅ Created memory optimization utilities');
}

// Create render optimization utilities
function createRenderOptimizations() {
  console.log('🎨 Creating render optimization utilities...');
  
  const renderUtils = `import React, { 
  memo, 
  useCallback, 
  useMemo, 
  useRef, 
  useEffect,
  useState,
  ComponentType 
} from 'react';

// HOC for pure component optimization
export function withMemoization<P extends object>(
  Component: ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) {
  return memo(Component, areEqual);
}

// Deep comparison memo
export function withDeepMemo<P extends object>(Component: ComponentType<P>) {
  return memo(Component, (prevProps, nextProps) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  });
}

// Selective prop memoization
export function withSelectiveMemo<P extends object>(
  Component: ComponentType<P>,
  watchProps: (keyof P)[]
) {
  return memo(Component, (prevProps, nextProps) => {
    return watchProps.every(prop => prevProps[prop] === nextProps[prop]);
  });
}

// Render prevention hook
export function useRenderPrevention(dependencies: React.DependencyList) {
  const prevDeps = useRef(dependencies);
  const shouldRender = useMemo(() => {
    const hasChanged = dependencies.some((dep, index) => dep !== prevDeps.current[index]);
    prevDeps.current = dependencies;
    return hasChanged;
  }, dependencies);

  return shouldRender;
}

// Batch state updates
export function useBatchedState<T>(initialState: T) {
  const [state, setState] = useState(initialState);
  const batchedUpdates = useRef<Partial<T>[]>([]);
  const batchTimeout = useRef<NodeJS.Timeout | null>(null);

  const batchSetState = useCallback((update: Partial<T>) => {
    batchedUpdates.current.push(update);
    
    if (batchTimeout.current) {
      clearTimeout(batchTimeout.current);
    }

    batchTimeout.current = setTimeout(() => {
      setState(prevState => {
        const newState = { ...prevState };
        batchedUpdates.current.forEach(update => {
          Object.assign(newState, update);
        });
        batchedUpdates.current = [];
        return newState;
      });
    }, 0);
  }, []);

  return [state, batchSetState] as const;
}

// Optimized list rendering
interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  windowSize?: number;
  threshold?: number;
}

export function OptimizedList<T>({
  items,
  renderItem,
  keyExtractor,
  windowSize = 10,
  threshold = 5
}: OptimizedListProps<T>) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: windowSize });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useThrottledCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, clientHeight } = containerRef.current;
    const itemHeight = clientHeight / windowSize;
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - threshold);
    const end = Math.min(items.length, start + windowSize + threshold * 2);

    setVisibleRange({ start, end });
  }, 100);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height: '100%', overflow: 'auto' }}
    >
      <div style={{ height: visibleRange.start * (100 / windowSize) + '%' }} />
      {visibleItems.map((item, index) => (
        <div key={keyExtractor(item, visibleRange.start + index)}>
          {renderItem(item, visibleRange.start + index)}
        </div>
      ))}
      <div style={{ height: (items.length - visibleRange.end) * (100 / windowSize) + '%' }} />
    </div>
  );
}

// Conditional rendering optimization
export function useConditionalRender<T>(
  condition: boolean,
  component: () => T,
  fallback?: () => T
): T | null {
  return useMemo(() => {
    if (condition) {
      return component();
    }
    return fallback ? fallback() : null;
  }, [condition]);
}

// Frame-based rendering for heavy components
export function useFrameBasedRendering(
  renderFunction: () => React.ReactNode,
  dependencies: React.DependencyList
) {
  const [content, setContent] = useState<React.ReactNode>(null);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    setIsRendering(true);
    
    const renderFrame = () => {
      try {
        const result = renderFunction();
        setContent(result);
      } catch (error) {
        console.error('Frame-based rendering error:', error);
      } finally {
        setIsRendering(false);
      }
    };

    requestAnimationFrame(renderFrame);
  }, dependencies);

  return { content, isRendering };
}

// Memoized event handlers
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

// Stable reference hook
export function useStableReference<T>(value: T): T {
  const ref = useRef(value);
  
  if (JSON.stringify(ref.current) !== JSON.stringify(value)) {
    ref.current = value;
  }
  
  return ref.current;
}

// Component profiling hook
export function useComponentProfiler(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(0);

  useEffect(() => {
    renderCount.current++;
    const now = performance.now();
    
    if (lastRenderTime.current > 0) {
      const timeSinceLastRender = now - lastRenderTime.current;
      console.log(\`\${componentName} - Render #\${renderCount.current}, Time since last: \${timeSinceLastRender.toFixed(2)}ms\`);
    }
    
    lastRenderTime.current = now;
  });

  return {
    renderCount: renderCount.current,
    resetProfiler: () => {
      renderCount.current = 0;
      lastRenderTime.current = 0;
    }
  };
}`;
  
  fs.writeFileSync('./src/utils/performance/renderOptimization.tsx', renderUtils);
  console.log('✅ Created render optimization utilities');
}

// Create bundle optimization utilities
function createBundleOptimizations() {
  console.log('📊 Creating bundle optimization utilities...');
  
  const bundleUtils = `// Dynamic import utilities for better code splitting
export const createDynamicImport = (path: string) => () => import(path);

// Commonly used dynamic imports
export const dynamicImports = {
  // Pages
  Dashboard: createDynamicImport('../pages/Dashboard'),
  RFQList: createDynamicImport('../features/rfqs/pages/RFQList'),
  RFQCreate: createDynamicImport('../features/rfqs/pages/RFQCreate'),
  SupplierList: createDynamicImport('../features/suppliers/pages/SupplierList'),
  OrderList: createDynamicImport('../features/orders/pages/OrderList'),
  
  // Components
  DataTable: createDynamicImport('../components/ui/DataTable'),
  Chart: createDynamicImport('../components/ui/Chart'),
  Map: createDynamicImport('../components/ui/Map'),
  
  // Features
  ExpertMarketplace: createDynamicImport('../features/expert-marketplace'),
  Analytics: createDynamicImport('../features/analytics'),
  Compliance: createDynamicImport('../features/compliance'),
};

// Tree shaking helpers
export const treeShakingHelpers = {
  // Only import specific Material-UI components
  muiImports: {
    Button: () => import('@mui/material/Button'),
    TextField: () => import('@mui/material/TextField'),
    DataGrid: () => import('@mui/x-data-grid/DataGrid'),
    DatePicker: () => import('@mui/x-date-pickers/DatePicker'),
  },
  
  // Only import specific Heroicons
  iconImports: {
    PlusIcon: () => import('@heroicons/react/24/outline').then(mod => ({ default: mod.PlusIcon })),
    EditIcon: () => import('@heroicons/react/24/outline').then(mod => ({ default: mod.PencilIcon })),
    DeleteIcon: () => import('@heroicons/react/24/outline').then(mod => ({ default: mod.TrashIcon })),
  },
};

// Bundle analyzer utilities
export function analyzeBundleSize() {
  if (process.env.NODE_ENV === 'development') {
    console.group('Bundle Analysis');
    
    // Estimate component bundle sizes
    const components = {
      'React': require('react'),
      'ReactDOM': require('react-dom'),
      'Material-UI': require('@mui/material'),
      'React Router': require('react-router-dom'),
      'React Query': require('@tanstack/react-query'),
    };
    
    Object.entries(components).forEach(([name, module]) => {
      const size = JSON.stringify(module).length;
      console.log(\`\${name}: ~\${(size / 1024).toFixed(2)}KB\`);
    });
    
    console.groupEnd();
  }
}

// Preload critical resources
export function preloadCriticalResources() {
  const criticalResources = [
    '/static/css/main.css',
    '/static/js/main.js',
    '/favicon.ico',
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    
    if (resource.endsWith('.css')) {
      link.as = 'style';
    } else if (resource.endsWith('.js')) {
      link.as = 'script';
    } else {
      link.as = 'image';
    }
    
    document.head.appendChild(link);
  });
}

// Resource hints for better loading
export function addResourceHints() {
  const hints = [
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//cdn.jsdelivr.net' },
    { rel: 'preconnect', href: 'https://api.foodxchange.com' },
  ];
  
  hints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    document.head.appendChild(link);
  });
}

// Code splitting strategy
export const codeSplittingStrategy = {
  // Split by route
  routeBased: {
    '/dashboard': dynamicImports.Dashboard,
    '/rfqs': dynamicImports.RFQList,
    '/rfqs/create': dynamicImports.RFQCreate,
    '/suppliers': dynamicImports.SupplierList,
    '/orders': dynamicImports.OrderList,
  },
  
  // Split by feature
  featureBased: {
    expertMarketplace: dynamicImports.ExpertMarketplace,
    analytics: dynamicImports.Analytics,
    compliance: dynamicImports.Compliance,
  },
  
  // Split by component size
  componentBased: {
    heavy: {
      DataTable: dynamicImports.DataTable,
      Chart: dynamicImports.Chart,
      Map: dynamicImports.Map,
    },
    light: {
      // Keep small components in main bundle
    },
  },
};

// Webpack chunk optimization
export function optimizeChunks() {
  return {
    cacheGroups: {
      vendor: {
        test: /[\\\\/]node_modules[\\\\/]/,
        name: 'vendors',
        chunks: 'all',
        priority: 10,
      },
      common: {
        name: 'common',
        minChunks: 2,
        chunks: 'all',
        priority: 5,
        enforce: true,
      },
      styles: {
        name: 'styles',
        test: /\\.css$/,
        chunks: 'all',
        enforce: true,
      },
    },
  };
}`;
  
  fs.writeFileSync('./src/utils/performance/bundleOptimization.ts', bundleUtils);
  console.log('✅ Created bundle optimization utilities');
}

// Update package.json with performance optimization dependencies
function updatePackageJsonForPerformance() {
  console.log('📦 Updating package.json for performance...');
  
  const packagePath = './package.json';
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Add performance dependencies
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      'webpack-bundle-analyzer': '^4.10.0',
      'compression-webpack-plugin': '^10.0.0',
      'image-webpack-loader': '^8.1.0',
      '@babel/plugin-syntax-dynamic-import': '^7.8.3',
      '@babel/plugin-proposal-decorators': '^7.23.0',
      'source-map-explorer': '^2.5.3'
    };
    
    // Add performance scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      'analyze': 'cross-env ANALYZE=true npm run build',
      'analyze:source-map': 'npm run build && npx source-map-explorer build/static/js/*.js',
      'build:optimized': 'cross-env GENERATE_SOURCEMAP=false npm run build',
      'perf:audit': 'lighthouse http://localhost:3000 --output=html --output-path=./performance-audit.html',
      'bundle:size': 'npm run build && bundlesize'
    };
    
    // Add bundlesize configuration
    packageJson.bundlesize = [
      {
        path: './build/static/js/*.js',
        maxSize: '250kb'
      },
      {
        path: './build/static/css/*.css',
        maxSize: '50kb'
      }
    ];
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json for performance');
  }
}

// Create performance monitoring integration
function createPerformanceIntegration() {
  console.log('⚡ Creating performance integration...');
  
  const perfIntegration = `import { rumMonitor } from '../monitoring/rum';

// Performance budget enforcement
export const performanceBudgets = {
  // Core Web Vitals thresholds
  FCP: 1800, // First Contentful Paint
  LCP: 2500, // Largest Contentful Paint
  FID: 100,  // First Input Delay
  CLS: 0.1,  // Cumulative Layout Shift
  
  // Custom metrics
  TTI: 3000, // Time to Interactive
  TBT: 300,  // Total Blocking Time
  SI: 4000,  // Speed Index
  
  // Bundle size limits
  mainBundle: 250 * 1024,    // 250KB
  vendorBundle: 500 * 1024,  // 500KB
  cssBundle: 50 * 1024,      // 50KB
};

// Performance monitoring class
class PerformanceMonitor {
  private observer: PerformanceObserver | null = null;
  private navigationEntry: PerformanceNavigationTiming | null = null;

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    // Monitor navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      this.navigationEntry = navEntries[0] || null;
    }

    // Monitor resource loading
    this.setupResourceMonitoring();
    
    // Monitor long tasks
    this.setupLongTaskMonitoring();
    
    // Monitor layout shifts
    this.setupLayoutShiftMonitoring();
  }

  private setupResourceMonitoring() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.analyzeResourcePerformance(resourceEntry);
          }
        });
      });

      this.observer.observe({ entryTypes: ['resource'] });
    }
  }

  private setupLongTaskMonitoring() {
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          rumMonitor.trackMetric('long_task', entry.duration, {
            startTime: entry.startTime,
            type: entry.entryType,
          });
        });
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long task monitoring not supported');
      }
    }
  }

  private setupLayoutShiftMonitoring() {
    if ('PerformanceObserver' in window) {
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            rumMonitor.trackMetric('layout_shift', (entry as any).value, {
              startTime: entry.startTime,
              sources: (entry as any).sources?.length || 0,
            });
          }
        });
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('Layout shift monitoring not supported');
      }
    }
  }

  private analyzeResourcePerformance(entry: PerformanceResourceTiming) {
    const { name, duration, transferSize, decodedBodySize } = entry;
    
    // Track resource load times
    rumMonitor.trackMetric('resource_load_time', duration, {
      resource: name,
      size: transferSize,
      type: this.getResourceType(name),
    });

    // Check for performance issues
    if (duration > 1000) {
      rumMonitor.trackMetric('slow_resource', duration, {
        resource: name,
        size: transferSize,
      });
    }

    // Track compression efficiency
    if (transferSize && decodedBodySize) {
      const compressionRatio = (1 - transferSize / decodedBodySize) * 100;
      rumMonitor.trackMetric('compression_ratio', compressionRatio, {
        resource: name,
      });
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  // Get current performance metrics
  getMetrics() {
    const navigation = this.navigationEntry;
    if (!navigation) return null;

    return {
      // Navigation timing
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      
      // Network timing
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcpConnect: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      
      // Processing timing
      domProcessing: navigation.domComplete - navigation.domLoading,
      
      // Overall metrics
      pageLoad: navigation.loadEventEnd - navigation.navigationStart,
      ttfb: navigation.responseStart - navigation.navigationStart,
    };
  }

  // Performance audit
  auditPerformance() {
    const metrics = this.getMetrics();
    if (!metrics) return [];

    const issues = [];

    // Check navigation timing
    if (metrics.pageLoad > 3000) {
      issues.push({
        type: 'slow_page_load',
        value: metrics.pageLoad,
        threshold: 3000,
        severity: 'high',
      });
    }

    if (metrics.ttfb > 600) {
      issues.push({
        type: 'slow_ttfb',
        value: metrics.ttfb,
        threshold: 600,
        severity: 'medium',
      });
    }

    if (metrics.domProcessing > 1000) {
      issues.push({
        type: 'slow_dom_processing',
        value: metrics.domProcessing,
        threshold: 1000,
        severity: 'medium',
      });
    }

    return issues;
  }

  // Cleanup
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// React component performance wrapper
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return React.memo((props: P) => {
    const startTime = React.useRef<number>(0);

    React.useEffect(() => {
      startTime.current = performance.now();
      
      return () => {
        const renderTime = performance.now() - startTime.current;
        rumMonitor.trackMetric('component_render_time', renderTime, {
          component: componentName,
        });
      };
    });

    return React.createElement(Component, props);
  });
}

// Performance debugging helpers
export const performanceDebug = {
  measureFunction: <T extends (...args: any[]) => any>(fn: T, name: string): T => {
    return ((...args: any[]) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      
      console.log(\`Function \${name} took \${end - start} milliseconds\`);
      rumMonitor.trackMetric('function_execution_time', end - start, { function: name });
      
      return result;
    }) as T;
  },

  measureRender: (componentName: string) => {
    console.time(\`Render: \${componentName}\`);
    return () => console.timeEnd(\`Render: \${componentName}\`);
  },

  logBundleSize: () => {
    if (performance && performance.getEntriesByType) {
      const resources = performance.getEntriesByType('resource');
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const cssResources = resources.filter(r => r.name.includes('.css'));
      
      console.group('Bundle Sizes');
      jsResources.forEach(r => {
        console.log(\`JS: \${r.name.split('/').pop()} - \${((r as any).transferSize / 1024).toFixed(2)}KB\`);
      });
      cssResources.forEach(r => {
        console.log(\`CSS: \${r.name.split('/').pop()} - \${((r as any).transferSize / 1024).toFixed(2)}KB\`);
      });
      console.groupEnd();
    }
  },
};`;
  
  fs.writeFileSync('./src/utils/performance/performanceIntegration.ts', perfIntegration);
  console.log('✅ Created performance integration');
}

// Run all advanced performance optimizations
async function setupAdvancedPerformance() {
  try {
    createAdvancedWebpackConfig();
    createLazyLoadingUtils();
    createMemoryOptimizations();
    createRenderOptimizations();
    createBundleOptimizations();
    updatePackageJsonForPerformance();
    createPerformanceIntegration();
    
    console.log('🎉 PHASE 5 COMPLETE: Advanced performance optimizations setup!');
    console.log('⚡ Features added:');
    console.log('  • Advanced webpack configuration with code splitting');
    console.log('  • Intelligent lazy loading with retry logic');
    console.log('  • Memory optimization utilities and hooks');
    console.log('  • Render optimization and virtualization');
    console.log('  • Bundle optimization and tree shaking');
    console.log('  • Performance monitoring integration');
    console.log('  • Component profiling and debugging tools');
    console.log('📋 Next: npm install and integrate performance monitoring');
    
  } catch (error) {
    console.error('❌ Error setting up advanced performance:', error);
  }
}

setupAdvancedPerformance();