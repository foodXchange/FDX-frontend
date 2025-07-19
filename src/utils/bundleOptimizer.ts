// Bundle optimization utilities
import React from 'react';
export interface BundleMetrics {
  totalSize: number;
  chunkSizes: Record<string, number>;
  loadTime: number;
  cacheHitRate: number;
  compressionRatio: number;
}

export interface ImportAnalysis {
  module: string;
  size: number;
  used: boolean;
  importType: 'static' | 'dynamic';
  treeshakeable: boolean;
}

export class BundleOptimizer {
  private static instance: BundleOptimizer;
  private metrics: BundleMetrics | null = null;
  private loadTimeObserver: PerformanceObserver | null = null;

  private constructor() {
    this.initializePerformanceObserver();
  }

  public static getInstance(): BundleOptimizer {
    if (!BundleOptimizer.instance) {
      BundleOptimizer.instance = new BundleOptimizer();
    }
    return BundleOptimizer.instance;
  }

  private initializePerformanceObserver(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.loadTimeObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name.includes('.js') || entry.name.includes('.css')) {
            this.recordLoadTime(entry.name, entry.duration);
          }
        });
      });

      this.loadTimeObserver.observe({ entryTypes: ['resource'] });
    }
  }

  private recordLoadTime(resourceName: string, duration: number): void {
    console.log(`Resource ${resourceName} loaded in ${duration.toFixed(2)}ms`);
  }

  public measureBundleSize(): BundleMetrics | null {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return null;
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    const chunkSizes: Record<string, number> = {};
    let totalSize = 0;

    resources.forEach((resource) => {
      if (resource.name.includes('.js') || resource.name.includes('.css')) {
        const size = resource.transferSize || resource.encodedBodySize || 0;
        const fileName = resource.name.split('/').pop() || resource.name;
        chunkSizes[fileName] = size;
        totalSize += size;
      }
    });

    this.metrics = {
      totalSize,
      chunkSizes,
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      cacheHitRate: this.calculateCacheHitRate(resources),
      compressionRatio: this.calculateCompressionRatio(resources)
    };

    return this.metrics;
  }

  private calculateCacheHitRate(resources: PerformanceResourceTiming[]): number {
    if (resources.length === 0) return 0;

    const cachedResources = resources.filter(resource => 
      resource.transferSize === 0 && resource.decodedBodySize > 0
    );

    return (cachedResources.length / resources.length) * 100;
  }

  private calculateCompressionRatio(resources: PerformanceResourceTiming[]): number {
    let totalTransferSize = 0;
    let totalDecodedSize = 0;

    resources.forEach(resource => {
      totalTransferSize += resource.transferSize || 0;
      totalDecodedSize += resource.decodedBodySize || 0;
    });

    if (totalDecodedSize === 0) return 0;
    return ((totalDecodedSize - totalTransferSize) / totalDecodedSize) * 100;
  }

  public analyzeImports(modules: string[]): ImportAnalysis[] {
    // This would typically be done during build time with webpack analysis
    return modules.map((module, index) => ({
      module,
      size: Math.random() * 50000, // Mock size
      used: Math.random() > 0.2, // Mock usage detection
      importType: index % 3 === 0 ? 'dynamic' : 'static',
      treeshakeable: !module.includes('node_modules')
    }));
  }

  public getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (!this.metrics) {
      this.measureBundleSize();
    }

    if (this.metrics) {
      if (this.metrics.totalSize > 1000000) { // 1MB
        recommendations.push('Consider code splitting to reduce bundle size');
      }

      if (this.metrics.loadTime > 3000) { // 3 seconds
        recommendations.push('Optimize loading performance with preloading or lazy loading');
      }

      if (this.metrics.cacheHitRate < 50) {
        recommendations.push('Improve caching strategy for better performance');
      }

      if (this.metrics.compressionRatio < 60) {
        recommendations.push('Enable or improve compression (gzip/brotli)');
      }

      // Check for large chunks
      Object.entries(this.metrics.chunkSizes).forEach(([name, size]) => {
        if (size > 200000) { // 200KB
          recommendations.push(`Large chunk detected: ${name} (${(size / 1024).toFixed(2)}KB)`);
        }
      });
    }

    return recommendations;
  }

  public generateReport(): void {
    const metrics = this.measureBundleSize();
    const recommendations = this.getOptimizationRecommendations();

    console.group('📦 Bundle Analysis Report');
    
    if (metrics) {
      console.table({
        'Total Size': `${(metrics.totalSize / 1024).toFixed(2)} KB`,
        'Load Time': `${metrics.loadTime.toFixed(2)} ms`,
        'Cache Hit Rate': `${metrics.cacheHitRate.toFixed(2)}%`,
        'Compression Ratio': `${metrics.compressionRatio.toFixed(2)}%`
      });

      console.group('📊 Chunk Sizes');
      Object.entries(metrics.chunkSizes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .forEach(([name, size]) => {
          console.log(`${name}: ${(size / 1024).toFixed(2)} KB`);
        });
      console.groupEnd();
    }

    if (recommendations.length > 0) {
      console.group('💡 Optimization Recommendations');
      recommendations.forEach(rec => console.log(`• ${rec}`));
      console.groupEnd();
    }

    console.groupEnd();
  }

  public dispose(): void {
    if (this.loadTimeObserver) {
      this.loadTimeObserver.disconnect();
      this.loadTimeObserver = null;
    }
  }
}

// Utility functions for dynamic imports
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  return React.lazy(importFunc);
};

export const preloadRoute = (routeImport: () => Promise<any>): void => {
  // Preload the route module
  routeImport().catch(() => {
    // Ignore preload errors
  });
};

// Bundle analyzer instance
export const bundleOptimizer = BundleOptimizer.getInstance();

// Auto-generate report in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    bundleOptimizer.generateReport();
  }, 5000); // Wait 5 seconds after app start
}

export default bundleOptimizer;