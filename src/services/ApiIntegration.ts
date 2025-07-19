import { api, apiClient } from './api-client';
import MockApiService, { USE_MOCK_API } from './mock/MockApiService';

// API Integration Helper - automatically switches between real and mock APIs
export class ApiIntegration {
  // Orders
  static orders = {
    getAll: async (params?: any) => {
      if (USE_MOCK_API) {
        return MockApiService.orders.getAll(params);
      }
      return api.orders.getAll(params);
    },

    getById: async (id: string) => {
      if (USE_MOCK_API) {
        return MockApiService.orders.getById(id);
      }
      return api.orders.getById(id);
    },

    create: async (data: any) => {
      if (USE_MOCK_API) {
        return MockApiService.orders.create(data);
      }
      return api.orders.create(data);
    },

    // ... other order methods use the same pattern
  };

  // Experts
  static experts = {
    search: async (query: any) => {
      if (USE_MOCK_API) {
        return MockApiService.experts.search(query);
      }
      return api.experts.search(query);
    },

    getAvailability: async (id: string, dateRange?: any) => {
      if (USE_MOCK_API) {
        return MockApiService.experts.getAvailability(id, dateRange);
      }
      return api.experts.getAvailability(id, dateRange);
    },

    // ... other expert methods
  };

  // RFQs with AI
  static rfqs = {
    analyzeWithAI: async (id: string) => {
      if (USE_MOCK_API) {
        return MockApiService.rfqs.analyzeWithAI(id);
      }
      return api.rfqs.analyzeWithAI(id);
    },

    getAIMatches: async (id: string, options?: any) => {
      if (USE_MOCK_API) {
        return MockApiService.rfqs.getAIMatches(id, options);
      }
      return api.rfqs.getAIMatches(id, options);
    },

    recommendSuppliers: async (id: string, criteria?: any) => {
      if (USE_MOCK_API) {
        return MockApiService.rfqs.recommendSuppliers(id, criteria);
      }
      return api.rfqs.recommendSuppliers(id, criteria);
    },

    // ... other RFQ methods
  };

  // Sample Tracking
  static samples = {
    getTracking: async (id: string) => {
      if (USE_MOCK_API) {
        return MockApiService.samples.getTracking(id);
      }
      return api.samples.getTracking(id);
    },

    // ... other sample methods
  };

  // Supplier Management
  static suppliers = {
    verify: async (id: string, verificationData: any) => {
      if (USE_MOCK_API) {
        return MockApiService.suppliers.verify(id, verificationData);
      }
      return api.suppliers.verify(id, verificationData);
    },

    getPerformanceMetrics: async (id: string, dateRange?: any) => {
      if (USE_MOCK_API) {
        return MockApiService.suppliers.getPerformanceMetrics(id, dateRange);
      }
      return api.suppliers.getPerformanceMetrics(id, dateRange);
    },

    // ... other supplier methods
  };

  // Compliance
  static compliance = {
    getComplianceMetrics: async (dateRange?: any) => {
      if (USE_MOCK_API) {
        return MockApiService.compliance.getComplianceMetrics(dateRange);
      }
      return api.compliance.getComplianceMetrics(dateRange);
    },

    checkCompliance: async (entityType: string, entityId: string, requirements: string[]) => {
      if (USE_MOCK_API) {
        return MockApiService.compliance.checkCompliance(entityType, entityId, requirements);
      }
      return api.compliance.checkCompliance(entityType, entityId, requirements);
    },

    // ... other compliance methods
  };

  // Health check to test API connectivity
  static async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'down'; usingMock: boolean }> {
    if (USE_MOCK_API) {
      return { status: 'healthy', usingMock: true };
    }

    try {
      await apiClient.get('/health');
      return { status: 'healthy', usingMock: false };
    } catch (error) {
      console.warn('API health check failed, falling back to mock data:', error);
      return { status: 'down', usingMock: false };
    }
  }
}

// Export for use in components
export default ApiIntegration;