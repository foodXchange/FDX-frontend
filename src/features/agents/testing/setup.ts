import { beforeAll, afterEach, afterAll, expect } from 'vitest';
import { setupServer } from 'msw/node';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

import { handlers, resetMockData } from './msw-handlers';
import { customMatchers } from './test-utils';

// Extend Vitest's expect with custom matchers
expect.extend(customMatchers);

// Setup MSW server for API mocking
export const server = setupServer(...handlers);

// Global test setup
beforeAll(() => {
  // Start MSW server
  server.listen({ onUnhandledRequest: 'error' });
  
  // Mock global APIs that aren't available in Node.js environment
  setupGlobalMocks();
  
  // Setup console spy to track errors/warnings during tests
  setupConsoleSpies();
});

afterEach(() => {
  // Clean up React Testing Library
  cleanup();
  
  // Reset MSW handlers to default state
  server.resetHandlers();
  
  // Reset mock data to initial state
  resetMockData();
  
  // Clear all mocks
  vi.clearAllMocks();
});

afterAll(() => {
  // Close MSW server
  server.close();
  
  // Restore global mocks
  restoreGlobalMocks();
});

// Global mocks setup
function setupGlobalMocks() {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation((callback, options) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: options?.rootMargin || '',
    thresholds: options?.threshold || [0],
  }));

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock MutationObserver
  global.MutationObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(() => []),
  }));

  // Mock requestAnimationFrame
  global.requestAnimationFrame = vi.fn((callback) => {
    setTimeout(callback, 16); // 60fps
    return 1;
  });

  global.cancelAnimationFrame = vi.fn();

  // Mock getComputedStyle
  Object.defineProperty(window, 'getComputedStyle', {
    value: vi.fn().mockImplementation(() => ({
      getPropertyValue: vi.fn(() => ''),
      display: 'block',
      visibility: 'visible',
      opacity: '1',
    })),
  });

  // Mock scrollTo
  Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
  });

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(() => null),
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(() => null),
  };
  
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
  });

  // Mock URL.createObjectURL
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = vi.fn();

  // Mock HTMLCanvasElement
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
  }));

  // Mock crypto for security utilities
  Object.defineProperty(global, 'crypto', {
    value: {
      getRandomValues: vi.fn((arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      }),
      randomUUID: vi.fn(() => 'mock-uuid-1234-5678-9abc-def0'),
    },
  });

  // Mock fetch (will be overridden by MSW)
  global.fetch = vi.fn();

  // Mock performance API
  Object.defineProperty(global, 'performance', {
    value: {
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByType: vi.fn(() => []),
      getEntriesByName: vi.fn(() => []),
    },
  });

  // Mock navigator
  Object.defineProperty(navigator, 'userAgent', {
    value: 'Mozilla/5.0 (Test Environment)',
    configurable: true,
  });

  Object.defineProperty(navigator, 'language', {
    value: 'en-US',
    configurable: true,
  });

  Object.defineProperty(navigator, 'languages', {
    value: ['en-US', 'en'],
    configurable: true,
  });

  // Mock Notification API
  Object.defineProperty(global, 'Notification', {
    value: vi.fn().mockImplementation(() => ({
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });

  Object.defineProperty(Notification, 'permission', {
    value: 'default',
    configurable: true,
  });

  Object.defineProperty(Notification, 'requestPermission', {
    value: vi.fn(() => Promise.resolve('granted')),
  });

  // Mock WebSocket for real-time features
  global.WebSocket = vi.fn().mockImplementation(() => ({
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    readyState: 1, // OPEN
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  }));

  // Mock DOMPurify
  vi.mock('dompurify', () => ({
    default: {
      sanitize: vi.fn((content) => content),
    },
  }));
}

function restoreGlobalMocks() {
  // Restore any mocked globals if needed
  vi.restoreAllMocks();
}

function setupConsoleSpies() {
  // Spy on console methods to catch unexpected errors/warnings
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = vi.fn((...args) => {
    // Allow certain expected errors
    const message = args[0];
    if (typeof message === 'string') {
      // Ignore React Testing Library warnings about act()
      if (message.includes('Warning: An invalid form control')) return;
      if (message.includes('Warning: React does not recognize')) return;
      if (message.includes('act(...)')) return;
    }
    
    // Call original console.error for unexpected errors
    originalError.apply(console, args);
  });

  console.warn = vi.fn((...args) => {
    const message = args[0];
    if (typeof message === 'string') {
      // Ignore certain expected warnings
      if (message.includes('componentWillReceiveProps')) return;
      if (message.includes('componentWillMount')) return;
    }
    
    // Call original console.warn for unexpected warnings
    originalWarn.apply(console, args);
  });
}

// Test environment validation
export function validateTestEnvironment() {
  const requiredGlobals = [
    'IntersectionObserver',
    'ResizeObserver',
    'requestAnimationFrame',
    'localStorage',
    'sessionStorage',
    'crypto',
    'fetch',
    'performance',
  ];

  const missingGlobals = requiredGlobals.filter(global => !(global in window));
  
  if (missingGlobals.length > 0) {
    throw new Error(`Missing global mocks: ${missingGlobals.join(', ')}`);
  }
}

// Performance testing utilities
export const performanceHelpers = {
  measureRenderTime: async (renderFunction: () => void): Promise<number> => {
    const start = performance.now();
    renderFunction();
    const end = performance.now();
    return end - start;
  },

  expectPerformanceUnder: (actualTime: number, maxTime: number) => {
    expect(actualTime).toBeLessThan(maxTime);
  },
};

// Accessibility testing setup
export const a11yConfig = {
  rules: {
    // Disable certain rules for testing environment
    'color-contrast': { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
  },
};

// Test data cleanup utilities
export const cleanupHelpers = {
  clearLocalStorage: () => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(() => null),
      },
    });
  },

  clearSessionStorage: () => {
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(() => null),
      },
    });
  },

  resetTimers: () => {
    vi.clearAllTimers();
    vi.useRealTimers();
  },
};

// Custom test utilities for async operations
export const asyncHelpers = {
  waitFor: (condition: () => boolean, timeout: number = 5000): Promise<void> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const check = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Timeout waiting for condition after ${timeout}ms`));
        } else {
          setTimeout(check, 10);
        }
      };
      
      check();
    });
  },

  flushPromises: (): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, 0));
  },
};

// Export commonly used testing imports
export { vi } from 'vitest';
export { server };

// Run environment validation
validateTestEnvironment();