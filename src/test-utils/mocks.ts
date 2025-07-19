// Mock API responses
export const mockApiResponses = {
  getRFQs: () => Promise.resolve([]),
  createRFQ: (data: any) => Promise.resolve({ id: 'new-rfq', ...data }),
  updateRFQ: (_id: string, data: any) => Promise.resolve({ id: _id, ...data }),
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
