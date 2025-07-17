import React from 'react';
// Jest is automatically available in test environment
import { setupServer } from 'msw/node';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

import { handlers, resetMockData } from './msw-handlers';
import { customMatchers } from './test-utils';

// Extend Jest's expect with custom matchers
expect.extend(customMatchers);

// Setup MSW server for API mocking
const server = setupServer(...handlers);

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
  jest.clearAllMocks();
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
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock IntersectionObserver (if not already defined)
  if (!global.IntersectionObserver) {
    global.IntersectionObserver = jest.fn().mockImplementation((_callback: any, options: any) => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
      root: null,
      rootMargin: options?.rootMargin || '',
      thresholds: options?.threshold || [0],
    }));
  }

  // Mock ResizeObserver (if not already defined)
  if (!global.ResizeObserver) {
    global.ResizeObserver = jest.fn().mockImplementation((_callback: any) => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  }

  // Mock MutationObserver (if not already defined)
  if (!global.MutationObserver) {
    global.MutationObserver = jest.fn().mockImplementation((_callback: any) => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
      takeRecords: jest.fn(() => []),
    }));
  }

  // Mock requestAnimationFrame
  global.requestAnimationFrame = jest.fn((callback: any) => {
    setTimeout(callback, 16); // 60fps
    return 1;
  });

  global.cancelAnimationFrame = jest.fn();

  // Mock getComputedStyle
  Object.defineProperty(window, 'getComputedStyle', {
    value: jest.fn().mockImplementation(() => ({
      getPropertyValue: jest.fn(() => ''),
      display: 'block',
      visibility: 'visible',
      opacity: '1',
    })),
  });

  // Mock scrollTo
  Object.defineProperty(window, 'scrollTo', {
    value: jest.fn(),
  });

  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(() => null),
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(() => null),
  };
  
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
  });

  // Mock URL.createObjectURL
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = jest.fn();

  // Mock HTMLCanvasElement
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    toDataURL: jest.fn(() => 'data:image/png;base64,mock'),
  })) as any;

  // Mock crypto for security utilities
  Object.defineProperty(global, 'crypto', {
    value: {
      getRandomValues: jest.fn((arr: any) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      }),
      randomUUID: jest.fn(() => 'mock-uuid-1234-5678-9abc-def0'),
    },
  });

  // Mock fetch (will be overridden by MSW)
  global.fetch = jest.fn();

  // Mock performance API
  Object.defineProperty(global, 'performance', {
    value: {
      now: jest.fn(() => Date.now()),
      mark: jest.fn(),
      measure: jest.fn(),
      getEntriesByType: jest.fn(() => []),
      getEntriesByName: jest.fn(() => []),
    },
  });

  // Enable fake timers for testing
  // vi.useFakeTimers();

  // Mock date for consistent testing
  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

  // Mock Notification API
  Object.defineProperty(global, 'Notification', {
    value: jest.fn().mockImplementation(() => ({
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })),
  });

  Object.defineProperty(Notification, 'permission', {
    value: 'granted',
    writable: true,
  });

  Object.defineProperty(Notification, 'requestPermission', {
    value: jest.fn(() => Promise.resolve('granted')),
  });

  // Mock WebSocket for real-time features
  (global as any).WebSocket = jest.fn().mockImplementation(() => ({
    send: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    readyState: 1, // OPEN
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  }));

  // Mock DOMPurify
  jest.mock('dompurify', () => ({
    default: {
      sanitize: jest.fn((content: any) => content),
    },
  }));
}

// Restore global mocks
function restoreGlobalMocks() {
  // Restore any mocked globals if needed
  jest.restoreAllMocks();
}

function setupConsoleSpies() {
  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = jest.fn((...args: any[]) => {
    // Allow certain expected errors
    const message = args[0];
    if (typeof message === 'string') {
      // Ignore React error boundary warnings in tests
      if (message.includes('Consider adding an error boundary')) return;
      // Ignore act() warnings
      if (message.includes('was not wrapped in act')) return;
    }
    
    // Log other errors
    originalError.apply(console, args);
  });

  console.warn = jest.fn((...args: any[]) => {
    const message = args[0];
    if (typeof message === 'string') {
      // Ignore certain expected warnings
      if (message.includes('React does not recognize')) return;
      if (message.includes('Unknown event handler property')) return;
    }
    
    // Log other warnings
    originalWarn.apply(console, args);
  });
}

// Test environment validation
function validateTestEnvironment() {
  // Ensure we're in a test environment
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Test setup should only run in test environment');
  }

  // Ensure required globals are available
  const requiredGlobals = ['window', 'document', 'navigator'];
  for (const global of requiredGlobals) {
    if (!(global in globalThis)) {
      throw new Error(`Required global '${global}' is not available`);
    }
  }
}

// Custom test utilities
export const testUtils = {
  // Wait for async operations
  waitForAsync: (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock module with TypeScript support
  mockModule: (modulePath: string, mockImplementation: any) => {
    jest.mock(modulePath, () => mockImplementation);
  },
  
  // Create mock API response
  createMockResponse: (data: any, status: number = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
  }),
  
  // Mock browser APIs
  mockGeolocation: (coords: { latitude: number; longitude: number }) => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementationOnce((success) =>
        Promise.resolve(
          success({
            coords: {
              latitude: coords.latitude,
              longitude: coords.longitude,
            },
          })
        )
      ),
      watchPosition: jest.fn(),
      clearWatch: jest.fn(),
    };
    
    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });
  },
  
  // Storage utilities
  mockLocalStorage: () => {
    const storage: Record<string, string> = {};
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => storage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          storage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete storage[key];
        }),
        clear: jest.fn(() => {
          Object.keys(storage).forEach(key => delete storage[key]);
        }),
        length: 0,
        key: jest.fn(() => null),
      },
    });
  },
  
  mockSessionStorage: () => {
    const storage: Record<string, string> = {};
    
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn((key: string) => storage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          storage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete storage[key];
        }),
        clear: jest.fn(() => {
          Object.keys(storage).forEach(key => delete storage[key]);
        }),
        length: 0,
        key: jest.fn(() => null),
      },
    });
  },

  resetTimers: () => {
    jest.clearAllTimers();
    jest.useRealTimers();
  },
};

// Error boundaries for testing
export class TestErrorBoundary extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TestErrorBoundary';
  }
}

// Mock data generators
export const generateMockData = {
  user: (overrides = {}) => ({
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'agent',
    ...overrides,
  }),
  
  lead: (overrides = {}) => ({
    id: 'lead-123',
    companyName: 'Test Company',
    contactPerson: 'John Doe',
    email: 'john@testcompany.com',
    phone: '+1234567890',
    status: 'new',
    priority: 'medium',
    ...overrides,
  }),
  
  notification: (overrides = {}) => ({
    id: 'notif-123',
    title: 'Test Notification',
    message: 'This is a test notification',
    type: 'info',
    isRead: false,
    timestamp: new Date().toISOString(),
    ...overrides,
  }),
};

// Export commonly used testing imports
export { server };

// Run environment validation
validateTestEnvironment();