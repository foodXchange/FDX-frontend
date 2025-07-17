import { Request, Response, NextFunction } from 'express';

// Performance monitoring middleware
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) { // Log slow requests
      console.warn(`⚠️ Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
};

// Lazy loading for heavy dependencies
export const lazyServices = {
  _analytics: null as any,
  _websocket: null as any,
  
  getAnalytics() {
    if (!this._analytics) {
      const { AnalyticsService } = require('../services/analytics');
      this._analytics = new AnalyticsService();
    }
    return this._analytics;
  },
  
  getWebSocket() {
    if (!this._websocket) {
      const { WebSocketService } = require('../services/websocket');
      this._websocket = new WebSocketService();
    }
    return this._websocket;
  }
};

// Memory optimization
export const optimizeMemory = () => {
  // Force garbage collection in development
  if (process.env.NODE_ENV === 'development' && global.gc) {
    setInterval(() => {
      if (global.gc) {
        global.gc();
      }
    }, 60000); // Every minute
  }
  
  // Monitor memory usage
  setInterval(() => {
    const usage = process.memoryUsage();
    const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
    
    if (usedMB > 200) { // Warn if using more than 200MB
      console.warn(`⚠️ High memory usage: ${usedMB}MB`);
    }
  }, 30000);
};

// Database connection optimization
export const optimizeDatabase = () => {
  return {
    // SQLite optimizations
    pragma: [
      'PRAGMA journal_mode=WAL',
      'PRAGMA synchronous=NORMAL',
      'PRAGMA cache_size=10000',
      'PRAGMA temp_store=MEMORY',
      'PRAGMA mmap_size=268435456', // 256MB
    ],
    
    // Connection pooling settings
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
    }
  };
};

// Cache headers for static assets
export const cacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    res.setHeader('ETag', `"${Date.now()}"`);
  }
  next();
};