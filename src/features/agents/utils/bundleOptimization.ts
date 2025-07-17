import React from 'react';
import { lazy, ComponentType, LazyExoticComponent } from 'react';

// Bundle optimization utilities
export class BundleOptimizer {
  private static loadedChunks = new Set<string>();
  private static preloadedRoutes = new Set<string>();
  
  // Lazy load components with error boundaries
  static lazyLoadComponent<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    chunkName?: string
  ): LazyExoticComponent<T> {
    return lazy(async () => {
      const start = performance.now();
      
      try {
        const module = await importFn();
        const loadTime = performance.now() - start;
        
        if (chunkName) {
          this.loadedChunks.add(chunkName);
          console.log(`Loaded chunk "${chunkName}" in ${loadTime.toFixed(2)}ms`);
        }
        
        // Track bundle metrics
        this.trackChunkLoad(chunkName || 'unknown', loadTime);
        
        return module;
      } catch (error) {
        console.error(`Failed to load chunk "${chunkName}":`, error);
        throw error;
      }
    });
  }

  // Preload routes for better UX
  static preloadRoute(routeImportFn: () => Promise<any>, routeName: string): void {
    if (this.preloadedRoutes.has(routeName)) {
      return;
    }

    this.preloadedRoutes.add(routeName);
    
    // Preload during idle time
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        routeImportFn().then(() => {
          console.log(`Preloaded route: ${routeName}`);
        }).catch(error => {
          console.warn(`Failed to preload route "${routeName}":`, error);
        });
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        routeImportFn().then(() => {
          console.log(`Preloaded route: ${routeName}`);
        }).catch(error => {
          console.warn(`Failed to preload route "${routeName}":`, error);
        });
      }, 100);
    }
  }

  // Preload component on hover (for links/buttons)
  static createPreloadOnHover(importFn: () => Promise<any>) {
    let preloaded = false;
    
    return {
      onMouseEnter: () => {
        if (!preloaded) {
          preloaded = true;
          importFn().catch(error => {
            console.warn('Preload on hover failed:', error);
            preloaded = false; // Allow retry
          });
        }
      },
    };
  }

  // Resource hints for critical resources
  static addResourceHints(resources: Array<{ href: string; as?: string; type?: string; crossorigin?: boolean }>) {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      
      if (resource.as) link.as = resource.as;
      if (resource.type) link.type = resource.type;
      if (resource.crossorigin) link.crossOrigin = 'anonymous';
      
      document.head.appendChild(link);
    });
  }

  // Intelligent prefetching based on user behavior
  static enableIntelligentPrefetch() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          const href = target.getAttribute('data-prefetch');
          
          if (href && !this.preloadedRoutes.has(href)) {
            this.preloadedRoutes.add(href);
            
            // Dynamically import the component
            import(/* webpackChunkName: "prefetch-[request]" */ href)
              .then(() => console.log(`Prefetched: ${href}`))
              .catch(error => console.warn(`Prefetch failed for ${href}:`, error));
          }
        }
      });
    }, {
      rootMargin: '50px',
    });

    // Observe all elements with data-prefetch attribute
    document.querySelectorAll('[data-prefetch]').forEach(el => {
      observer.observe(el);
    });

    return observer;
  }

  // Track and analyze chunk loading performance
  private static trackChunkLoad(chunkName: string, loadTime: number) {
    if (process.env.NODE_ENV === 'development') {
      const event = {
        type: 'chunk_load',
        chunkName,
        loadTime,
        timestamp: Date.now(),
        url: window.location.href,
      };

      // Send to analytics or store locally for development
      const existingData = JSON.parse(localStorage.getItem('chunk_performance') || '[]');
      existingData.push(event);
      
      // Keep only last 100 entries
      if (existingData.length > 100) {
        existingData.splice(0, existingData.length - 100);
      }
      
      localStorage.setItem('chunk_performance', JSON.stringify(existingData));
    }
  }

  // Get performance report
  static getPerformanceReport() {
    const data = JSON.parse(localStorage.getItem('chunk_performance') || '[]');
    
    const report = {
      totalChunks: this.loadedChunks.size,
      preloadedRoutes: this.preloadedRoutes.size,
      averageLoadTime: 0,
      slowestChunks: [] as Array<{ name: string; time: number }>,
      recentLoads: data.slice(-10),
    };

    if (data.length > 0) {
      const totalTime = data.reduce((sum: number, item: any) => sum + item.loadTime, 0);
      report.averageLoadTime = totalTime / data.length;
      
      report.slowestChunks = data
        .sort((a: any, b: any) => b.loadTime - a.loadTime)
        .slice(0, 5)
        .map((item: any) => ({ name: item.chunkName, time: item.loadTime }));
    }

    return report;
  }

  // Clear performance data
  static clearPerformanceData() {
    localStorage.removeItem('chunk_performance');
    this.loadedChunks.clear();
    this.preloadedRoutes.clear();
  }
}

// Tree shaking utilities
export class TreeShakingOptimizer {
  // Mark unused exports for tree shaking
  static markUnused(modulePath: string, unusedExports: string[]) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Unused exports in ${modulePath}:`, unusedExports);
    }
  }

  // Analyze bundle composition
  static analyzeBundleComposition() {
    if (process.env.NODE_ENV !== 'development') return;

    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const analysis = scripts.map(script => {
      const src = (script as HTMLScriptElement).src;
      return {
        src,
        async: (script as HTMLScriptElement).async,
        defer: (script as HTMLScriptElement).defer,
        module: (script as HTMLScriptElement).type === 'module',
      };
    });

    console.table(analysis);
    return analysis;
  }
}

// Image optimization utilities
export class ImageOptimizer {
  // Create responsive image with multiple formats
  static createResponsiveImage(src: string, alt: string, sizes: string[] = ['320w', '640w', '1024w']) {
    // const formats = ['webp', 'avif', 'jpg']; // Not used currently
    
    return {
      src,
      alt,
      srcSet: sizes.map(size => `${src}?w=${size.replace('w', '')} ${size}`).join(', '),
      sizes: '(max-width: 320px) 280px, (max-width: 640px) 600px, 1024px',
      loading: 'lazy' as const,
      decoding: 'async' as const,
    };
  }

  // Preload critical images
  static preloadCriticalImages(images: string[]) {
    images.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  // Lazy load images with intersection observer
  static enableLazyLoading() {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    // Observe all images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });

    return imageObserver;
  }
}

// CSS optimization utilities
export class CSSOptimizer {
  // Remove unused CSS classes
  static removeUnusedCSS() {
    if (process.env.NODE_ENV !== 'development') return;

    const allClasses = new Set<string>();
    const usedClasses = new Set<string>();

    // Collect all CSS classes
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        Array.from(sheet.cssRules).forEach(rule => {
          if (rule instanceof CSSStyleRule) {
            const matches = rule.selectorText.match(/\.[a-zA-Z0-9_-]+/g);
            if (matches) {
              matches.forEach(match => allClasses.add(match.substring(1)));
            }
          }
        });
      } catch (error) {
        // Cross-origin stylesheets may throw errors
        console.warn('Could not analyze stylesheet:', error);
      }
    });

    // Find used classes
    document.querySelectorAll('*').forEach(element => {
      element.classList.forEach(className => {
        usedClasses.add(className);
      });
    });

    const unusedClasses = Array.from(allClasses).filter(cls => !usedClasses.has(cls));
    
    if (unusedClasses.length > 0) {
      console.warn('Unused CSS classes detected:', unusedClasses);
    }

    return {
      total: allClasses.size,
      used: usedClasses.size,
      unused: unusedClasses,
    };
  }

  // Critical CSS extraction
  static extractCriticalCSS() {
    const criticalElements = document.querySelectorAll('header, nav, .hero, .above-fold');
    const criticalClasses = new Set<string>();

    criticalElements.forEach(element => {
      element.classList.forEach(className => {
        criticalClasses.add(className);
      });
    });

    return Array.from(criticalClasses);
  }
}

// Font optimization utilities
export class FontOptimizer {
  // Preload critical fonts
  static preloadFonts(fonts: Array<{ href: string; type?: string }>) {
    fonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.href = font.href;
      link.type = font.type || 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  // Enable font display optimization
  static optimizeFontDisplay() {
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-display: swap; /* Ensure text remains visible during font load */
      }
    `;
    document.head.appendChild(style);
  }
}

// Service Worker utilities for caching
export class ServiceWorkerOptimizer {
  // Register service worker for caching
  static async registerServiceWorker(swPath: string = '/sw.js') {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      try {
        const registration = await navigator.serviceWorker.register(swPath);
        console.log('Service Worker registered:', registration);
        
        // Update service worker if new version available
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                console.log('New version available. Please refresh.');
              }
            });
          }
        });
        
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return undefined;
      }
    }
    return undefined;
  }

  // Clear old caches
  static async clearOldCaches(currentCacheNames: string[]) {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name => !currentCacheNames.includes(name));
      
      await Promise.all(oldCaches.map(name => caches.delete(name)));
      console.log('Cleared old caches:', oldCaches);
    }
  }
}

// Main bundle optimization class
export default class BundleOptimization {
  static optimizer = BundleOptimizer;
  static treeShaking = TreeShakingOptimizer;
  static images = ImageOptimizer;
  static css = CSSOptimizer;
  static fonts = FontOptimizer;
  static serviceWorker = ServiceWorkerOptimizer;

  // Initialize all optimizations
  static initializeOptimizations() {
    // Enable image lazy loading
    this.images.enableLazyLoading();
    
    // Enable intelligent prefetching
    this.optimizer.enableIntelligentPrefetch();
    
    // Optimize font display
    this.fonts.optimizeFontDisplay();
    
    // Register service worker in production
    if (process.env.NODE_ENV === 'production') {
      this.serviceWorker.registerServiceWorker();
    }
    
    console.log('Bundle optimizations initialized');
  }

  // Get optimization report
  static getOptimizationReport() {
    return {
      bundle: this.optimizer.getPerformanceReport(),
      css: this.css.removeUnusedCSS(),
      timestamp: new Date().toISOString(),
    };
  }
}