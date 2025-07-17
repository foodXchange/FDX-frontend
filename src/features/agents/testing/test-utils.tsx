import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
// Jest is automatically available in test environment

// Mock store for Zustand
interface MockStoreOptions {
  initialState?: Record<string, any>;
  actions?: Record<string, any>;
}

export const createMockStore = (options: MockStoreOptions = {}) => {
  const { initialState = {}, actions = {} } = options;
  
  const store = {
    ...initialState,
    ...actions,
    subscribe: jest.fn(),
    getState: jest.fn(() => ({ ...initialState })),
    setState: jest.fn((updater: any) => {
      if (typeof updater === 'function') {
        Object.assign(initialState, updater(initialState));
      } else {
        Object.assign(initialState, updater);
      }
    }),
    destroy: jest.fn(),
  };

  return store;
};

// Mock theme for consistent testing
const testTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Custom render options
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  routerProps?: MemoryRouterProps;
  themeProps?: Parameters<typeof createTheme>[0];
  storeOptions?: MockStoreOptions;
}

// Custom wrapper component
const createWrapper = (options: CustomRenderOptions = {}) => {
  const { routerProps, themeProps } = options;
  const theme = themeProps ? createTheme(themeProps) : testTheme;
  
  return function Wrapper({ children }: { children: React.ReactNode }) {
    const content = (
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    );

    if (routerProps || routerProps === undefined) {
      return (
        <MemoryRouter {...routerProps}>
          {content}
        </MemoryRouter>
      );
    }

    return content;
  };
};

// Enhanced render function
export const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & { user: typeof userEvent } => {
  const user = userEvent;
  const { routerProps, themeProps, ...renderOptions } = options;
  
  const Wrapper = createWrapper({ routerProps, themeProps });
  
  const result = render(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });

  return {
    ...result,
    user,
  };
};

// Mock data generators
export const mockLeadData = {
  basic: () => ({
    id: 'lead-1',
    companyName: 'Test Company',
    contactName: 'John Doe',
    email: 'john@test.com',
    phone: '+1234567890',
    status: 'active',
    priority: 'medium' as const,
    estimatedRevenue: 50000,
    source: 'website',
    tags: ['tech', 'startup'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }),
  
  multiple: (count: number) => 
    Array.from({ length: count }, (_, index) => ({
      id: `lead-${index + 1}`,
      companyName: `Company ${index + 1}`,
      contactName: `Contact ${index + 1}`,
      email: `contact${index + 1}@test.com`,
      phone: `+123456789${index}`,
      status: ['active', 'pending', 'closed'][index % 3],
      priority: (['high', 'medium', 'low'][index % 3]) as 'high' | 'medium' | 'low',
      estimatedRevenue: (index + 1) * 10000,
      source: ['website', 'referral', 'cold-call'][index % 3],
      tags: [`tag${index + 1}`],
      createdAt: new Date(2024, 0, index + 1).toISOString(),
      updatedAt: new Date(2024, 0, index + 1).toISOString(),
    })),
};

export const mockAgentData = {
  basic: () => ({
    id: 'agent-1',
    name: 'Test Agent',
    email: 'agent@test.com',
    role: 'senior',
    department: 'sales',
    avatar: 'https://example.com/avatar.jpg',
    status: 'active',
    performance: {
      leadsCount: 25,
      conversationRate: 0.15,
      revenue: 125000,
    },
    createdAt: '2024-01-01T00:00:00Z',
  }),
};

// API mocking utilities
export const mockApiResponses = {
  success: <T,>(data: T) => Promise.resolve({ data, success: true }),
  error: (message: string, status: number = 400) => 
    Promise.reject(new Error(`HTTP ${status}: ${message}`)),
  delayed: <T,>(data: T, delay: number = 1000) => 
    new Promise<{ data: T; success: boolean }>(resolve => 
      setTimeout(() => resolve({ data, success: true }), delay)
    ),
};

// Mock fetch implementation
export const createMockFetch = (responses: Record<string, any>) => {
  return jest.fn().mockImplementation((url: string, options?: RequestInit) => {
    const method = options?.method || 'GET';
    const key = `${method} ${url}`;
    
    if (responses[key]) {
      const response = responses[key];
      
      if (response instanceof Error) {
        return Promise.reject(response);
      }
      
      return Promise.resolve({
        ok: response.status < 400,
        status: response.status || 200,
        json: () => Promise.resolve(response.data || response),
        text: () => Promise.resolve(JSON.stringify(response.data || response)),
        headers: new Headers(response.headers || {}),
      });
    }
    
    return Promise.reject(new Error(`No mock response for ${key}`));
  });
};

// Performance testing utilities
export const measureRenderTime = async (
  component: ReactElement,
  options?: CustomRenderOptions
): Promise<number> => {
  const start = performance.now();
  customRender(component, options);
  const end = performance.now();
  return end - start;
};

// Accessibility testing utilities
export const checkAccessibility = async (container: HTMLElement): Promise<any> => {
  // This would integrate with axe-core in a real implementation
  const issues: any[] = [];
  
  // Check for missing alt attributes
  const images = container.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.getAttribute('alt')) {
      issues.push({
        rule: 'image-alt',
        target: `img:nth-child(${index + 1})`,
        message: 'Images must have alternative text',
      });
    }
  });
  
  // Check for missing form labels
  const inputs = container.querySelectorAll('input, select, textarea');
  inputs.forEach((input, index) => {
    const id = input.getAttribute('id');
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');
    
    if (!ariaLabel && !ariaLabelledBy && id) {
      const label = container.querySelector(`label[for="${id}"]`);
      if (!label) {
        issues.push({
          rule: 'label',
          target: `input:nth-child(${index + 1})`,
          message: 'Form elements must have labels',
        });
      }
    }
  });
  
  return {
    violations: issues,
    passes: [],
    incomplete: [],
  };
};

// Component testing helpers
export const testComponentProps = {
  lead: mockLeadData.basic(),
  agent: mockAgentData.basic(),
  onAction: jest.fn(),
  onSelect: jest.fn(),
  onSave: jest.fn(),
  onCancel: jest.fn(),
  onDelete: jest.fn(),
};

// Custom matchers for better assertions
export const customMatchers = {
  toBeAccessible: async (received: HTMLElement) => {
    const results = await checkAccessibility(received);
    const hasViolations = results.violations.length > 0;
    
    return {
      message: () => 
        hasViolations 
          ? `Expected element to be accessible but found ${results.violations.length} violations:\n${results.violations.map((v: any) => `- ${v.message}`).join('\n')}`
          : 'Expected element to have accessibility violations',
      pass: !hasViolations,
    };
  },
  
  toHavePerformanceUnder: (received: number, expected: number) => {
    return {
      message: () => 
        received > expected
          ? `Expected render time ${received}ms to be under ${expected}ms`
          : `Expected render time ${received}ms to be over ${expected}ms`,
      pass: received < expected,
    };
  },
};

// Test data factories
export class TestDataFactory {
  static lead(overrides: Partial<ReturnType<typeof mockLeadData.basic>> = {}) {
    return { ...mockLeadData.basic(), ...overrides };
  }
  
  static agent(overrides: Partial<ReturnType<typeof mockAgentData.basic>> = {}) {
    return { ...mockAgentData.basic(), ...overrides };
  }
  
  static leadList(count: number, overrides: Partial<ReturnType<typeof mockLeadData.basic>> = {}) {
    return mockLeadData.multiple(count).map(lead => ({ ...lead, ...overrides }));
  }
}

// Mock hooks for testing
export const mockHooks = {
  useAgentStore: (initialState = {}) => createMockStore({ initialState }),
  useLeadStore: (initialState = {}) => createMockStore({ initialState }),
  useAuth: () => ({
    user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
  }),
  useApi: () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    isLoading: false,
    error: null,
  }),
};

// Integration test helpers
export const integrationHelpers = {
  waitForLoadingToFinish: () => new Promise(resolve => setTimeout(resolve, 0)),
  
  fillForm: async (form: HTMLFormElement, data: Record<string, string>) => {
    const user = userEvent;
    
    for (const [name, value] of Object.entries(data)) {
      const field = form.querySelector(`[name="${name}"]`) as HTMLInputElement;
      if (field) {
        if (field.type === 'checkbox' || field.type === 'radio') {
          if (value === 'true' || value === '1') {
            await user.click(field);
          }
        } else {
          await user.clear(field);
          await user.type(field, value);
        }
      }
    }
  },
  
  submitForm: async (form: HTMLFormElement) => {
    const user = userEvent;
    const submitButton = form.querySelector('[type="submit"]') as HTMLButtonElement;
    if (submitButton) {
      await user.click(submitButton);
    }
  },
};

// Re-export commonly used testing utilities
export * from '@testing-library/react';
export * from '@testing-library/user-event';
// Jest exports are available globally

// Remove global configuration from test-utils to avoid duplication
// Global configuration is handled in setup.ts

export default customRender;