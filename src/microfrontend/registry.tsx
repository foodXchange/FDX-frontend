// Micro-frontend module loader and registry
export interface MicrofrontendConfig {
  name: string;
  url: string;
  scope: string;
  module: string;
  version?: string;
  dependencies?: string[];
  fallback?: React.ComponentType;
  errorBoundary?: React.ComponentType;
}

export class MicrofrontendRegistry {
  private static modules: Map<string, MicrofrontendConfig> = new Map();
  private static loadedModules: Map<string, any> = new Map();
  private static loadingPromises: Map<string, Promise<any>> = new Map();

  // Register a micro-frontend module
  static register(config: MicrofrontendConfig): void {
    this.modules.set(config.name, config);
    console.log(`Registered micro-frontend: ${config.name}`);
  }

  // Load a micro-frontend module
  static async loadModule(name: string): Promise<any> {
    const config = this.modules.get(name);
    if (!config) {
      throw new Error(`Micro-frontend '${name}' not registered`);
    }

    // Return cached module if already loaded
    if (this.loadedModules.has(name)) {
      return this.loadedModules.get(name);
    }

    // Return existing loading promise if already loading
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name);
    }

    // Start loading process
    const loadPromise = this.loadModuleInternal(config);
    this.loadingPromises.set(name, loadPromise);

    try {
      const module = await loadPromise;
      this.loadedModules.set(name, module);
      this.loadingPromises.delete(name);
      return module;
    } catch (error) {
      this.loadingPromises.delete(name);
      throw error;
    }
  }

  private static async loadModuleInternal(config: MicrofrontendConfig): Promise<any> {
    // Load dependencies first
    if (config.dependencies) {
      await Promise.all(
        config.dependencies.map(dep => this.loadModule(dep))
      );
    }

    // Load the remote module
    await this.loadRemoteEntry(config);

    // Get the module from the global scope
    const container = (window as any)[config.scope];
    if (!container) {
      throw new Error(`Container '${config.scope}' not found`);
    }

    // Initialize the container
    await container.init(this.getSharedDependencies());

    // Get the module factory
    const factory = await container.get(config.module);
    const module = factory();

    return module;
  }

  private static async loadRemoteEntry(config: MicrofrontendConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = config.url;
      script.type = 'text/javascript';
      script.async = true;

      script.onload = () => {
        console.log(`Loaded remote entry for ${config.name}`);
        resolve();
      };

      script.onerror = () => {
        reject(new Error(`Failed to load remote entry for ${config.name}`));
      };

      document.head.appendChild(script);
    });
  }

  private static getSharedDependencies(): any {
    return {
      react: {
        singleton: true,
        requiredVersion: '^18.0.0',
        get: () => import('react')
      },
      'react-dom': {
        singleton: true,
        requiredVersion: '^18.0.0',
        get: () => import('react-dom')
      },
      '@mui/material': {
        singleton: true,
        requiredVersion: '^5.0.0',
        get: () => import('@mui/material')
      }
    };
  }

  // Unload a module (for hot reloading)
  static unloadModule(name: string): void {
    this.loadedModules.delete(name);
    console.log(`Unloaded micro-frontend: ${name}`);
  }

  // Get all registered modules
  static getRegisteredModules(): MicrofrontendConfig[] {
    return Array.from(this.modules.values());
  }

  // Check if module is loaded
  static isModuleLoaded(name: string): boolean {
    return this.loadedModules.has(name);
  }
}

// React component for loading micro-frontends
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';

interface MicrofrontendComponentProps {
  name: string;
  fallback?: React.ComponentType;
  onError?: (error: Error) => void;
  [key: string]: any;
}

export const MicrofrontendComponent: React.FC<MicrofrontendComponentProps> = ({
  name,
  fallback: CustomFallback,
  onError,
  ...props
}) => {
  const [error, setError] = useState<Error | null>(null);
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadComponent = async () => {
      try {
        setError(null);
        const module = await MicrofrontendRegistry.loadModule(name);
        
        if (isMounted) {
          // Assume the module exports a default component
          setComponent(() => module.default || module);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(`Failed to load ${name}`);
        if (isMounted) {
          setError(error);
          onError?.(error);
        }
      }
    };

    loadComponent();

    return () => {
      isMounted = false;
    };
  }, [name, onError]);

  if (error) {
    const config = MicrofrontendRegistry.modules.get(name);
    const ErrorComponent = config?.errorBoundary;
    
    if (ErrorComponent) {
      return <ErrorComponent />;
    }
    
    return (
      <Alert severity="error">
        Failed to load {name}: {error.message}
      </Alert>
    );
  }

  if (!Component) {
    const config = MicrofrontendRegistry.modules.get(name);
    const FallbackComponent = CustomFallback || config?.fallback;
    
    if (FallbackComponent) {
      return <FallbackComponent />;
    }
    
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return <Component {...props} />;
};

// Higher-order component for micro-frontend wrapping
export function withMicrofrontend(name: string) {
  return function <P extends object>(WrappedComponent: React.ComponentType<P>) {
    return React.memo((props: P) => {
      return (
        <MicrofrontendComponent name={name} {...props}>
          <WrappedComponent {...props} />
        </MicrofrontendComponent>
      );
    });
  };
}

// Event bus for micro-frontend communication
export class MicrofrontendEventBus {
  private static listeners: Map<string, Set<Function>> = new Map();

  // Subscribe to events
  static subscribe(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  // Emit events
  static emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for '${event}':`, error);
        }
      });
    }
  }

  // Clear all listeners for an event
  static clearListeners(event: string): void {
    this.listeners.delete(event);
  }

  // Clear all listeners
  static clearAllListeners(): void {
    this.listeners.clear();
  }

  // Get active events
  static getActiveEvents(): string[] {
    return Array.from(this.listeners.keys());
  }
}

// Shared state management for micro-frontends
export class SharedStateManager {
  private static state: Map<string, any> = new Map();
  private static subscribers: Map<string, Set<Function>> = new Map();

  // Set shared state
  static setState(key: string, value: any): void {
    const oldValue = this.state.get(key);
    this.state.set(key, value);
    
    // Notify subscribers
    const callbacks = this.subscribers.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(value, oldValue);
        } catch (error) {
          console.error(`Error in state subscriber for '${key}':`, error);
        }
      });
    }
  }

  // Get shared state
  static getState(key: string): any {
    return this.state.get(key);
  }

  // Subscribe to state changes
  static subscribe(key: string, callback: Function): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    
    this.subscribers.get(key)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.get(key)?.delete(callback);
    };
  }

  // Clear state
  static clearState(key: string): void {
    this.state.delete(key);
    this.setState(key, undefined);
  }

  // Get all state keys
  static getStateKeys(): string[] {
    return Array.from(this.state.keys());
  }
}

// React hook for shared state
export function useSharedState<T>(key: string, initialValue?: T): [T, (value: T) => void] {
  const [value, setValue] = React.useState<T>(() => 
    SharedStateManager.getState(key) ?? initialValue
  );

  React.useEffect(() => {
    const unsubscribe = SharedStateManager.subscribe(key, (newValue: T) => {
      setValue(newValue);
    });

    return unsubscribe;
  }, [key]);

  const setSharedValue = React.useCallback((newValue: T) => {
    SharedStateManager.setState(key, newValue);
  }, [key]);

  return [value, setSharedValue];
}