import React from 'react';
import { logger } from '@/services/logger';

// Debug utilities for development
const DEBUG_KEY = 'fdx_debug';

interface DebugConfig {
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enablePerformanceMetrics: boolean;
  enableNetworkLogging: boolean;
  enableStateLogging: boolean;
  highlightRerenders: boolean;
  showErrorOverlay: boolean;
}

const defaultConfig: DebugConfig = {
  logLevel: 'info',
  enablePerformanceMetrics: false,
  enableNetworkLogging: false,
  enableStateLogging: false,
  highlightRerenders: false,
  showErrorOverlay: true,
};

class DebugUtils {
  private config: DebugConfig;

  constructor() {
    this.config = this.loadConfig();
    this.setupDebugHelpers();
  }

  private loadConfig(): DebugConfig {
    try {
      const stored = localStorage.getItem(DEBUG_KEY);
      return stored ? { ...defaultConfig, ...JSON.parse(stored) } : defaultConfig;
    } catch {
      return defaultConfig;
    }
  }

  private saveConfig(): void {
    localStorage.setItem(DEBUG_KEY, JSON.stringify(this.config));
  }

  private setupDebugHelpers(): void {
    if (process.env.NODE_ENV === 'development') {
      // Expose debug utilities to window
      (window as any).fdx = {
        debug: this,
        logger,
        enableDebug: () => this.enable(),
        disableDebug: () => this.disable(),
        setLogLevel: (level: DebugConfig['logLevel']) => this.setLogLevel(level),
        togglePerformanceMetrics: () => this.togglePerformanceMetrics(),
        toggleNetworkLogging: () => this.toggleNetworkLogging(),
        toggleStateLogging: () => this.toggleStateLogging(),
        toggleRerenderHighlight: () => this.toggleRerenderHighlight(),
        clearStorage: () => this.clearStorage(),
        exportLogs: () => this.exportLogs(),
      };

      // Add keyboard shortcuts
      window.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Shift + D to toggle debug panel
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
          e.preventDefault();
          this.toggleDebugPanel();
        }
      });
    }
  }

  enable(): void {
    this.config = { ...this.config, logLevel: 'debug' };
    this.saveConfig();
    logger.setConfig({ minLevel: 'debug' });
    console.log('🐛 Debug mode enabled');
  }

  disable(): void {
    this.config = defaultConfig;
    this.saveConfig();
    logger.setConfig({ minLevel: 'info' });
    console.log('🐛 Debug mode disabled');
  }

  setLogLevel(level: DebugConfig['logLevel']): void {
    this.config.logLevel = level;
    this.saveConfig();
    logger.setConfig({ minLevel: level });
  }

  togglePerformanceMetrics(): void {
    this.config.enablePerformanceMetrics = !this.config.enablePerformanceMetrics;
    this.saveConfig();
    
    if (this.config.enablePerformanceMetrics) {
      this.startPerformanceMonitoring();
    } else {
      this.stopPerformanceMonitoring();
    }
  }

  toggleNetworkLogging(): void {
    this.config.enableNetworkLogging = !this.config.enableNetworkLogging;
    this.saveConfig();
    
    if (this.config.enableNetworkLogging) {
      this.interceptNetworkRequests();
    }
  }

  toggleStateLogging(): void {
    this.config.enableStateLogging = !this.config.enableStateLogging;
    this.saveConfig();
  }

  toggleRerenderHighlight(): void {
    this.config.highlightRerenders = !this.config.highlightRerenders;
    this.saveConfig();
    
    if (this.config.highlightRerenders) {
      this.enableRerenderHighlight();
    } else {
      this.disableRerenderHighlight();
    }
  }

  private startPerformanceMonitoring(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        logger.debug('Performance entry', {
          name: entry.name,
          type: entry.entryType,
          duration: entry.duration,
          startTime: entry.startTime,
        });
      }
    });
    
    observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
    (window as any).__performanceObserver = observer;
  }

  private stopPerformanceMonitoring(): void {
    const observer = (window as any).__performanceObserver;
    if (observer) {
      observer.disconnect();
      delete (window as any).__performanceObserver;
    }
  }

  private interceptNetworkRequests(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const [url, options] = args;
      
      logger.debug('Network request', {
        url,
        method: options?.method || 'GET',
        headers: options?.headers,
      });
      
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;
        
        logger.debug('Network response', {
          url,
          status: response.status,
          duration: `${duration.toFixed(2)}ms`,
        });
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        logger.error('Network error', {
          url,
          error,
          duration: `${duration.toFixed(2)}ms`,
        });
        throw error;
      }
    };
  }

  private enableRerenderHighlight(): void {
    const style = document.createElement('style');
    style.id = 'rerender-highlight';
    style.textContent = `
      @keyframes rerender-highlight {
        0% { outline: 2px solid red; outline-offset: -2px; }
        100% { outline: 2px solid transparent; outline-offset: -2px; }
      }
      .rerender-highlight {
        animation: rerender-highlight 1s ease-out;
      }
    `;
    document.head.appendChild(style);
  }

  private disableRerenderHighlight(): void {
    const style = document.getElementById('rerender-highlight');
    if (style) {
      style.remove();
    }
  }

  private toggleDebugPanel(): void {
    let panel = document.getElementById('debug-panel');
    
    if (panel) {
      panel.remove();
    } else {
      this.createDebugPanel();
    }
  }

  private createDebugPanel(): void {
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 300px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      font-family: monospace;
      font-size: 12px;
    `;
    
    panel.innerHTML = `
      <h3 style="margin: 0 0 12px 0;">🐛 Debug Panel</h3>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <label>
          <input type="checkbox" ${this.config.enablePerformanceMetrics ? 'checked' : ''} 
            onchange="window.fdx.togglePerformanceMetrics()">
          Performance Metrics
        </label>
        <label>
          <input type="checkbox" ${this.config.enableNetworkLogging ? 'checked' : ''} 
            onchange="window.fdx.toggleNetworkLogging()">
          Network Logging
        </label>
        <label>
          <input type="checkbox" ${this.config.enableStateLogging ? 'checked' : ''} 
            onchange="window.fdx.toggleStateLogging()">
          State Logging
        </label>
        <label>
          <input type="checkbox" ${this.config.highlightRerenders ? 'checked' : ''} 
            onchange="window.fdx.toggleRerenderHighlight()">
          Highlight Rerenders
        </label>
        <hr style="margin: 8px 0;">
        <button onclick="window.fdx.exportLogs()" style="padding: 4px 8px;">
          Export Logs
        </button>
        <button onclick="window.fdx.clearStorage()" style="padding: 4px 8px;">
          Clear Storage
        </button>
        <button onclick="document.getElementById('debug-panel').remove()" style="padding: 4px 8px;">
          Close
        </button>
      </div>
    `;
    
    document.body.appendChild(panel);
  }

  clearStorage(): void {
    if (confirm('This will clear all localStorage and sessionStorage. Continue?')) {
      localStorage.clear();
      sessionStorage.clear();
      logger.info('Storage cleared');
      window.location.reload();
    }
  }

  exportLogs(): void {
    const logs = logger.getLogBuffer();
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fdx-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Utility method to measure React component render time
  measureRender(componentName: string, fn: () => void): void {
    if (this.config.enablePerformanceMetrics) {
      const startTime = performance.now();
      fn();
      const duration = performance.now() - startTime;
      logger.debug(`Component render [${componentName}]`, { duration: `${duration.toFixed(2)}ms` });
    } else {
      fn();
    }
  }

  // Log state changes if enabled
  logStateChange(storeName: string, action: string, state: any): void {
    if (this.config.enableStateLogging) {
      logger.debug(`State change [${storeName}]`, { action, state });
    }
  }
}

export const debugUtils = new DebugUtils();

// React DevTools hook
export function useWhyDidYouUpdate(name: string, props: Record<string, any>): void {
  if (process.env.NODE_ENV === 'development') {
    const previousProps = React.useRef<Record<string, any>>();
    
    React.useEffect(() => {
      if (previousProps.current) {
        const allKeys = Object.keys({ ...previousProps.current, ...props });
        const changedProps: Record<string, any> = {};
        
        allKeys.forEach(key => {
          if (previousProps.current![key] !== props[key]) {
            changedProps[key] = {
              from: previousProps.current![key],
              to: props[key],
            };
          }
        });
        
        if (Object.keys(changedProps).length > 0) {
          logger.debug(`[${name}] Props changed:`, changedProps);
        }
      }
      
      previousProps.current = props;
    });
  }
}