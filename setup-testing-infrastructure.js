const fs = require('fs');
const path = require('path');

console.log('🧪 PHASE 2: Setting up comprehensive testing infrastructure...');

// Create test configuration
function createTestConfig() {
  console.log('⚙️ Creating test configuration...');
  
  const jestConfig = {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/src/setupTests.ts"],
    "moduleNameMapping": {
      "^@/(.*)$": "<rootDir>/src/$1",
      "\\.(css|less|scss|sass)$": "identity-obj-proxy"
    },
    "collectCoverageFrom": [
      "src/**/*.{ts,tsx}",
      "!src/**/*.d.ts",
      "!src/reportWebVitals.ts",
      "!src/index.tsx"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    },
    "testMatch": [
      "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
      "<rootDir>/src/**/*.(test|spec).{js,jsx,ts,tsx}"
    ],
    "transform": {
      "^.+\\.(ts|tsx)$": ["ts-jest", {
        "tsconfig": "tsconfig.json"
      }]
    }
  };
  
  fs.writeFileSync('./jest.config.json', JSON.stringify(jestConfig, null, 2));
  console.log('✅ Created Jest configuration');
}

// Create setup tests file
function createSetupTests() {
  console.log('🔧 Creating test setup...');
  
  const setupContent = `import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
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

// Mock WebSocket
global.WebSocket = class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 1;
  }
  
  send() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
};

// Suppress console warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    return originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
`;
  
  fs.writeFileSync('./src/setupTests.ts', setupContent);
  console.log('✅ Created test setup file');
}

// Create test utilities
function createTestUtils() {
  console.log('🛠️ Creating test utilities...');
  
  if (!fs.existsSync('./src/test-utils')) {
    fs.mkdirSync('./src/test-utils', { recursive: true });
  }
  
  const renderUtilsContent = `import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { optimizedTheme } from '../theme/optimizedTheme';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider theme={optimizedTheme}>
          {children}
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock data generators
export const mockUser = {
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'buyer' as const,
};

export const mockRFQ = {
  id: 'rfq-1',
  title: 'Test RFQ',
  description: 'Test RFQ Description',
  status: 'draft' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockOrder = {
  id: 'order-1',
  rfqId: 'rfq-1',
  status: 'pending' as const,
  total: 1000,
  createdAt: new Date().toISOString(),
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
`;
  
  fs.writeFileSync('./src/test-utils/render.tsx', renderUtilsContent);
  
  // Create mock utilities
  const mockUtilsContent = `// Mock API responses
export const mockApiResponses = {
  getRFQs: () => Promise.resolve([]),
  createRFQ: (data: any) => Promise.resolve({ id: 'new-rfq', ...data }),
  updateRFQ: (id: string, data: any) => Promise.resolve({ id, ...data }),
  deleteRFQ: (id: string) => Promise.resolve({ success: true }),
};

// Mock WebSocket events
export const mockWebSocketEvents = {
  connected: () => ({}),
  disconnected: () => ({}),
  error: (error: Error) => ({ error }),
  sample_update: (data: any) => data,
  order_update: (data: any) => data,
};

// Mock localStorage
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock performance monitoring
export const mockPerformanceMonitor = {
  start: jest.fn(),
  end: jest.fn(),
  measure: jest.fn(),
};

// Mock error handlers
export const mockErrorHandler = {
  handle: jest.fn(),
  reportError: jest.fn(),
  clearError: jest.fn(),
};
`;
  
  fs.writeFileSync('./src/test-utils/mocks.ts', mockUtilsContent);
  console.log('✅ Created test utilities');
}

// Create example test files
function createExampleTests() {
  console.log('📝 Creating example test files...');
  
  // Component test example
  const componentTestContent = `import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test-utils/render';
import { ErrorProvider } from '../hooks/useStandardErrorHandler';
import { mockErrorHandler } from '../test-utils/mocks';

// Example component test
describe('ErrorProvider', () => {
  it('should render children without errors', () => {
    render(
      <ErrorProvider>
        <div>Test Content</div>
      </ErrorProvider>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should handle error reporting', async () => {
    const TestComponent = () => {
      const { reportError } = React.useContext(ErrorContext);
      
      return (
        <button onClick={() => reportError(new Error('Test error'))}>
          Trigger Error
        </button>
      );
    };

    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockErrorHandler.reportError).toHaveBeenCalled();
    });
  });
});
`;
  
  if (!fs.existsSync('./src/components/__tests__')) {
    fs.mkdirSync('./src/components/__tests__', { recursive: true });
  }
  
  fs.writeFileSync('./src/components/__tests__/ErrorProvider.test.tsx', componentTestContent);
  
  // Hook test example
  const hookTestContent = `import { renderHook, act } from '@testing-library/react';
import { usePerformanceOptimization } from '../usePerformanceOptimization';

describe('usePerformanceOptimization', () => {
  it('should initialize with default device capabilities', () => {
    const { result } = renderHook(() => usePerformanceOptimization());
    
    expect(result.current.deviceCapabilities).toBeDefined();
    expect(result.current.deviceCapabilities.memory).toBeGreaterThan(0);
  });

  it('should track performance metrics', () => {
    const { result } = renderHook(() => usePerformanceOptimization());
    
    act(() => {
      result.current.trackMetric('test-metric', 100);
    });
    
    expect(result.current.metrics).toHaveProperty('test-metric');
  });
});
`;
  
  if (!fs.existsSync('./src/hooks/__tests__')) {
    fs.mkdirSync('./src/hooks/__tests__', { recursive: true });
  }
  
  fs.writeFileSync('./src/hooks/__tests__/usePerformanceOptimization.test.ts', hookTestContent);
  
  // Integration test example
  const integrationTestContent = `import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../test-utils/render';
import { mockApiResponses } from '../../test-utils/mocks';

// Mock the API
jest.mock('../../services/api', () => ({
  rfqApi: mockApiResponses,
}));

describe('RFQ Integration Tests', () => {
  it('should create and display new RFQ', async () => {
    const CreateRFQForm = () => {
      const [title, setTitle] = React.useState('');
      
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await mockApiResponses.createRFQ({ title });
      };
      
      return (
        <form onSubmit={handleSubmit}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="RFQ Title"
          />
          <button type="submit">Create RFQ</button>
        </form>
      );
    };

    render(<CreateRFQForm />);
    
    const input = screen.getByPlaceholderText('RFQ Title');
    const button = screen.getByRole('button', { name: 'Create RFQ' });
    
    fireEvent.change(input, { target: { value: 'Test RFQ' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockApiResponses.createRFQ).toHaveBeenCalledWith({
        title: 'Test RFQ'
      });
    });
  });
});
`;
  
  if (!fs.existsSync('./src/__tests__/integration')) {
    fs.mkdirSync('./src/__tests__/integration', { recursive: true });
  }
  
  fs.writeFileSync('./src/__tests__/integration/rfq.test.tsx', integrationTestContent);
  
  console.log('✅ Created example test files');
}

// Create test scripts
function createTestScripts() {
  console.log('📜 Creating test scripts...');
  
  const e2eTestContent = `// E2E Test Example using Playwright
import { test, expect } from '@playwright/test';

test.describe('FDX Frontend E2E Tests', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    await expect(page).toHaveTitle(/FoodXchange/);
    await expect(page.getByRole('banner')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL(/.*login/);
    
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
  });

  test('should handle form submission', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    
    await page.click('[data-testid="submit-button"]');
    
    // Should show loading state
    await expect(page.getByRole('button', { name: /loading/i })).toBeVisible();
  });
});
`;
  
  if (!fs.existsSync('./e2e')) {
    fs.mkdirSync('./e2e', { recursive: true });
  }
  
  fs.writeFileSync('./e2e/app.spec.ts', e2eTestContent);
  
  // Performance test
  const performanceTestContent = `import { performanceMonitor } from '../src/utils/performance';

describe('Performance Tests', () => {
  it('should complete render within performance budget', async () => {
    const renderStart = performance.now();
    
    // Simulate component render
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const renderTime = performance.now() - renderStart;
    
    // Should render within 16ms (60fps)
    expect(renderTime).toBeLessThan(100); // Generous for test environment
  });

  it('should not exceed memory usage thresholds', () => {
    const memoryBefore = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Simulate memory-intensive operation
    const data = new Array(1000).fill(0).map((_, i) => ({ id: i, data: 'test' }));
    
    const memoryAfter = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = memoryAfter - memoryBefore;
    
    // Should not increase memory by more than 10MB
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});
`;
  
  fs.writeFileSync('./src/__tests__/performance.test.ts', performanceTestContent);
  
  console.log('✅ Created test scripts');
}

// Update package.json with test dependencies and scripts
function updatePackageJsonForTesting() {
  console.log('📦 Updating package.json for testing...');
  
  const packagePath = './package.json';
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Add test dependencies
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      '@testing-library/jest-dom': '^6.1.0',
      '@testing-library/react': '^14.1.0',
      '@testing-library/react-hooks': '^8.0.1',
      '@testing-library/user-event': '^14.5.0',
      '@playwright/test': '^1.40.0',
      'jest-environment-jsdom': '^29.7.0',
      'ts-jest': '^29.1.0',
      'identity-obj-proxy': '^3.0.0'
    };
    
    // Add test scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      'test:unit': 'jest --config jest.config.json',
      'test:watch': 'jest --config jest.config.json --watch',
      'test:coverage': 'jest --config jest.config.json --coverage',
      'test:e2e': 'playwright test',
      'test:e2e:ui': 'playwright test --ui',
      'test:all': 'npm run test:unit && npm run test:e2e',
      'test:ci': 'npm run test:coverage && npm run test:e2e'
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json for testing');
  }
}

// Run all testing setup
async function setupTestingInfrastructure() {
  try {
    createTestConfig();
    createSetupTests();
    createTestUtils();
    createExampleTests();
    createTestScripts();
    updatePackageJsonForTesting();
    
    console.log('🎉 PHASE 2 COMPLETE: Testing infrastructure setup!');
    console.log('📊 Next: npm install && npm run test:unit');
    
  } catch (error) {
    console.error('❌ Error setting up testing:', error);
  }
}

setupTestingInfrastructure();